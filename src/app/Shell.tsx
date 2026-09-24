import { useState, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { SUBJECT_LABELS, type Screen, type SubjectId } from './useForge';
import './shell.css';

/**
 * Powłoka aplikacji: nawigacja wokół ekranów kursu.
 *
 * Na komputerze - pasek boczny, na telefonie - pięć zakładek na dole i reszta
 * pod "Więcej". Arena (rozwiązywanie zadań) celowo NIE ma powłoki: tam liczy
 * się jedno zadanie na pełnym ekranie, bez rozpraszaczy (sek. 7.2).
 */

interface NavItem {
  screen: Screen;
  label: string;
  icon: IconName;
}

const PRIMARY: NavItem[] = [
  { screen: 'command-center', label: 'Dziś', icon: 'today' },
  { screen: 'course', label: 'Kurs', icon: 'course' },
  { screen: 'flashcards', label: 'Fiszki', icon: 'cards' },
  { screen: 'calendar', label: 'Kalendarz', icon: 'calendar' },
  { screen: 'progress', label: 'Postęp', icon: 'progress' },
];

const SECONDARY: NavItem[] = [
  { screen: 'exams', label: 'Arkusze CKE', icon: 'exam' },
  { screen: 'error-lab', label: 'Laboratorium błędów', icon: 'errors' },
  { screen: 'mastery-map', label: 'Mapa umiejętności', icon: 'map' },
  { screen: 'weekly-report', label: 'Raport tygodnia', icon: 'report' },
  { screen: 'ai-settings', label: 'Nauczyciel AI', icon: 'ai' },
  { screen: 'data', label: 'Twoje dane', icon: 'data' },
];

/** Ekrany, które na pasku podświetlają swojego "rodzica". */
const PARENT: Partial<Record<Screen, Screen>> = {
  lesson: 'course',
  summary: 'command-center',
  'diagnostic-intro': 'command-center',
  'diagnostic-report': 'command-center',
};

interface Props {
  screen: Screen;
  subject: SubjectId;
  onSubject: (next: SubjectId) => void;
  onNavigate: (screen: Screen) => void;
  /** Liczby przy pozycjach menu, np. fiszki do powtórki. */
  badges: Partial<Record<Screen, number>>;
  children: ReactNode;
}

export function Shell({ screen, subject, onSubject, onNavigate, badges, children }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  const active = PARENT[screen] ?? screen;

  const go = (s: Screen) => {
    setMoreOpen(false);
    onNavigate(s);
  };

  const item = (n: NavItem, variant: 'side' | 'tab' | 'sheet') => {
    const badge = badges[n.screen];
    return (
      <button
        key={n.screen}
        type="button"
        className={`nav__item nav__item--${variant}${active === n.screen ? ' nav__item--on' : ''}`}
        aria-current={active === n.screen ? 'page' : undefined}
        onClick={() => go(n.screen)}
      >
        <Icon name={n.icon} size={variant === 'tab' ? 22 : 19} />
        <span className="nav__label">{n.label}</span>
        {badge !== undefined && badge > 0 && <span className="nav__badge">{badge}</span>}
      </button>
    );
  };

  const subjects = (
    <div className="subjects" role="radiogroup" aria-label="Przedmiot">
      {(Object.keys(SUBJECT_LABELS) as SubjectId[]).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={subject === id}
          className={subject === id ? 'subjects__item subjects__item--on' : 'subjects__item'}
          onClick={() => onSubject(id)}
        >
          {SUBJECT_LABELS[id]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="shell">
      <aside className="shell__side" aria-label="Nawigacja">
        <p className="shell__brand">FORGE</p>
        {subjects}
        <nav className="nav">{PRIMARY.map((n) => item(n, 'side'))}</nav>
        <nav className="nav nav--secondary" aria-label="Narzędzia">
          {SECONDARY.map((n) => item(n, 'side'))}
        </nav>
      </aside>

      <header className="shell__top">
        <p className="shell__brand">FORGE</p>
        {subjects}
        <button
          type="button"
          className="shell__more"
          aria-expanded={moreOpen}
          aria-label="Więcej"
          onClick={() => setMoreOpen((o) => !o)}
        >
          <Icon name={moreOpen ? 'close' : 'more'} />
        </button>
      </header>

      {moreOpen && (
        <div className="shell__sheet" role="dialog" aria-label="Więcej">
          {SECONDARY.map((n) => item(n, 'sheet'))}
        </div>
      )}

      <div className="shell__content">{children}</div>

      <nav className="shell__tabs" aria-label="Nawigacja">
        {PRIMARY.map((n) => item(n, 'tab'))}
      </nav>
    </div>
  );
}
