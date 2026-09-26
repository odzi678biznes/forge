import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '@/components/Icon';
import { installUpdate, subscribePwa, updateReady } from '@/platform/pwa';
import { SUBJECT_LABELS, SUBJECT_SHORT, type Screen, type SubjectId } from './useForge';
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

// Prototyp nauki: na dole tylko to, co codzienne. Statystyki i narzędzia — pod „Więcej”.
const PRIMARY: NavItem[] = [
  { screen: 'command-center', label: 'Dziś', icon: 'today' },
  { screen: 'course', label: 'Kurs', icon: 'course' },
];

const SECONDARY: NavItem[] = [
  { screen: 'flashcards', label: 'Powtórki i fiszki', icon: 'cards' },
  { screen: 'exams', label: 'Arkusze CKE', icon: 'exam' },
  { screen: 'plan', label: 'Statystyki', icon: 'report' },
  { screen: 'ai-settings', label: 'Nauczyciel AI', icon: 'ai' },
  { screen: 'data', label: 'Twoje dane', icon: 'data' },
];

/** Ekrany, które na pasku podświetlają swojego "rodzica". */
const PARENT: Partial<Record<Screen, Screen>> = {
  lesson: 'course',
  summary: 'command-center',
  'diagnostic-intro': 'command-center',
  'diagnostic-report': 'command-center',
  progress: 'plan',
  'mastery-map': 'plan',
  'weekly-report': 'plan',
  'error-lab': 'plan',
  calendar: 'plan',
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
  const update = useSyncExternalStore(subscribePwa, updateReady);
  const [updateLater, setUpdateLater] = useState(false);
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

  // W bocznym menu pełne nazwy jedna pod drugą, w górnym pasku telefonu — skróty.
  const subjects = (compact: boolean) => (
    <div className={compact ? 'subjects subjects--compact' : 'subjects'} role="radiogroup" aria-label="Przedmiot">
      {(Object.keys(SUBJECT_LABELS) as SubjectId[]).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={subject === id}
          className={subject === id ? 'subjects__item subjects__item--on' : 'subjects__item'}
          onClick={() => onSubject(id)}
          aria-label={SUBJECT_LABELS[id]}
        >
          {compact ? SUBJECT_SHORT[id] : SUBJECT_LABELS[id]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="shell">
      <aside className="shell__side" aria-label="Nawigacja">
        <p className="shell__brand">FORGE</p>
        {subjects(false)}
        <nav className="nav">{PRIMARY.map((n) => item(n, 'side'))}</nav>
        <nav className="nav nav--secondary" aria-label="Więcej">
          <p className="nav__naglowek">Więcej</p>
          {SECONDARY.map((n) => item(n, 'side'))}
        </nav>
      </aside>

      <header className="shell__top">
        <p className="shell__brand">FORGE</p>
        {subjects(true)}
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

      <div className="shell__content">
        {update && !updateLater && (
          <div className="shell__update" role="status">
            <span>Jest nowa wersja FORGE. Odśwież, kiedy zechcesz — Twoje dane są zapisane.</span>
            <button type="button" className="btn btn--small btn--primary" onClick={installUpdate}>
              Odśwież
            </button>
            <button type="button" className="btn btn--small" onClick={() => setUpdateLater(true)}>
              Później
            </button>
          </div>
        )}
        {children}
      </div>

      {createPortal(<nav className="shell__tabs" aria-label="Nawigacja">
        {PRIMARY.map((n) => item(n, 'tab'))}
        <button
          type="button"
          className={`nav__item nav__item--tab${moreOpen ? ' nav__item--on' : ''}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((o) => !o)}
        >
          <Icon name={moreOpen ? 'close' : 'more'} size={22} />
          <span className="nav__label">Więcej</span>
        </button>
      </nav>, document.body)}
    </div>
  );
}
