import { afterEach, expect, it, vi } from 'vitest';
import { createLocalTeacherSetup, trustedLocalTeacherRequest } from '../../../server/teacher-local-setup';

const key = 'sk-ant-test-provider-key-never-real-1234567890';
const url = 'http://localhost:4173/api/nauczyciel/setup';
afterEach(() => vi.restoreAllMocks());
const req = (method = 'GET', overrides: Record<string, string> = {}, body?: string) => new Request(url, {
  method, headers: { host: 'localhost:4173', ...(method === 'POST' ? { origin: 'http://localhost:4173', 'content-type': 'application/json' } : {}), ...overrides },
  ...(body !== undefined ? { body } : {}),
});

it('requires loopback peer, loopback host and exactly matching origin including port', () => {
  expect(trustedLocalTeacherRequest(req(), '127.0.0.1')).toBe(true);
  expect(trustedLocalTeacherRequest(req(), '::1')).toBe(true);
  expect(trustedLocalTeacherRequest(req(), '192.168.1.7')).toBe(false);
  expect(trustedLocalTeacherRequest(req('POST', { origin: 'https://evil.example' }), '127.0.0.1')).toBe(false);
  expect(trustedLocalTeacherRequest(req('POST', { origin: 'http://localhost:9999' }), '127.0.0.1')).toBe(false);
  expect(trustedLocalTeacherRequest(req('POST', { origin: '' }), '127.0.0.1')).toBe(false);
  expect(trustedLocalTeacherRequest(req('GET', { host: 'evil.example' }), '127.0.0.1')).toBe(false);
  expect(trustedLocalTeacherRequest(req('GET', { 'sec-fetch-site': 'cross-site' }), '127.0.0.1')).toBe(false);
});

it('loads a stored key internally and returns booleans, never the credential', async () => {
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const handle = createLocalTeacherSetup(vault, env, async () => true);
  const response = await handle(req(), '127.0.0.1');
  const text = await response.text();
  expect(text).not.toContain(key); expect(JSON.parse(text)).toMatchObject({ configured: true, persisted: true, localSetupAvailable: true, providerVerified: true });
  expect(env.ANTHROPIC_API_KEY).toBe(key);
  await handle(req(), '127.0.0.1'); expect(vault.read).toHaveBeenCalledTimes(1);
});

it('persists only a syntactically valid key with a stubbed provider verifier', async () => {
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(null), save: vi.fn().mockResolvedValue(undefined) };
  const handle = createLocalTeacherSetup(vault, env, async () => true);
  expect((await handle(req('POST', {}, JSON.stringify({ key: 'wrong' })), '127.0.0.1')).status).toBe(400);
  expect(vault.save).not.toHaveBeenCalled();
  const saved = await handle(req('POST', {}, JSON.stringify({ key })), '127.0.0.1');
  expect(saved.status).toBe(200); expect(await saved.text()).not.toContain(key);
  expect(vault.save).toHaveBeenCalledWith(key); expect(env.ANTHROPIC_API_KEY).toBe(key);
});

it('restores the same vault in a new process without saving again or generating a completion', async () => {
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const verify = vi.fn().mockResolvedValue(true);
  for (let restart = 0; restart < 2; restart++) {
    const env: NodeJS.ProcessEnv = {};
    const handle = createLocalTeacherSetup(vault, env, verify);
    expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ configured: true, persisted: true, providerVerified: true });
    expect(env.ANTHROPIC_API_KEY).toBe(key);
    await handle(req(), '127.0.0.1');
  }
  expect(verify).toHaveBeenCalledTimes(2);
  expect(vault.save).not.toHaveBeenCalled();
});

it('network failure leaves a saved key intact and clearly reports unverified connection', async () => {
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const handle = createLocalTeacherSetup(vault, env, async () => null);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ configured: true, persisted: true, providerVerified: false });
  expect(env.ANTHROPIC_API_KEY).toBe(key);
  expect(vault.save).not.toHaveBeenCalled();
});

it('does not replace an existing credential with a key the provider rejects', async () => {
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const handle = createLocalTeacherSetup(vault, env, async candidate => candidate === key);
  const response = await handle(req('POST', {}, JSON.stringify({ key: 'sk-ant-invalid-candidate-1234567890' })), '127.0.0.1');
  expect(response.status).toBe(401); expect(vault.save).not.toHaveBeenCalled();
  expect(env.ANTHROPIC_API_KEY).toBe(key);
});

it('rejects CSRF before touching the vault and bounds request size', async () => {
  const vault = { read: vi.fn().mockResolvedValue(null), save: vi.fn() };
  const handle = createLocalTeacherSetup(vault, {}, async () => true);
  expect((await handle(req('POST', { origin: 'http://evil.example' }, JSON.stringify({ key })), '127.0.0.1')).status).toBe(403);
  expect(vault.read).not.toHaveBeenCalled(); expect(vault.save).not.toHaveBeenCalled();
  expect((await handle(req('POST', {}, 'x'.repeat(2049)), '127.0.0.1')).status).toBe(413);
  expect((await handle(req('POST', { 'content-type': 'text/plain' }, JSON.stringify({ key })), '127.0.0.1')).status).toBe(415);
});

it('does not claim persistence or enable the key when the Windows vault rejects it', async () => {
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(null), save: vi.fn().mockRejectedValue(new Error('private detail ' + key)) };
  const handle = createLocalTeacherSetup(vault, env, async () => true);
  const response = await handle(req('POST', {}, JSON.stringify({ key })), '127.0.0.1');
  expect(response.status).toBe(503); expect(await response.text()).not.toContain(key);
  expect(env.ANTHROPIC_API_KEY).toBeUndefined();
});

it('retries temporary vault and network failures without entering or saving the key again', async () => {
  const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockRejectedValueOnce(new Error('locked')).mockResolvedValue(key), save: vi.fn() };
  const verify = vi.fn().mockResolvedValueOnce(null).mockResolvedValue(true);
  const handle = createLocalTeacherSetup(vault, env, verify);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ configured: false, providerVerified: false, storageError: expect.any(String) });
  now.mockReturnValue(7000);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ configured: true, persisted: true, providerVerified: false, storageError: null });
  now.mockReturnValue(13000);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ providerVerified: true });
  expect(vault.read).toHaveBeenCalledTimes(2); expect(verify).toHaveBeenCalledTimes(2);
  expect(vault.save).not.toHaveBeenCalled(); expect(env.ANTHROPIC_API_KEY).toBe(key);
});

it('expires verification and invalidates authentication without deleting the saved credential', async () => {
  const now = vi.spyOn(Date, 'now').mockReturnValue(1000);
  const env: NodeJS.ProcessEnv = {};
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const verify = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValue(true);
  const handle = createLocalTeacherSetup(vault, env, verify);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ providerVerified: true });
  handle.invalidateVerification();
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ providerVerified: false, configured: true, persisted: true });
  expect(verify).toHaveBeenCalledTimes(1);
  now.mockReturnValue(7000);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ providerVerified: false });
  now.mockReturnValue(13000);
  expect(await (await handle(req(), '127.0.0.1')).json()).toMatchObject({ providerVerified: true });
  now.mockReturnValue(74000);
  await handle(req(), '127.0.0.1'); expect(verify).toHaveBeenCalledTimes(4);
  expect(env.ANTHROPIC_API_KEY).toBe(key); expect(vault.save).not.toHaveBeenCalled();
});

it('shares an in-flight recheck and does not revive a verification invalidated while it was pending', async () => {
  let finish!: (value: boolean) => void;
  const verify = vi.fn(() => new Promise<boolean>(resolve => { finish = resolve; }));
  const vault = { read: vi.fn().mockResolvedValue(key), save: vi.fn() };
  const handle = createLocalTeacherSetup(vault, {}, verify);
  const first = handle(req(), '127.0.0.1');
  const second = handle(req(), '127.0.0.1');
  await vi.waitFor(() => expect(verify).toHaveBeenCalledTimes(1));
  handle.invalidateVerification(); finish(true);
  for (const response of await Promise.all([first, second])) expect(await response.json()).toMatchObject({ providerVerified: false });
  expect(vault.read).toHaveBeenCalledTimes(1);
});
