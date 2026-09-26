import { LEKCJE } from './lekcje';
import { biezaca, numerKroku, postep, powtorkaNaTeraz, terminPowtorki, type StanNauki } from './silnik';
import { kiedy } from './czas';
import type { Przedmiot } from './typy';
import type { Tryb } from './FeedView';
import './nauka.css';
import { Math as Tex } from '@/components/Math';

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
  descriptions: Record<string, string>;
}

export function DzisView({ przedmiot, przedmiotNazwa, stan, onStart, onWiecej, onKurs, nextCourse, onCourseLesson, descriptions }: Props) {
  const teraz = Date.now();
  const lekcje = LEKCJE.filter((l) => l.przedmiot === przedmiot);
  const data = new Date(teraz).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!stan) return <p className="boot">Wczytywanie…</p>;

  // Kolejność decyzji: zaległa powtórka > rozpoczęta lekcja > nowa lekcja.
  const zalegla = lekcje.find((l) => powtorkaNaTeraz(stan, l.skillId, teraz));
  const wToku = lekcje.find((l) => postep(stan, l).status === 'w trakcie');
  const nowa = lekcje.find((l) => postep(stan, l).status === 'nowa');
  const cel = zalegla ? { l: zalegla, tryb: 'powtorka' as const } : wToku ? { l: wToku, tryb: 'nauka' as const } : nowa ? { l: nowa, tryb: 'nauka' as const } : null;

  const krok = (() => {
    if (!cel) return null;
    if (cel.tryb === 'powtorka') return 'Powtórka na innym zadaniu CKE';
    const k = biezaca(stan, cel.l);
    const nr = k ? numerKroku(stan, cel.l, k.id) : null;
    return nr ? `Krok ${nr.krok} z ${nr.z}` : null;
  })();

  const najblizsza = lekcje
    .map((l) => ({ l, t: terminPowtorki(stan, l.skillId) }))
    .filter((x): x is { l: (typeof lekcje)[number]; t: number } => x.t !== null)
    .sort((a, b) => a.t - b.t)[0];

  return (
    <main className="dzis">
      <header className="dzis__heading">
        <p className="dzis__data">{data}</p>
        <h1 className="dzis__tytul">Dziś · {przedmiotNazwa}</h1>
        <p className="dzis__subtitle">Jedna lekcja. Kolejny krok w Twoim tempie.</p>
      </header>

      {cel || nextCourse ? (
        <section className="dzis__recommendation" aria-label="Rekomendowana nauka">
          <p className="dzis__activity">{cel?.tryb === 'powtorka' ? 'Powtórka na dziś' : wToku && cel?.l === wToku ? 'Wracamy do lekcji' : 'Następna lekcja'}</p>
          <h2 className="dzis__lesson">{cel?.l.tytul ?? nextCourse!.name}</h2>
          <p className="dzis__description"><Tex>{descriptions[cel?.l.skillId ?? nextCourse!.id] ?? ''}</Tex></p>
          {krok && <p className="dzis__step">{krok}</p>}
          <button type="button" className="btn btn--primary dzis__start" onClick={() => cel ? onStart(cel.l.skillId, cel.tryb) : onCourseLesson(nextCourse!.id)}>
            {cel?.tryb === 'powtorka' ? 'Zrób powtórkę' : wToku && cel?.l === wToku ? 'Kontynuuj lekcję' : 'Rozpocznij lekcję'} <span aria-hidden>→</span>
          </button>
        </section>
      ) : <section className="dzis__recommendation"><h2 className="dzis__lesson">Dostępne lekcje przerobione</h2><p className="dzis__description">Możesz zakończyć naukę na dziś, wrócić do wybranej lekcji w kursie albo przećwiczyć materiał w treningu dodatkowym.</p><button className="btn" onClick={onKurs}>Otwórz kurs</button></section>}

      <p className="dzis__powtorka">
        {najblizsza
          ? `Najbliższa powtórka: ${najblizsza.l.tytul} — ${kiedy(najblizsza.t, teraz)}`
          : 'Najbliższa powtórka: pojawi się po pierwszej skończonej lekcji.'}
      </p>

      <div className="dzis__dol">
        <button type="button" className="dzis__link" onClick={onKurs}>
          Wszystkie lekcje w Kursie →
        </button>
        <button type="button" className="dzis__link" onClick={onWiecej}>Statystyki →</button>
      </div>
    </main>
  );
}
