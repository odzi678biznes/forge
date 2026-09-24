import type { ExamLevel } from '@/data/types';

/**
 * Wymagania szczegółowe z matematyki - podstawa programowa kształcenia
 * ogólnego po zmianie z 2024 r. (Dz.U. 2024 poz. 1019). Według niej CKE
 * układa arkusze od grudnia 2024 r., więc także maturę 2027.
 *
 * Teksty są skrótem aktu prawnego (akty urzędowe nie są objęte prawem
 * autorskim, art. 4 ustawy o prawie autorskim). Kody mają postać używaną
 * w zasadach oceniania CKE: "V.14", "IX.R3", "XIII" (dział bez numeru).
 *
 * Mapowanie kod -> umiejętności kursu pozwala przypisać każde zadanie
 * z oficjalnego arkusza do tego, co trzeba powtórzyć po słabym wyniku.
 */

export interface Requirement {
  code: string;
  level: ExamLevel;
  text: string;
  /** Umiejętności kursu, które przygotowują do tego wymagania. */
  skills: string[];
}

const pp = (code: string, text: string, skills: string[]): Requirement => ({ code, level: 'PP', text, skills });
const pr = (code: string, text: string, skills: string[]): Requirement => ({ code, level: 'PR', text, skills });

export const REQUIREMENTS_2024: Requirement[] = [
  // I. Liczby rzeczywiste
  pp('I.1', 'wykonuje działania (także potęgowanie, pierwiastkowanie, logarytmowanie) w zbiorze liczb rzeczywistych', ['num-order', 'num-roots', 'num-approx', 'log-basic']),
  pp('I.2', 'przeprowadza proste dowody dotyczące podzielności liczb całkowitych i reszt z dzielenia', ['num-proofs']),
  pp('I.3', 'stosuje własności pierwiastków dowolnego stopnia', ['num-roots']),
  pp('I.4', 'stosuje związek pierwiastkowania z potęgowaniem oraz prawa działań na potęgach i pierwiastkach', ['num-powers', 'num-roots', 'alg-irrational']),
  pp('I.5', 'stosuje monotoniczność potęgowania', ['exp-function', 'exp-equations']),
  pp('I.6', 'posługuje się pojęciem przedziału liczbowego', ['num-abs', 'ineq-linear']),
  pp('I.7', 'stosuje interpretację geometryczną i algebraiczną wartości bezwzględnej', ['num-abs']),
  pp('I.8', 'wykorzystuje własności potęgowania i pierwiastkowania w sytuacjach praktycznych (procent składany, lokaty, kredyty)', ['num-percent', 'exp-model']),
  pp('I.9', 'stosuje związek logarytmowania z potęgowaniem, wzory na logarytm iloczynu, ilorazu i potęgi', ['log-basic', 'log-properties']),
  pr('I.R', 'stosuje wzór na zamianę podstawy logarytmu', ['log-properties']),
  // II. Wyrażenia algebraiczne
  pp('II.1', 'stosuje wzory skróconego mnożenia na (a + b)², (a − b)², a² − b²', ['alg-expand']),
  pp('II.2', 'dodaje, odejmuje i mnoży wielomiany jednej i wielu zmiennych', ['alg-expand', 'poly-basics']),
  pp('II.3', 'wyłącza poza nawias jednomian z sumy algebraicznej', ['alg-factor']),
  pp('II.4', 'mnoży i dzieli wyrażenia wymierne', ['alg-rational']),
  pr('II.R1', 'dzieli wielomian przez dwumian x − a', ['poly-division']),
  pr('II.R2', 'rozkłada wielomiany na czynniki (wyłączanie, grupowanie)', ['poly-roots', 'alg-factor']),
  pr('II.R3', 'znajduje pierwiastki całkowite wielomianu o współczynnikach całkowitych', ['poly-roots']),
  pr('II.R4', 'stosuje własności trójkąta Pascala i współczynnika dwumianowego', ['prob-bernoulli']),
  pr('II.R5', 'korzysta ze wzorów na a³ ± b³, aⁿ − bⁿ, (a ± b)ⁿ', ['alg-cubes']),
  pr('II.R6', 'dodaje i odejmuje wyrażenia wymierne', ['alg-rational']),
  // III. Równania i nierówności
  pp('III.1', 'przekształca równania i nierówności w sposób równoważny', ['eq-linear', 'eq-rational']),
  pp('III.2', 'interpretuje równania i nierówności liniowe sprzeczne oraz tożsamościowe', ['eq-linear']),
  pp('III.3', 'rozwiązuje nierówności liniowe z jedną niewiadomą', ['ineq-linear']),
  pp('III.4', 'rozwiązuje równania i nierówności kwadratowe', ['quad-discriminant', 'quad-ineq']),
  pp('III.5', 'rozwiązuje równania wielomianowe W(x) = 0 w postaci iloczynowej', ['poly-equations']),
  pr('III.R1', 'rozwiązuje równania i nierówności wielomianowe (także po wyłączeniu i grupowaniu)', ['poly-equations', 'poly-inequalities']),
  pr('III.R2', 'rozwiązuje równania i nierówności wymierne sprowadzalne do liniowych lub kwadratowych', ['rat-inequalities', 'eq-rational']),
  pr('III.R3', 'stosuje wzory Viète’a', ['quad-vieta']),
  pr('III.R4', 'rozwiązuje równania i nierówności z wartością bezwzględną', ['eq-abs']),
  pr('III.R5', 'analizuje równania i nierówności liniowe i kwadratowe z parametrami', ['quad-param', 'lin-param', 'eq-system-param']),
  pr('III.R6', 'rozwiązuje równania wielomianowe sprowadzalne do kwadratowych (dwukwadratowe)', ['poly-equations']),
  pr('III.R7', 'rozwiązuje równania wymierne V(x)/W(x) = 0 w postaci iloczynowej', ['eq-rational', 'rat-inequalities']),
  // IV. Układy równań
  pp('IV.1', 'rozwiązuje układy równań liniowych z dwiema niewiadomymi, interpretacja geometryczna', ['eq-system']),
  pp('IV.2', 'stosuje układy równań do zadań tekstowych', ['eq-system']),
  pr('IV.R', 'rozwiązuje układy równań liniowych i kwadratowych z dwiema niewiadomymi', ['geo-point-line', 'eq-system-param']),
  // V. Funkcje
  pp('V.1', 'określa funkcję (opis, tabela, wykres, wzór)', ['fn-basics']),
  pp('V.2', 'oblicza wartość funkcji zadanej wzorem', ['fn-basics']),
  pp('V.3', 'odczytuje i interpretuje wartości funkcji z tabel, wykresów, wzorów', ['fn-graph']),
  pp('V.4', 'odczytuje z wykresu: dziedzinę, zbiór wartości, miejsca zerowe, monotoniczność, wartości skrajne', ['fn-graph']),
  pp('V.5', 'interpretuje współczynniki we wzorze funkcji liniowej', ['lin-formula']),
  pp('V.6', 'wyznacza wzór funkcji liniowej z informacji o wykresie lub własnościach', ['lin-two-points', 'lin-parallel']),
  pp('V.7', 'szkicuje wykres funkcji kwadratowej', ['quad-forms']),
  pp('V.8', 'interpretuje współczynniki funkcji kwadratowej (postać ogólna, kanoniczna, iloczynowa)', ['quad-forms', 'quad-vertex']),
  pp('V.9', 'wyznacza wzór funkcji kwadratowej', ['quad-forms', 'quad-vertex']),
  pp('V.10', 'wyznacza największą i najmniejszą wartość funkcji kwadratowej w przedziale domkniętym', ['quad-vertex', 'quad-optim']),
  pp('V.11', 'wykorzystuje własności funkcji liniowej i kwadratowej w zastosowaniach', ['lin-model', 'quad-optim']),
  pp('V.12', 'szkicuje wykresy y = f(x − a), y = f(x) + b', ['fn-shift']),
  pp('V.13', 'posługuje się funkcją f(x) = a/x (proporcjonalność odwrotna)', ['rat-inverse']),
  pp('V.14', 'posługuje się funkcjami wykładniczą i logarytmiczną, w tym wykresami, w zastosowaniach', ['exp-function', 'exp-model', 'log-function']),
  pr('V.R1', 'rysuje wykresy y = −f(x), y = f(−x)', ['fn-transform']),
  pr('V.R2', 'posługuje się złożeniami funkcji', ['fn-compose']),
  pr('V.R3', 'dowodzi monotoniczności funkcji zadanej wzorem', ['rat-shifted', 'deriv-monotonic']),
  // VI. Ciągi
  pp('VI.1', 'oblicza wyrazy ciągu określonego wzorem ogólnym', ['seq-basics']),
  pp('VI.2', 'oblicza początkowe wyrazy ciągów określonych rekurencyjnie', ['seq-basics']),
  pp('VI.3', 'bada, czy ciąg jest rosnący, czy malejący', ['seq-basics']),
  pp('VI.4', 'sprawdza, czy ciąg jest arytmetyczny lub geometryczny', ['seq-basics', 'seq-arithmetic', 'seq-geometric']),
  pp('VI.5', 'stosuje wzory ciągu arytmetycznego', ['seq-arithmetic']),
  pp('VI.6', 'stosuje wzory ciągu geometrycznego', ['seq-geometric']),
  pp('VI.7', 'wykorzystuje własności ciągów, także w kontekście praktycznym', ['seq-mixed']),
  pr('VI.R1', 'oblicza granice ciągów', ['seq-limit']),
  pr('VI.R2', 'rozpoznaje zbieżne szeregi geometryczne i oblicza ich sumę', ['seq-series']),
  // VII. Trygonometria
  pp('VII.1', 'wykorzystuje definicje sinusa, cosinusa i tangensa dla kątów od 0° do 180°', ['trig-values', 'trig-obtuse']),
  pp('VII.2', 'korzysta z wzorów sin²α + cos²α = 1 i tg α = sin α / cos α', ['trig-identities']),
  pp('VII.3', 'stosuje twierdzenie cosinusów i wzór na pole trójkąta P = ½ab sin γ', ['trig-laws', 'trig-area']),
  pp('VII.4', 'rozwiązuje trójkąty prostokątne', ['trig-values']),
  pr('VII.R1', 'stosuje miarę łukową', ['trig-radians']),
  pr('VII.R2', 'posługuje się wykresami funkcji trygonometrycznych', ['trig-radians']),
  pr('VII.R3', 'wykorzystuje okresowość funkcji trygonometrycznych', ['trig-radians']),
  pr('VII.R4', 'stosuje wzory redukcyjne', ['trig-radians', 'trig-obtuse']),
  pr('VII.R5', 'korzysta z wzorów na funkcje sumy, różnicy i podwojonego kąta', ['trig-formulas']),
  pr('VII.R6', 'rozwiązuje równania trygonometryczne', ['trig-equations']),
  pr('VII.R7', 'stosuje twierdzenie sinusów', ['trig-laws']),
  pr('VII.R8', 'rozwiązuje trójkąty (dowolne)', ['trig-laws']),
  // VIII. Planimetria
  pp('VIII.1', 'wyznacza promienie, średnice, cięciwy i odcinki stycznych', ['plan-circle', 'plan-triangles']),
  pp('VIII.2', 'rozpoznaje trójkąty ostro-, prosto- i rozwartokątne; naprzeciw większego kąta dłuższy bok', ['plan-triangles', 'trig-laws']),
  pp('VIII.3', 'rozpoznaje wielokąty foremne i korzysta z ich własności', ['plan-angles']),
  pp('VIII.4', 'korzysta z własności kątów i przekątnych czworokątów', ['plan-quadrilaterals']),
  pp('VIII.5', 'stosuje własności kątów wpisanych i środkowych', ['plan-circle']),
  pp('VIII.6', 'stosuje wzory na pole wycinka koła i długość łuku', ['plan-circle']),
  pp('VIII.7', 'stosuje twierdzenie Talesa', ['plan-similarity']),
  pp('VIII.8', 'korzysta z cech podobieństwa trójkątów', ['plan-similarity']),
  pp('VIII.9', 'wykorzystuje zależności między obwodami i polami figur podobnych', ['plan-similarity']),
  pp('VIII.10', 'wskazuje punkty szczególne trójkąta i korzysta z ich własności', ['plan-inscribed', 'plan-proofs']),
  pp('VIII.11', 'przeprowadza dowody geometryczne', ['plan-proofs']),
  pp('VIII.12', 'stosuje funkcje trygonometryczne do długości odcinków i pól figur', ['trig-area', 'trig-values']),
  pr('VIII.R1', 'stosuje własności czworokątów wpisanych w okrąg i opisanych na okręgu', ['plan-inscribed']),
  pr('VIII.R2', 'stosuje twierdzenie odwrotne do twierdzenia Talesa', ['plan-similarity']),
  // IX. Geometria analityczna
  pp('IX.1', 'rozpoznaje wzajemne położenie prostych, znajduje ich punkt wspólny', ['geo-line']),
  pp('IX.2', 'posługuje się równaniami prostych (kierunkowe i ogólne)', ['geo-line']),
  pp('IX.3', 'oblicza odległość dwóch punktów', ['geo-distance']),
  pp('IX.4', 'posługuje się równaniem okręgu', ['geo-circle']),
  pp('IX.5', 'wyznacza obrazy okręgów i wielokątów w symetriach względem osi i początku układu', ['geo-figures']),
  pr('IX.R1', 'znajduje punkty wspólne prostej i okręgu', ['geo-point-line']),
  pr('IX.R2', 'znajduje punkty wspólne dwóch okręgów', ['geo-point-line']),
  pr('IX.R3', 'posługuje się wektorami (współrzędne, długość, dodawanie, mnożenie przez liczbę)', ['geo-vectors']),
  pr('IX.R4', 'wyznacza równanie prostej prostopadłej i stycznej do okręgu', ['geo-line', 'geo-point-line']),
  // X. Stereometria
  pp('X.1', 'rozpoznaje wzajemne położenie prostych w przestrzeni', ['stereo-prisms']),
  pp('X.2', 'posługuje się kątem między prostą a płaszczyzną i kątem dwuściennym', ['stereo-angles']),
  pp('X.3', 'rozpoznaje i oblicza kąty w graniastosłupach i ostrosłupach', ['stereo-angles']),
  pp('X.4', 'rozpoznaje i oblicza kąty w walcach i stożkach', ['stereo-angles', 'stereo-solids']),
  pp('X.5', 'oblicza objętości i pola powierzchni brył, także z trygonometrią', ['stereo-prisms', 'stereo-pyramids', 'stereo-solids']),
  pp('X.6', 'wykorzystuje zależność między objętościami brył podobnych', ['stereo-solids']),
  pr('X.R1', 'stosuje twierdzenie o prostej prostopadłej do płaszczyzny i o trzech prostopadłych', ['stereo-advanced']),
  pr('X.R2', 'wyznacza przekroje sześcianu i ostrosłupów prawidłowych, oblicza ich pola', ['stereo-advanced']),
  // XI. Kombinatoryka
  pp('XI.1', 'zlicza obiekty w prostych sytuacjach kombinatorycznych', ['prob-counting']),
  pp('XI.2', 'stosuje reguły mnożenia i dodawania', ['prob-counting']),
  pr('XI.R1', 'stosuje permutacje, kombinacje i wariacje', ['prob-counting']),
  pr('XI.R2', 'stosuje współczynnik dwumianowy i jego własności', ['prob-bernoulli']),
  // XII. Rachunek prawdopodobieństwa i statystyka
  pp('XII.1', 'oblicza prawdopodobieństwo w modelu klasycznym', ['prob-classic', 'prob-compound']),
  pp('XII.2', 'oblicza średnią arytmetyczną i ważoną, medianę i dominantę', ['stat-descriptive']),
  pr('XII.R1', 'oblicza prawdopodobieństwo warunkowe, stosuje wzór Bayesa i prawdopodobieństwo całkowite', ['prob-conditional']),
  pr('XII.R2', 'stosuje schemat Bernoullego', ['prob-bernoulli']),
  // XIII. Optymalizacja i rachunek różniczkowy
  pp('XIII', 'rozwiązuje zadania optymalizacyjne opisane funkcją kwadratową', ['quad-optim']),
  pr('XIII.R1', 'oblicza granice funkcji (także jednostronne)', ['deriv-limit']),
  pr('XIII.R2', 'stosuje własność Darboux', ['deriv-limit']),
  pr('XIII.R3', 'stosuje definicję pochodnej, interpretacja geometryczna i fizyczna', ['deriv-basic', 'deriv-tangent']),
  pr('XIII.R4', 'oblicza pochodne (potęgowa, suma, iloczyn, iloraz, złożenie)', ['deriv-basic', 'deriv-rules']),
  pr('XIII.R5', 'stosuje pochodną do badania monotoniczności', ['deriv-monotonic', 'deriv-extrema']),
  pr('XIII.R6', 'rozwiązuje zadania optymalizacyjne z pochodną', ['deriv-optimization']),
];

/**
 * Kody z podstawy z 2018 r., używane w arkuszach do maja 2024 r. włącznie
 * (zasady oceniania: „Wymagania egzaminacyjne 2023 i 2024”). Numeracja
 * części działów była inna - np. IX.5 to wtedy odległość punktu od prostej,
 * a IX.R3 - punkty wspólne prostej i okręgu. Mapujemy tylko kody, które
 * faktycznie występują w tych arkuszach.
 */
export const SKILLS_BY_CODE_2018: Record<string, string[]> = {
  'I.1': ['num-order', 'num-roots'],
  'I.2': ['num-proofs'],
  'I.4': ['num-powers', 'num-roots'],
  'I.6': ['num-abs'],
  'I.7': ['num-abs'],
  'I.8': ['num-percent', 'exp-model'],
  'I.9': ['log-basic', 'log-properties'],
  'I.R1': ['log-properties'],
  'II.1': ['alg-expand'],
  'II.2': ['alg-expand'],
  'II.5': ['alg-rational'],
  'II.6': ['alg-rational'],
  'II.R3': ['alg-cubes'],
  'III.1': ['eq-linear'],
  'III.3': ['ineq-linear'],
  'III.5': ['poly-equations'],
  'III.6': ['eq-rational'],
  'III.R3': ['quad-vieta'],
  'III.R4': ['eq-abs'],
  'III.R5': ['quad-param'],
  'IV.1': ['eq-system'],
  'IV.2': ['eq-system'],
  'V.2': ['fn-basics'],
  'V.3': ['fn-graph'],
  'V.4': ['fn-graph'],
  'V.5': ['lin-formula'],
  'V.6': ['lin-two-points'],
  'V.8': ['quad-forms'],
  'V.9': ['quad-forms', 'quad-vertex'],
  'V.11': ['lin-model', 'quad-optim'],
  'V.12': ['fn-shift'],
  'V.13': ['exp-function', 'exp-model'],
  'VI.1': ['seq-basics'],
  'VI.2': ['seq-basics'],
  'VI.3': ['seq-basics'],
  'VI.4': ['seq-arithmetic'],
  'VI.5': ['seq-geometric'],
  'VI.6': ['seq-mixed'],
  'VI.R2': ['seq-series'],
  'VII.1': ['trig-values', 'trig-obtuse'],
  'VII.2': ['trig-identities'],
  'VII.4': ['trig-values'],
  'VII.R5': ['trig-formulas'],
  'VII.R6': ['trig-equations'],
  'VIII.1': ['plan-circle'],
  'VIII.2': ['plan-triangles'],
  'VIII.4': ['plan-quadrilaterals'],
  'VIII.5': ['plan-circle'],
  'VIII.7': ['plan-similarity'],
  'VIII.8': ['plan-similarity'],
  'VIII.11': ['trig-area'],
  'VIII.R1': ['plan-inscribed'],
  'VIII.R3': ['plan-proofs'],
  'IX.1': ['geo-line'],
  'IX.2': ['geo-line'],
  'IX.3': ['geo-distance'],
  'IX.4': ['geo-circle'],
  'IX.5': ['geo-point-line'],
  'IX.R1': ['geo-line'],
  'IX.R3': ['geo-point-line'],
  'X.1': ['stereo-prisms'],
  'X.2': ['stereo-angles'],
  'X.3': ['stereo-angles'],
  'X.4': ['stereo-prisms', 'stereo-pyramids', 'stereo-solids'],
  'X.5': ['stereo-solids'],
  'X.R5': ['stereo-advanced'],
  'XI.1': ['prob-counting'],
  'XI.2': ['prob-counting'],
  'XI.R1': ['prob-counting'],
  'XII.1': ['prob-classic', 'prob-compound'],
  'XII.2': ['stat-descriptive'],
  'XII.R2': ['prob-bernoulli'],
  XIII: ['quad-optim'],
  'XIII.R1': ['deriv-limit'],
  'XIII.R2': ['deriv-basic', 'deriv-tangent'],
  'XIII.R3': ['deriv-basic', 'deriv-rules'],
  'XIII.R4': ['deriv-monotonic', 'deriv-extrema'],
  'XIII.R5': ['deriv-optimization'],
};

export const SKILLS_BY_CODE_2024: Record<string, string[]> = Object.fromEntries(
  REQUIREMENTS_2024.map((r) => [r.code, r.skills]),
);

export type CurriculumEra = 2018 | 2024;

/** Umiejętności kursu odpowiadające kodowi wymagania w danej podstawie. */
export function skillsForCode(code: string, era: CurriculumEra): string[] {
  return (era === 2024 ? SKILLS_BY_CODE_2024 : SKILLS_BY_CODE_2018)[code] ?? [];
}
