import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleLektorRequest } from '../../../server/lektor-http';

const code = 'test-forge-private-code-32-characters';
beforeEach(() => {
  vi.stubEnv('FORGE_TEACHER_ACCESS_CODE', code);
  vi.stubEnv('AZURE_SPEECH_KEY', 'provider-secret');
  vi.stubEnv('AZURE_SPEECH_REGION', 'westeurope');
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function request(body?: unknown, headers: Record<string, string> = {}) {
  return new Request('https://teacher.example/api/lektor', {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${code}`, 'Content-Type': 'application/json', ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe('naturalny lektor na serwerze', () => {
  it('nie ujawnia klucza w statusie', async () => {
    const response = await handleLektorRequest(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('{"dostepny":true}');
  });

  it('brak klucza nie jest udawanym naturalnym głosem', async () => {
    vi.stubEnv('AZURE_SPEECH_KEY', '');
    const response = await handleLektorRequest(request());
    expect(response.status).toBe(503);
    expect((await response.json()).dostepny).toBe(false);
  });

  it('publiczne nagrania wymagają prywatnego dostępu', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const response = await handleLektorRequest(request({ text: 'Lekcja.', voice: 'pl-PL-ZofiaNeural' }, { Authorization: '' }));
    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
    vi.stubEnv('FORGE_TEACHER_ACCESS_CODE', '');
    expect((await handleLektorRequest(request())).status).toBe(503);
  });

  it('lokalny serwer działa bez publicznego kodu, ale nie otwiera w ten sposób zdalnego serwera', async () => {
    vi.stubEnv('FORGE_TEACHER_ACCESS_CODE', '');
    expect((await handleLektorRequest(new Request('http://localhost:1420/api/lektor'), true)).status).toBe(200);
    expect((await handleLektorRequest(request(), true)).status).toBe(503);
  });

  it('blokuje obce strony i obsługuje CORS aplikacji na telefonie', async () => {
    expect((await handleLektorRequest(request(undefined, { Origin: 'https://other.example' }))).status).toBe(403);
    const response = await handleLektorRequest(new Request('https://teacher.example/api/lektor', {
      method: 'OPTIONS', headers: { Origin: 'https://odzi678biznes.github.io' },
    }));
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://odzi678biznes.github.io');
  });

  it('waliduje długość, głos i format przed wysłaniem tekstu', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    for (const body of [{ text: '', voice: 'pl-PL-ZofiaNeural' }, { text: 'x'.repeat(1801), voice: 'pl-PL-ZofiaNeural' },
      { text: 'Lekcja.', voice: 'unknown' }, { text: '\u0000', voice: 'pl-PL-ZofiaNeural' }]) {
      expect((await handleLektorRequest(request(body))).status).toBe(400);
    }
    expect((await handleLektorRequest(request({ text: 'x'.repeat(16_001) }))).status).toBe(413);
    expect((await handleLektorRequest(request({ text: 'Lekcja.' }, { 'Content-Type': 'text/plain' }))).status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('przekazuje polski głos i tekst jako bezpieczny SSML oraz zwraca audio', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'audio/mpeg' } }));
    vi.stubGlobal('fetch', fetch);
    const response = await handleLektorRequest(request({ text: 'Czy 2 < 3 & 4 > 1? <voice name="obcy">', voice: 'pl-PL-ZofiaNeural' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    const [url, options] = fetch.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe('https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
    expect(options.body).toContain('name="pl-PL-ZofiaNeural"');
    expect(options.body).toContain('&lt;voice name=&quot;obcy&quot;&gt;');
    expect(options.body).not.toContain('<voice name="obcy">');
    expect(options.headers).toMatchObject({ 'Ocp-Apim-Subscription-Key': 'provider-secret' });
  });

  it('nie zwraca treści błędu dostawcy ani klucza użytkownikowi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('provider-secret', { status: 401 })));
    const response = await handleLektorRequest(request({ text: 'Lekcja.', voice: 'pl-PL-MarekNeural' }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('provider-secret');
  });
});
