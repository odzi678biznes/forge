#!/usr/bin/env node
/**
 * Generuje content/exams/cs-exams.ts - katalog oficjalnych arkuszy CKE
 * z informatyki (formuła 2023) z listą zadań: numer, maks. punkty, kody
 * wymagań i umiejętności kursu, które do zadania przygotowują.
 *
 * Źródłem są ZASADY OCENIANIA CKE. Treści zadań ani rozwiązań nie są
 * kopiowane: z tekstu zasad bierzemy tylko strukturę (numery, punkty,
 * kody), a umiejętności kursu wyznaczamy regułami słów kluczowych
 * (np. „rekurencj” → rekurencja, SELECT → SQL). Aplikacja linkuje do
 * oficjalnych PDF-ów i plików z danymi.
 *
 * Arkusze z 2023 i 2024 r. mają numerację wymagań egzaminacyjnych z 2022 r.,
 * a od grudnia 2024 - podstawy programowej z 2024 r. Mapowanie po treści
 * wymagań działa niezależnie od numeracji.
 *
 * Wymaga: sieci, curl i pdftotext (poppler). Uruchomienie:
 *   node scripts/cke-cs-exams.cjs [katalog-na-pdf]
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const A = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne';
const P = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Probny/2024/Informatyka';

/** [id, rodzaj, rok-miesiąc, era, arkusz, zasady, dane] */
const EXAMS = [
  ['inf-2605-PR', 'main', '2026-05', 2024, `${A}/2026/Informatyka/MINP-R0-100-A-2605-arkusz.pdf`, `${A}/2026/Informatyka/MINP-R0-100-2605-zasady.pdf`, `${A}/2026/Informatyka/Dane-NF-2605.zip`],
  ['inf-2505-PR', 'main', '2025-05', 2024, `${A}/2025/Informatyka/MINP-R0-100-A-2505-arkusz.pdf`, `${A}/2025/zasady_oceniania/MINP-R0-100-2505-zasady.pdf`, `${A}/2025/Informatyka/Dane-NF-2505.zip`],
  ['inf-2412-PR', 'diagnostic', '2024-12', 2024, `${P}/MINP-R0-100-A-2412-arkusz.pdf`, `${P}/MINP-R0-100-200-300-400-660-2412-zasady.pdf`, `${P}/Dane-2412.zip`],
  ['inf-2405-PR', 'main', '2024-05', 2018, `${A}/2024/Informatyka/MINP-R0-100-A-2405-arkusz.pdf`, `${A}/2024/Informatyka/MINP-R0-100-2405-zasady.pdf`, `${A}/2024/Informatyka/Dane-NF-2405.zip`],
  ['inf-2305-PR', 'main', '2023-05', 2018, `${A}/2023/Informatyka/MINP-R0-100-2305.pdf`, `${A}/2023/Informatyka/MINP-R0-100-2305-zasady.pdf`, `${A}/2023/Informatyka/Dane_2305.zip`],
];

/**
 * Reguły: fragment tekstu (małe litery) → umiejętności kursu. Tekst to
 * wymagania szczegółowe i rozwiązanie z zasad oceniania danego zadania.
 * Kolejność nie ma znaczenia - zadanie dostaje sumę wszystkich trafień.
 */
const RULES = [
  // Zasady oceniania zadań bazodanowych podają tylko wyniki, bez zapytań, więc
  // nie da się odróżnić SELECT od złączeń czy grupowania - zadanie z bazą
  // prowadzi do trzech podstawowych umiejętności SQL. Zmianę danych
  // rozpoznajemy wyłącznie po rozwiązaniu (tekst wymagania zawsze ją wymienia).
  [/\bselect\b|\bgroup by\b|kwerend|język sql|jezyk sql/, ['cs-sql-select', 'cs-sql-aggregate', 'cs-sql-join']],
  [/\binsert\b|\bupdate\b|\bdelete\b|create table/, ['cs-sql-modify'], 'sol'],
  [/arkusz|licz\.jeżeli|suma\.jeżeli|wyszukaj\.pionowo|=jeżeli\(/, ['cs-sheet-formulas', 'cs-sheet-analysis']],
  [/rekurencj|rekurencyjn|fraktal/, ['cs-recursion']],
  [/pierwszości|liczb pierwszych|eratostenesa|czynniki pierwsze/, ['cs-numbers']],
  [/\bnwd\b|\bnww\b|euklidesa/, ['cs-gcd']],
  [/systemami liczbowymi|systemach innych niż dziesiętny|systemie dwójkowym|zapis dwójkowy|dwójkow|ósemkow|szesnastkow/, ['cs-bases']],
  [/szybkiego potęgowania|hornera/, ['cs-fastpow']],
  [/miejsc zerowych|pierwiastka kwadratowego|błąd zaokrąglenia|błąd przybliżenia|błędów pojawiających/, ['cs-approx']],
  [/połowieni|binarnego wyszukiwania|zbiorze uporządkowanym/, ['cs-binary-search']],
  [/sortowani|porządkowania ciągu/, ['cs-search-sort']],
  [/przez scalanie|sortowanie szybkie|dziel i zwyciężaj/, ['cs-sort-advanced']],
  [/zachłann|wydawania reszty/, ['cs-greedy']],
  [/programowanie dynamiczne|najdłuższego wspólnego/, ['cs-dp']],
  [/podciąg/, ['cs-subseq']],
  [/notacji polskiej|\bonp\b|\bstos\b|kolejk/, ['cs-stack-queue']],
  // „graf”, „grafu”, „grafów”… ale nie „grafika” (grafika rastrowa to inne wymaganie).
  [/\bgraf(y|u|ie|em|ów)?\b|wierzchołk/, ['cs-graphs']],
  [/wzorca w tekście|porównywania tekstów|metodą cezara|szyfrowania tekstu|palindrom|anagram/, ['cs-strings']],
  // Bez „reprezentacji liczb” - tak brzmi też wymaganie o systemach pozycyjnych (P.I.2a).
  [/reprezentowania w komputerze|kodzie u2|uzupełnień do dwóch|zmiennoprzecinkow/, ['cs-representation']],
  [/operacji logicznych|operacje logiczne|działań arytmetycznych/, ['cs-logic']],
  [/logarytm|efektywnoś|złożonoś|analizuje algorytmy|gotowych implementacji|sprawdza poprawność działania algorytmów/, ['cs-analysis']],
  [/kompresj/, ['cs-compression']],
  [/protokoł|identyfikowania komputerów|adres ip|maska podsieci|przepływie informacji|zarządzaniu siecią/, ['cs-networks']],
  [/szyfrowani|podpis|kryptograf|uwierzytelniani|kluczem publicznym/, ['cs-security']],
];

/** Zadanie programistyczne bez wyraźnego tematu: pętle, funkcje, dane z pliku. */
const PROGRAMMING = /projektuje i programuje|implementuje|programuje rozwiązania|programowania algorytmy/;
const PROGRAMMING_SKILLS = ['cs-py-functions', 'cs-arrays', 'cs-files'];

const ROMAN = '(?:I\\+II|III|IV|II|V|I)';

function parseTasks(text) {
  const tasks = [];
  let cur = null;
  // Tekst zadania dzielimy na wymagania (do „Zasady oceniania”) i rozwiązanie.
  let inSolution = false;
  for (const line of text.split(/\r?\n/)) {
    const h = /Zadanie\s+(\d+(?:\.\d+)?)\.?\s*\((\d)\s*[–-]\s*(\d+)\)/.exec(line);
    if (h) {
      inSolution = false;
      cur = tasks.find((t) => t.no === h[1]);
      if (!cur) {
        cur = { no: h[1], points: Number(h[3]), codes: [], req: '', sol: '' };
        tasks.push(cur);
      }
    }
    if (!cur) continue;
    if (!h && /Zasady oceniania/.test(line)) inSolution = true;
    if (inSolution) {
      cur.sol += ` ${line}`;
      continue;
    }
    cur.req += ` ${line}`;
    // Kody: "I.4)", "I. 2)", "P. I. 3)", "I+II.3)".
    const re = new RegExp(`(?:^|[\\s(])((?:P\\.\\s?)?${ROMAN}\\.\\s?\\d+)\\)`, 'g');
    let m;
    while ((m = re.exec(line))) {
      const code = m[1].replace(/\s/g, '');
      if (!cur.codes.includes(code)) cur.codes.push(code);
    }
  }
  return tasks;
}

const norm = (x) => x.toLowerCase().replace(/-\s+/g, '').replace(/\s+/g, ' ');

function skillsFor(task) {
  const sol = norm(task.sol);
  const text = `${norm(task.req)} ${sol}`;
  const skills = new Set();
  for (const [re, ids, scope] of RULES) {
    if (re.test(scope === 'sol' ? sol : text)) ids.forEach((id) => skills.add(id));
  }
  if (skills.size === 0 && PROGRAMMING.test(text)) PROGRAMMING_SKILLS.forEach((id) => skills.add(id));
  if (skills.size === 0) skills.add('cs-analysis');
  return [...skills];
}

const dir = process.argv[2] ?? fs.mkdtempSync(path.join(os.tmpdir(), 'cke-inf-'));
const out = [];
for (const [id, kind, date, era, sheet, key, data] of EXAMS) {
  const pdf = path.join(dir, `${id}-zasady.pdf`);
  const txt = path.join(dir, `${id}-zasady.txt`);
  if (!fs.existsSync(pdf)) execFileSync('curl', ['-s', '-f', '-L', '--max-time', '120', '-o', pdf, key]);
  execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', pdf, txt]);
  const tasks = parseTasks(fs.readFileSync(txt, 'utf8'));
  const total = tasks.reduce((a, t) => a + t.points, 0);
  console.log(`${id}: ${tasks.length} zadań, ${total} pkt`);
  const lines = tasks.map(
    (t) => `    t(${JSON.stringify(t.no)}, ${t.points}, ${JSON.stringify(t.codes)}, ${JSON.stringify(skillsFor(t))}),`,
  );
  out.push(`  exam({
    id: ${JSON.stringify(id)},
    subjectId: 'cs',
    level: 'PR',
    kind: ${JSON.stringify(kind)},
    date: ${JSON.stringify(date)},
    era: ${era},
    minutes: 210,
    sheetUrl: ${JSON.stringify(sheet)},
    keyUrl: ${JSON.stringify(key)},
    dataUrl: ${JSON.stringify(data)},
    tasks: [
${lines.join('\n')}
    ],
  }),`);
}

const file = `// PLIK GENEROWANY przez scripts/cke-cs-exams.cjs - nie edytuj ręcznie.
// Struktura arkuszy z zasad oceniania CKE (bez treści zadań).
import { exam, t, type ExamSheet } from './types';

export const CS_EXAMS: ExamSheet[] = [
${out.join('\n')}
];
`;
fs.writeFileSync(path.join(__dirname, '..', 'content', 'exams', 'cs-exams.ts'), file);
console.log('Zapisano content/exams/cs-exams.ts');
