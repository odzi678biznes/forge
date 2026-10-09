import { LEKCJE as ORIGINAL_LEKCJE } from './lekcje';
import { getPracticeLesson } from './lesson-quality';
import type { StanNauki } from './silnik';

/** Presentation changes keep the original card IDs and all accumulated evidence. */
export const PRACTICE_LEKCJE = ORIGINAL_LEKCJE.map(getPracticeLesson);
export const practiceLesson = (skillId: string) => PRACTICE_LEKCJE.find(l => l.skillId === skillId);

export function migratePracticeCourse(state: StanNauki): StanNauki {
  if (state.practiceRevision === 1) return state;
  const lessons = { ...state.lekcje };
  for (const old of ORIGINAL_LEKCJE) {
    const saved = lessons[old.skillId];
    const next = practiceLesson(old.skillId)!;
    if (!saved) continue;
    // Finished lessons stay finished. Neither attempts nor FSRS are recreated.
    let position = next.seria.length;
    if (saved.ukonczona === null) {
      position = next.seria.findIndex(id => !saved.wyniki[id]?.zaliczona
        && old.seria.indexOf(id) >= saved.pozycja);
      // A previously skipped final question remains available, without awarding progress.
      if (position < 0) position = next.seria.findIndex(id => !saved.wyniki[id]?.zaliczona);
      if (position < 0) position = next.seria.length;
    }
    lessons[old.skillId] = { ...saved, pozycja: position,
      wstawione: saved.wstawione.filter(id => next.seria.includes(id)) };
  }
  return { ...state, practiceRevision: 1, lekcje: lessons };
}

/** Reuse actual successful calculations from the previous course; never infer from skips. */
export function knownWorkedSteps(state: StanNauki, skillId: string): number {
  const result = state.lekcje[skillId]?.wyniki;
  const passed = (id: string) => result?.[id]?.zaliczona === true;
  if (skillId === 'num-order') {
    if (passed('m1-kwadrat') || passed('m1-zadanie')) return 4;
    if (passed('m1-nawias')) return 3;
    return passed('m1-potega') ? 1 : 0;
  }
  if (skillId === 'num-powers') {
    if (passed('m2-f3') || passed('m2-zadanie')) return 3;
    if (passed('m2-f1') && passed('m2-f2')) return 2;
    return passed('m2-ujemna') && passed('m2-dane') ? 1 : 0;
  }
  return 0;
}
