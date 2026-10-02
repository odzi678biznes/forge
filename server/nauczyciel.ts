import Anthropic from '@anthropic-ai/sdk';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  PROSBA_TEKST,
  type KontekstNauczyciela,
  type OdpowiedzNauczyciela,
  type StatusNauczyciela,
  type ZapytanieNauczyciela,
} from '../src/nauka/nauczyciel-kontekst.js';

/**
 * Nauczyciel AI po stronie serwera (dev i preview Vite).
 *
 * Klucz API czyta SDK ze zmiennej środowiskowej (ANTHROPIC_API_KEY) — nigdy
 * nie trafia do przeglądarki. Bez klucza endpoint odpowiada 503, a aplikacja
 * przechodzi w wyraźnie oznaczony tryb demonstracyjny.
 *
 * Poprawność odpowiedzi ucznia sprawdzają reguły i klucz CKE w aplikacji;
 * nauczyciel dostaje ten wynik w kontekście i ma go nie podważać.
 */

export const MODEL = process.env.FORGE_NAUCZYCIEL_MODEL ?? 'claude-sonnet-5';
const MAX_BODY = 40_000;
const MAX_HISTORIA = 12;

export function status(): StatusNauczyciela {
  const klucz = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  return klucz
    ? { dostepny: true, model: MODEL, powod: null }
    : {
        dostepny: false,
        model: null,
        powod: 'Serwer nie ma klucza API (zmienna ANTHROPIC_API_KEY nie jest ustawiona).',
      };
}

const SYSTEM = `Jesteś spokojnym, cierpliwym nauczycielem przygotowującym do matury (CKE). Uczeń jest początkujący.
Piszesz po polsku, prostymi zdaniami, krótko. Uczeń czyta na telefonie, więc odpowiedź ma być przejrzysta:
- jedna myśl = jeden krótki akapit (akapity oddzielaj pustą linią); zwykle 2–4 akapity, bez wstępów typu „Świetne pytanie”,
- kolejne kroki rachunku jako lista numerowana („1. …”), wyliczenia jako lista z „- ”,
- najważniejsze słowo lub wynik pogrubiaj **tak**, oszczędnie,
- wzory w tekście w LaTeX-u między $...$; ważny wzór lub przekształcenie w osobnej linii między $$...$$,
- kod w odwrotnych apostrofach; bez tabel, nagłówków i HTML-a.

Zasady:
- Najpierw pomagasz wykonać NASTĘPNY mały krok. Pełnego rozwiązania nie podajesz, dopóki uczeń wprost o nie nie poprosi (prośba „Pokaż pełne rozwiązanie”).
- Opierasz się na oryginalnym zadaniu CKE i oficjalnej odpowiedzi z kontekstu. Nie wymyślasz innych danych ani innej odpowiedzi.
- O tym, czy odpowiedź ucznia jest poprawna, zdecydowała już aplikacja (reguły i klucz CKE) — ten wynik jest w kontekście. Nie podważaj go.
- Gdy uczeń się pomylił, nazwij konkretną przyczynę błędu na podstawie jego odpowiedzi i wróć o krok.
- „Nie rozumiem” — wyjaśnij ten sam krok prościej, na mniejszym kawałku, z przykładem z tego zadania.
- „Skąd to się bierze?” — wyjaśnij sens reguły (dlaczego działa), nie tylko jak jej użyć.
- „Wytłumacz inaczej” — użyj innej drogi (inna analogia, inny sposób zapisu), nie powtarzaj poprzedniego wyjaśnienia.
- Nie zawstydzaj, nie poganiaj. Na koniec możesz zadać jedno krótkie pytanie sprawdzające.
- Jeśli pytanie nie dotyczy nauki, łagodnie wróć do zadania.`;

function opisKontekstu(k: KontekstNauczyciela): string {
  const z = k.zadanie;
  const linie = [
    `Przedmiot: ${k.przedmiot}. Lekcja: ${k.lekcja}.`,
    z
      ? [
          `Zadanie: ${z.zrodlo} — ${z.dokument}, zadanie ${z.numer}, poziom ${z.poziom}. Źródło: ${z.url}`,
          `Treść (dane z oryginału): ${z.tresc}`,
          z.odpowiedzi ? `Odpowiedzi: ${z.odpowiedzi.map((o, i) => `${'ABCD'[i]}. ${o}`).join('  ')}` : '',
          `Oficjalna odpowiedź (klucz CKE): ${z.oficjalnaOdpowiedz}`,
          `Zasady oceniania: ${z.zasadyOceniania}`,
          `Rozwiązanie krok po kroku: ${z.rozwiazanie.join(' | ')}`,
        ]
          .filter(Boolean)
          .join('\n')
      : 'To ćwiczenie pomocnicze FORGE — NIE jest zadaniem CKE (brak autentycznego zadania do tego tematu).',
    `Bieżący krok (${k.krok.numer} z ${k.krok.z}, etap: ${k.krok.etap}): ${k.krok.pytanie}`,
    k.krok.kontekst ? `Kontekst kroku: ${k.krok.kontekst}` : '',
    `Wyjaśnienie kroku w aplikacji: ${k.krok.wyjasnienie}`,
    k.odpowiedzUcznia !== null
      ? `Odpowiedź ucznia: ${k.odpowiedzUcznia} — aplikacja oceniła ją jako ${k.czyPoprawna ? 'POPRAWNĄ' : 'BŁĘDNĄ'}.`
      : 'Uczeń jeszcze nie odpowiedział na ten krok.',
    k.trudnosci.length > 0 ? `Wcześniejsze trudności w tej lekcji: ${k.trudnosci.join(' | ')}` : 'Wcześniejszych trudności brak.',
  ];
  return linie.filter(Boolean).join('\n');
}

export function waliduj(body: unknown): ZapytanieNauczyciela | null {
  const b = body as Partial<ZapytanieNauczyciela> | null;
  if (!b || typeof b !== 'object' || !b.kontekst || typeof b.prosba !== 'string') return null;
  if (!['nastepny-krok', 'nie-rozumiem', 'skad', 'inaczej', 'pelne', 'pytanie', 'korepetytor'].includes(b.prosba)) return null;
  if (!Array.isArray(b.historia)) return null;
  const text = (v: unknown): v is string => typeof v === 'string';
  const texts = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);
  const k = b.kontekst;
  if (typeof k !== 'object' || !text(k.przedmiot) || !text(k.lekcja) || !k.krok || !texts(k.trudnosci)) return null;
  if (!text(k.krok.etap) || !text(k.krok.pytanie) || !text(k.krok.wyjasnienie) || !Number.isInteger(k.krok.numer) || !Number.isInteger(k.krok.z)) return null;
  if (k.krok.kontekst !== undefined && !text(k.krok.kontekst)) return null;
  if (k.odpowiedzUcznia !== null && !text(k.odpowiedzUcznia)) return null;
  if (k.czyPoprawna !== null && typeof k.czyPoprawna !== 'boolean') return null;
  if (k.zadanie !== null) {
    const z = k.zadanie;
    if (!z || typeof z !== 'object' || ![z.zrodlo,z.dokument,z.numer,z.poziom,z.url,z.tresc,z.oficjalnaOdpowiedz,z.zasadyOceniania].every(text) || !texts(z.rozwiazanie)) return null;
    if (z.odpowiedzi !== undefined && !texts(z.odpowiedzi)) return null;
  }
  if (!b.historia.every(w => w && (w.rola === 'uczen' || w.rola === 'nauczyciel') && text(w.tekst))) return null;
  if (b.prosba === 'pytanie' && (typeof b.pytanie !== 'string' || b.pytanie.trim() === '')) return null;
  if (b.prosba === 'korepetytor') {
    const r = b.raport;
    if (!r || typeof r !== 'object' || !text(r.przedmiot) || !text(r.lekcja) || !Number.isInteger(r.samodzielnosc)) return null;
    if (!Array.isArray(r.odpowiedzi) || r.odpowiedzi.length > 20) return null;
    if (!r.odpowiedzi.every((o) => o && text(o.krok) && text(o.etap) && typeof o.poprawnaZaPierwszym === 'boolean'
      && Number.isInteger(o.proby) && (o.czasS === null || Number.isFinite(o.czasS)))) return null;
  }
  return b as ZapytanieNauczyciela;
}

const SYSTEM_KOREPETYTOR = `Jesteś korepetytorem, który w tle prowadzi ucznia przez kurs maturalny (cel: 100% na maturze rozszerzonej).
Dostajesz raport z ostatnich kroków lekcji: czy odpowiedź była poprawna za pierwszym razem, ile prób, ile sekund (null = przerwa albo brak pomiaru — tego nie oceniaj).
Decydujesz o tempie kolejnych kroków:
- "trudniej" — gdy uczeń odpowiada pewnie i szybko; podnosimy poprzeczkę lekko, o jeden stopień,
- "tak-samo" — gdy idzie dobrze, ale nie bez potknięć,
- "latwiej" — gdy się myli albo długo się zastanawia; nie męczymy go, wracamy do mniejszych kroków.
"samodzielnosc": 0 = pełne prowadzenie, 1 = bez kroków pomocniczych, 2 = od razu całe zadanie.
Odpowiedz WYŁĄCZNIE jednym obiektem JSON: {"tempo":"latwiej"|"tak-samo"|"trudniej","komentarz":"…"}
Komentarz: jedno krótkie, ciepłe zdanie po polsku do ucznia (bez ocen typu „słabo”), np. co zauważyłeś i co teraz zrobimy.`;

function opisRaportu(z: ZapytanieNauczyciela): string {
  const r = z.raport!;
  return [
    `Przedmiot: ${r.przedmiot}. Lekcja: ${r.lekcja}. Obecna samodzielność: ${r.samodzielnosc}.`,
    r.poprzednie ? `Poprzednia decyzja: ${r.poprzednie}.` : '',
    ...r.odpowiedzi.map((o, i) => `${i + 1}. [${o.etap}] ${o.krok.slice(0, 200)} — ${o.poprawnaZaPierwszym ? 'dobrze' : 'błąd'} za pierwszym razem, prób: ${o.proby}, czas: ${o.czasS === null ? 'brak' : `${o.czasS} s`}`),
  ].filter(Boolean).join('\n');
}

export async function zapytaj(z: ZapytanieNauczyciela): Promise<OdpowiedzNauczyciela> {
  const client = new Anthropic({ timeout: 45_000, maxRetries: 0 });
  if (z.prosba === 'korepetytor') {
    const odp = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system: SYSTEM_KOREPETYTOR,
      messages: [{ role: 'user', content: opisRaportu(z) }],
    });
    const tekst = odp.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return { tekst: tekst || '{}', model: odp.model };
  }
  const historia: Anthropic.Beta.BetaMessageParam[] = z.historia.slice(-MAX_HISTORIA).map((w) => ({
    role: w.rola === 'uczen' ? 'user' : 'assistant',
    content: w.tekst.slice(0, 2000),
  }));
  const tekstProsby = z.prosba === 'pytanie' ? (z.pytanie ?? '').slice(0, 1000) : PROSBA_TEKST[z.prosba];
  const odp = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    // Model zapasowy przy odmowie — tylko dla modeli, które go obsługują (Opus 5 / Fable).
    ...(/opus-5|fable/.test(MODEL) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    system: `${SYSTEM}\n\n--- KONTEKST ---\n${opisKontekstu(z.kontekst)}`,
    messages: [...historia, { role: 'user', content: tekstProsby }],
  });
  if (odp.stop_reason === 'refusal') {
    return { tekst: 'Nie mogę na to odpowiedzieć. Spróbujmy wrócić do zadania.', model: odp.model };
  }
  const tekst = odp.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return { tekst: tekst || 'Nie udało się przygotować odpowiedzi — spróbuj jeszcze raz.', model: odp.model };
}

function wyslij(res: ServerResponse, kod: number, json: unknown): void {
  res.statusCode = kod;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(json));
}

function czytaj(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let dane = '';
    req.setEncoding('utf8');
    req.on('data', (c: string) => {
      dane += c;
      if (dane.length > MAX_BODY) {
        reject(new Error('za duże'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(dane));
    req.on('error', reject);
  });
}

/** Middleware Connect: GET …/api/nauczyciel/status, POST …/api/nauczyciel. */
export async function middleware(req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> {
  const sciezka = (req.url ?? '').split('?')[0] ?? '';
  if (sciezka.endsWith('/api/nauczyciel/status') && req.method === 'GET') {
    wyslij(res, 200, status());
    return;
  }
  if (!sciezka.endsWith('/api/nauczyciel')) {
    next();
    return;
  }
  if (req.method !== 'POST') {
    wyslij(res, 405, { blad: 'Tylko POST.' });
    return;
  }
  const s = status();
  if (!s.dostepny) {
    wyslij(res, 503, { blad: s.powod, demo: true });
    return;
  }
  let body: unknown;
  try {
    body = JSON.parse(await czytaj(req));
  } catch {
    wyslij(res, 400, { blad: 'Nieprawidłowe zapytanie.' });
    return;
  }
  const z = waliduj(body);
  if (!z) {
    wyslij(res, 400, { blad: 'Niepełny kontekst zapytania.' });
    return;
  }
  try {
    wyslij(res, 200, await zapytaj(z));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) wyslij(res, 502, { blad: 'Klucz API na serwerze jest nieprawidłowy.' });
    else if (err instanceof Anthropic.RateLimitError) wyslij(res, 429, { blad: 'Za dużo zapytań — spróbuj za chwilę.' });
    else if (err instanceof Anthropic.APIConnectionError) wyslij(res, 502, { blad: 'Brak połączenia z API.' });
    else if (err instanceof Anthropic.APIError) wyslij(res, 502, { blad: `Błąd API (${String(err.status)}).` });
    else wyslij(res, 500, { blad: 'Nieoczekiwany błąd serwera.' });
  }
}
