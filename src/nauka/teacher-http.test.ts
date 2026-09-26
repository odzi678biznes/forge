import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { handleTeacherRequest } from '../../server/teacher-http';
import * as teacher from '../../server/nauczyciel';
const code = 'test-access-code-with-32-characters';
beforeEach(() => { vi.stubEnv('FORGE_TEACHER_ACCESS_CODE', code); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
function request(path = '', init: RequestInit = {}) {
  return new Request(`https://teacher.example/api/nauczyciel${path}`, init);
}
it('requires a private access code before calling the provider', async () => {
  const response = await handleTeacherRequest(request('/status'));
  expect(response.status).toBe(401);
  expect((await response.json()).wymagaKodu).toBe(true);
});
it('rejects requests from another website', async () => {
  const response = await handleTeacherRequest(request('/status', {headers:{Origin:'https://other.example',Authorization:`Bearer ${code}`}}));
  expect(response.status).toBe(403);
});
it('allows phone preflight from FORGE', async () => {
  const response = await handleTeacherRequest(request('', {method:'OPTIONS',headers:{Origin:'https://odzi678biznes.github.io'}}));
  expect(response.status).toBe(204);
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://odzi678biznes.github.io');
});
it('keeps provider key out of status response', async () => {
  vi.stubEnv('ANTHROPIC_API_KEY','test-provider-secret');
  const response = await handleTeacherRequest(request('/status', {headers:{Authorization:`Bearer ${code}`}}));
  const body = await response.text();
  expect(response.status).toBe(200);
  expect(body).not.toContain('test-provider-secret');
});
it('rejects malformed nested context before provider call', async () => {
  vi.stubEnv('ANTHROPIC_API_KEY','test-provider-secret');
  const response = await handleTeacherRequest(request('', {method:'POST',headers:{Authorization:`Bearer ${code}`,'Content-Type':'application/json'},body:JSON.stringify({prosba:'skad',kontekst:{},historia:[]})}));
  expect(response.status).toBe(400);
});
it('limits request size before JSON parsing', async () => {
  vi.stubEnv('ANTHROPIC_API_KEY','test-provider-secret');
  const response = await handleTeacherRequest(request('', {method:'POST',headers:{Authorization:`Bearer ${code}`,'Content-Type':'application/json'},body:'x'.repeat(40_001)}));
  expect(response.status).toBe(413);
});
it('passes task and question to the model and returns its answer', async () => {
  vi.stubEnv('ANTHROPIC_API_KEY','test-provider-secret');
  const ask = vi.spyOn(teacher,'zapytaj').mockResolvedValue({tekst:'Najpierw zamień 16 na potęgę dwójki.',model:'test-model'});
  const body = {prosba:'pytanie',pytanie:'Od czego zacząć?',historia:[],kontekst:{przedmiot:'matematyka',lekcja:'Potęgi',zadanie:null,krok:{etap:'zasada',numer:1,z:3,pytanie:'Zapisz 16 jako potęgę dwójki.',wyjasnienie:'16 = 2^4'},odpowiedzUcznia:null,czyPoprawna:null,trudnosci:[]}};
  const response = await handleTeacherRequest(request('', {method:'POST',headers:{Authorization:`Bearer ${code}`,'Content-Type':'application/json'},body:JSON.stringify(body)}));
  expect(response.status).toBe(200);
  expect(ask).toHaveBeenCalledWith(body);
  expect((await response.json()).tekst).toContain('potęgę dwójki');
});
