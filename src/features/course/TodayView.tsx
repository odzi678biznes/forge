import type { DayMode, Skill, Topic } from '@/data/types';
import type { MissionPlan } from '@/learning-engine/mission';
import { MODE_LABELS, MODE_LOAD, type WeekRhythm } from '@/learning-engine/planner';
import { daysUntil, formatDay, keyToDate } from '@/learning-engine/schedule';
import { count } from '@/learning-engine/polish';
import type { CourseView, SubjectGlance } from '@/app/useCourse';
import type { SubjectId } from '@/app/useForge';
import { Icon } from '@/components/Icon';
import { Ring } from '@/components/Ring';
import './course.css';

/**
 * Dziś - ekran startowy (sek. 7.1).
 *
 * W 10 sekund: co robić, dlaczego to, ile potrwa. Na górze JEDNA czynność
 * z przyciskiem, pod nią cały plan dnia z odhaczaniem. Motywuje widoczny
 * postęp i jasny cel, a nie liczniki serii ani poczucie winy (sek. 14).
 */

interface Props {
  course: CourseView;
  topics: Topic[];
  recommended: MissionPlan;
  options: MissionPlan[];
  rhythm: WeekRhythm;
  dayMode: DayMode;
  deadline: string;
  examDate: string | null;
  comeback: boolean;
  onDayMode: (mode: DayMode) => void;
  onStartMission: (plan: MissionPlan) => void;
  onOpenLesson: (skillId: string) => void;
  onPractice: (skill: Skill) => void;
  onOpenFlashcards: () => void;
  onOpenCalendar: () => void;
  onOpenCourse: () => void;
  diagnostic: { hasReport: boolean; onOpen: () => void } | null;
  /** Skrót dnia pozostałych przedmiotów - żeby żaden nie wypadł z planu. */
  others: { id: SubjectId; label: string; glance: SubjectGlance }[];
  onSwitchSubject: (id: SubjectId) => void;
}

const WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

type NextStep =
  | { kind: 'lesson'; skill: Skill }
  | { kind: 'review' }
  | { kind: 'cards' }
  | { kind: 'done' };

export function TodayView(props: Props) {
  const { course, topics, recommended, rhythm, dayMode, deadline, examDate, comeback } = props;
  const topicName = (s: Skill) => topics.find((t) => t.id === s.topicId)?.name ?? '';

  const pendingLessons = course.todayLessons.filter((s) => !isDoneToday(course, s));
  const lessonTarget = pendingLessons[0] ?? (course.todayLessons.length === 0 ? course.next : null);
  const cardsWaiting = course.cardSession.queue.length;
  const reviews = course.reviewsDue.length;

  // Kolejność "następnego kroku": po przerwie najpierw łagodny powrót, potem
  // lekcja z planu, potem powtórki, potem fiszki.
  const next: NextStep = comeback
    ? { kind: 'review' }
    : lessonTarget
      ? { kind: 'lesson', skill: lessonTarget }
      : reviews > 0
        ? { kind: 'review' }
        : cardsWaiting > 0
          ? { kind: 'cards' }
          : { kind: 'done' };

  const today = keyToDate(course.today);
  const toDeadline = daysUntil(course.today, deadline);
  const toExam = examDate ? daysUntil(course.today, examDate) : null;

  return (
    <main className="page today">
      <header className="today__head">
        <div>
          <p className="page__eyebrow">
            {WEEKDAYS[today.getDay()]}, {formatDay(course.today)}
          </p>
          <h1 className="page__title">{headline(next, pendingLessons.length, reviews, cardsWaiting)}</h1>
        </div>
        <div className="today__counters">
          {toDeadline >= 0 && (
            <span className="chip">
              <Icon name="clock" size={14} /> {count(toDeadline, ['dzień', 'dni', 'dni'])} do końca materiału
            </span>
          )}
          {toExam !== null && toExam >= 0 && (
            <span className="chip chip--pr">{count(toExam, ['dzień', 'dni', 'dni'])} do matury</span>
          )}
        </div>
      </header>

      <section className="today__hero card card--raised" aria-labelledby="today-next">
        <NextStepCard {...props} next={next} topicName={topicName} />
      </section>

      <div className="today__grid">
        <section className="card" aria-labelledby="today-plan">
          <h2 className="card__title" id="today-plan">
            Plan na dziś
          </h2>
          <ul className="plan">
            {course.todayLessons.length === 0 && (
              <li className="plan__row">
                <span className="plan__check plan__check--rest" aria-hidden>
                  <Icon name="book" size={16} />
                </span>
                <span className="plan__text">
                  <strong>Bez nowej lekcji</strong>
                  <span>
                    {course.schedule.status === 'done'
                      ? 'Materiał przerobiony — czas na arkusze i powtórki.'
                      : 'Dzień na utrwalenie: ćwiczenia z ostatnich lekcji, powtórki i fiszki.'}
                  </span>
                </span>
              </li>
            )}
            {course.todayLessons.map((s) => {
              const done = isDoneToday(course, s);
              const lesson = course.lessonOf.get(s.id);
              return (
                <li key={s.id} className="plan__row">
                  <span className={done ? 'plan__check plan__check--on' : 'plan__check'} aria-hidden>
                    {done && <Icon name="check" size={16} />}
                  </span>
                  <span className="plan__text">
                    <strong>Lekcja: {s.name}</strong>
                    <span>
                      {topicName(s)} · {lesson ? `${lesson.minutes} min + ćwiczenia` : 'ćwiczenia'}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => (lesson ? props.onOpenLesson(s.id) : props.onPractice(s))}
                  >
                    {done ? 'Powtórz' : lesson ? 'Zacznij' : 'Ćwicz'}
                  </button>
                </li>
              );
            })}
            <li className="plan__row">
              <span className={reviews === 0 ? 'plan__check plan__check--on' : 'plan__check'} aria-hidden>
                {reviews === 0 && <Icon name="check" size={16} />}
              </span>
              <span className="plan__text">
                <strong>Powtórki</strong>
                <span>
                  {reviews === 0
                    ? 'Nic nie czeka — wszystko w terminie.'
                    : `${count(reviews, ['umiejętność czeka', 'umiejętności czekają', 'umiejętności czeka'])} na powtórkę`}
                </span>
              </span>
              {reviews > 0 && (
                <button type="button" className="btn btn--small" onClick={() => props.onStartMission(recommended)}>
                  Powtórz
                </button>
              )}
            </li>
            <li className="plan__row">
              <span className={cardsWaiting === 0 ? 'plan__check plan__check--on' : 'plan__check'} aria-hidden>
                {cardsWaiting === 0 && <Icon name="check" size={16} />}
              </span>
              <span className="plan__text">
                <strong>Fiszki</strong>
                <span>
                  {cardsWaiting === 0
                    ? 'Wszystkie przejrzane.'
                    : `${count(cardsWaiting, ['karta', 'karty', 'kart'])} · ok. ${Math.max(1, Math.round(cardsWaiting / 4))} min`}
                </span>
              </span>
              {cardsWaiting > 0 && (
                <button type="button" className="btn btn--small" onClick={props.onOpenFlashcards}>
                  Przejrzyj
                </button>
              )}
            </li>
          </ul>

          {props.others.length > 0 && (
            <>
              <h3 className="plan__sub">Pozostałe przedmioty</h3>
              <ul className="plan">
                {props.others.map((o) => {
                  const clear = glanceParts(o.glance).length === 0;
                  return (
                    <li key={o.id} className="plan__row">
                      <span className={clear ? 'plan__check plan__check--on' : 'plan__check'} aria-hidden>
                        {clear && <Icon name="check" size={16} />}
                      </span>
                      <span className="plan__text">
                        <strong>{o.label}</strong>
                        <span>{clear ? 'Na dziś nic nie czeka.' : glanceParts(o.glance).join(' · ')}</span>
                      </span>
                      {!clear && (
                        <button type="button" className="btn btn--small" onClick={() => props.onSwitchSubject(o.id)}>
                          Przejdź
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className={`today__pace today__pace--${course.schedule.status}`}>
            {course.schedule.message}{' '}
            <button type="button" className="link" onClick={props.onOpenCalendar}>
              Kalendarz &rarr;
            </button>
          </p>
        </section>

        <section className="card today__rings" aria-label="Postęp">
          <h2 className="card__title today__rings-title">Twój postęp</h2>
          <Ring value={course.summary.ratio} label="Kurs przerobiony" size={84} />
          {/* Informatyka ma tylko poziom rozszerzony - pierścień PP byłby pusty. */}
          {course.readinessPP.skills > 0 && <Ring value={course.readinessPP.ratio} label="Gotowość PP" size={84} />}
          <Ring value={course.readinessPR.ratio} label="Gotowość PR" size={84} tone="challenge" />
          <p className="today__rings-note">Gotowość to szacunek z poziomów umiejętności, nie wynik arkusza.</p>
          <button type="button" className="link" onClick={props.onOpenCourse}>
            {course.summary.covered} z {course.summary.total} umiejętności przerobionych &rarr;
          </button>
        </section>
      </div>

      <section className="card" aria-label="Rytm tygodnia i tryb dnia">
        <div className="rhythm-row">
          <div className="rhythm-days" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className={[
                  'rhythm-days__day',
                  i < rhythm.activeDays ? 'rhythm-days__day--on' : '',
                  i >= rhythm.plannedDays ? 'rhythm-days__day--buffer' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
          <p className="rhythm-row__note">{rhythm.note}</p>
        </div>
        <div className="modes" role="radiogroup" aria-label="Tryb dnia">
          {(Object.keys(MODE_LABELS) as DayMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={dayMode === m}
              className={dayMode === m ? 'modes__item modes__item--on' : 'modes__item'}
              onClick={() => props.onDayMode(m)}
            >
              <strong>{MODE_LABELS[m]}</strong>
              <span>
                {MODE_LOAD[m]} {MODE_LOAD[m] === 1 ? 'misja' : 'misje'} · {MODE_MINUTES_LABEL[m]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="today__extra" aria-label="Inne formy treningu">
        {props.options.map((o) => (
          <button key={o.title} type="button" className="extra" onClick={() => props.onStartMission(o)}>
            <strong>{o.title}</strong>
            <span>{o.rationale}</span>
          </button>
        ))}
        {props.diagnostic && (
          <button type="button" className="extra" onClick={props.diagnostic.onOpen}>
            <strong>{props.diagnostic.hasReport ? 'Wynik diagnozy' : 'Diagnoza przekrojowa'}</strong>
            <span>
              {props.diagnostic.hasReport
                ? 'Diagnoza czeka na przyjęcie planu.'
                : 'Po zadaniu z najważniejszych umiejętności każdego działu — pokaże, od czego zacząć.'}
            </span>
          </button>
        )}
      </section>
    </main>
  );
}

const MODE_MINUTES_LABEL: Record<DayMode, string> = {
  minimum: '~30 min',
  standard: '~60 min',
  strong: '~90 min',
};

function isDoneToday(course: CourseView, skill: Skill): boolean {
  return course.todayDone.has(skill.id);
}

function headline(next: NextStep, lessons: number, reviews: number, cards: number): string {
  if (next.kind === 'done') return 'Plan na dziś zrobiony. Dobra robota.';
  const parts: string[] = [];
  if (lessons > 0) parts.push(count(lessons, ['lekcja', 'lekcje', 'lekcji']));
  if (reviews > 0) parts.push(count(reviews, ['powtórka', 'powtórki', 'powtórek']));
  if (cards > 0) parts.push(count(cards, ['fiszka', 'fiszki', 'fiszek']));
  return parts.length > 0 ? `Dziś: ${parts.join(', ')}` : 'Dziś: kolejna lekcja';
}

interface NextProps extends Props {
  next: NextStep;
  topicName: (s: Skill) => string;
}

function NextStepCard({ next, course, topicName, recommended, ...p }: NextProps) {
  if (next.kind === 'lesson') {
    const lesson = course.lessonOf.get(next.skill.id);
    const started = course.lessonsDone.has(next.skill.id);
    return (
      <>
        <p className="page__eyebrow" id="today-next">
          Następny krok · {topicName(next.skill)}
        </p>
        <h2 className="today__hero-title">{next.skill.name}</h2>
        <p className="today__hero-why">
          {lesson
            ? `${lesson.intro.split('. ')[0]}.`
            : 'Ćwiczenia od łatwych do maturalnych — trudność dopasuje się do Ciebie.'}
        </p>
        <div className="today__hero-meta">
          <span className={next.skill.level === 'PR' ? 'chip chip--pr' : 'chip chip--pp'}>
            {next.skill.level === 'PR' ? 'rozszerzenie' : 'podstawa'}
          </span>
          {lesson && (
            <span className="chip">
              <Icon name="clock" size={14} /> {lesson.minutes} min lekcji + ok. 25 min ćwiczeń
            </span>
          )}
        </div>
        <div className="today__hero-actions">
          <button
            type="button"
            className="btn btn--primary"
            autoFocus
            onClick={() => (lesson ? p.onOpenLesson(next.skill.id) : p.onPractice(next.skill))}
          >
            <Icon name="play" size={18} />
            {lesson ? (started ? 'Wróć do lekcji' : 'Zacznij lekcję') : 'Zacznij ćwiczenia'}
          </button>
          {lesson && started && (
            <button type="button" className="btn" onClick={() => p.onPractice(next.skill)}>
              Od razu do ćwiczeń
            </button>
          )}
        </div>
      </>
    );
  }

  if (next.kind === 'review') {
    return (
      <>
        <p className="page__eyebrow" id="today-next">
          Następny krok · powtórka
        </p>
        <h2 className="today__hero-title">{recommended.title}</h2>
        <p className="today__hero-why">{recommended.rationale}</p>
        <div className="today__hero-actions">
          <button type="button" className="btn btn--primary" autoFocus onClick={() => p.onStartMission(recommended)}>
            <Icon name="repeat" size={18} /> Rozpocznij · {recommended.questionCount} zadań
          </button>
        </div>
      </>
    );
  }

  if (next.kind === 'cards') {
    return (
      <>
        <p className="page__eyebrow" id="today-next">
          Następny krok · fiszki
        </p>
        <h2 className="today__hero-title">
          {count(course.cardSession.queue.length, ['fiszka czeka', 'fiszki czekają', 'fiszek czeka'])}
        </h2>
        <p className="today__hero-why">Kilka minut, żeby wzory i definicje zostały w głowie na dłużej.</p>
        <div className="today__hero-actions">
          <button type="button" className="btn btn--primary" autoFocus onClick={p.onOpenFlashcards}>
            <Icon name="cards" size={18} /> Przejrzyj fiszki
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="page__eyebrow" id="today-next">
        Na dziś wystarczy
      </p>
      <h2 className="today__hero-title">Wszystko z planu zrobione</h2>
      <p className="today__hero-why">
        Odpoczynek też jest częścią nauki. Jeśli masz ochotę na więcej, możesz wziąć kolejną lekcję — plan się
        do tego dopasuje.
      </p>
      {course.next && (
        <div className="today__hero-actions">
          <button type="button" className="btn" onClick={() => p.onOpenLesson(course.next!.id)}>
            Następna lekcja: {course.next.name}
          </button>
        </div>
      )}
    </>
  );
}

function glanceParts(g: SubjectGlance): string[] {
  const parts: string[] = [];
  if (g.lessonsLeft > 0) parts.push(count(g.lessonsLeft, ['lekcja', 'lekcje', 'lekcji']));
  if (g.reviewsDue > 0) parts.push(count(g.reviewsDue, ['powtórka', 'powtórki', 'powtórek']));
  if (g.cardsWaiting > 0) parts.push(count(g.cardsWaiting, ['fiszka', 'fiszki', 'fiszek']));
  return parts;
}
