import type { ExamReport, TutorSession } from './types';

export function examReport(session: TutorSession, previous: ExamReport | null): ExamReport {
  let earned = 0, ungraded = 0, correct = 0, partial = 0, incorrect = 0, unanswered = 0;
  const repair = new Set<string>();
  const lost: ExamReport['lost'] = [];
  for (const exercise of session.exercises) {
    const submissions = session.submissions.filter(s => s.exerciseId === exercise.id);
    const attempt = submissions.at(-1);
    const a = attempt?.analysis;
    if (!attempt) {
      unanswered++; repair.add(exercise.skillId);
      lost.push({ exerciseId: exercise.id, points: exercise.maxPoints, reasons: ['Brak przesłanego rozwiązania.'] });
      continue;
    }
    if (!a || a.verdict === 'uncertain' || a.points === null) {
      ungraded++; lost.push({ exerciseId: exercise.id, points: null, reasons: [a?.clarification || attempt.error || 'Oczekuje na analizę.'] });
      continue;
    }
    earned += a.points;
    if (a.verdict === 'correct') correct++; else if (a.verdict === 'partial') partial++; else incorrect++;
    if (a.points < exercise.maxPoints) {
      repair.add(exercise.skillId);
      a.errors.forEach(e => repair.add(e.skillId));
      lost.push({ exerciseId: exercise.id, points: exercise.maxPoints - a.points,
        reasons: a.errors.length ? a.errors.map(e => `${e.step}: ${e.explanation}`) : [a.feedback] });
    }
  }
  return { earned, possible: session.exercises.reduce((sum, e) => sum + e.maxPoints, 0), ungraded,
    correct, partial, incorrect, unanswered, lost, timeUsedMs: (session.endedAt ?? Date.now()) - session.startedAt,
    timedOut: session.deadlineAt !== null && (session.endedAt ?? Date.now()) >= session.deadlineAt,
    repairSkillIds: [...repair], previousPercent: previous && previous.ungraded === 0 ? previous.earned / previous.possible * 100 : null };
}
