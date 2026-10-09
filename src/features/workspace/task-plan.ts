import type { Question } from '@/data/types';

export interface TaskPlanStep {
  id: string;
  title: string;
  prompt: string;
  /** Only use after the learner submits this step; never render as a hint. */
  expected?: number;
}

export interface TaskPlan {
  title: string;
  steps: TaskPlanStep[];
}

type StepText = [title: string, prompt: string];

function plan(title: string, ...steps: StepText[]): TaskPlan {
  return { title, steps: steps.map(([stepTitle, prompt], i) => ({ id: `step-${i + 1}`, title: stepTitle, prompt })) };
}

function normalize(text: string): string {
  return text.toLocaleLowerCase('pl').replace(/\{,\}/g, ',').replace(/[\s$]/g, '').replace(/−/g, '-');
}

/**
 * Learning prompts, not a solution renderer. Deliberately reads neither answer,
 * solution, steps nor hints. Unknown methods have no automatic correctness claim.
 * The three verified plans are matched against the complete prompt, not an ID
 * that a later content update could reuse with different numbers.
 */
export function getTaskPlan(question: Question, skillName?: string): TaskPlan {
  const text = question.prompt.toLocaleLowerCase('pl');
  const normalized = normalize(question.prompt);
  const skill = question.skillId;

  if (normalized === normalize('Oblicz wyróżnik równania x^2 - 6x + 5 = 0.')) {
    return { title: 'Wyróżnik: jeden rachunek naraz', steps: [
      { id: 'coefficients', title: 'Współczynniki', prompt: 'Zapisz osobno a, b i c. Które znaki należą do współczynników?' },
      { id: 'square', title: 'Kwadrat współczynnika', prompt: 'Oblicz samo b². Przy liczbie ujemnej zapisz nawias przed podniesieniem do kwadratu.', expected: (-6) ** 2 },
      { id: 'product', title: 'Iloczyn', prompt: 'Oblicz osobno 4 · a · c. Zachowaj poprzedni wynik w brudnopisie.', expected: 4 * 1 * 5 },
      { id: 'difference', title: 'Wyróżnik', prompt: 'Oblicz różnicę b² − 4ac z dwóch zapisanych wyników. To będzie odpowiedź do zadania.', expected: (-6) ** 2 - 4 * 1 * 5 },
    ] };
  }
  if (normalized === normalize('Wykres funkcji f(x) = ax + 3 przechodzi przez punkt (2, -5). Wyznacz miejsce zerowe tej funkcji.')) {
    return { title: 'Od punktu do miejsca zerowego', steps: [
      { id: 'point', title: 'Punkt jako warunek', prompt: 'Zapisz, co z podanego punktu podstawisz za x, a co za f(x). Ułóż równanie z niewiadomą a.' },
      { id: 'coefficient', title: 'Współczynnik a', prompt: 'Rozwiąż zapisane równanie. Każdą operację zapisuj w osobnym wierszu. Jaką wartość ma a?', expected: (-5 - 3) / 2 },
      { id: 'zero-equation', title: 'Warunek miejsca zerowego', prompt: 'Zapisz wzór funkcji z obliczonym a. Jakie równanie opisuje punkt, w którym wykres przecina oś x?' },
      { id: 'zero', title: 'Argument miejsca zerowego', prompt: 'Rozwiąż równanie względem x. Ułamek jest poprawnym sposobem zapisania wyniku.', expected: -3 / ((-5 - 3) / 2) },
      { id: 'check', title: 'Dwie kontrole', prompt: 'Sprawdź we własnym wzorze zarówno podany punkt, jak i wyznaczone miejsce zerowe. Jakich dwóch wartości f(x) oczekujesz?' },
    ] };
  }
  if (normalized === normalize('Opłata za taksówkę to f(k) = 8 + 3{,}5k zł, gdzie k to liczba kilometrów. Za ile kilometrów zapłacono 43 zł?')) {
    return { title: 'Koszt przejazdu: od kwoty do kilometrów', steps: [
      { id: 'model', title: 'Co opisuje cena?', prompt: 'Zapisz opłatę stałą, cenę kilometra i łączny koszt. Ułóż równanie dla nieznanej liczby kilometrów.' },
      { id: 'distance-cost', title: 'Część zależna od drogi', prompt: 'Ile z całej kwoty zapłacono za same kilometry, po odjęciu opłaty stałej?', expected: 43 - 8 },
      { id: 'distance', title: 'Liczba kilometrów', prompt: 'Jak z kosztu samych kilometrów i ceny jednego kilometra otrzymać długość trasy? Oblicz ją.', expected: (43 - 8) / 3.5 },
      { id: 'check', title: 'Sprawdzenie w treści', prompt: 'Wstaw obliczoną liczbę kilometrów do wzoru opłaty. Porównaj cenę z treścią i dopisz jednostkę do odpowiedzi.' },
    ] };
  }

  if (question.format === 'code') return plan('Plan rozwiązania programu',
    ['Wejście i wynik', 'Zapisz własnymi słowami, jakie dane otrzymujesz i co ma zwrócić program.'],
    ['Mały przykład', 'Przejdź ręcznie przez mały przykład. Zapisuj zmiany danych, zamiast pamiętać je w głowie.'],
    ['Algorytm', 'Zapisz kolejne czynności. Sprawdź także przypadek brzegowy.'],
    ['Implementacja i test', 'Zamień czynności na kod i uruchom dostępne testy. Wyjaśnij rozbieżność, jeśli wynik jest inny niż oczekiwany.']);

  if (skill.includes('proof')) return plan('Budujemy uzasadnienie',
    ['Założenia i teza', 'Zapisz oddzielnie dane i to, co trzeba udowodnić.'],
    ['Powiązanie', 'Jakie twierdzenie lub przekształcenie łączy założenia z tezą? Zapisz pierwszy uzasadniony krok.'],
    ['Łańcuch argumentów', 'Zapisuj kolejne wnioski wraz z powodem. Sam przykład liczbowy nie dowodzi zdania ogólnego.'],
    ['Kontrola dowodu', 'Czy uwzględniono wszystkie dopuszczalne przypadki i nie przyjęto tezy jako założenia?']);

  if (skill === 'num-percent') return plan('Procenty z zapisaną podstawą',
    ['Podstawa procentu', 'Co w tym zadaniu oznacza 100%? Zapisz tę wielkość i jej jednostkę.'],
    ['Rodzaj zmiany', 'Czy szukasz części, całości, zmiany procentowej, czy punktów procentowych? Zapisz zależność.'],
    ['Kolejne działania', 'Oblicz każdą zmianę osobno. Przy kolejnej zmianie ustal ponownie, od jakiej wartości liczysz procent.'],
    ['Sens wyniku', 'Czy wynik ma oczekiwaną jednostkę i wielkość? Sprawdź go względem wyjściowej całości.']);
  if (skill === 'num-order') return plan('Rachunki bez pamiętania wyników',
    ['Kolejność', 'Zaznacz nawiasy, potęgi, mnożenie i dzielenie. Które działanie wykonasz jako pierwsze?'],
    ['Wyniki częściowe', 'Oblicz jedną część i przepisz całe wyrażenie z jej wynikiem. Powtarzaj w nowych wierszach.'],
    ['Ułamki', 'Jeśli dodajesz ułamki, zapisz wspólny mianownik. Skracaj przez wspólny czynnik.'],
    ['Kontrola', 'Porównaj wynik z przybliżeniem i sprawdź znaki.']);
  if (/^num-(powers|roots)$/.test(skill)) return plan('Potęgi i pierwiastki',
    ['Zapis', 'Zapisz podstawy, wykładniki i stopnie pierwiastków. Ustal warunki istnienia w liczbach rzeczywistych.'],
    ['Reguła', 'Która reguła pozwala połączyć lub uprościć te wyrażenia? Zapisz ją przed podstawieniem.'],
    ['Jedna zmiana', 'Upraszczaj po jednym czynniku. Zachowaj nawiasy i znaki.'],
    ['Sprawdzenie', 'Sprawdź, czy wynik ma sens, szczególnie przy parzystych potęgach i pierwiastkach.']);
  if (skill === 'num-approx') return plan('Przybliżenie z kontrolą błędu',
    ['Wielkości', 'Zapisz wartość dokładną, przybliżenie i wymaganą dokładność, jeśli zostały podane.'],
    ['Miara błędu', 'Czy pytanie dotyczy błędu bezwzględnego, względnego, zaokrąglenia czy notacji wykładniczej? Zapisz właściwą zależność.'],
    ['Obliczenie', 'Zachowaj dokładność w rachunkach pośrednich; zaokrąglij dopiero na końcu.']);
  if (skill === 'num-abs' || skill === 'eq-abs') return plan('Odległość i wartość bezwzględna',
    ['Wnętrze modułu', 'Zapisz, dla jakiej wartości wnętrze modułu zmienia znak.'],
    ['Przypadki', 'Rozpisz odpowiednie przedziały lub opisz warunek jako odległość na osi.'],
    ['Rachunki', 'Rozwiąż każdy przypadek w osobnym wierszu, zachowując jego warunki.'],
    ['Wspólny wynik', 'Sprawdź otrzymane wartości w pierwotnym warunku i zapisz cały zbiór rozwiązań.']);

  if (skill === 'alg-rational' || skill === 'eq-rational' || skill.startsWith('rat-')) return plan('Wyrażenia wymierne z dziedziną',
    ['Dziedzina', 'Które wartości zerują mianowniki? Zapisz wykluczenia przed rachunkami.'],
    ['Czynniki', 'Rozłóż licznik i mianownik na czynniki, jeśli to pomaga. Co wolno skrócić?'],
    ['Przekształcenie', 'Zapisuj jedną operację na wiersz. W nierówności nie mnóż przez wyrażenie o nieznanym znaku.'],
    ['Kontrola warunków', 'Porównaj wynik z początkową dziedziną; dla nierówności zbadaj znaki w przedziałach.']);
  if (skill.startsWith('alg-') || skill === 'poly-basics' || skill === 'poly-division') return plan('Przekształcenia algebraiczne',
    ['Cel przekształcenia', 'Czy masz rozwinąć, rozłożyć na czynniki, uprościć czy podzielić wyrażenie? Zapisz cel.'],
    ['Wybór reguły', 'Sprawdź wspólny czynnik, nawiasy i wzory algebraiczne. Wybierz jeden ruch.'],
    ['Rachunki w wierszach', 'Zapisz wynik tego ruchu. Redukuj tylko wyrazy podobne, uważając na minus przed nawiasem.'],
    ['Kontrola', 'Sprawdź przekształcenie działaniem odwrotnym. Próba liczbowa może wykryć błąd, ale nie zastępuje uzasadnienia.']);
  if (skill === 'eq-system' || skill === 'eq-system-param') return plan('Układ równań',
    ['Równania', 'Zapisz niewiadome oraz oba równania. Czy występuje parametr wymagający osobnych przypadków?'],
    ['Eliminacja', 'Wybierz podstawianie lub odejmowanie równań. Zapisz krok usuwający jedną niewiadomą.'],
    ['Druga niewiadoma', 'Rozwiąż otrzymane równanie i wróć do jednego z równań układu.'],
    ['Sprawdzenie pary', 'Podstaw wynik do obu równań. Sprawdź też możliwość sprzeczności lub nieskończenie wielu rozwiązań.']);
  if (skill === 'eq-linear' || skill === 'ineq-linear') return plan('Równanie lub nierówność: po jednej operacji',
    ['Porządkowanie', 'Przepisz warunek, usuń nawiasy i połącz wyrazy podobne.'],
    ['Niewiadoma', 'Zapisz tę samą operację po obu stronach. Nie wykonuj kilku ruchów w pamięci.'],
    ['Izolowanie', 'Wyznacz niewiadomą. Przy dzieleniu nierówności przez liczbę ujemną zmień zwrot znaku.'],
    ['Sprawdzenie', 'Podstaw wynik albo sprawdź punkt z otrzymanego przedziału i jego końce.']);

  if (skill === 'quad-discriminant' || /oblicz wyróżnik/.test(text)) return plan('Równanie kwadratowe i wyróżnik',
    ['Współczynniki', 'Sprowadź równanie do postaci ogólnej. Zapisz a, b i c razem ze znakami.'],
    ['Dwa rachunki', 'Oblicz osobno b² oraz 4ac. Zachowaj oba wyniki.'],
    ['Różnica', 'Oblicz wyróżnik jako różnicę tych wyników.'],
    ['Cel zadania', 'Czy pytanie dotyczy tylko wyróżnika, liczby rozwiązań czy samych rozwiązań? Wykonaj pozostały potrzebny krok.']);
  if (skill === 'quad-param') return plan('Równanie z parametrem',
    ['Rodzaj równania', 'Zapisz współczynnik przy x². Dla jakich parametrów znika i równanie przestaje być kwadratowe?'],
    ['Warunki', 'Zamień żądaną liczbę lub własność rozwiązań na warunki dla współczynników i wyróżnika.'],
    ['Przypadki', 'Rozwiąż warunki osobno. Uwzględnij wartości graniczne i przypadek niekwadratowy.'],
    ['Połączenie', 'Sprawdź wyniki w oryginalnym równaniu i zapisz zbiór parametrów.']);
  if (skill === 'quad-vieta') return plan('Pierwiastki przez sumę i iloczyn',
    ['Współczynniki', 'Zapisz a, b, c i sprawdź warunki istnienia wymaganych pierwiastków.'],
    ['Suma i iloczyn', 'Wyraź sumę i iloczyn pierwiastków przez współczynniki.'],
    ['Szukane wyrażenie', 'Przekształć szukane wyrażenie tak, by wykorzystać zapisaną sumę i iloczyn.'],
    ['Rachunek', 'Podstaw i oblicz po jednej części. Sprawdź znaki.']);
  if (skill === 'quad-ineq' || skill === 'poly-inequalities' || skill === 'poly-equations' || skill === 'poly-roots') return plan('Miejsca zerowe i znaki',
    ['Jedna strona', 'Przenieś wszystkie wyrazy na jedną stronę, a po drugiej zostaw zero.'],
    ['Rozkład', 'Rozłóż wyrażenie na czynniki i wyznacz ich miejsca zerowe.'],
    ['Rozwiązania lub przedziały', 'Dla równania zbierz miejsca zerowe. Dla nierówności zapisz znaki na kolejnych przedziałach.'],
    ['Brzegi', 'Sprawdź, czy miejsca zerowe należą do odpowiedzi i czy nie naruszają dziedziny.']);
  if (skill.startsWith('quad-')) return plan('Parabola i jej własności',
    ['Dane i cel', 'Zapisz dostępną postać funkcji oraz szukaną własność. Przy zadaniu tekstowym ustal dziedzinę modelu.'],
    ['Wygodna postać', 'Która postać funkcji lub jaka cecha wykresu ułatwia odpowiedź? Zapisz potrzebne przekształcenie.'],
    ['Rachunki częściowe', 'Wyznacz potrzebne współrzędne lub współczynniki po jednym.'],
    ['Interpretacja', 'Sprawdź kierunek ramion i ograniczenia dziedziny. Przy wartości skrajnej rozważ też końce przedziału.']);

  if (skill.startsWith('lin-')) return plan('Funkcja liniowa',
    ['Dane', 'Zapisz, co wiadomo o współczynnikach, punktach albo kierunku prostej.'],
    ['Warunki we wzorze', 'Przełóż każdy warunek na równanie. Dla punktu oddziel argument x od wartości f(x).'],
    ['Współczynniki', 'Wyznacz brakujące współczynniki, zapisując wyniki pośrednie.'],
    ['Szukana własność', 'Wróć do pytania: wyznacz potrzebną wartość, argument albo własność. Sprawdź wynik w otrzymanym wzorze.']);
  if (skill === 'fn-graph') return plan('Czytanie wykresu',
    ['Osie i skala', 'Zapisz, co pokazuje każda oś oraz jaką wartość ma jedna kratka.'],
    ['Odczyt', 'Zaznacz argumenty lub wartości wymagane w pytaniu. Odczytuj po jednym punkcie albo przedziale.'],
    ['Końce i warunki', 'Sprawdź pełne i puste kółka, końce przedziałów i to, czy pytanie dotyczy osi x czy y.']);
  if (skill === 'fn-compose') return plan('Złożenie funkcji',
    ['Kolejność', 'Którą funkcję stosujesz jako pierwszą? Zapisz funkcję wewnętrzną.'],
    ['Podstawienie', 'Podstaw cały jej wynik, z nawiasami, do funkcji zewnętrznej.'],
    ['Dziedzina i rachunek', 'Sprawdź ograniczenia obu funkcji i uprość zapis po jednej operacji.']);
  if (skill === 'fn-shift' || skill === 'fn-transform') return plan('Przekształcenie wykresu',
    ['Wykres wyjściowy', 'Zapisz charakterystyczne punkty wykresu przed zmianą.'],
    ['Zmiana', 'Czy zmienia się argument wewnątrz funkcji, czy jej wartość? Opisz ruch lub symetrię.'],
    ['Kontrola punktów', 'Przekształć po jednym punkcie. Sprawdź kierunek i znaki we wzorze.']);
  if (skill.startsWith('fn-')) return plan('Wartość, argument i dziedzina',
    ['Czego szukasz?', 'Oddziel argument funkcji od jej wartości. Zapisz dane oraz szukaną wielkość.'],
    ['Warunki', 'Sprawdź mianowniki, pierwiastki i ograniczenia z treści. Zapisz odpowiednie podstawienie albo równanie.'],
    ['Obliczenia', 'Oblicz kolejne części wzoru osobno. Jeśli szukasz argumentu, rozwiązuj równanie po jednej operacji.'],
    ['Odpowiedź', 'Porównaj wynik z dziedziną i treścią. Dopisz jednostkę, jeśli występuje.']);

  if (skill.startsWith('log-')) return plan('Logarytmy',
    ['Warunki', 'Zapisz argumenty i podstawy logarytmów. Sprawdź, kiedy zapis ma sens.'],
    ['Definicja lub własność', 'Czy łatwiej przejść na zapis potęgowy, czy połączyć logarytmy? Zapisz wybraną regułę.'],
    ['Przekształcenie', 'Wykonuj jedno przekształcenie w wierszu. Nie rozdzielaj logarytmu sumy na sumę logarytmów.'],
    ['Kontrola', 'Sprawdź otrzymany wynik w początkowych warunkach.']);
  if (skill.startsWith('exp-')) return plan('Potęgi i model wykładniczy',
    ['Podstawa i wykładnik', 'Zapisz podstawy potęg. W zadaniu tekstowym ustal wartość początkową i czynnik zmiany.'],
    ['Wspólny zapis', 'Czy możesz zapisać potęgi przy wspólnej podstawie? Ułóż równanie lub zależność.'],
    ['Obliczenie', 'Wyznacz szukaną wielkość, przechowując rachunki w kolejnych wierszach.'],
    ['Sprawdzenie', 'Sprawdź warunki i sens wyniku, w tym liczbę okresów w modelu.']);
  if (skill === 'seq-limit' || skill === 'deriv-limit') return plan('Granica krok po kroku',
    ['Kierunek', 'Zapisz, do czego dąży argument lub indeks i z której strony, jeśli to istotne.'],
    ['Postać', 'Sprawdź, czy można bezpośrednio podstawić. Jeśli pojawia się postać nieoznaczona, wybierz przekształcenie.'],
    ['Uproszczenie', 'Zapisuj kolejne równoważne wyrażenia i pilnuj dziedziny.'],
    ['Wniosek', 'Ustal granicę. Jeśli pytanie dotyczy ciągłości, porównaj ją z wartością funkcji.']);
  if (skill.startsWith('seq-')) return plan('Ciąg z zapisanymi indeksami',
    ['Wyrazy i indeksy', 'Zapisz podane wyrazy wraz z ich numerami. Czy chodzi o wyraz, sumę czy inną własność ciągu?'],
    ['Rodzaj ciągu', 'Ustal, czy stosujesz stałą różnicę, stały iloraz, czy podany wzór. Zapisz potrzebną zależność.'],
    ['Parametry', 'Wyznacz brakujące dane. Policz liczbę przejść między indeksami, zanim wykonasz rachunek.'],
    ['Wynik i kontrola', 'Oblicz szukaną wielkość i sprawdź ją na podanych wyrazach. Dla szeregu sprawdź warunek zbieżności.']);
  if (skill === 'prob-counting') return plan('Liczenie możliwości',
    ['Co jest wynikiem?', 'Opisz pojedynczy dopuszczalny wynik. Czy kolejność ma znaczenie i czy elementy mogą się powtarzać?'],
    ['Etapy lub przypadki', 'Podziel wybór na etapy albo rozłączne przypadki. Zapisz liczbę możliwości dla każdego.'],
    ['Połączenie', 'Zdecyduj, gdzie mnożyć, a gdzie dodawać. Sprawdź, czy nie policzono tej samej możliwości kilka razy.']);
  if (skill.startsWith('prob-')) return plan('Prawdopodobieństwo z opisanym zdarzeniem',
    ['Zdarzenie', 'Zapisz dokładnie, co ma się wydarzyć. Ustal, czy losowanie odbywa się ze zwracaniem i czy jest warunek.'],
    ['Model', 'Wybierz model: równoprawdopodobne wyniki, drzewo, zdarzenie przeciwne lub schemat prób. Uzasadnij wybór.'],
    ['Rachunki częściowe', 'Zapisz liczniki, mianowniki lub prawdopodobieństwa gałęzi osobno. Przy warunku zawęź zbiór możliwości.'],
    ['Sprawdzenie', 'Połącz odpowiednie przypadki i sprawdź, czy wynik należy do przedziału od 0 do 1.']);
  if (skill.startsWith('stat-')) return plan('Statystyka z uporządkowanymi danymi',
    ['Dane', 'Wypisz wartości, liczności i ewentualne wagi. Sprawdź liczbę obserwacji.'],
    ['Miara', 'Której miary dotyczy pytanie? Dla mediany uporządkuj dane, dla średniej zapisz sumę i liczbę obserwacji.'],
    ['Rachunki', 'Oblicz potrzebne części osobno. Uwzględnij każdą obserwację i jej wagę.'],
    ['Interpretacja', 'Sprawdź jednostkę i to, czy odpowiedź opisuje wskazaną miarę.']);
  if (skill.startsWith('trig-')) return plan('Trygonometria',
    ['Dane i jednostka kąta', 'Zapisz dane kąty i długości. Ustal, czy kąty podano w stopniach czy radianach.'],
    ['Relacja', 'Wybierz odpowiednią funkcję, tożsamość lub twierdzenie. Zapisz je z oznaczeniami z zadania.'],
    ['Rachunki', 'Podstaw wartości i upraszczaj osobno licznik, mianownik lub każdą stronę równości.'],
    ['Warunki', 'Sprawdź znaki, dziedzinę i wymagany przedział kątów. Przy równaniu uwzględnij wszystkie odpowiednie rozwiązania.']);
  if (skill.startsWith('geo-')) return plan('Geometria we współrzędnych',
    ['Punkty i obiekty', 'Zapisz współrzędne punktów, równania i szukaną wielkość.'],
    ['Zależność', 'Dobierz zależność dla odległości, środka, prostej, okręgu lub wektora. Zapisz wzór przed liczbami.'],
    ['Rachunki częściowe', 'Oblicz różnice współrzędnych albo współczynniki osobno. Pilnuj znaków i nawiasów.'],
    ['Sprawdzenie', 'Podstaw wynik do warunków zadania. Czy odległości i położenie pasują do rysunku?']);
  if (skill.startsWith('stereo-')) return plan('Bryła: od rysunku do rachunku',
    ['Oznaczenia', 'Zapisz dane bryły i szukaną wielkość. Odróżnij wysokość bryły od wysokości ściany.'],
    ['Przekrój', 'Wskaż trójkąt lub przekrój zawierający potrzebne odcinki i kąt. Zapisz zależność.'],
    ['Brakujące wielkości', 'Wyznacz po jednej długości lub polu. Zapisuj ich jednostki.'],
    ['Wynik', 'Oblicz szukaną wielkość. Sprawdź, czy chodzi o pole, objętość, długość czy kąt.']);
  if (skill.startsWith('plan-')) return plan('Geometria płaska',
    ['Rysunek i dane', 'Oznacz dane długości, kąty i szukaną wielkość. Zapisz relacje wynikające z treści.'],
    ['Wybór twierdzenia', 'Które twierdzenie łączy dane z szukaną wielkością? Zapisz je z oznaczeniami figury.'],
    ['Kroki pośrednie', 'Wyznacz po jednej brakującej długości, polu lub kącie, zachowując każdy wynik.'],
    ['Kontrola', 'Sprawdź jednostki i własności figury. Nie opieraj wniosku wyłącznie na wyglądzie szkicu.']);
  if (skill.startsWith('deriv-')) return plan('Pochodna i jej zastosowanie',
    ['Funkcja i cel', 'Zapisz dziedzinę i to, czy szukasz pochodnej, stycznej, monotoniczności czy wartości skrajnej.'],
    ['Reguła różniczkowania', 'Wybierz regułę dla sumy, iloczynu, ilorazu lub złożenia. Oblicz pochodne części.'],
    ['Zastosowanie', 'Zapisz warunek odpowiadający celowi: wartość pochodnej, jej miejsca zerowe lub znaki.'],
    ['Wniosek', 'Sprawdź dziedzinę, punkty krytyczne i, jeśli trzeba, końce przedziału. Uzasadnij końcową odpowiedź.']);

  return plan(skillName ? `Plan pracy: ${skillName}` : 'Twój plan rozwiązania',
    ['Dane i pytanie', 'Zapisz własnymi słowami, co wiadomo i czego szukasz.'],
    ['Jeden mały krok', 'Wybierz pierwszy krok, który potrafisz wykonać. Zapisz go w brudnopisie wraz z wynikiem.'],
    ['Dalsza praca', 'Wykorzystaj zapisany wynik w następnym kroku. Jeśli nie wiesz jak, opisz nauczycielowi dokładne miejsce trudności.'],
    ['Sprawdzenie', 'Porównaj rozwiązanie z treścią. Zaznaczenie etapu zapisuje postęp pracy; nie potwierdza poprawności rachunków.']);
}
