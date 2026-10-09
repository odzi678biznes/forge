import { kodNauczyciela, ustawKodNauczyciela } from '../../nauka/nauczyciel-klient';
import { isTauri } from '../../data/create-storage';
import type { TutorImage, TutorSnapshot, TutorStatus } from './types';

export interface TutorConnection { base: string; token: string; role: 'learner' | 'scanner' }
const CONNECTION_KEY = 'forge.tutor.connection.v1';
export function defaultTutorApi(): string {
  const teacher = import.meta.env.VITE_NAUCZYCIEL_API_URL?.trim();
  const fallback = isTauri() && !import.meta.env.DEV ? 'https://forge-teacher.vercel.app/api/tutor' : `${location.origin}${import.meta.env.BASE_URL}api/tutor`;
  return import.meta.env.VITE_TUTOR_API_URL?.trim() || (teacher ? teacher.replace(/\/nauczyciel\/?$/, '/tutor') : fallback);
}
export function validApi(base: string): string {
  const url = new URL(base, location.origin);
  if (url.username || url.password || url.hash || url.search || !['http:', 'https:'].includes(url.protocol)) throw new Error('Wpisz prawidłowy adres serwera.');
  const octets = url.hostname.split('.').map(Number);
  const privateIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) && octets.every(n => n >= 0 && n <= 255)
    && (octets[0] === 10 || octets[0] === 192 && octets[1] === 168 || octets[0] === 172 && octets[1]! >= 16 && octets[1]! <= 31);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && !privateIp) throw new Error('Serwer korepetytora wymaga HTTPS.');
  return url.href.replace(/\/$/, '');
}
export function loadConnection(): TutorConnection | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONNECTION_KEY) ?? 'null') as TutorConnection | null;
    return c && /^[A-Za-z0-9_-]{43}$/.test(c.token) && ['learner', 'scanner'].includes(c.role) ? { ...c, base: validApi(c.base) } : null;
  } catch { return null; }
}
export function saveConnection(c: TutorConnection): void {
  try { localStorage.setItem(CONNECTION_KEY, JSON.stringify(c)); } catch { throw new Error('Włącz zapisywanie danych przeglądarki, aby zachować połączenie między sesjami.'); }
}
export function forgetConnection(): void { localStorage.removeItem(CONNECTION_KEY); }
export function takeScannerLink(): TutorConnection | null {
  const hash = location.hash;
  if (!hash.startsWith('#tutor-scan=')) return null;
  const params = new URLSearchParams(hash.slice(1));
  const access = params.get('tutor-scan');
  if (!access || !/^[A-Za-z0-9_-]{43}$/.test(access)) throw new Error('Link parowania jest nieprawidłowy.');
  const c: TutorConnection = { base: validApi(params.get('api') || defaultTutorApi()), token: access, role: 'scanner' };
  // Capability stays in the URL fragment, never in requests or Referer. Clear after pairing.
  saveConnection(c); history.replaceState(history.state, '', location.pathname + location.search + '#tutor');
  return c;
}
export function wantsTutor(): boolean { return location.hash.startsWith('#tutor') || loadConnection()?.role === 'scanner'; }
export class TutorApiError extends Error { constructor(public status: number, message: string) { super(message); } }

async function request<T>(base: string, access: string, payload?: unknown, query = ''): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + query, { method: payload === undefined ? 'GET' : 'POST', headers: {
      Accept: 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}), ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
    }, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }), cache: 'no-store', signal: AbortSignal.timeout(payload ? 115_000 : 12_000) });
  } catch { throw new TutorApiError(0, 'Brak odpowiedzi serwera. Sprawdź połączenie. Zdjęcie czekające na wysłanie zostaje na urządzeniu.'); }
  const data = await response.json().catch(() => null) as T & { error?: string } | null;
  if (!response.ok) throw new TutorApiError(response.status, data?.error || 'Serwer nie zakończył operacji. Spróbuj ponownie.');
  if (!data || typeof data !== 'object') throw new TutorApiError(502, 'Serwer zwrócił nieprawidłowe dane.');
  return data;
}
export async function tutorStatus(base: string): Promise<TutorStatus> { return request(validApi(base), '', undefined, '?action=status'); }
export async function connectTutor(base: string, code: string, initialStates: unknown): Promise<TutorConnection> {
  const api = validApi(base);
  const result = await request<{ token: string }>(api, code.trim() || kodNauczyciela(), { action: 'register', initialStates });
  const c: TutorConnection = { base: api, token: result.token, role: 'learner' };
  saveConnection(c); if (code.trim()) ustawKodNauczyciela(code); return c;
}
export function getSnapshot(c: TutorConnection, sessionId?: string): Promise<TutorSnapshot> {
  return request(c.base, c.token, undefined, sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '');
}
export function command(c: TutorConnection, action: string, data: Record<string, unknown> = {}): Promise<TutorSnapshot> { return request(c.base, c.token, { ...data, action }); }
export function getImage(c: TutorConnection, id: string): Promise<{ image: TutorImage }> { return request(c.base, c.token, undefined, `?imageId=${encodeURIComponent(id)}`); }
export async function pairPhone(c: TutorConnection, publicAppUrl: string, phoneApi: string): Promise<string> {
  const url = new URL(publicAppUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Wpisz adres wersji webowej Forge dostępnej na telefonie.');
  const api = validApi(phoneApi);
  const { token } = await request<{ token: string }>(c.base, c.token, { action: 'pair' });
  url.hash = new URLSearchParams({ 'tutor-scan': token, api }).toString();
  return url.href;
}
