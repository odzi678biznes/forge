import type {
  CodeTest,
  CommonError,
  Figure,
  Flashcard,
  FlashcardKind,
  Hint,
  HintLevel,
  LessonBlock,
  Question,
  QuestionKind,
  SqlTable,
  SqlValue,
  WorkedExample,
} from '@/data/types';

/**
 * Pomocnicze funkcje do pisania treści kursu.
 *
 * Pełny obiekt `Question` ma kilkanaście pól, z których większość w treści
 * autorskiej jest taka sama. Tu piszemy tylko to, co jest treścią zadania,
 * a resztę uzupełniają funkcje - mniej miejsca na pomyłkę przy przepisywaniu.
 *
 * Najważniejsze jest pole `verify`: funkcja, która LICZY wynik niezależnie od
 * wpisanej odpowiedzi. Test treści porównuje jedno z drugim - błąd rachunkowy
 * autora wychodzi w testach, zanim zobaczy go uczeń.
 */

export const AUTHORED = 'FORGE / autorskie';

/** Wyniki liczone niezależnie od odpowiedzi autora - sprawdzane w testach treści. */
export const VERIFIERS = new Map<string, () => number | string>();

type ErrorSpec = [matches: string | string[], cause: string, rule: string];

interface BaseSpec {
  id: string;
  skill: string;
  kind: QuestionKind;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  /**
   * Podpowiedzi od pierwszego szczebla. Cztery teksty dostają szczeble
   * 1, 2, 3 i 5 (bez fragmentu przykładu), pięć - 1..5, sześć - 1..6.
   */
  hints: string[];
  /** Rozwiązanie krok po kroku, jak przy tablicy. */
  steps: string[];
  /** Typowe błędy: odpowiedzi, które je zdradzają, przyczyna i złamana zasada. */
  errors: ErrorSpec[];
  /** Wykres albo figura do zadania. */
  figure?: Figure;
  /** Kod do analizy pokazywany pod treścią. */
  listing?: string;
  source?: string;
}

export interface NumericSpec extends BaseSpec {
  answer: string | number;
  variants?: string[];
  tolerance?: number;
  /** Niezależne wyliczenie wyniku. */
  verify?: () => number;
}

export interface TextSpec extends BaseSpec {
  answer: string;
  variants?: string[];
  verify?: () => string;
}

type Letter = 'A' | 'B' | 'C' | 'D';

export interface ChoiceSpec extends BaseSpec {
  choices: [string, string, string, string];
  answer: Letter;
  /** Liczba, którą powinna dawać poprawna odpowiedź - sprawdzana w testach. */
  verify?: () => number;
}

function hintLevels(count: number): HintLevel[] {
  if (count === 4) return [1, 2, 3, 5];
  if (count === 5) return [1, 2, 3, 4, 5];
  if (count === 6) return [1, 2, 3, 4, 5, 6];
  throw new Error(`Podpowiedzi muszą być 4, 5 albo 6, jest ${count}.`);
}

function toHints(texts: string[]): Hint[] {
  const levels = hintLevels(texts.length);
  return texts.map((text, i) => ({ level: levels[i] as Exclude<HintLevel, 0>, text }));
}

function toErrors(id: string, specs: ErrorSpec[]): CommonError[] {
  return specs.map(([matches, cause, rule], i) => ({
    id: `${id}-e${i + 1}`,
    matches: Array.isArray(matches) ? matches : [matches],
    cause,
    rule,
  }));
}

function base(spec: BaseSpec): Omit<Question, 'format' | 'answer' | 'acceptedVariants'> {
  return {
    id: spec.id,
    skillId: spec.skill,
    kind: spec.kind,
    prompt: spec.prompt,
    solution: spec.steps.join(' '),
    steps: spec.steps,
    hints: toHints(spec.hints),
    commonErrors: toErrors(spec.id, spec.errors),
    difficulty: spec.difficulty,
    source: spec.source ?? AUTHORED,
    verified: false,
    ...(spec.figure ? { figure: spec.figure } : {}),
    ...(spec.listing ? { listing: dedent(spec.listing) } : {}),
  };
}

/** Zadanie z odpowiedzią liczbową. */
export function numeric(spec: NumericSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  return {
    ...base(spec),
    format: 'numeric',
    answer: String(spec.answer),
    acceptedVariants: spec.variants ?? [],
    ...(spec.tolerance === undefined ? {} : { tolerance: spec.tolerance }),
  };
}

/** Zadanie z odpowiedzią tekstową (np. przedział, postać wyrażenia). */
export function text(spec: TextSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  return {
    ...base(spec),
    format: 'exact-text',
    answer: spec.answer,
    acceptedVariants: spec.variants ?? [],
  };
}

/**
 * Zadanie zamknięte A-D jak na maturze podstawowej.
 *
 * Błędne odpowiedzi nie są przypadkowe: każdy dystraktor powinien odpowiadać
 * konkretnemu błędowi, a `errors` przypisuje mu przyczynę. Wtedy wybór złej
 * litery mówi, CO poszło źle, a nie tylko że poszło.
 */
export function choice(spec: ChoiceSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  const q: Question = {
    ...base(spec),
    format: 'choice',
    answer: spec.answer,
    acceptedVariants: [],
    choices: spec.choices,
  };
  return shuffleChoices(q);
}

const LETTERS: Letter[] = ['A', 'B', 'C', 'D'];

/** FNV-1a - ten sam identyfikator daje zawsze ten sam wynik. */
function hashId(id: string): number {
  let h = 2166136261;
  for (const ch of id) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Kolejność odpowiedzi dla zadania: `order[nowaPozycja] = staraPozycja`. */
export function choiceOrder(id: string): number[] {
  let seed = hashId(id);
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    // Starsze bity - młodsze bity generatora liniowego mają krótki okres.
    return seed >>> 16;
  };
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

/**
 * Autor zapisuje zwykle poprawną odpowiedź jako pierwszą. Bez mieszania
 * prawie każde zadanie zamknięte miałoby odpowiedź A i uczeń uczyłby się
 * litery zamiast treści. Kolejność zależy od id zadania - jest stała, więc
 * zapisana odpowiedź ucznia znaczy zawsze to samo. Razem z odpowiedziami
 * przestawiane są litery w typowych błędach.
 */
function shuffleChoices(q: Question): Question {
  const order = choiceOrder(q.id);
  const moved = new Map(order.map((from, to) => [LETTERS[from]!, LETTERS[to]!]));
  const remap = (letter: string) => moved.get(letter as Letter) ?? letter;
  return {
    ...q,
    answer: remap(q.answer),
    choices: order.map((from) => q.choices![from]!),
    commonErrors: q.commonErrors.map((e) => ({ ...e, matches: e.matches.map(remap) })),
  };
}

// ---------------------------------------------------------------------------
// Zadania programistyczne w Pythonie
// ---------------------------------------------------------------------------

/** Usuwa wspólne wcięcie i puste linie z brzegów - kod w szablonach czyta się wygodniej. */
export function dedent(code: string): string {
  const lines = code.replace(/\t/g, '    ').split('\n');
  while (lines.length > 0 && lines[0]!.trim() === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === '') lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim() !== '').map((l) => /^ */.exec(l)![0].length));
  return `${lines.map((l) => l.slice(indent)).join('\n')}\n`;
}

export interface PyTaskSpec extends Omit<BaseSpec, 'errors'> {
  functionName: string;
  /** Nazwy parametrów - z nich powstaje sygnatura i kod startowy. */
  params: string[];
  /** Opis typów pokazywany uczniowi, np. "lista liczb całkowitych -> int". */
  types: string;
  tests: CodeTest[];
  /** Wzorcowe rozwiązanie - pokazywane po próbie i sprawdzane w testach treści. */
  model: string;
  /** Własny kod startowy; domyślnie pusta funkcja z komentarzem. */
  starter?: string;
}

/** Zadanie: napisz funkcję w Pythonie, ocenianą na testach jawnych i ukrytych. */
export function pyTask(spec: PyTaskSpec): Question {
  const signature = `def ${spec.functionName}(${spec.params.join(', ')})  # ${spec.types}`;
  const starter =
    spec.starter ?? `def ${spec.functionName}(${spec.params.join(', ')}):\n    # Twoje rozwiązanie\n    pass\n`;
  return {
    ...base({ ...spec, errors: [] }),
    format: 'code',
    answer: 'program',
    acceptedVariants: [],
    code: {
      language: 'python',
      functionName: spec.functionName,
      signature,
      starterCode: starter,
      tests: spec.tests,
      modelSolution: dedent(spec.model),
    },
  };
}

// ---------------------------------------------------------------------------
// Zadania SQL
// ---------------------------------------------------------------------------

export type SqlRow = SqlValue[];

export interface SqlFixture {
  name: string;
  /** Dane: tabela → wiersze (wartości w kolejności kolumn z CREATE TABLE). */
  data: Record<string, SqlRow[]>;
}

export interface SqlTaskSpec extends Omit<BaseSpec, 'errors'> {
  /** Instrukcje CREATE TABLE — pokazywane uczniowi i wykonywane przed każdym testem. */
  schema: string;
  /** Pierwszy zestaw danych jest przykładem widocznym dla ucznia, pozostałe są ukryte. */
  fixtures: SqlFixture[];
  /** Wzorcowe zapytanie. */
  model: string;
  /** Zapytanie sprawdzające stan bazy — dla zadań zmieniających dane. */
  check?: string;
  /** Czy kolejność wierszy jest częścią zadania (ORDER BY). */
  ordered?: boolean;
  starter?: string;
  /**
   * Oczekiwane wyniki (zestaw danych → wiersze). Generuje je skrypt
   * `scripts/sql-expected.ts` ze wzorcowego zapytania; test treści pilnuje,
   * żeby były aktualne.
   */
  expected?: Record<string, SqlRow[]>;
}

function sqlLiteral(v: SqlValue): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${v.replace(/'/g, "''")}'`;
}

/** Skrypt tworzący bazę: struktura + dane zestawu. */
export function sqlSetup(schema: string, data: Record<string, SqlRow[]>): string {
  const inserts = Object.entries(data)
    .filter(([, rows]) => rows.length > 0)
    .map(([table, rows]) => `INSERT INTO ${table} VALUES\n${rows.map((r) => `(${r.map(sqlLiteral).join(', ')})`).join(',\n')};`);
  return [dedent(schema), ...inserts].join('\n');
}

/** Nazwy kolumn każdej tabeli z instrukcji CREATE TABLE. */
export function schemaColumns(schema: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const m of schema.matchAll(/CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi)) {
    const parts: string[] = [];
    let depth = 0;
    let current = '';
    for (const c of m[2] ?? '') {
      if (c === '(') depth += 1;
      if (c === ')') depth -= 1;
      if (c === ',' && depth === 0) {
        parts.push(current);
        current = '';
      } else current += c;
    }
    parts.push(current);
    out[m[1]!] = parts
      .map((p) => p.trim())
      .filter((p) => p !== '' && !/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(p))
      .map((p) => p.split(/\s+/)[0]!);
  }
  return out;
}

/** Zadanie: napisz zapytanie SQL, sprawdzane na kilku bazach (jawnej i ukrytych). */
export function sqlTask(spec: SqlTaskSpec): Question {
  const columns = schemaColumns(spec.schema);
  const sample = spec.fixtures[0];
  if (!sample) throw new Error(`${spec.id}: zadanie SQL potrzebuje co najmniej jednego zestawu danych.`);
  const tables: SqlTable[] = Object.entries(sample.data).map(([name, rows]) => ({
    name,
    columns: columns[name] ?? [],
    rows,
  }));
  return {
    ...base({ ...spec, errors: [] }),
    format: 'code',
    answer: 'program',
    acceptedVariants: [],
    code: {
      language: 'sql',
      functionName: 'zapytanie',
      signature: dedent(spec.schema).trimEnd(),
      starterCode: spec.starter ?? '-- Twoje zapytanie\n',
      tests: spec.fixtures.map((fx, i) => ({
        name: fx.name,
        input: [sqlSetup(spec.schema, fx.data), spec.check ?? null, spec.ordered ?? false],
        expected: spec.expected?.[fx.name] ?? null,
        ...(i > 0 ? { hidden: true } : {}),
      })),
      modelSolution: dedent(spec.model),
      sql: { schema: dedent(spec.schema).trimEnd(), tables },
    },
  };
}

// ---------------------------------------------------------------------------
// Lekcje i fiszki
// ---------------------------------------------------------------------------

export const p = (body: string): LessonBlock => ({ kind: 'text', body });
export const f = (tex: string, caption?: string): LessonBlock =>
  caption === undefined ? { kind: 'formula', tex } : { kind: 'formula', tex, caption };
export const tip = (body: string): LessonBlock => ({ kind: 'tip', body });
export const warn = (body: string): LessonBlock => ({ kind: 'warning', body });
/** Listing kodu w lekcji. Kod jest pokazywany dosłownie. */
export const listing = (code: string, caption?: string): LessonBlock =>
  caption === undefined ? { kind: 'code', code } : { kind: 'code', code, caption };

/**
 * Przykład rozwiązany. Krok to albo sam tekst, albo [tekst, dlaczego].
 */
export function example(
  prompt: string,
  steps: Array<string | [string, string]>,
  answer: string,
): WorkedExample {
  return {
    prompt,
    steps: steps.map((s) => (Array.isArray(s) ? { text: s[0], why: s[1] } : { text: s })),
    answer,
  };
}

export function card(
  id: string,
  skillId: string,
  kind: FlashcardKind,
  front: string,
  back: string,
): Flashcard {
  return { id, skillId, kind, front, back };
}
