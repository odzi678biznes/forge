#!/usr/bin/env node
/**
 * Generuje content/exams/math-exams.ts - katalog oficjalnych arkuszy CKE
 * z matematyki (formuła 2023) z listą zadań: numer, maks. punkty i kody
 * wymagań podstawy programowej.
 *
 * Źródłem są ZASADY OCENIANIA publikowane przez CKE. Treści zadań nie są
 * kopiowane - aplikacja linkuje do oficjalnych PDF-ów, a z zasad bierze
 * tylko strukturę arkusza (metadane).
 *
 * Wymaga: sieci, curl i pdftotext (poppler). Uruchomienie:
 *   node scripts/cke-math-exams.cjs [katalog-na-pdf]
 * Po dodaniu nowego arkusza: dopisz go do EXAMS, uruchom i sprawdź testy
 * (content/exams/exams.test.ts pilnuje sum punktów i mapowania kodów).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const E23 = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023';
const A = `${E23}/Arkusze_egzaminacyjne`;
const D23 = `${E23}/materialy_dodatkowe`;
const P15 = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Probny/2024/Matematyka';

/** [id, poziom, rodzaj, rok-miesiąc, era podstawy, arkusz, zasady] */
const EXAMS = [
  ['2605-PR', 'PR', 'main', '2026-05', 2024, `${A}/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2605-arkusz.pdf`, `${A}/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-2605-zasady.pdf`],
  ['2605-PP', 'PP', 'main', '2026-05', 2024, `${A}/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf`, `${A}/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf`],
  ['2601-PP', 'PP', 'mock', '2026-03', 2024, `${D23}/probny_egzamin/2026_marzec/Matematyka/MMAP-P0-100-A-2601-arkusz.pdf`, `${D23}/probny_egzamin/2026_marzec/Matematyka/MMAP-P0-100-2601-zasady.pdf`],
  ['2505-PR', 'PR', 'main', '2025-05', 2024, `${A}/2025/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2505-arkusz.pdf`, `${A}/2025/zasady_oceniania/MMAP-R0-100-2505-zasady.pdf`],
  ['2505-PP', 'PP', 'main', '2025-05', 2024, `${A}/2025/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2505-arkusz.pdf`, `${A}/2025/zasady_oceniania/MMAP-P0-100-2505-zasady.pdf`],
  ['2412-PR', 'PR', 'diagnostic', '2024-12', 2024, `${P15}/poziom_rozszerzony/MMAP-R0-100-A-2412-arkusz.pdf`, `${P15}/poziom_rozszerzony/MMAP-R0-100-200-300-400-700-Q00-K00-2412-zasady.pdf`],
  ['2412-PP', 'PP', 'diagnostic', '2024-12', 2024, `${P15}/poziom_podstawowy/MMAP-P0-100-A-2412-arkusz.pdf`, `${P15}/poziom_podstawowy/MMAP-P0-100-200-300-400-700-Q00-K00-MMAU-2412-zasady.pdf`],
  ['2405-PR', 'PR', 'main', '2024-05', 2018, `${A}/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2405-arkusz.pdf`, `${A}/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-2405-zasady.pdf`],
  ['2405-PP', 'PP', 'main', '2024-05', 2018, `${A}/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2405-arkusz.pdf`, `${A}/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-2405-zasady.pdf`],
  ['2312-PP', 'PP', 'diagnostic', '2023-12', 2018, `${D23}/diagnostyczne_12_23/matematyka/MMAP-P0-100-A-2312-arkusz.pdf`, `${D23}/diagnostyczne_12_23/matematyka/MMAP-P0-100-200-300-400-660-Q00-K00-MMAU-100-2312-zasady.pdf`],
  ['2305-PR', 'PR', 'main', '2023-05', 2018, `${A}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305.pdf`, `${A}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305-zasady.pdf`],
  ['2305-PP', 'PP', 'main', '2023-05', 2018, `${A}/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305.pdf`, `${A}/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305-zasady.pdf`],
  ['2209-PP', 'PP', 'diagnostic', '2022-09', 2018, `${D23}/diagnostyczne/matematyka/MMAP-P0-100-2209.pdf`, `${D23}/diagnostyczne/matematyka/MMAP-P0-100-200-300-400-660-700-Q00-2209-zasady.pdf`],
];

const ROMAN = '(?:XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)';

function parseTasks(text) {
  const tasks = [];
  let cur = null;
  for (const line of text.split(/\r?\n/)) {
    // "Zadanie 14. (0–1)" albo bez kropki: "Zadanie 14.1 (0–1)".
    const h = /Zadanie\s+(\d+(?:\.\d+)?)\.?\s*\((\d)\s*[–-]\s*(\d+)\)/.exec(line);
    if (h) {
      cur = tasks.find((t) => t.no === h[1]);
      if (!cur) {
        cur = { no: h[1], points: Number(h[3]), codes: [] };
        tasks.push(cur);
      }
    }
    if (!cur) continue;
    // Warianty zapisu kodu: "V.14)", "IX.R2)", "I.R)", "IX. 2)", "XIII)".
    const re = new RegExp(`\\b(${ROMAN}(?:\\.\\s?R?\\d*)?)\\)`, 'g');
    let m;
    while ((m = re.exec(line))) {
      const code = m[1].replace(/\s/g, '');
      if (!code.includes('.') && code !== 'XIII') continue; // numer działu z wymagań ogólnych
      if (!cur.codes.includes(code)) cur.codes.push(code);
    }
    // PP: jedyne wymaganie działu XIII bywa zapisane z kropką zamiast nawiasu.
    if (/\bXIII\.\s+rozwiązuje zadania optymalizacyjne/.test(line) && !cur.codes.includes('XIII')) cur.codes.push('XIII');
  }
  return tasks;
}

const dir = process.argv[2] ?? fs.mkdtempSync(path.join(os.tmpdir(), 'cke-'));
const out = [];
for (const [id, level, kind, date, era, sheet, key] of EXAMS) {
  const pdf = path.join(dir, `${id}-zasady.pdf`);
  const txt = path.join(dir, `${id}-zasady.txt`);
  if (!fs.existsSync(pdf)) execFileSync('curl', ['-s', '-f', '-L', '--max-time', '120', '-o', pdf, key]);
  execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', pdf, txt]);
  const tasks = parseTasks(fs.readFileSync(txt, 'utf8'));
  const missing = tasks.filter((t) => t.codes.length === 0).map((t) => t.no);
  if (missing.length) throw new Error(`${id}: zadania bez kodów wymagań: ${missing.join(', ')}`);
  const total = tasks.reduce((a, t) => a + t.points, 0);
  console.log(`${id}: ${tasks.length} zadań, ${total} pkt`);
  out.push({ id, level, kind, date, era, sheet, key, tasks });
}

const lines = out.map((e) => {
  const tasks = e.tasks.map((t) => `      t('${t.no}', ${t.points}, ${JSON.stringify(t.codes).replace(/"/g, "'")}),`).join('\n');
  return `  exam({
    id: 'mat-${e.id.toLowerCase()}',
    level: '${e.level}',
    kind: '${e.kind}',
    date: '${e.date}',
    era: ${e.era},
    sheetUrl: '${e.sheet}',
    keyUrl: '${e.key}',
    tasks: [
${tasks}
    ],
  }),`;
});

const file = `// PLIK GENEROWANY przez scripts/cke-math-exams.cjs - nie edytuj ręcznie.
// Struktura arkuszy (numery zadań, punkty, kody wymagań) z zasad oceniania CKE.
import { exam, t, type ExamSheet } from './types';

export const MATH_EXAMS: ExamSheet[] = [
${lines.join('\n')}
];
`;
const target = path.join(__dirname, '..', 'content', 'exams', 'math-exams.ts');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, file);
console.log(`zapisano ${target}`);
