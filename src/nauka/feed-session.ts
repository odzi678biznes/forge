import type { Wynik } from './KartaWidok';
import type { StanNauki, Zdarzenie } from './silnik';
import type { Lekcja } from './typy';
import type { Preference } from '@/data/types';
import { decodeLessonDraft, LESSON_DRAFT_PREFIX } from './lesson-draft';
import { LEKCJE as ORIGINAL_LEKCJE } from './lekcje';
import { migratePracticeCourse } from './practice-course';

export interface FeedSession {
  engineStamp: string;
  helpedTasks?: string[];
  directTasks?: string[];
  trening: number;
  kolejkaTreningu: string[];
  dobrzeTrening: number;
  biez: { id: string; wynik: Wynik | null; pomoc?: boolean } | null;
  ekran: 'karta' | 'stop' | 'koniec' | 'odlozona';
  historia: { id: string; wynik: Wynik | null; pomoc?: boolean }[];
  podglad: number | null;
  zdarzenie: Zdarzenie | null;
  wynikSerii: string | null;
  nota: string | null;
}

export function feedEngineStamp(stan: StanNauki, lesson: Lekcja): string {
  return JSON.stringify({ course: lesson.seria, lesson: stan.lekcje[lesson.skillId] ?? null,
    review: stan.powtorki[lesson.skillId] ?? null,
    training: lesson.karty.map(k => [k.id, stan.trening?.[k.id] ?? null]),
  });
}
export function isFeedSession(value: unknown): value is FeedSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as FeedSession;
  const position = (p: FeedSession['biez']) => p === null || (!!p && typeof p.id === 'string'
    && (p.pomoc === undefined || typeof p.pomoc === 'boolean')
    && (p.wynik === null || (!!p.wynik && typeof p.wynik.poprawna === 'boolean' && typeof p.wynik.tekst === 'string')));
  return (s.directTasks === undefined || (Array.isArray(s.directTasks) && s.directTasks.every(x=>typeof x==='string'))) && (s.helpedTasks === undefined || (Array.isArray(s.helpedTasks) && s.helpedTasks.every(x => typeof x === 'string'))) && typeof s.engineStamp === 'string' && Number.isInteger(s.trening) && s.trening >= 0
    && Number.isInteger(s.dobrzeTrening) && s.dobrzeTrening >= 0
    && Array.isArray(s.kolejkaTreningu) && s.kolejkaTreningu.every(x => typeof x === 'string')
    && position(s.biez) && ['karta', 'stop', 'koniec', 'odlozona'].includes(s.ekran)
    && Array.isArray(s.historia) && s.historia.every(p => p !== null && position(p))
    && (s.podglad === null || (Number.isInteger(s.podglad) && s.podglad >= 0 && s.podglad < s.historia.length))
    && (s.zdarzenie === null || (!!s.zdarzenie && typeof s.zdarzenie.stop === 'boolean' && typeof s.zdarzenie.koniecSerii === 'boolean'))
    && (s.wynikSerii === null || typeof s.wynikSerii === 'string') && (s.nota === null || typeof s.nota === 'string');
}
/** Restore presentation only when it describes the already saved learning evidence. */
export function resumeFeedSession(saved: FeedSession | null, stan: StanNauki, lesson: Lekcja): FeedSession | null {
  if (!saved || !['karta', 'stop'].includes(saved.ekran)) return null;
  const stamp = feedEngineStamp(stan, lesson);
  if (saved.engineStamp !== stamp && !matchesCourseUpgrade(saved.engineStamp, stan, lesson, stamp)) return null;
  const ids = new Set(lesson.karty.map(k => k.id));
  if ((saved.biez && !ids.has(saved.biez.id)) || saved.historia.some(p => !ids.has(p.id))
    || saved.kolejkaTreningu.some(id => !ids.has(id))) return null;
  return saved.engineStamp === stamp ? saved : { ...saved, engineStamp: stamp };
}

/** A shorter course must not erase the answer history in a paused phone lesson. */
function matchesCourseUpgrade(oldStamp: string, stan: StanNauki, lesson: Lekcja, currentStamp: string): boolean {
  if (stan.practiceRevision !== 1) return false;
  const original = ORIGINAL_LEKCJE.find(l => l.skillId === lesson.skillId);
  if (!original || JSON.stringify(original.seria) === JSON.stringify(lesson.seria)) return false;
  try {
    const parsed = JSON.parse(oldStamp) as { lesson: StanNauki['lekcje'][string] | null };
    // Reconstruct only the old presentation position, never attempts or review dates.
    const legacy: StanNauki = { ...stan, lekcje: { ...stan.lekcje } };
    delete legacy.practiceRevision;
    if (parsed.lesson === null) delete legacy.lekcje[lesson.skillId];
    else legacy.lekcje[lesson.skillId] = parsed.lesson;
    // Both comparisons are strict: actual evidence changes still invalidate a draft.
    return oldStamp === feedEngineStamp(legacy, original)
      && currentStamp === feedEngineStamp(migratePracticeCourse(legacy), lesson);
  } catch { return false; }
}

export interface ResumeFeed { skillId: string; tryb: 'nauka' | 'powtorka' | 'trening'; title: string; updatedAt: number }
export function findResumableFeed(preferences: Preference[], stan: StanNauki, lessons: Lekcja[]): ResumeFeed | null {
  const candidates: ResumeFeed[] = [];
  for (const lesson of lessons) for (const tryb of ['nauka', 'powtorka', 'trening'] as const) {
    const key = `${LESSON_DRAFT_PREFIX}feed:${tryb}:${lesson.skillId}`;
    const saved = preferences.filter(p => p.key === key).map(p => decodeLessonDraft(p.value, isFeedSession))
      .filter(p => p !== null).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (saved && resumeFeedSession(saved.value, stan, lesson)) candidates.push({ skillId: lesson.skillId, tryb, title: lesson.tytul, updatedAt: saved.updatedAt });
  }
  return candidates.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
}

export function localFeedCheckpoints(): Preference[] {
  try {
    return Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .filter((key): key is string => Boolean(key?.startsWith(`${LESSON_DRAFT_PREFIX}feed:`)))
      .map(key => ({ key, value: localStorage.getItem(key) ?? 'null' }));
  } catch { return []; }
}
