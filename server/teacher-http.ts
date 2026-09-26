import { timingSafeEqual } from 'node:crypto';
import { status, waliduj, zapytaj } from './nauczyciel.js';

/** Public endpoint: provider credentials stay on the server. Access code is private. */
export async function handleTeacherRequest(request: Request): Promise<Response> {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Origin' });
  const origin = request.headers.get('origin');
  const allowed = (process.env.FORGE_ALLOWED_ORIGINS ?? 'https://odzi678biznes.github.io').split(',').map(s => s.trim());
  const json = (code: number, body: unknown) => new Response(JSON.stringify(body), { status: code, headers });
  if (origin && !allowed.includes(origin) && origin !== new URL(request.url).origin) return json(403, { blad: 'Ta strona nie ma dostępu do nauczyciela.' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const isStatus = new URL(request.url).pathname.endsWith('/status');
  if (request.method !== (isStatus ? 'GET' : 'POST')) return json(405, { blad: 'Nieobsługiwana metoda.' });
  const secret = process.env.FORGE_TEACHER_ACCESS_CODE?.trim();
  if (!secret || secret.length < 24) return json(503, { blad: 'Nauczyciel czeka na konfigurację dostępu.' });
  const actual = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return json(401, { dostepny: false, model: null, powod: 'Wpisz swój kod dostępu do nauczyciela.', wymagaKodu: true });
  }
  const availability = status();
  if (isStatus) return json(200, availability);
  if (!availability.dostepny) return json(503, { blad: availability.powod });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { blad: 'Wymagany JSON.' });
  // Bound the stream before parsing, including chunked requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return json(400, { blad: 'Brak pytania.' });
  let bytes = 0;
  let text = '';
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 40_000) { await reader.cancel(); return json(413, { blad: 'Pytanie jest zbyt długie.' }); }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  let body: unknown;
  try { body = JSON.parse(text); } catch { return json(400, { blad: 'Nieprawidłowe pytanie.' }); }
  const query = waliduj(body);
  if (!query) return json(400, { blad: 'Niepełny kontekst zadania.' });
  try { return json(200, await zapytaj(query)); }
  catch { return json(502, { blad: 'Nauczyciel nie odpowiedział. Spróbuj ponownie za chwilę.' }); }
}
