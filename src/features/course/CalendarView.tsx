import { useMemo, useState } from 'react';
import type { DayMode, Skill } from '@/data/types';
import type { CourseView } from '@/app/useCourse';
import { intensity } from '@/learning-engine/activity';
import {
  DEFAULT_REST_WEEKDAYS,
  addDays,
  dayKey,
  formatDay,
  keyToDate,
  weekday,
} from '@/learning-engine/schedule';
import { MODE_LABELS } from '@/learning-engine/planner';
import { count } from '@/learning-engine/polish';
import './course.css';

/**
 * Kalendarz kursu.
 *
 * Przeszłość pokazuje, co faktycznie zrobiłeś (natężenie dnia), przyszłość -
 * co jest zaplanowane. Plan zawsze liczy się od dziś: opuszczony dzień nie
 * zostawia czerwonej plamy ani zaległości, tylko przesuwa resztę (sek. 14).
 */

interface Props {
  course: CourseView;
  skills: Skill[];
  deadline: string;
  examDate: string | null;
  dayMode: DayMode;
  onDeadline: (key: string) => void;
  onExamDate: (key: string) => void;
  onOpenLesson: (skillId: string) => void;
}

const MONTHS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];
const WEEK_HEAD = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

export function CalendarView({ course, skills, deadline, examDate, dayMode, onDeadline, onExamDate, onOpenLesson }: Props) {
  const [selected, setSelected] = useState<string>(course.today);
  const byId = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills]);

  const planned = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of course.schedule.days) m.set(d.date, d.skillIds);
    return m;
  }, [course.schedule]);

  const months = useMemo(() => {
    const firstActive = [...course.activity.keys()].sort()[0];
    const start = firstActive && firstActive < course.today ? firstActive : course.today;
    const ends = [deadline, course.schedule.finishDate ?? deadline, examDate ?? deadline].sort();
    const end = ends[ends.length - 1] ?? deadline;
    const out: Array<{ year: number; month: number }> = [];
    const cursor = keyToDate(start);
    cursor.setDate(1);
    const last = keyToDate(end);
    while (cursor.getFullYear() < last.getFullYear() || (cursor.getFullYear() === last.getFullYear() && cursor.getMonth() <= last.getMonth())) {
      out.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  }, [course.activity, course.today, course.schedule.finishDate, deadline, examDate]);

  const selectedPlan = (planned.get(selected) ?? []).map((id) => byId.get(id)).filter((s): s is Skill => !!s);
  const selectedActivity = course.activity.get(selected);

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Kalendarz</p>
        <h1 className="page__title">Plan do {formatDay(deadline)}</h1>
        <p className="page__lead">
          {course.schedule.message} Tryb dnia: {MODE_LABELS[dayMode]}. Niedziele są dniami buforowymi — bez nowego
          materiału.
        </p>
      </header>

      <section className="card calendar__settings" aria-label="Terminy">
        <label>
          <span>Koniec materiału</span>
          <input type="date" value={deadline} onChange={(e) => onDeadline(e.target.value)} />
        </label>
        <label>
          <span>Data matury</span>
          <input type="date" value={examDate ?? ''} onChange={(e) => onExamDate(e.target.value)} />
        </label>
        <p className="calendar__settings-note">
          Po terminie zostaje szlifowanie: arkusze, powtórki i fiszki aż do matury.
        </p>
      </section>

      <div className="calendar__legend" aria-hidden>
        <span><i className="cal-swatch cal-swatch--i2" /> dzień nauki</span>
        <span><i className="cal-swatch cal-swatch--plan" /> zaplanowana lekcja</span>
        <span><i className="cal-swatch cal-swatch--rest" /> bufor</span>
        <span><i className="cal-swatch cal-swatch--deadline" /> termin</span>
      </div>

      <div className="calendar__months">
        {months.map(({ year, month }) => (
          <Month
            key={`${year}-${month}`}
            year={year}
            month={month}
            today={course.today}
            deadline={deadline}
            examDate={examDate}
            selected={selected}
            planned={planned}
            activity={course.activity}
            onSelect={setSelected}
          />
        ))}
      </div>

      <section className="card calendar__day" aria-live="polite">
        <h2 className="card__title">
          {selected === course.today ? 'Dziś' : formatDay(selected)}
          {DEFAULT_REST_WEEKDAYS.includes(weekday(selected)) && <span className="chip">bufor</span>}
        </h2>
        {selectedActivity && (
          <p>
            Zrobione: {count(selectedActivity.attempts, ['zadanie', 'zadania', 'zadań'])}, w tym{' '}
            {selectedActivity.independent} samodzielnie poprawnie
            {selectedActivity.lessons > 0 && `, ${count(selectedActivity.lessons, ['lekcja', 'lekcje', 'lekcji'])}`}.
          </p>
        )}
        {selectedPlan.length > 0 && (
          <ul className="calendar__plan">
            {selectedPlan.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                {course.lessonOf.has(s.id) && (
                  <button type="button" className="btn btn--small" onClick={() => onOpenLesson(s.id)}>
                    Lekcja
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {!selectedActivity && selectedPlan.length === 0 && (
          <p className="calendar__empty">
            {selected < course.today
              ? 'Tego dnia nie było nauki — i to jest w porządku. Plan przeliczył się od nowa.'
              : 'Bez nowej lekcji: ćwiczenia, powtórki i fiszki.'}
          </p>
        )}
      </section>
    </main>
  );
}

interface MonthProps {
  year: number;
  month: number;
  today: string;
  deadline: string;
  examDate: string | null;
  selected: string;
  planned: Map<string, string[]>;
  activity: CourseView['activity'];
  onSelect: (key: string) => void;
}

function Month({ year, month, today, deadline, examDate, selected, planned, activity, onSelect }: MonthProps) {
  const first = dayKey(new Date(year, month, 1).getTime());
  // Tydzień od poniedziałku: niedziela (0) na końcu.
  const lead = (weekday(first) + 6) % 7;
  const days: string[] = [];
  for (let d = first; keyToDate(d).getMonth() === month; d = addDays(d, 1)) days.push(d);

  return (
    <section className="month card" aria-label={`${MONTHS[month]} ${year}`}>
      <h2 className="month__title">
        {MONTHS[month]} <span>{year}</span>
      </h2>
      <div className="month__grid" role="grid">
        {WEEK_HEAD.map((h) => (
          <span key={h} className="month__head" role="columnheader">
            {h}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {days.map((d) => {
          const past = d <= today;
          const act = activity.get(d);
          const plan = planned.get(d);
          const classes = ['day'];
          if (past) classes.push(`day--i${intensity(act)}`);
          if (!past && plan && plan.length > 0) classes.push('day--plan');
          if (DEFAULT_REST_WEEKDAYS.includes(weekday(d))) classes.push('day--rest');
          if (d === today) classes.push('day--today');
          if (d === deadline) classes.push('day--deadline');
          if (d === examDate) classes.push('day--exam');
          if (d === selected) classes.push('day--selected');
          return (
            <button
              key={d}
              type="button"
              role="gridcell"
              className={classes.join(' ')}
              aria-label={`${formatDay(d)}${d === deadline ? ', termin' : ''}${plan?.length ? `, lekcje: ${plan.length}` : ''}`}
              onClick={() => onSelect(d)}
            >
              {keyToDate(d).getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
