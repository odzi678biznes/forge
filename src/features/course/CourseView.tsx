import { MASTERY_LABELS, MasteryLevel, type Skill, type SkillState, type Topic } from '@/data/types';
import { STATUS_LABELS, skillStatus, type SkillStatus } from '@/learning-engine/course';
import { formatDay } from '@/learning-engine/schedule';
import type { CourseView as Course } from '@/app/useCourse';
import { Icon } from '@/components/Icon';
import './course.css';

/**
 * Mapa kursu: działy po kolei, w każdym umiejętności z lekcją i ćwiczeniami.
 *
 * Nic nie jest zablokowane - kurs podpowiada kolejność ("tu jesteś"), ale
 * uczeń może wejść w dowolną lekcję. Blokady zmuszałyby do przechodzenia
 * tematów, które ktoś już umie.
 */

interface Props {
  course: Course;
  subjectName: string;
  topics: Topic[];
  skills: Skill[];
  states: Map<string, SkillState>;
  onOpenLesson: (skillId: string) => void;
  onPractice: (skill: Skill) => void;
}

const STATUS_ICON: Record<SkillStatus, string> = {
  new: 'course__dot',
  learning: 'course__dot course__dot--learning',
  covered: 'course__dot course__dot--covered',
  retained: 'course__dot course__dot--retained',
};

export function CourseView({ course, subjectName, topics, skills, states, onOpenLesson, onPractice }: Props) {
  const plannedOn = new Map<string, string>();
  for (const d of course.schedule.days) for (const id of d.skillIds) plannedOn.set(id, d.date);

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Kurs</p>
        <h1 className="page__title">{subjectName}</h1>
        <p className="page__lead">
          Przerobione: {course.summary.covered} z {course.summary.total} umiejętności.
          {/* Informatyka i biznes mają tylko poziom rozszerzony — podział na poziomy nic by nie mówił. */}
          {course.summary.byLevel.PP.total > 0 && (
            <>
              {' '}Podstawa {course.summary.byLevel.PP.covered}/{course.summary.byLevel.PP.total}, rozszerzenie{' '}
              {course.summary.byLevel.PR.covered}/{course.summary.byLevel.PR.total}.
            </>
          )}{' '}
          „Przerobione” znaczy: typowe zadanie rozwiązane samodzielnie dwa razy z rzędu.
        </p>
        <div className="bar course__bar" aria-hidden>
          <div className="bar__fill" style={{ width: `${course.summary.ratio * 100}%` }} />
        </div>
      </header>

      <ol className="chapters">
        {course.topics.map((tp, index) => {
          const topic = topics.find((t) => t.id === tp.topic.id) ?? tp.topic;
          const own = skills.filter((s) => s.topicId === topic.id);
          const containsNext = own.some((s) => s.id === course.next?.id);
          const hasLessons = own.some((s) => course.lessonOf.has(s.id));
          return (
            <li key={topic.id} className="chapter">
              <details open={containsNext || undefined}>
                <summary className="chapter__head">
                  <span className="chapter__num">{index + 1}</span>
                  <span className="chapter__info">
                    <strong>{topic.name}</strong>
                    {topic.summary && <span className="chapter__summary">{topic.summary}</span>}
                    <span className="chapter__meta">
                      {tp.covered}/{tp.total} przerobione
                      {tp.levels.PP.total > 0 && <span className="chip chip--pp">PP {tp.levels.PP.covered}/{tp.levels.PP.total}</span>}
                      {tp.levels.PR.total > 0 && <span className="chip chip--pr">PR {tp.levels.PR.covered}/{tp.levels.PR.total}</span>}
                      {!hasLessons && <span className="chip">lekcje w przygotowaniu</span>}
                    </span>
                  </span>
                  <span className="chapter__progress" aria-label={`${Math.round(tp.ratio * 100)}% przerobione`}>
                    <span className="bar">
                      <span className="bar__fill" style={{ width: `${tp.ratio * 100}%`, display: 'block' }} />
                    </span>
                  </span>
                </summary>

                <ul className="skills">
                  {own.map((s) => {
                    const state = states.get(s.id);
                    const status = skillStatus(state, course.lessonsDone.has(s.id));
                    const lesson = course.lessonOf.get(s.id);
                    const isNext = course.next?.id === s.id;
                    const planned = plannedOn.get(s.id);
                    return (
                      <li key={s.id} className={isNext ? 'skill skill--next' : 'skill'}>
                        <span className={STATUS_ICON[status]} aria-hidden>
                          {(status === 'covered' || status === 'retained') && <Icon name="check" size={12} />}
                        </span>
                        <span className="skill__info">
                          <span className="skill__name">
                            {s.name}
                            {isNext && <span className="skill__here">tu jesteś</span>}
                          </span>
                          <span className="skill__meta">
                            <span className={s.level === 'PP' ? 'chip chip--pp' : 'chip chip--pr'}>
                              {s.level === 'PP' ? 'podstawa' : 'rozszerzenie'}
                            </span>
                            {s.extra && (
                              <span className="chip" title="Poza wymaganiami egzaminu od 2025 r. — nie wchodzi do planu ani postępu.">
                                dodatkowe
                              </span>
                            )}
                            <span>{STATUS_LABELS[status]}</span>
                            <span>· poziom: {MASTERY_LABELS[state?.level ?? MasteryLevel.Unknown]}</span>
                            {planned && status !== 'covered' && status !== 'retained' && (
                              <span>· w planie: {formatDay(planned)}</span>
                            )}
                          </span>
                        </span>
                        <span className="skill__actions">
                          {lesson && (
                            <button type="button" className="btn btn--small" onClick={() => onOpenLesson(s.id)}>
                              <Icon name="book" size={15} /> Lekcja
                            </button>
                          )}
                          <button type="button" className="btn btn--small" onClick={() => onPractice(s)}>
                            <Icon name="play" size={15} /> Ćwicz
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
