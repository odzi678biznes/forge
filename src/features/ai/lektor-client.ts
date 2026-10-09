import { isTauri } from '@/data/create-storage';
import { kodNauczyciela } from '@/nauka/nauczyciel-klient';

const teacher = import.meta.env.VITE_NAUCZYCIEL_API_URL?.trim();
const fallback = isTauri() && !import.meta.env.DEV
  ? 'https://forge-teacher.vercel.app/api/lektor' : `${import.meta.env.BASE_URL}api/lektor`;
export const LEKTOR_API = (import.meta.env.VITE_LEKTOR_API_URL?.trim()
  || (teacher ? teacher.replace(/\/nauczyciel\/?$/, '/lektor') : fallback)).replace(/\/$/, '');

export const NATURAL_VOICES = [
  { id: 'pl-PL-ZofiaNeural', name: 'Zofia · naturalny głos' },
  { id: 'pl-PL-MarekNeural', name: 'Marek · naturalny głos' },
] as const;

export interface LektorStatus { dostepny: boolean; powod?: string; wymagaKodu?: boolean }

function authorization(): Record<string, string> {
  const code = kodNauczyciela();
  return code ? { Authorization: `Bearer ${code}` } : {};
}

export async function lektorStatus(signal: AbortSignal): Promise<LektorStatus> {
  try {
    const response = await fetch(LEKTOR_API, { headers: authorization(), signal, cache: 'no-store' });
    const body = await response.json() as LektorStatus;
    if (typeof body.dostepny !== 'boolean') throw new Error('Nieprawidłowy status');
    return body;
  } catch {
    return { dostepny: false, powod: 'Nie udało się połączyć z naturalnym lektorem. Sprawdź internet i spróbuj ponownie.' };
  }
}

// Nagrania tylko w pamięci bieżącej aplikacji. Powtórka nie generuje nowego audio.
const cache = new Map<string, Blob>();
let cacheSize = 0;

export async function lektorRecording(text: string, voice: string, signal: AbortSignal): Promise<Blob> {
  const key = JSON.stringify([voice, text]);
  const saved = cache.get(key);
  if (saved) {
    cache.delete(key);
    cache.set(key, saved);
    return saved;
  }
  const response = await fetch(LEKTOR_API, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...authorization() },
    signal, body: JSON.stringify({ text, voice }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { blad?: string; powod?: string };
    throw new Error(error.blad ?? error.powod ?? 'Nie udało się przygotować nagrania. Spróbuj ponownie.');
  }
  if (!response.headers.get('content-type')?.startsWith('audio/')) throw new Error('Lektor nie zwrócił nagrania. Spróbuj ponownie.');
  const blob = await response.blob();
  if (!blob.size || blob.size > 6_000_000) throw new Error('Nie udało się pobrać nagrania.');
  if (signal.aborted) throw new DOMException('Odczyt anulowany', 'AbortError');
  while (cache.size >= 40 || cacheSize + blob.size > 24_000_000) {
    const first = cache.keys().next().value;
    if (first === undefined) break;
    cacheSize -= cache.get(first)?.size ?? 0;
    cache.delete(first);
  }
  cache.set(key, blob);
  cacheSize += blob.size;
  return blob;
}
