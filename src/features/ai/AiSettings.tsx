import { useEffect, useState } from 'react';
import { MAX_PRIOR_ERRORS } from '@/learning-engine/ai-context';
import type { AiTutor } from './tutor';
import './ai.css';

/**
 * Ustawienia opcjonalnej warstwy AI — Blueprint sek. 11 i 12.
 *
 * Ekran mówi wprost trzy rzeczy, zanim uczeń poda klucz: gdzie klucz jest
 * trzymany, co trafia do AI i co się dzieje bez AI. Domyślnie AI jest
 * wyłączone — aplikacja nie zachęca do włączenia, tylko je umożliwia.
 */

interface Props {
  tutor: AiTutor;
  onChange: (enabled: boolean) => void;
  onBack: () => void;
}

export function AiSettings({ tutor, onChange, onBack }: Props) {
  const [present, setPresent] = useState<boolean | null>(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void tutor.keyPresent().then(setPresent);
  }, [tutor]);

  const save = async () => {
    setMessage(null);
    try {
      await tutor.setKey(draft);
      setDraft('');
      setPresent(true);
      onChange(true);
      setMessage('Klucz ustawiony na czas tej sesji.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Nie udało się ustawić klucza.');
    }
  };

  const clear = async () => {
    await tutor.clearKey();
    setPresent(false);
    onChange(false);
    setMessage('Klucz usunięty z pamięci. AI jest wyłączone.');
  };

  return (
    <main className="ai-settings">
      <header>
        <button type="button" className="ai-settings__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <p className="ai-settings__eyebrow">Opcjonalne</p>
        <h1 className="ai-settings__title">Nauczyciel AI</h1>
        <p className="ai-settings__lead">
          Aplikacja działa w pełni bez AI: drabina podpowiedzi, ocenianie, plan i raporty są lokalne.
          AI może dać dodatkową podpowiedź i ocenić tok rozumowania.
        </p>
      </header>

      {tutor.unavailableReason ? (
        <p className="ai-settings__box">{tutor.unavailableReason}</p>
      ) : (
        <>
          <section className="ai-settings__box">
            <h2>Gdzie jest klucz</h2>
            <p>
              Wyłącznie w pamięci procesu aplikacji. Nie jest zapisywany do bazy, na dysk ani do
              logów, i znika po zamknięciu aplikacji. Po każdym uruchomieniu trzeba go podać od nowa
              — to cena tego, że nigdzie nie zostaje.
            </p>
            <p className="ai-settings__status">
              Stan: {present === null ? 'sprawdzam…' : present ? 'klucz ustawiony w tej sesji' : 'AI wyłączone'}
            </p>

            {present ? (
              <button type="button" className="ai-settings__secondary" onClick={() => void clear()}>
                Usuń klucz i wyłącz AI
              </button>
            ) : (
              <div className="ai-settings__form">
                <label htmlFor="ai-key">Klucz API Anthropic</label>
                <input
                  id="ai-key"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="button"
                  className="ai-settings__primary"
                  onClick={() => void save()}
                  disabled={draft.trim() === ''}
                >
                  Użyj w tej sesji
                </button>
              </div>
            )}
            {message && <p className="ai-settings__message">{message}</p>}
          </section>

          <section className="ai-settings__box">
            <h2>Co trafia do AI</h2>
            <ul>
              <li>treść bieżącego pytania,</li>
              <li>twoja odpowiedź (i tok rozumowania, jeśli prosisz o jego ocenę),</li>
              <li>rubryka: poprawna odpowiedź i rozwiązanie wzorcowe,</li>
              <li>podpowiedzi, które już zobaczyłeś,</li>
              <li>najwyżej {MAX_PRIOR_ERRORS} przyczyny twoich wcześniejszych błędów w tej kompetencji.</li>
            </ul>
            <p>
              Nic więcej: ani poziomy kompetencji, ani historia prób, plan, terminy czy dane o tobie.
              Przed każdym wysłaniem zobaczysz dokładny podgląd.
            </p>
          </section>

          <section className="ai-settings__box">
            <h2>Czego AI nie robi</h2>
            <ul>
              <li>
                Nie zmienia poziomów kompetencji — ocena AI to informacja zwrotna, a nie dowód
                opanowania. Błędna ocena AI nie zepsuje twojego postępu.
              </li>
              <li>
                Podpowiedź AI, która zawiera wynik, jest odrzucana, zanim ją zobaczysz.
              </li>
              <li>Bez połączenia albo po odmowie odpowiedzi aplikacja po prostu działa dalej.</li>
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
