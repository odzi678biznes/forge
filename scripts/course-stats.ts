import type { Corpus } from '../content/corpus';
import { MATH_CORPUS } from '../content/math';
import { CS_CORPUS } from '../content/cs';
import { BIZ_CORPUS } from '../content/biz';

function stats(label: string, c: Corpus): void {
  const pp = c.skills.filter((s) => s.level === 'PP').length;
  const pr = c.skills.filter((s) => s.level === 'PR').length;
  const code = c.questions.filter((q) => q.format === 'code');
  const byLanguage = new Map<string, number>();
  for (const q of code) {
    const lang = q.code?.language ?? 'javascript';
    byLanguage.set(lang, (byLanguage.get(lang) ?? 0) + 1);
  }
  console.log(`\n${label}`);
  console.log(`dzialy: ${c.topics.length}, umiejetnosci: ${c.skills.length} (PP ${pp}, PR ${pr})`);
  console.log(`zadania: ${c.questions.length}, lekcje: ${c.lessons.length}, fiszki: ${c.flashcards.length}`);
  if (code.length > 0) {
    console.log(`zadania programistyczne: ${code.length} (${[...byLanguage].map(([l, n]) => `${l} ${n}`).join(', ')})`);
  }
  console.log(`minuty lekcji: ${c.lessons.reduce((a, l) => a + l.minutes, 0)}`);
  for (const t of c.topics) {
    const sk = c.skills.filter((s) => s.topicId === t.id);
    const q = c.questions.filter((x) => sk.some((s) => s.id === x.skillId)).length;
    console.log(`  ${t.name}: ${sk.length} umiejetnosci, ${q} zadan`);
  }
}

stats('MATEMATYKA', MATH_CORPUS);
stats('INFORMATYKA', CS_CORPUS);
stats('BIZNES I ZARZĄDZANIE', BIZ_CORPUS);
