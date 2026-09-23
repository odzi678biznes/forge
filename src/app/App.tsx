import { useEffect, useMemo, useState } from 'react';
import { useForge } from './useForge';
import { CommandCenter } from '@/features/missions/CommandCenter';
import { MissionSummary } from '@/features/missions/MissionSummary';
import { Arena } from '@/features/questions/Arena';
import { MasteryMap } from '@/features/mastery-map/MasteryMap';
import { ErrorLab } from '@/features/error-lab/ErrorLab';
import { repairFor, timeTrial, trainingFor } from '@/learning-engine/mission';
import { DiagnosticIntro } from '@/features/diagnostics/DiagnosticIntro';
import { DiagnosticReportView } from '@/features/diagnostics/DiagnosticReportView';
import { WeeklyReportView } from '@/features/weekly-review/WeeklyReportView';
import { AiSettings } from '@/features/ai/AiSettings';
import { createTutor } from '@/features/ai/tutor';

export function App() {
  const {
    state,
    skills,
    questions,
    beginMission,
    submitAnswer,
    advance,
    toCommandCenter,
    goTo,
    startDiagnostic,
    previewPlan,
    choosePlan,
    diagnosticSize,
    setDayMode,
    setSubject,
    finishMissionNow,
  } = useForge();

  // AI jest opcjonalne i domyslnie wylaczone: wlacza je dopiero klucz
  // podany w tej sesji (sek. 11). Tutor tworzymy raz na cale zycie aplikacji.
  const tutor = useMemo(() => createTutor(), []);
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => {
    if (tutor.unavailableReason) return;
    void tutor.keyPresent().then(setAiEnabled).catch(() => setAiEnabled(false));
  }, [tutor]);
  const catalogue = useMemo(() => questions.flatMap((q) => q.commonErrors), [questions]);

  if (state.screen === 'loading') {
    return <p className="boot">Wczytywanie profilu...</p>;
  }

  if (state.screen === 'arena' && state.current && state.plan) {
    return (
      <Arena
        selection={state.current}
        step={state.step}
        total={state.plan.questionCount}
        feedback={state.feedback}
        onSubmit={(answer, hintLevel, confidence) => {
          void submitAnswer(answer, hintLevel, confidence);
        }}
        onAdvance={() => {
          void advance();
        }}
        deadlineAt={state.missionDeadline}
        onTimeUp={() => {
          void finishMissionNow();
        }}
        running={state.running}
        ai={{
          tutor,
          enabled: aiEnabled,
          recentErrorIds: state.skillStates.get(state.current.skill.id)?.recentErrors ?? [],
          catalogue,
        }}
      />
    );
  }

  if (state.screen === 'summary') {
    return (
      <MissionSummary
        steps={state.steps}
        skills={skills}
        states={state.skillStates}
        missionsToday={state.missionsToday}
        // "Jeszcze jedna" wraca do centrum dowodzenia, a nie startuje misji
        // automatycznie - Blueprint sek. 3 i 14.
        onAgain={toCommandCenter}
        onFinish={toCommandCenter}
      />
    );
  }

  if (state.screen === 'mastery-map') {
    return (
      <MasteryMap
        skills={skills}
        states={state.skillStates}
        // Klikniecie w wezel uruchamia trening, nie otwiera statystyk (sek. 7.3).
        onSelect={(skill) =>
          beginMission(trainingFor(skill, state.skillStates.get(skill.id)?.level ?? 0))
        }
        onBack={toCommandCenter}
      />
    );
  }

  if (state.screen === 'diagnostic-intro') {
    return (
      <DiagnosticIntro
        probeCount={diagnosticSize}
        hasPreviousPlan={state.savedPlan !== null}
        onStart={startDiagnostic}
        onBack={toCommandCenter}
      />
    );
  }

  if (state.screen === 'diagnostic-report' && state.report) {
    return (
      <DiagnosticReportView
        report={state.report}
        preview={previewPlan}
        onChoose={(variant, deadline) => {
          void choosePlan(variant, deadline);
        }}
        onBack={toCommandCenter}
      />
    );
  }

  if (state.screen === 'ai-settings') {
    return <AiSettings tutor={tutor} onChange={setAiEnabled} onBack={toCommandCenter} />;
  }

  if (state.screen === 'weekly-report') {
    return (
      <WeeklyReportView
        report={state.weekly}
        rhythm={state.rhythm}
        onBack={toCommandCenter}
      />
    );
  }

  if (state.screen === 'error-lab') {
    return (
      <ErrorLab
        groups={state.errorGroups}
        skills={skills}
        onRepair={(skill, cause) => beginMission(repairFor(skill, cause))}
        onBack={toCommandCenter}
      />
    );
  }

  return (
    <CommandCenter
      recommended={state.recommended}
      options={state.options}
      skills={skills}
      states={state.skillStates}
      missionsToday={state.missionsToday}
      errorGroups={state.errorGroups}
      onStart={beginMission}
      onOpenMap={() => goTo('mastery-map')}
      onOpenErrorLab={() => goTo('error-lab')}
      onOpenDiagnostic={() => goTo('diagnostic-intro')}
      onOpenReport={state.report ? () => goTo('diagnostic-report') : null}
      hasPlan={state.savedPlan !== null}
      subject={state.subject}
      onSubject={(next) => { void setSubject(next); }}
      daily={state.daily}
      rhythm={state.rhythm}
      dayMode={state.dayMode}
      onDayMode={(mode) => { void setDayMode(mode); }}
      onOpenWeekly={() => goTo('weekly-report')}
      onTimeTrial={() => beginMission(timeTrial())}
      onOpenAi={() => goTo('ai-settings')}
      aiEnabled={aiEnabled}
    />
  );
}
