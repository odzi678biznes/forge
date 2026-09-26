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
  nextCourse: { id: string; name: string } | null;
  onCourseLesson: (skillId: string) => void;
}

export function DzisView({ przedmiot, przedmiotNazwa, stan, onStart, onWiecej, onKurs, nextCourse, onCourseLesson }: Props) {
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

      {cel || nextCourse ? (
        <button type="button" className="dzis__kontynuuj" onClick={() => cel ? onStart(cel.l.skillId, cel.tryb) : onCourseLesson(nextCourse!.id)}>
          <span className="dzis__kontynuuj-napis">Kontynuuj</span>
          <span className="dzis__kontynuuj-opis">{opis ?? `Następna lekcja kursu: ${nextCourse!.name}`}</span>
        </button>
      ) : <p>Wszystkie dostępne lekcje są przerobione. Wróć, gdy nadejdzie powtórka.</p>}

      <p className="dzis__powtorka">
        {najblizsza
          ? `Najbliższa powtórka: ${najblizsza.l.tytul} — ${kiedy(najblizsza.t, teraz)}`
          : 'Najbliższa powtórka: pojawi się po pierwszej skończonej lekcji.'}
      </p>

      <div className="dzis__dol">
        <button type="button" className="dzis__link" onClick={onWiecej}>
          Statystyki →
        </button>
        <button type="button" className="dzis__link" onClick={onKurs}>
          Wszystkie lekcje w Kursie →
        </button>
      </div>
    </main>
  );
}
