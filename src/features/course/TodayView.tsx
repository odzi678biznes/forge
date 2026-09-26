import type { DayMode, Skill, Topic } from '@/data/types';
import type { MissionPlan } from '@/learning-engine/mission';
import type { WeekRhythm } from '@/learning-engine/planner';
import type { CourseView, SubjectGlance } from '@/app/useCourse';
import type { SubjectId } from '@/app/useForge';
import { Ring } from '@/components/Ring';
import { Icon } from '@/components/Icon';
import './course.css';

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
  others: { id: SubjectId; label: string; glance: SubjectGlance }[];
  onSwitchSubject: (id: SubjectId) => void;
}

/** Statystyki są odczytem planu i wyników; jedyny start nauki pozostaje na „Dziś”. */
export function TodayView({ course, topics, others, onSwitchSubject, diagnostic, onOpenCalendar }: Props) {
  const topicName = (s: Skill) => topics.find((t) => t.id === s.topicId)?.name ?? '';
  return (
    <main className="page today">
      <header>
        <p className="page__eyebrow">Statystyki</p>
        <h1 className="page__title">Plan i postęp</h1>
      </header>
      <div className="today__grid">
        <section className="card" aria-labelledby="today-plan">
          <h2 className="card__title" id="today-plan">Plan na dziś</h2>
          <ul className="plan">
            {course.todayLessons.length === 0 && <li className="plan__row">Bez nowej lekcji w planie na dziś.</li>}
            {course.todayLessons.map((s) => (
              <li key={s.id} className="plan__row">
                <span className={course.todayDone.has(s.id) ? 'plan__check plan__check--on' : 'plan__check'} aria-hidden>
                  {course.todayDone.has(s.id) && <Icon name="check" size={16} />}
                </span>
                <span className="plan__text"><strong>{s.name}</strong><span>{topicName(s)} · {course.todayDone.has(s.id) ? 'przerobiona' : 'do przerobienia'}</span></span>
              </li>
            ))}
            <li className="plan__row">Powtórki: {course.reviewsDue.length} · Fiszki: {course.cardSession.queue.length}</li>
          </ul>
          <h3 className="plan__sub">Pozostałe przedmioty</h3>
          <ul className="plan">
            {others.map((o) => <li key={o.id} className="plan__row">
              <span className="plan__text"><strong>{o.label}</strong><span>{o.glance.lessonsLeft} lekcji · {o.glance.reviewsDue} powtórek · {o.glance.cardsWaiting} fiszek</span></span>
              <button type="button" className="btn btn--small" onClick={() => onSwitchSubject(o.id)}>Pokaż</button>
            </li>)}
          </ul>
          <p className="today__pace">{course.schedule.message} <button type="button" className="link" onClick={onOpenCalendar}>Kalendarz →</button></p>
        </section>
        <section className="card today__rings" aria-label="Postęp">
          <h2 className="card__title today__rings-title">Twój postęp</h2>
          <Ring value={course.summary.ratio} label="Kurs przerobiony" size={84} />
          {course.readinessPP.skills > 0 && <Ring value={course.readinessPP.ratio} label="Gotowość PP" size={84} />}
          <Ring value={course.readinessPR.ratio} label="Gotowość PR" size={84} tone="challenge" />
          <p className="today__rings-note">Gotowość to szacunek z poziomów umiejętności, nie wynik arkusza.</p>
          <p>{course.summary.covered} z {course.summary.total} umiejętności przerobionych</p>
        </section>
      </div>
      {diagnostic && <section className="today__extra" aria-label="Inne formy treningu">
        <button type="button" className="extra" onClick={diagnostic.onOpen}>
          <strong>{diagnostic.hasReport ? 'Wynik diagnozy' : 'Diagnoza przekrojowa'}</strong>
          <span>Sprawdź umiejętności z całego przedmiotu i zobacz wynik.</span>
        </button>
      </section>}
    </main>
  );
}
