import './diagnostics.css';

/**
 * Wejście w diagnozę — Blueprint sek. 15, Etap 3.
 *
 * Ekran mówi wprost, ile to potrwa i czego NIE da. Blueprint sek. 14 zabrania
 * obietnic bez pokrycia, a diagnoza jest najbardziej kuszącym miejscem na
 * obietnicę „teraz wiemy o tobie wszystko" — jedna sonda na kompetencję to
 * pomiar zgrubny i trzeba to powiedzieć przed startem, a nie po.
 */

interface Props {
  probeCount: number;
  hasPreviousPlan: boolean;
  onStart: () => void;
  onBack: () => void;
}

/** Sonda diagnostyczna to zadanie otwarte — liczymy ok. 90 sekund. */
const SECONDS_PER_PROBE = 90;

export function DiagnosticIntro({ probeCount, hasPreviousPlan, onStart, onBack }: Props) {
  const minutes = globalThis.Math.round((probeCount * SECONDS_PER_PROBE) / 60);

  return (
    <main className="diag">
      <header className="diag__head">
        <button type="button" className="diag__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <p className="diag__eyebrow">Diagnoza</p>
        <h1 className="diag__title">Gdzie naprawdę jesteś</h1>
      </header>

      <section className="diag__lead">
        <p>
          Jedna sonda na każdą kompetencję, przekrojowo przez wszystkie działy.
          Wynik ustawi plan nauki na podstawie tego, co rozwiążesz — nie na
          podstawie tego, jak się oceniasz.
        </p>
      </section>

      <dl className="diag__facts">
        <div>
          <dt>Pytania</dt>
          <dd>{probeCount}</dd>
        </div>
        <div>
          <dt>Szacowany czas</dt>
          <dd>{minutes} min</dd>
        </div>
        <div>
          <dt>Wynik</dt>
          <dd>Raport luk i trzy warianty planu</dd>
        </div>
      </dl>

      <section className="diag__honest">
        <h2>Czego ta diagnoza nie zrobi</h2>
        <ul>
          <li>
            Nie przyzna poziomu wyższego niż „samodzielne". Transferu i pamięci
            po odroczeniu nie da się zmierzyć jednym zadaniem — te poziomy
            zdobywa się w misjach.
          </li>
          <li>
            Jedna sonda na kompetencję to pomiar zgrubny. Pomyłka z nieuwagi
            zaniży wynik, a trafiony strzał go zawyży.
          </li>
          <li>
            Możesz korzystać z podpowiedzi. Zostaną zapisane i obniżą
            oszacowanie — to nie jest kara, tylko warunek uczciwego pomiaru.
          </li>
        </ul>
        <p className="diag__note">
          Możesz przerwać w dowolnym momencie. Kompetencje, do których nie
          dojdziesz, zostaną oznaczone jako niesprawdzone, a nie jako zerowe.
        </p>
      </section>

      {hasPreviousPlan && (
        <p className="diag__warn">
          Masz już aktywny plan. Nowa diagnoza go zastąpi — poprzedni zostanie
          w historii.
        </p>
      )}

      <div className="diag__actions">
        <button type="button" className="diag__primary" onClick={onStart} autoFocus>
          Zacznij diagnozę
        </button>
        <button type="button" className="diag__secondary" onClick={onBack}>
          Nie teraz
        </button>
      </div>
    </main>
  );
}
