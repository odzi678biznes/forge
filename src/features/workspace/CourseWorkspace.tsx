import type { KontekstNauczyciela } from '@/nauka/nauczyciel-kontekst';
import type { Question } from '@/data/types';
import { TaskWorkspace } from './TaskWorkspace';
import type { StoragePort } from '@/data/storage-port';
import type { Prosba } from '@/nauka/nauczyciel-kontekst';
import type { Odpowiedz } from '@/nauka/nauczyciel-klient';

/** Shared notebook for the small course cards; the course owns its steps and grading. */
export function CourseWorkspace({ context, skillId, storageKey, storage, onHelp, onUseAnswer }: {
  context: KontekstNauczyciela; skillId: string; storageKey: string; storage?: () => StoragePort;
  onHelp?: (response: Odpowiedz, request: Prosba) => void;
  onUseAnswer?: (value: string) => void;
}) {
  const question: Question = {
    id: storageKey, skillId, kind: 'foundation', format: 'numeric',
    prompt: context.zadanie?.tresc ?? context.krok.pytanie,
    source: context.zadanie?.zrodlo ?? 'FORGE', verified: false,
    answer: '', acceptedVariants: [], solution: '', hints: [], commonErrors: [], difficulty: 1,
  };
  return <TaskWorkspace question={question} storageKey={storageKey} courseContext={context} {...(storage ? { storage } : {})} {...(onHelp ? {onTeacherHelp:onHelp} : {})} {...(onUseAnswer ? { onUseAnswer } : {})} />;
}
