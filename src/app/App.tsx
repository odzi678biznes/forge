import { useForge } from './useForge';
import { CommandCenter } from '@/features/missions/CommandCenter';
import { MissionSummary } from '@/features/missions/MissionSummary';
import { Arena } from '@/features/questions/Arena';

export function App() {
  const { state, skills, beginMission, submitAnswer, advance, toCommandCenter } =
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

  return (
    <CommandCenter
      recommended={state.recommended}
      options={state.options}
      skills={skills}
      states={state.skillStates}
      missionsToday={state.missionsToday}
      onStart={beginMission}
    />
  );
}
