import { MASTERY_LABELS, MasteryLevel, type Attempt, type Skill, type SkillState } from '@/data/types';
import type { CourseView } from '@/app/useCourse';
import { intensity } from '@/learning-engine/activity';
import { addDays, formatDay, weekday } from '@/learning-engine/schedule';
import { count } from '@/learning-engine/polish';
import { Ring } from '@/components/Ring';
import './course.css';

/**
 * Postęp - "co mi jak idzie".
 *
 * Wszystkie liczby są liczone z dowodów (prób i poziomów), nie z czasu
 * spędzonego w aplikacji. Szacunek gotowości jest opisany jako szacunek,
 * bo nim jest - poziomy umiejętności to nie wynik arkusza.
 */

interface Props {
  course: CourseView;
  skills: Skill[];
  states: Map<string, SkillState>;
  attempts: Attempt[];
  onPractice: (skill: Skill) => void;
}

const WEEKS = 16;

export function ProgressView({ course, skills, states, attempts, onPractice }: Props) {
  const ids = new Set(skills.map((s) => s.id));
  const own = attempts.filter((a) => ids.has(a.skillId));
  const correct = own.filter((a) => a.correctness === 'correct').length;
  const independent = own.filter((a) => a.correctness === 'correct' && a.hintLevel === 0).length;

  // Mapa aktywności: ostatnie WEEKS tygodni, kolumny od poniedziałku.
  const lastMonday = addDays(course.today, -((weekday(course.today) + 6) % 7));
  const start = addDays(lastMonday, -(WEEKS - 1) * 7);
  const columns: string[][] = [];
  for (let w = 0; w < WEEKS; w += 1) {
    columns.push(Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  }
  const activeLast30 = Array.from({ length: 30 }, (_, i) => addDays(course.today, -i)).filter(
    (d) => (course.activity.get(d)?.attempts ?? 0) + (course.activity.get(d)?.lessons ?? 0) > 0,
  ).length;

  const withState = skills
    .map((s) => ({ skill: s, state: states.get(s.id) }))
    .filter((x) => (x.state?.totalAttempts ?? 0) > 0);
  const strongest = [...withState]
    .sort((a, b) => (b.state?.level ?? 0) - (a.state?.level ?? 0))
    .slice(0, 5);
  const toWork = [...withState]
    .filter((x) => (x.state?.level ?? 0) < MasteryLevel.Independent)
    .sort((a, b) => (b.state?.recentErrors.length ?? 0) - (a.state?.recentErrors.length ?? 0))
    .slice(0, 5);

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Postęp</p>
        <h1 className="page__title">Co mi jak idzie</h1>
        <p className="page__lead">
          Liczone z tego, co rozwiązałeś, a nie z czasu w aplikacji. Gotowość to szacunek z poziomów umiejętności —
          prawdziwy sprawdzian to arkusz.
        </p>
      </header>

      <section className="card progress__rings" aria-label="Podsumowanie">
        <Ring value={course.summary.ratio} label="Kurs przerobiony" size={120} />
        {course.readinessPP.skills > 0 && <Ring value={course.readinessPP.ratio} label="Gotowość: podstawa" size={104} />}
        <Ring value={course.readinessPR.ratio} label="Gotowość: rozszerzenie" size={104} tone="challenge" />
        <dl className="progress__stats">
          <div>
            <dt>Lekcje ukończone</dt>
            <dd>
              {course.lessonsDone.size} / {course.lessonOf.size}
            </dd>
          </div>
          <div>
            <dt>Zadania rozwiązane</dt>
            <dd>{own.length}</dd>
          </div>
          <div>
            <dt>Poprawnie bez pomocy</dt>
            <dd>{own.length === 0 ? '—' : `${Math.round((independent / own.length) * 100)}%`}</dd>
          </div>
          <div>
            <dt>Poprawnie w ogóle</dt>
            <dd>{own.length === 0 ? '—' : `${Math.round((correct / own.length) * 100)}%`}</dd>
          </div>
          <div>
            <dt>Dni nauki (30 dni)</dt>
            <dd>{activeLast30}</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-labelledby="progress-heat">
        <h2 className="card__title" id="progress-heat">
          Aktywność — ostatnie {WEEKS} tygodni
        </h2>
        <div className="heat" role="img" aria-label={`Dni nauki w ostatnich ${WEEKS} tygodniach`}>
          {columns.map((col, i) => (
            <div key={i} className="heat__col">
              {col.map((d) => (
                <span
                  key={d}
                  className={`heat__cell cal-swatch--i${d > course.today ? 0 : intensity(course.activity.get(d))}${d === course.today ? ' heat__cell--today' : ''}`}
                  title={`${formatDay(d)}: ${course.activity.get(d)?.attempts ?? 0} zadań`}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="progress-topics">
        <h2 className="card__title" id="progress-topics">
          Działy
        </h2>
        <ul className="topic-bars">
          {course.topics.map((t) => (
            <li key={t.topic.id}>
              <span className="topic-bars__name">{t.topic.name}</span>
              <span className="topic-bars__bar bar" aria-hidden>
                <span className="topic-bars__stack">
                  <span className="bar__fill" style={{ width: `${(t.covered / Math.max(1, t.total)) * 100}%` }} />
                  <span
                    className="bar__fill bar__fill--learning"
                    style={{ width: `${(t.learning / Math.max(1, t.total)) * 100}%` }}
                  />
                </span>
              </span>
              <span className="topic-bars__value">
                {t.covered}/{t.total}
              </span>
            </li>
          ))}
        </ul>
        <p className="topic-bars__legend">
          <i className="cal-swatch cal-swatch--i4" /> przerobione <i className="cal-swatch cal-swatch--i1" /> w trakcie
        </p>
      </section>

      <div className="progress__lists">
        <section className="card" aria-labelledby="progress-strong">
          <h2 className="card__title" id="progress-strong">
            Najmocniejsze
          </h2>
          {strongest.length === 0 ? (
            <p className="calendar__empty">Pojawią się po pierwszych zadaniach.</p>
          ) : (
            <ul className="skill-list">
              {strongest.map(({ skill, state }) => (
                <li key={skill.id}>
                  <span>{skill.name}</span>
                  <span className="chip chip--pp">{MASTERY_LABELS[state?.level ?? MasteryLevel.Unknown]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card" aria-labelledby="progress-work">
          <h2 className="card__title" id="progress-work">
            Do dopracowania
          </h2>
          {toWork.length === 0 ? (
            <p className="calendar__empty">Nic nie wymaga teraz szczególnej uwagi.</p>
          ) : (
            <ul className="skill-list">
              {toWork.map(({ skill, state }) => (
                <li key={skill.id}>
                  <span>
                    {skill.name}
                    {(state?.recentErrors.length ?? 0) > 0 && (
                      <small> · {count(state?.recentErrors.length ?? 0, ['ostatni błąd', 'ostatnie błędy', 'ostatnich błędów'])}</small>
                    )}
                  </span>
                  <button type="button" className="btn btn--small" onClick={() => onPractice(skill)}>
                    Ćwicz
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
