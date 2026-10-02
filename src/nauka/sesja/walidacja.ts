import type { Interakcja, MathStep, MathTask } from './typy';
import { ETAP } from './typy';
import { czytelne, rownowazne } from './wyrazenia';

/**
 * Walidacja struktury zadania — dla zadań pisanych ręcznie (test treści)
 * i przede wszystkim dla zadań z AI. Zadanie, które nie przejdzie walidacji,
 * nie trafia do UI ani do pamięci podręcznej. AI dostarcza treść, aplikacja
 * pilnuje, że da się ją pokazać i sprawdzić lokalnie.
 */

export interface WynikWalidacji {
  ok: boolean;
  bledy: string[];
}

const tekst = (v: unknown, min = 1): v is string => typeof v === 'string' && v.trim().length >= min;

/** Nawiasy $…$ muszą się domykać — inaczej KaTeX pokaże surowy LaTeX. */
function dolary(s: string): boolean {
  return (s.replace(/\\\$/g, '').match(/\$/g)?.length ?? 0) % 2 === 0;
}

function walidujInterakcje(i: unknown, gdzie: string, bledy: string[]): void {
  const x = i as Interakcja | null;
  if (!x || typeof x !== 'object') {
    bledy.push(`${gdzie}: brak odpowiedzi`);
    return;
  }
  if (x.typ === 'wybor') {
    if (!Array.isArray(x.opcje) || x.opcje.length < 2 || x.opcje.length > 5 || !x.opcje.every((o) => tekst(o))) bledy.push(`${gdzie}: 2–5 opcji`);
    else if (new Set(x.opcje).size !== x.opcje.length) bledy.push(`${gdzie}: powtórzone opcje`);
    if (!Number.isInteger(x.poprawna) || x.poprawna < 0 || x.poprawna >= (x.opcje?.length ?? 0)) bledy.push(`${gdzie}: zły indeks poprawnej`);
    for (const k of Object.keys(x.bledne ?? {})) {
      if (Number(k) === x.poprawna) bledy.push(`${gdzie}: diagnoza błędu przy poprawnej opcji`);
    }
  } else if (x.typ === 'wyrazenie') {
    if (!tekst(x.zmienna) || x.zmienna.length !== 1) bledy.push(`${gdzie}: zmienna musi być jedną literą`);
    else if (!czytelne(x.oczekiwane, x.zmienna)) bledy.push(`${gdzie}: oczekiwane wyrażenie nieczytelne`);
    else {
      for (const t of x.typowe ?? []) {
        if (!czytelne(t.wyrazenie, x.zmienna)) bledy.push(`${gdzie}: typowy błąd nieczytelny`);
        else if (rownowazne(t.wyrazenie, x.oczekiwane, x.zmienna)) bledy.push(`${gdzie}: typowy błąd równy poprawnej odpowiedzi`);
      }
    }
  } else if (x.typ === 'liczba') {
    if (typeof x.wartosc !== 'number' || !Number.isFinite(x.wartosc)) bledy.push(`${gdzie}: wartość nie jest liczbą`);
    for (const t of x.typowe ?? []) if (t.wartosc === x.wartosc) bledy.push(`${gdzie}: typowy błąd równy poprawnej odpowiedzi`);
  } else {
    bledy.push(`${gdzie}: nieznany typ odpowiedzi`);
  }
}

export function walidujZadanie(z: unknown): WynikWalidacji {
  const bledy: string[] = [];
  const t = z as MathTask | null;
  if (!t || typeof t !== 'object') return { ok: false, bledy: ['brak zadania'] };
  for (const pole of ['id', 'topic', 'subtopic', 'skill', 'question', 'finalAnswer'] as const) {
    if (!tekst(t[pole])) bledy.push(`brak pola ${pole}`);
  }
  if (![1, 2, 3, 4, 5].includes(t.difficulty)) bledy.push('trudność 1–5');
  if (t.examLevel !== 'PP' && t.examLevel !== 'PR') bledy.push('poziom PP albo PR');
  if (!t.source || !['forge', 'cke', 'ai'].includes(t.source.typ)) bledy.push('brak źródła');
  if (!Array.isArray(t.steps) || t.steps.length < 3 || t.steps.length > 12) bledy.push('3–12 kroków');
  const ids = new Set<string>();
  (t.steps ?? []).forEach((k: MathStep, i: number) => {
    const g = `krok ${i + 1}`;
    if (!tekst(k?.id) || ids.has(k.id)) bledy.push(`${g}: brak lub powtórzone id`);
    ids.add(k?.id);
    if (!(k?.stage in ETAP)) bledy.push(`${g}: nieznany etap`);
    for (const pole of ['skill', 'objective', 'prompt', 'explanation', 'hintLevel1', 'hintLevel2', 'hintLevel3', 'example', 'work'] as const) {
      if (!tekst(k?.[pole])) bledy.push(`${g}: brak ${pole}`);
      else if (!dolary(k[pole])) bledy.push(`${g}: niedomknięty wzór w ${pole}`);
    }
    if (!Array.isArray(k?.misconceptionTags)) bledy.push(`${g}: brak misconceptionTags`);
    walidujInterakcje(k?.answer, g, bledy);
  });
  if (tekst(t.question) && !dolary(t.question)) bledy.push('niedomknięty wzór w treści');
  return { ok: bledy.length === 0, bledy };
}
