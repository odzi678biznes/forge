import { LEKCJE } from './lekcje';
import { biezaca, numerKroku, postep, powtorkaNaTeraz, terminPowtorki, type StanNauki } from './silnik';
import { kiedy } from './czas';
import type { Przedmiot } from './typy';
import type { Tryb } from './FeedView';
import './nauka.css';

/**
 * Nowa strona „Dziś”: jedna główna decyzja — „Kontynuuj”. Obok tylko
 * najbliższa powtórka. Statystyki i narzędzia są pod „Więcej”.
 */

interface Props {
  przedmiot: Przedmiot;
  przedmiotNazwa: string;
  stan: StanNauki | null;
  onStart: (skillId: string, tryb: Tryb) => void;
  onWiecej: () => void;
  onKurs: () => void;
}

const STATUS: Record<string, string> = {
  nowa: 'nowa',
  'w trakcie': 'w trakcie',
  przerobiona: 'przerobiona — czeka na powtórkę',
  utrwalona: 'utrwalona',
};

export function DzisView({ przedmiot, przedmiotNazwa, stan, onStart, onWiecej, onKurs }: Props) {
  const teraz = Date.now();
  const lekcje = LEKCJE.filter((l) => l.przedmiot === przedmiot);
  const data = new Date(teraz).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!stan) return <p className="boot">Wczytywanie…</p>;

  // Kolejność decyzji: zaległa powtórka > rozpoczęta lekcja > nowa lekcja.
  const zalegla = lekcje.find((l) => powtorkaNaTeraz(stan, l.skillId, teraz));
  const wToku = lekcje.find((l) => postep(stan, l).status === 'w trakcie');
  const nowa = lekcje.find((l) => postep(stan, l).status === 'nowa');
  const cel = zalegla ? { l: zalegla, tryb: 'powtorka' as const } : wToku ? { l: wToku, tryb: 'nauka' as const } : nowa ? { l: nowa, tryb: 'nauka' as const } : null;

  const opis = (() => {
    if (!cel) return null;
    if (cel.tryb === 'powtorka') return `Powtórka: ${cel.l.tytul} — na innym zadaniu CKE`;
    const k = biezaca(stan, cel.l);
    const nr = k ? numerKroku(stan, cel.l, k.id) : null;
    return nr && postep(stan, cel.l).status === 'w trakcie' ? `${cel.l.tytul} — krok ${nr.krok} z ${nr.z}` : `Nowa lekcja: ${cel.l.tytul}`;
  })();

  const najblizsza = lekcje
    .map((l) => ({ l, t: terminPowtorki(stan, l.skillId) }))
    .filter((x): x is { l: (typeof lekcje)[number]; t: number } => x.t !== null)
    .sort((a, b) => a.t - b.t)[0];

  return (
    <main className="dzis">
      <p className="dzis__data">{data}</p>
      <h1 className="dzis__tytul">{przedmiotNazwa}</h1>

      {cel ? (
        <button type="button" className="dzis__kontynuuj" onClick={() => onStart(cel.l.skillId, cel.tryb)}>
          <span className="dzis__kontynuuj-napis">Kontynuuj</span>
          <span className="dzis__kontynuuj-opis">{opis}</span>
        </button>
      ) : (
        <div className="dzis__gotowe">
          <p>Obie lekcje próbki są przerobione, a powtórki czekają na swój termin.</p>
          <button type="button" className="btn btn--primary" onClick={() => lekcje[0] && onStart(lekcje[0].skillId, 'trening')}>
            Ćwicz dalej
          </button>
        </div>
      )}

      <p className="dzis__powtorka">
        {najblizsza
          ? `Najbliższa powtórka: ${najblizsza.l.tytul} — ${kiedy(najblizsza.t, teraz)}`
          : 'Najbliższa powtórka: pojawi się po pierwszej skończonej lekcji.'}
      </p>

      <ul className="dzis__lekcje" aria-label="Lekcje w próbce">
        {lekcje.map((l) => {
          const p = postep(stan, l);
          return (
            <li key={l.skillId}>
              <button type="button" onClick={() => onStart(l.skillId, p.status === 'nowa' || p.status === 'w trakcie' ? 'nauka' : 'trening')}>
                <span>{l.tytul}</span>
                <span className="dzis__status">
                  {STATUS[p.status]}
                  {p.utrwalenie > 0 && p.status !== 'utrwalona' ? ` · powtórki ${p.utrwalenie}/2` : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dzis__dol">
        <button type="button" className="dzis__link" onClick={onWiecej}>
          Więcej: plan dnia, statystyki, narzędzia →
        </button>
        <button type="button" className="dzis__link" onClick={onKurs}>
          Pozostałe lekcje (dotychczasowy widok) →
        </button>
      </div>
    </main>
  );
}
