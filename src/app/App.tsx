import { useForge } from './useForge';
import { CommandCenter } from '@/features/missions/CommandCenter';
import { MissionSummary } from '@/features/missions/MissionSummary';
import { Arena } from '@/features/questions/Arena';
import { MasteryMap } from '@/features/mastery-map/MasteryMap';
import { ErrorLab } from '@/features/error-lab/ErrorLab';
import { repairFor, trainingFor } from '@/learning-engine/mission';

export function App() {
  const { state, skills, beginMission, submitAnswer, advance, toCommandCenter, goTo } =
    useForge();

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
    />
  );
}
