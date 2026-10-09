import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const VOICES = ['pl-PL-ZofiaNeural', 'pl-PL-MarekNeural'];
const MAX_BODY = 16_000;

function escapeXml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Klucz Speech zostaje na serwerze; publiczny endpoint wymaga kodu FORGE. */
export async function handleLektorRequest(request: Request, local = false): Promise<Response> {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Origin' });
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const allowed = (process.env.FORGE_ALLOWED_ORIGINS
    ?? 'https://odzi678biznes.github.io,http://tauri.localhost,https://tauri.localhost,tauri://localhost').split(',').map((s) => s.trim());
  if (origin && origin !== url.origin && !allowed.includes(origin)) return json(403, { blad: 'Ta strona nie ma dostępu do lektora.' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET' && request.method !== 'POST') return json(405, { blad: 'Nieobsługiwana metoda.' });

  const key = process.env.AZURE_SPEECH_KEY?.trim();
  const region = process.env.AZURE_SPEECH_REGION?.trim();
  if (!key || !region || !/^[a-z0-9]+$/.test(region)) {
    return json(503, { dostepny: false, powod: 'Naturalny lektor nie jest jeszcze podłączony. Możesz korzystać z głosu urządzenia.' });
  }
  const localOnly = local && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const code = process.env.FORGE_TEACHER_ACCESS_CODE?.trim();
  if (!localOnly || code) {
    if (!code || code.length < 24) return json(503, { dostepny: false, powod: 'Naturalny lektor czeka na konfigurację dostępu.' });
    const actual = Buffer.from(request.headers.get('authorization') ?? '');
    const expected = Buffer.from(`Bearer ${code}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return json(401, { dostepny: false, wymagaKodu: true, powod: 'Wpisz swój kod dostępu do FORGE.' });
    }
  }
  if (request.method === 'GET') return json(200, { dostepny: true });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { blad: 'Wymagany JSON.' });
  const reader = request.body?.getReader();
  if (!reader) return json(400, { blad: 'Brak tekstu do odczytu.' });
  let size = 0;
  let text = '';
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); return json(413, { blad: 'Fragment jest zbyt długi.' }); }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  let body: unknown;
  try { body = JSON.parse(text); } catch { return json(400, { blad: 'Nieprawidłowe zapytanie.' }); }
  if (!body || typeof body !== 'object') return json(400, { blad: 'Brak tekstu do odczytu.' });
  const input = body as Record<string, unknown>;
  if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 1800
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input.text)
    || typeof input.voice !== 'string' || !VOICES.includes(input.voice)) {
    return json(400, { blad: 'Nieprawidłowy fragment lub głos.' });
  }
  try {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'FORGE-Lektor',
      },
      body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pl-PL"><voice name="${input.voice}"><prosody rate="-3%">${escapeXml(input.text)}</prosody></voice></speak>`,
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]),
    });
    if (!response.ok) return json(response.status === 429 ? 429 : 502, { blad: 'Lektor nie przygotował nagrania. Spróbuj ponownie za chwilę.' });
    const audio = await response.arrayBuffer();
    if (!audio.byteLength || audio.byteLength > 6_000_000) return json(502, { blad: 'Nie udało się pobrać nagrania.' });
    headers.set('Content-Type', 'audio/mpeg');
    return new Response(audio, { headers });
  } catch {
    return json(502, { blad: 'Nie udało się połączyć z lektorem. Spróbuj ponownie.' });
  }
}

/** Adapter lokalnego serwera Vite — ten sam handler co w funkcji Vercel. */
export async function lektorMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> {
  if (!(req.url ?? '').split('?')[0]?.endsWith('/api/lektor')) { next(); return; }
  const controller = new AbortController();
  req.on('aborted', () => controller.abort());
  try {
    let body = '';
    if (req.method !== 'GET' && req.method !== 'OPTIONS') {
      let size = 0;
      const decoder = new TextDecoder();
      for await (const chunk of req) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
        size += bytes.length;
        if (size > MAX_BODY) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ blad: 'Fragment jest zbyt długi.' }));
          return;
        }
        body += decoder.decode(bytes, { stream: true });
      }
      body += decoder.decode();
    }
    const requestHeaders = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value) requestHeaders.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
    const response = await handleLektorRequest(new Request(`http://${req.headers.host ?? 'localhost'}${req.url}`, {
      method: req.method ?? 'GET', headers: requestHeaders, signal: controller.signal,
      ...(body ? { body } : {}),
    }), true);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ blad: 'Nie udało się przygotować nagrania.' }));
  }
}
