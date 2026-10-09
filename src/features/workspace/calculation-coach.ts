import type { KontekstNauczyciela, Prosba } from '@/nauka/nauczyciel-kontekst';
import { zapytajNauczyciela, type Odpowiedz } from '@/nauka/nauczyciel-klient';
import { beginTeacherRequest, changeTeacherConversation, finishTeacherRequest, isTeacherRequestCurrent, readTeacherConversation } from '@/nauka/teacher-conversation';
import type { Calculation } from './calculator';

export const coachConversationKey = (storageKey: string) => `forge.teacher.chat:${storageKey}:workpad`;
export function coachResponseIsHelp(response: Odpowiedz, request: Prosba): boolean {
  return response.tryb === 'ai' && request !== 'zapis' && !!response.struktura
    && response.struktura.rodzaj !== 'inne';
}

export function calculationReviewContext(context: KontekstNauczyciela, calculation: Calculation): KontekstNauczyciela {
  return { ...context, krok: { ...context.krok,
    kontekst: `${context.krok.kontekst ?? ''}\nOSTATNI ZATWIERDZONY RACHUNEK: ${calculation.expression} = ${calculation.result}.\nWynik arytmetyczny został obliczony lokalnym kalkulatorem. Oceń wyłącznie, czy wybrana metoda pasuje do zadania; nie podawaj następnego wyniku.` },
  };
}

/** Exactly one explicit action -> at most one request. Persists across closing/reopening the pad. */
export async function askCalculationCoach(input: {
  storageKey: string; requestId: string; request: 'sprawdz-rachunek' | 'zapis';
  context: KontekstNauczyciela; text: string;
}, ask: typeof zapytajNauczyciela = zapytajNauczyciela): Promise<'sent' | 'busy' | 'duplicate' | 'cancelled'> {
  const key = coachConversationKey(input.storageKey);
  const previous = readTeacherConversation(key);
  const completed = previous.find(message => message.id === `${input.requestId}:reply`);
  if (completed?.tryb === 'ai' || (!completed && previous.some(message => message.id === input.requestId))) return 'duplicate';
  if (!beginTeacherRequest(key, input.requestId)) return 'busy';
  changeTeacherConversation(key, messages => [...messages.filter(message => message.id !== input.requestId && message.id !== `${input.requestId}:reply`), { id: input.requestId, rola: 'uczen', tekst: input.text, prosba: input.request }]);
  try {
    let response: Odpowiedz;
    try { response = await ask(input.context, input.request, [], input.request === 'zapis' ? input.text : undefined); }
    catch { response = { tryb: 'demo', model: null, tekst: '', powod: 'Nie udało się odebrać odpowiedzi nauczyciela.' }; }
    if (!isTeacherRequestCurrent(key, input.requestId)) return 'cancelled';
    if (response.tryb !== 'ai') response = { tryb: 'demo', model: null, tekst: input.request === 'zapis'
      ? 'AI nie rozpoznało wypowiedzi. Twoje słowa pozostają w polu; możesz poprawić zapis lub spróbować ponownie.'
      : 'AI nie sprawdziło tego kroku. Kalkulator i zapisane rachunki nadal działają.', ...(response.powod ? { powod: response.powod } : {}) };
    const hidden = response.struktura?.ujawniaWynik === true;
    changeTeacherConversation(key, messages => [...messages, {
      id: `${input.requestId}:reply`, rola: 'nauczyciel', tekst: response.tekst, tryb: response.tryb, model: response.model,
      prosba: input.request, helpPending: !hidden && coachResponseIsHelp(response, input.request),
      ...(hidden ? { ukryta: true } : {}),
      ...(response.struktura ? { struktura: response.struktura } : {}),
      ...(response.struktura?.pytanieKontrolne ? { pytanieKontrolne: response.struktura.pytanieKontrolne } : {}),
      ...(response.struktura?.zapisKalkulatora ? { expression: response.struktura.zapisKalkulatora } : {}),
      ...(response.powod ? { powod: response.powod } : {}),
    }]);
    return 'sent';
  } finally { finishTeacherRequest(key, input.requestId); }
}
