import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultTutorApi, validApi } from './client';

beforeEach(() => {
  vi.stubGlobal('location', { origin: 'http://localhost:1420' });
  vi.stubGlobal('window', {});
  vi.stubEnv('VITE_NAUCZYCIEL_API_URL', ''); vi.stubEnv('VITE_TUTOR_API_URL', '');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('tutor endpoint configuration', () => {
  it('uses the existing separate teacher endpoint and allows an explicit tutor endpoint', () => {
    vi.stubEnv('VITE_NAUCZYCIEL_API_URL', 'https://forge.example/api/nauczyciel');
    expect(defaultTutorApi()).toBe('https://forge.example/api/tutor');
    vi.stubEnv('VITE_TUTOR_API_URL', 'https://other.example/api/tutor');
    expect(defaultTutorApi()).toBe('https://other.example/api/tutor');
  });
  it('uses a real backend address in the packaged Tauri app', () => {
    vi.stubGlobal('window', { __TAURI_INTERNALS__: {} }); vi.stubEnv('DEV', false);
    expect(defaultTutorApi()).toBe('https://forge-teacher.vercel.app/api/tutor');
  });
  it('permits local development and numeric private LAN addresses', () => {
    for (const origin of ['http://localhost:1420', 'http://192.168.1.20:1420', 'http://10.0.0.2:1420', 'http://172.16.0.2:1420']) {
      expect(validApi(origin + '/api/tutor')).toBe(origin + '/api/tutor');
    }
  });
  it('requires HTTPS for remote hosts including names disguised as private IPs', () => {
    for (const origin of ['http://remote.example', 'http://192.168.evil.example', 'http://10.evil.example', 'http://172.32.1.2']) {
      expect(() => validApi(origin + '/api/tutor')).toThrow('HTTPS');
    }
    expect(() => validApi('https://user:password@remote.example/api/tutor')).toThrow();
  });
});
