/** Deterministic provider double for automated tests only. Production always uses claudeProvider. */
import type { TutorProvider } from '../../../server/tutor/provider';
import type { SolutionAnalysis, TutorExercise } from './types';

export const TEST_PHOTO = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG1cAAAAASUVORK5CYII=';
export function testExercise(index = 0): TutorExercise {
  return { id: `exercise-${index}`, subjectId: 'math', sourceId: null, skillId: 'num-order', prompt: `Oblicz $\\frac{1}{2}+\\frac{1}{2}$. Próba ${index + 1}.`,
    answer: '1', solution: 'Dodaj liczniki przy wspólnym mianowniku: 2/2 = 1.', steps: ['2/2 = 1'], choices: [], figure: null,
    listing: null, kind: 'foundation', difficulty: 1, maxPoints: 2, rationale: 'Sprawdzamy wspólny mianownik.', validation: 'program' };
}
export function testAnalysis(overrides: Partial<SolutionAnalysis> = {}): SolutionAnalysis {
  return { readable: true, complete: true, confidence: 0.95, clarification: '', transcription: ['1/2 + 1/2 = 2/2 = 1'],
    verdict: 'correct', points: 2, reasoning: 'sound', goodSteps: ['Wspólny mianownik i poprawne dodanie liczników.'],
    errors: [], feedback: 'Kolejne przekształcenia są poprawne.', nextStep: 'Spróbuj podobnego działania z innym mianownikiem.',
    learned: 'Dodawanie ułamków.', formulas: [{ name: 'Dodawanie ułamków', usedCorrectly: true }], ...overrides };
}
export function testProvider(): TutorProvider {
  let index = 0;
  return {
    async generate() { return { exercise: testExercise(index++), introduction: 'Zaczniemy od łatwych ułamków.', phases: ['Rozgrzewka', 'Ćwiczenia', 'Utrwalenie'] }; },
    async sheet() { return { exercises: [testExercise(index++), testExercise(index++)], introduction: 'Arkusz do testu automatycznego.' }; },
    async analyze() { return testAnalysis(); },
    async help(_e, _s, _m, level) { return { text: level === 5 ? 'Dodaj liczniki, wynik 1.' : `Wskazówka ${level}: sprawdź mianowniki.`, helpLevel: level === 5 ? 6 : level }; },
    async lesson() { return { skillId: 'num-order', title: 'Wspólny mianownik', steps: ['Idea', 'Przykład', 'Razem', 'Teraz Ty', 'Sprawdzenie', 'Utrwalenie'].map(title => ({ title, text: 'Dodawaj kawałki jednakowej wielkości.' })), step: 0, checked: false }; },
    async plan() { return { plan: { now: 'Ćwiczymy ułamki.', skillId: 'num-order', reason: 'Sprawdzamy samodzielne przekształcenia.', next: ['Procenty'], updatedAt: Date.now() },
      summary: { learned: ['Dodawanie ułamków'], progress: 'Poprawny zapis kroków.', improve: 'Utrwalamy mianowniki.', next: 'Podobne zadanie z innymi liczbami.' } }; },
  };
}
