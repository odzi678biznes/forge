import { MasteryLevel, type DayMode, type Skill, type SkillState } from '@/data/types';
import type { MissionPlan } from '@/learning-engine/mission';
import { openErrorCount, type ErrorGroup } from '@/learning-engine/error-lab';
import { MODE_LABELS, MODE_LOAD, type DailyPlan, type WeekRhythm } from '@/learning-engine/planner';
import { MasteryNode } from '@/features/mastery-map/MasteryNode';
import { SUBJECT_LABELS, type SubjectId } from '@/app/useForge';
import './command-center.css';

/**
 * Centrum dowodzenia - Blueprint sek. 7.1.
 *
 * Obietnica z sek. 2: w 10 sekund wiadomo, co robic, dlaczego wlasnie to, ile
 * potrwa seria i jaki bedzie efekt. Dlatego na gorze jest JEDNA rekomendacja
 * z przyciskiem startu, a nie lista zaleglosci.
 */

interface Props {
  recommended: MissionPlan;
  options: MissionPlan[];
  skills: Skill[];
  states: Map<string, SkillState>;
  missionsToday: number;
  errorGroups: ErrorGroup[];
  onStart: (plan: MissionPlan) => void;
  onOpenMap: () => void;
  onOpenErrorLab: () => void;
  onOpenDiagnostic: () => void;
  /** Powrot do gotowego, ale jeszcze nieprzyjetego raportu diagnozy. */
  onOpenReport: (() => void) | null;
  /** Czy uzytkownik przeszedl juz diagnoze i ma aktywny plan. */
  hasPlan: boolean;
  daily: DailyPlan;
  rhythm: WeekRhythm;
  dayMode: DayMode;
  onDayMode: (mode: DayMode) => void;
  onOpenWeekly: () => void;
  onTimeTrial: () => void;
  subject: SubjectId;
  onSubject: (next: SubjectId) => void;
  onOpenAi: () => void;
  aiEnabled: boolean;
}

export function CommandCenter({
  recommended,
  options,
  skills,
  states,
  missionsToday,
  errorGroups,
  onStart,
  onOpenMap,
  onOpenErrorLab,
  onOpenDiagnostic,
  onOpenReport,
  hasPlan,
  daily,
  rhythm,
  dayMode,
  onDayMode,
  onOpenWeekly,
  onTimeTrial,
  subject,
  onSubject,
  onOpenAi,
  aiEnabled,
}: Props) {
  const openErrors = openErrorCount(errorGroups);
  // Mapa stanow obejmuje oba przedmioty - liczymy tylko biezacy, inaczej
  // wynik nie zgadzalby sie z mianownikiem "z N".
  const solvedIndependently = skills.filter(
    (s) => (states.get(s.id)?.level ?? MasteryLevel.Unknown) >= MasteryLevel.Independent,
  ).length;

  // Sek. 7.1: dzisiejszy wynik, nie lista wszystkich kompetencji. Pelny
  // przekroj jest jednym kliknieciem dalej, na mapie.
  const todaySkills = daily.skillIds
    .map((id) => skills.find((s) => s.id === id))
    .filter((s): s is Skill => s !== undefined);
  const isMath = subject === 'math';

  return (
    <main className="cc">
      <header className="cc__head">
        <p className="cc__brand">FORGE</p>
        <div className="cc__subjects" role="radiogroup" aria-label="Przedmiot">
          {(Object.keys(SUBJECT_LABELS) as SubjectId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={subject === id}
              className={subject === id ? 'cc__subject cc__subject--on' : 'cc__subject'}
              onClick={() => onSubject(id)}
            >
              {SUBJECT_LABELS[id]}
            </button>
          ))}
        </div>
        <p className="cc__today">
          {missionsToday === 0
            ? 'Dzis jeszcze nie zaczynales.'
            : `Dzis ukonczone misje: ${missionsToday}.`}
        </p>
      </header>

      <section className="rhythm" aria-label="Rytm tygodnia">
        <div className="rhythm__bar" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={[
                'rhythm__day',
                i < rhythm.activeDays ? 'rhythm__day--on' : '',
                // Dni buforowe sa oznaczone inaczej: sek. 4.4 traktuje je
                // jako normalny element tygodnia, nie jako brak.
                i >= rhythm.plannedDays ? 'rhythm__day--buffer' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
        <p className="rhythm__note">{rhythm.note}</p>

        <div className="rhythm__modes" role="radiogroup" aria-label="Tryb dnia">
          {(Object.keys(MODE_LABELS) as DayMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={dayMode === m}
              className={dayMode === m ? 'rhythm__mode rhythm__mode--on' : 'rhythm__mode'}
              onClick={() => onDayMode(m)}
            >
              {MODE_LABELS[m]}
              <span>{MODE_LOAD[m]}</span>
            </button>
          ))}
        </div>
        <p className="rhythm__daily">{daily.rationale}</p>
      </section>

      {/* Diagnoza jest matematyczna (sek. 15, Etap 3) - w informatyce nie ma czego zapraszac. */}
      {isMath && !hasPlan && (
        <section className="cc__diag-invite">
          <p className="cc__diag-title">Nie masz jeszcze planu</p>
          <p className="cc__diag-text">
            {onOpenReport
              ? 'Diagnoza jest ukonczona, ale plan nie zostal jeszcze przyjety. Wynik czeka - nie trzeba jej powtarzac.'
              : 'Diagnoza przekrojowa ustawi kolejnosc pracy na podstawie tego, co rozwiazesz. Bez niej aplikacja zgaduje, od czego zaczac.'}
          </p>
          <button
            type="button"
            className="cc__link"
            onClick={onOpenReport ?? onOpenDiagnostic}
          >
            {onOpenReport ? 'Zobacz wynik diagnozy' : 'Przejdz diagnoze'} &rarr;
          </button>
        </section>
      )}

      <section className="cc__mission" aria-labelledby="cc-mission-title">
        <p className="cc__eyebrow">Rekomendowana misja</p>
        <h1 className="cc__title" id="cc-mission-title">
          {recommended.title}
        </h1>
        <p className="cc__rationale">{recommended.rationale}</p>

        <dl className="cc__facts">
          <div>
            <dt>Pytania</dt>
            <dd>{recommended.questionCount}</dd>
          </div>
          <div>
            <dt>Szacowany czas</dt>
            <dd>{estimateMinutes(recommended.questionCount)} min</dd>
          </div>
          <div>
            <dt>Pierwszy krok</dt>
            <dd>Pytanie 1 z {recommended.questionCount}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="cc__start"
          onClick={() => onStart(recommended)}
          autoFocus
        >
          Rozpocznij
          <kbd>Enter</kbd>
        </button>
      </section>

      <section className="cc__alts" aria-label="Alternatywy">
        {options.map((option) => (
          <button
            key={option.title}
            type="button"
            className="cc__alt"
            onClick={() => onStart(option)}
          >
            <span className="cc__alt-title">{option.title}</span>
            <span className="cc__alt-meta">{option.questionCount} pytan</span>
            <span className="cc__alt-why">{option.rationale}</span>
          </button>
        ))}
      </section>

      <section className="cc__map" aria-labelledby="cc-map-title">
        <div className="cc__map-head">
          <h2 id="cc-map-title">Mapa kompetencji</h2>
          <div className="cc__map-actions">
            <p className="cc__map-note">
              Samodzielnie lub wyzej: {solvedIndependently} z {skills.length}
            </p>
            <button type="button" className="cc__link" onClick={onOpenMap}>
              Pelna mapa &rarr;
            </button>
            {isMath && hasPlan && (
              <button type="button" className="cc__link" onClick={onOpenDiagnostic}>
                Powtorz diagnoze
              </button>
            )}
            <button type="button" className="cc__link" onClick={onOpenWeekly}>
              Raport tygodniowy
            </button>
            <button type="button" className="cc__link" onClick={onTimeTrial}>
              Proba czasowa
            </button>
            <button type="button" className="cc__link" onClick={onOpenAi}>
              {aiEnabled ? 'AI: wlaczone' : 'AI: wylaczone'}
            </button>
            <button type="button" className="cc__link" onClick={onOpenErrorLab}>
              Laboratorium bledow
              {openErrors > 0 && <span className="cc__badge">{openErrors}</span>}
            </button>
          </div>
        </div>
        <p className="cc__nodes-label">Na dziś</p>
        <div className="cc__nodes">
          {todaySkills.map((skill) => {
            const state = states.get(skill.id);
            return state ? (
              <MasteryNode key={skill.id} skill={skill} state={state} />
            ) : null;
          })}
        </div>
      </section>
    </main>
  );
}

/** Ok. 90 sekund na pytanie otwarte - szacunek, nie obietnica. */
function estimateMinutes(count: number): number {
  return globalThis.Math.max(2, globalThis.Math.round((count * 90) / 60));
}
