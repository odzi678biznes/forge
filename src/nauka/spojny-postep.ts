import { MasteryLevel, emptySkillState, type LessonProgress, type SkillState } from '@/data/types';
import { LEKCJE } from './lekcje';
import { postep, terminPowtorki, type StanNauki } from './silnik';

/**
 * Widoki starszego kursu czytają ten sam postęp, który uczeń zdobył w feedzie.
 * To projekcja do wyświetlania; zapis starego silnika pozostaje bez zmian.
 */
export function spojnyPostep(
  stan: StanNauki | null,
  zapisaneStany: Map<string, SkillState>,
  zapisaneLekcje: LessonProgress[],
): { states: Map<string, SkillState>; lessons: LessonProgress[] } {
  if (!stan) return { states: zapisaneStany, lessons: zapisaneLekcje };

  const states = new Map(zapisaneStany);
  const lessons = [...zapisaneLekcje];
  for (const lekcja of LEKCJE) {
    const wynik = stan.lekcje[lekcja.skillId];
    if (!wynik || wynik.ukonczona === null) continue;

    if (!lessons.some((x) => x.skillId === lekcja.skillId)) {
      lessons.push({ skillId: lekcja.skillId, completedAt: wynik.ukonczona });
    }

    const poprzedni = states.get(lekcja.skillId) ?? emptySkillState(lekcja.skillId);
    const poziom = postep(stan, lekcja).status === 'utrwalona'
      ? MasteryLevel.Retained
      : MasteryLevel.Independent;
    if (poprzedni.level < poziom) {
      states.set(lekcja.skillId, {
        ...poprzedni,
        level: poziom,
        levelReachedAt: wynik.ukonczona,
        reviewDueAt: terminPowtorki(stan, lekcja.skillId),
      });
    }
  }
  return { states, lessons };
}
