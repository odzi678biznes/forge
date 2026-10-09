import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { readFileSync, writeFileSync } from 'node:fs';
import { MATH_CORPUS } from '@content/math';
import { CS_CORPUS } from '@content/cs';
import { BIZ_CORPUS } from '@content/biz';
import { MATH_EXAMS } from '@content/exams/math-exams';
import { CS_EXAMS } from '@content/exams/cs-exams';
import { LEKCJE } from './lekcje';
import { ZADANIA_CKE } from './zadania-cke';
import { WARIANTY, pokazWartosc } from './warianty';
import { sprawdzWpis, sprawdzWynikKodu } from './sprawdz';
import { KLOCKI, MIKRO, SPEED, ZADANIA_DEEP } from './sesja/tresc';
import { auditQuestionQuality, getExtraPracticeCards, getPracticeLesson, getTheoryCards, type QualityItem } from './lesson-quality';

// Count displayed text glyphs, excluding TeX commands and MathML annotations.
function visibleText(value: string): string {
  return value.replace(/\$([^$]+)\$/g, (_, tex: string) => katex.renderToString(tex, { output: 'mathml', throwOnError: false, strict: false })
    .replace(/<annotation\b[^>]*>[\s\S]*?<\/annotation>/g, '').replace(/<msqrt>/g, '√').replace(/<mfrac>/g, '/').replace(/<[^>]+>/g, '')
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' '))
    .replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

const corpora = [MATH_CORPUS, CS_CORPUS, BIZ_CORPUS];
const items: QualityItem[] = corpora.flatMap((corpus) => [
  ...corpus.questions.map((q): QualityItem => ({ id: q.id, family: `corpus-${corpus.subject.id}`, prompt: q.prompt,
    ...(q.choices ? { options: q.choices, correctIndex: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(q.answer.trim()) } : {}),
    ...(q.steps ? { steps: q.steps } : {}) })),
  ...corpus.flashcards.map((q): QualityItem => ({ id: q.id, family: 'flashcard', prompt: q.front })),
]);
for (const lesson of LEKCJE) for (const card of lesson.karty) {
  const item: QualityItem = { id: card.id, family: 'feed', prompt: card.pytanie, ...(card.kontekst ? { context: card.kontekst } : {}) };
  if (card.rodzaj === 'wybor') { item.options = card.opcje; item.correctIndex = card.poprawna; }
  if (card.rodzaj === 'blad') { item.options = card.linie; item.correctIndex = card.bledna; }
  if (card.rodzaj === 'kolejnosc') item.steps = card.elementy;
  if (card.rodzaj === 'zadanie' && card.koniec.typ === 'abcd') {
    item.options = ZADANIA_CKE.find((q) => q.id === card.zadanieId)!.odpowiedzi!;
    item.correctIndex = card.koniec.poprawna;
  }
  const variants = WARIANTY[card.id];
  if (variants && (card.rodzaj === 'wpis' || card.rodzaj === 'kod')) {
    item.options = variants.map((variant) => pokazWartosc(variant.wartosc));
    item.correctIndex = variants.findIndex((variant) => card.rodzaj === 'wpis'
      ? sprawdzWpis(variant.wartosc, card.oczekiwane) : sprawdzWynikKodu(variant.wartosc, card.wynik));
  }
  items.push(item);
}
items.push(...ZADANIA_CKE.map((q): QualityItem => ({ id: q.id, family: 'cke-source', prompt: q.tresc, steps: q.rozwiazanie,
  ...(q.odpowiedzi ? { options: q.odpowiedzi, correctIndex: 'ABCD'.indexOf(q.oficjalnaOdpowiedz.trim()) } : {}) })));
for (const task of ZADANIA_DEEP) {
  items.push({ id: task.id, family: 'deep-task', prompt: task.question, steps: task.steps.map((step) => step.prompt) });
  items.push(...task.steps.map((step): QualityItem => ({ id: step.id, family: 'deep-step', prompt: step.prompt,
    ...(step.answer.typ === 'wybor' ? { options: step.answer.opcje, correctIndex: step.answer.poprawna } : {}) })));
}
items.push(...KLOCKI.map((q): QualityItem => ({ id: q.id, family: 'blocks', prompt: q.problem, steps: q.kroki })));
items.push(...MIKRO.map((q): QualityItem => ({ id: q.id, family: 'micro', prompt: q.pytanie, ...(q.kontekst ? { context: q.kontekst } : {}),
  ...(q.odpowiedz.typ === 'wybor' ? { options: q.odpowiedz.opcje, correctIndex: q.odpowiedz.poprawna } : {}) })));
items.push(...SPEED.map((q): QualityItem => ({ id: q.id, family: 'speed', prompt: q.pytanie,
  ...(q.odpowiedz?.typ === 'wybor' ? { options: q.odpowiedz.opcje, correctIndex: q.odpowiedz.poprawna } :
    q.prawda !== undefined ? { options: ['Prawda', 'Fałsz'], correctIndex: q.prawda ? 0 : 1 } : {}) })));

describe('practice profiles and catalog quality', () => {
  it('keeps a complete public semantic review and all applied flashcard findings', () => {
    const review = JSON.parse(readFileSync('docs/question-quality-review.json', 'utf8')) as {
      reviews: { id: string; modelStatus: string; decision: string; reason: string }[];
      changedCorpusIds: string[]; changedAuxiliaryFeedIds: string[];
    };
    expect(review.reviews.map((q) => q.id).sort()).toEqual(corpora.flatMap((c) => c.questions.map((q) => q.id)).sort());
    expect(review.reviews.filter((q) => q.modelStatus === 'flag')).toHaveLength(76);
    expect(review.reviews.filter((q) => q.decision === 'fixed')).toHaveLength(23);
    expect(review.reviews.every((q) => q.decision && q.reason)).toBe(true);
    expect(new Set(review.changedCorpusIds).size).toBe(27);
    expect(new Set(review.changedAuxiliaryFeedIds).size).toBe(20);
    const findings = JSON.parse(readFileSync('docs/flashcard-quality-findings.json', 'utf8')) as { findings: { id: string; applied: boolean }[] };
    const flashIds = new Set(corpora.flatMap((c) => c.flashcards.map((q) => q.id)));
    expect(findings.findings).toHaveLength(26);
    expect(findings.findings.every((q) => q.applied && flashIds.has(q.id))).toBe(true);
  });
  it('keeps all historical cards, review IDs and canonical series unchanged', () => {
    const snapshot = JSON.stringify(LEKCJE);
    expect(LEKCJE.map((lesson) => getPracticeLesson(lesson).seria.length)).toEqual([1, 1, 3, 3, 1, 1]);
    for (const lesson of LEKCJE) {
      const practice = getPracticeLesson(lesson);
      expect(practice).not.toBe(lesson);
      expect(practice.karty).toBe(lesson.karty);
      expect(practice.powtorka).toEqual(lesson.powtorka);
      expect(getTheoryCards(practice)).toEqual(getTheoryCards(lesson));
      expect(getExtraPracticeCards(practice)).toEqual(getExtraPracticeCards(lesson));
      expect([...practice.seria, ...getTheoryCards(lesson).map((q) => q.id), ...getExtraPracticeCards(lesson).map((q) => q.id)].sort()).toEqual([...lesson.seria].sort());
      expect(practice.karty.find((q) => q.id === practice.seria.at(-1))?.rodzaj).toBe('zadanie');
    }
    expect(JSON.stringify(LEKCJE)).toBe(snapshot);
  });
  it('measures ties separately, detects copied answers and duplicate steps', () => {
    const result = auditQuestionQuality({ id: 'test', family: 'test', prompt: 'abcdefghijkl', options: ['abcdefghijkl', 'abcdefghijkl'], correctIndex: 0, steps: ['One', ' one '] });
    expect(result.flags).toEqual(['longest-tie', 'duplicate-options', 'answer-in-stem', 'duplicate-steps']);
    expect(result.longestGuessCredit).toBe(0.5);
    expect(visibleText('$\\frac{12}{3}$')).toBe('/123');
    expect(visibleText('$\\sqrt{n}$')).toBe('√n');
  });
  it('keeps exactly one accepted option in each legacy typed-answer choice set', () => {
    for (const lesson of LEKCJE) for (const card of lesson.karty) {
      const variants = WARIANTY[card.id];
      if (!variants || (card.rodzaj !== 'wpis' && card.rodzaj !== 'kod')) continue;
      const valid = variants.filter((variant) => card.rodzaj === 'wpis'
        ? sprawdzWpis(variant.wartosc, card.oczekiwane) : sprawdzWynikKodu(variant.wartosc, card.wynik));
      expect(valid, card.id).toHaveLength(1);
    }
  });
  it('inventories every shipped corpus/card and produces reproducible review leads', () => {
    const results = items.map((item) => auditQuestionQuality(item, visibleText));
    expect(new Set(items.map((item) => `${item.family}/${item.id}`)).size).toBe(items.length);
    expect(items.filter((item) => item.options && !results[items.indexOf(item)]!.validChoice).map((item) => item.id)).toEqual([]);
    const families = [...new Set(items.map((item) => item.family))];
    const summary = families.map((family) => {
      const all = results.filter((result) => result.family === family);
      const choices = all.filter((result) => result.validChoice);
      return { family, count: all.length, choices: choices.length, uniqueLongest: choices.filter((r) => r.flags.includes('longest')).length,
        tiedLongest: choices.filter((r) => r.flags.includes('longest-tie')).length,
        longestStrategyPercent: choices.length ? +(100 * choices.reduce((sum, r) => sum + r.longestGuessCredit, 0) / choices.length).toFixed(1) : null };
    });
    const exams = [...MATH_EXAMS, ...CS_EXAMS].flatMap((exam) => exam.tasks.map((task) => `${exam.id}/${task.no}`));
    if (process.env.FORGE_QUALITY_REPORT) {
      const path = process.env.FORGE_QUALITY_REPORT;
      writeFileSync(path, JSON.stringify({ summary, results, examMetadata: exams, items }, null, 2));
      console.log(JSON.stringify(summary));
    }
    if (process.env.FORGE_QUALITY_MARKDOWN) {
      const path = 'docs/question-quality-audit.md';
      const marker = '<!-- generated-catalog -->';
      const heading = readFileSync(path, 'utf8').split(marker)[0];
      const lines = [marker, '', '## Pomiar całego katalogu', '',
        '| Katalog | Wszystkie pozycje | Z opcjami | Poprawna jedyna najdłuższa | Poprawna w remisie najdłuższych | Strategia najdłuższej, % |',
        '|---|---:|---:|---:|---:|---:|',
        ...summary.map((s) => `| ${s.family} | ${s.count} | ${s.choices} | ${s.uniqueLongest} | ${s.tiedLongest} | ${s.longestStrategyPercent ?? '—'} |`),
        '', `Łącznie ${items.length} wpisów z treścią oraz ${exams.length} odnośników do zadań arkuszowych bez lokalnej treści.`, '',
        '## Pełny katalog ID i sygnałów', '',
        'Długości kolejnych opcji w kolejności danych wykonawczych (po deterministycznym tasowaniu corpus); puste pole oznacza brak opcji. Flagi są sygnałami do recenzji, nie werdyktem błędności.', '',
        '| Katalog | ID | Długości opcji | Sygnały |', '|---|---|---|---|',
        ...results.map((r) => `| ${r.family} | ${r.id} | ${r.lengths.join(', ')} | ${r.flags.join(', ')} |`),
        '', '## Katalog metadanych arkuszy CKE', '',
        'Poniższe rekordy zawierają numer, punkty i wymagania, a nie pełną treść pytania. Zostały zinwentaryzowane, ale nie poddane pozornej ocenie języka ani dystraktorów.', '',
        ...[...MATH_EXAMS, ...CS_EXAMS].map((exam) => `- **${exam.id}**: ${exam.tasks.map((task) => `${exam.id}/${task.no}`).join(', ')}`), ''];
      writeFileSync(path, heading + lines.join('\n'));
    }
  });
});
