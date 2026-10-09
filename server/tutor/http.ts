import type { IncomingMessage, ServerResponse } from 'node:http';
import { MODEL, status as teacherStatus } from '../nauczyciel';
import { authenticate, hasAccess } from './auth';
import { TutorEngine, TutorError } from './engine';
import { claudeProvider, type TutorProvider } from './provider';
import { storeKind, tutorStore, type TutorStore } from './store';
import type { TutorImage } from '../../src/features/tutor/types';

const MAX_BODY = 3_800_000;
export function createTutorHandler(dependencies: { store: () => TutorStore; provider: TutorProvider; availability?: () => boolean; kind?: () => 'sqlite' | 'redis' | null }) {
  return async (request: Request): Promise<Response> => {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Origin', 'Referrer-Policy': 'no-referrer' });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    const url = new URL(request.url), origin = request.headers.get('origin');
    const allowed = (process.env.FORGE_ALLOWED_ORIGINS ?? 'https://odzi678biznes.github.io').split(',').map(s => s.trim());
    if (origin && origin !== url.origin && !allowed.includes(origin)) return json(403, { error: 'Ta strona nie ma dostępu do korepetytora.' });
    if (origin) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) return json(405, { error: 'Nieobsługiwana metoda.' });
    const available = dependencies.availability?.() ?? teacherStatus().dostepny;
    const kind = dependencies.kind ? dependencies.kind() : storeKind();
    if (request.method === 'GET' && url.searchParams.get('action') === 'status') {
      const codeReady = Boolean(process.env.FORGE_TEACHER_ACCESS_CODE && process.env.FORGE_TEACHER_ACCESS_CODE.trim().length >= 24);
      return json(200, { available: available && kind !== null && codeReady, storage: kind,
        model: available ? process.env.FORGE_TUTOR_MODEL || MODEL : null,
        reason: !available ? 'Claude nie jest podłączony na serwerze.' : !kind ? 'Serwer wymaga trwałego magazynu sesji.' : !codeReady ? 'Serwer wymaga prywatnego kodu dostępu.' : null });
    }
    if (kind === null) return json(503, { error: 'Serwer wymaga trwałego magazynu sesji.' });
    let body: Record<string, unknown> = {};
    if (request.method === 'POST') {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { error: 'Wymagany JSON.' });
      if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return json(413, { error: 'Zdjęcie jest za duże.' });
      const reader = request.body?.getReader();
      if (!reader) return json(400, { error: 'Brak danych.' });
      let bytes = 0, raw = '';
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_BODY) { await reader.cancel(); return json(413, { error: 'Zdjęcie jest za duże.' }); }
          raw += decoder.decode(value, { stream: true });
        }
        const parsed: unknown = JSON.parse(raw + decoder.decode());
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json(400, { error: 'Nieprawidłowe dane.' });
        body = parsed as Record<string, unknown>;
      } catch { return json(400, { error: 'Nieprawidłowy JSON.' }); }
    }
    try {
      const store = dependencies.store(), engine = new TutorEngine(store, dependencies.provider);
      if (body.action === 'register') {
        if (!hasAccess(request.headers.get('authorization'))) return json(401, { error: 'Wpisz prywatny kod dostępu do nauczyciela. Nie jest to klucz Anthropic.' });
        if (!available) return json(503, { error: 'Podłącz Claude na serwerze przed rozpoczęciem.' });
        return json(201, await engine.register(body.initialStates));
      }
      const auth = await authenticate(store, request.headers.get('authorization'));
      if (!auth) return json(401, { error: 'Połącz urządzenie z profilem korepetytora.' });
      const w = await engine.load(auth.ownerId);
      if (auth.role === 'scanner' && !w.scanners.some(s => s.hash === auth.hash && s.expiresAt > Date.now())) return json(401, { error: 'Parowanie telefonu wygasło lub zostało cofnięte.' });
      if (request.method === 'GET') {
        const imageId = url.searchParams.get('imageId');
        if (imageId) {
          if (auth.role !== 'learner' || !w.sessions.some(s => s.submissions.some(a => a.imageIds.includes(imageId)))) return json(403, { error: 'Brak dostępu do zdjęcia.' });
          const photo = await store.read<TutorImage>(`image/${imageId}`);
          return photo ? json(200, { image: photo.value }) : json(404, { error: 'Nie znaleziono zdjęcia.' });
        }
        return json(200, engine.snapshot(w, auth.role, auth.role === 'learner' ? url.searchParams.get('sessionId') ?? undefined : undefined));
      }
      const action = body.action;
      if (auth.role === 'scanner' && action !== 'upload') return json(403, { error: 'Telefon służy do przesyłania zdjęć. Steruj sesją na komputerze.' });
      if (['start', 'next', 'hint', 'chat', 'analyze', 'lesson', 'plan'].includes(String(action)) && !available) return json(503, { error: 'Claude jest niedostępny. Zapisane zdjęcia i sesja pozostają dostępne.' });
      let updated;
      switch (action) {
        case 'start': updated = await engine.start(auth.ownerId, body); break;
        case 'next': updated = await engine.next(auth.ownerId, body); break;
        case 'hint': updated = await engine.help(auth.ownerId, body, false); break;
        case 'chat': updated = await engine.help(auth.ownerId, body, true); break;
        case 'upload': updated = await engine.upload(auth.ownerId, body); break;
        case 'analyze': updated = await engine.analyze(auth.ownerId, body); break;
        case 'lesson': updated = await engine.lesson(auth.ownerId, body); break;
        case 'finish': updated = await engine.finish(auth.ownerId); break;
        case 'plan': updated = await engine.plan(auth.ownerId); break;
        case 'pair': return json(200, { token: await engine.pair(auth.ownerId) });
        case 'revoke': updated = await engine.revoke(auth.ownerId); break;
        case 'repeat': updated = await engine.repeat(auth.ownerId, body); break;
        case 'select': case 'pause': case 'resume': case 'style': case 'lesson-step': case 'lesson-dismiss': updated = await engine.simple(auth.ownerId, String(action), body); break;
        default: return json(400, { error: 'Nieznana operacja.' });
      }
      return json(200, engine.snapshot(updated, auth.role));
    } catch (error) {
      if (error instanceof TutorError) return json(error.status, { error: error.message });
      // Provider errors may contain request details: never serialize raw errors or credentials.
      return json(502, { error: 'Nie udało się zakończyć operacji. Sprawdź połączenie i konfigurację Claude, a potem spróbuj ponownie. Twoja sesja jest zapisana.' });
    }
  };
}
export const handleTutorRequest = createTutorHandler({ store: tutorStore, provider: claudeProvider });

/** Same authenticated API in Vite dev/preview and in the serverless deployment. */
export async function tutorMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (!(req.url ?? '').split('?')[0]?.endsWith('/api/tutor')) { next(); return; }
  try {
    let bytes = 0, body = '';
    const decoder = new TextDecoder();
    if (req.method === 'POST') {
      for await (const chunk of req) {
        bytes += Buffer.byteLength(chunk);
        if (bytes > MAX_BODY) { res.writeHead(413, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Zdjęcie jest za duże.' })); return; }
        body += decoder.decode(typeof chunk === 'string' ? Buffer.from(chunk) : chunk, { stream: true });
      }
      body += decoder.decode();
    }
    const request = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
      method: req.method || 'GET', headers: Object.fromEntries(Object.entries(req.headers).filter((x): x is [string, string] => typeof x[1] === 'string')),
      ...(req.method === 'POST' ? { body } : {}),
    });
    const response = await handleTutorRequest(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries())); res.end(await response.text());
  } catch { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Serwer nie odpowiedział.' })); }
}
