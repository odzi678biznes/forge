import { MATH_CORPUS } from '../content/math';

const c = MATH_CORPUS;
const pp = c.skills.filter((s) => s.level === 'PP').length;
const pr = c.skills.filter((s) => s.level === 'PR').length;
console.log(`dzialy: ${c.topics.length}, umiejetnosci: ${c.skills.length} (PP ${pp}, PR ${pr})`);
console.log(`zadania: ${c.questions.length}, lekcje: ${c.lessons.length}, fiszki: ${c.flashcards.length}`);
console.log(`minuty lekcji: ${c.lessons.reduce((a, l) => a + l.minutes, 0)}`);
for (const t of c.topics) {
  const sk = c.skills.filter((s) => s.topicId === t.id);
  const q = c.questions.filter((x) => sk.some((s) => s.id === x.skillId)).length;
  console.log(`  ${t.name}: ${sk.length} umiejetnosci, ${q} zadan`);
}
