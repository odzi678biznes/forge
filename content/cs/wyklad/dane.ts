import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: bazy danych, arkusz kalkulacyjny, sieci i bezpieczeństwo. */
export const WYKLAD_DANE: Record<string, LessonExplanation> = {
  'cs-sql-select': {
    idea: [
      'Tabela w bazie danych to uporządkowany arkusz: każdy wiersz to jeden obiekt (uczeń, książka), każda kolumna — jedna jego cecha. SQL różni się od Pythona tym, że nie piszesz, JAK szukać, tylko CO chcesz dostać — a baza sama wymyśla, jak zrobić to szybko.',
      'Zapytanie `SELECT` czytasz jak zdanie: „wybierz TE kolumny Z tej tabeli, GDZIE spełniony jest warunek, POSORTUJ według…”. `WHERE` działa jak sito na wiersze, a lista po `SELECT` — jak nożyczki na kolumny.',
      '`NULL` oznacza „nie wiadomo”, a nie zero ani pusty tekst. Porównanie z „nie wiadomo” też daje „nie wiadomo”, więc `kolumna = NULL` nie znajduje niczego — do tego służy `IS NULL`.',
    ],
    method: [
      'Ustal, z której tabeli bierzesz dane i które kolumny mają być w wyniku.',
      'Zapisz warunki w `WHERE`, łącząc je `AND` i `OR` (z nawiasami); tekst pisz w apostrofach.',
      'Dodaj `ORDER BY` (z `DESC` dla kolejności malejącej) i ewentualnie `LIMIT`.',
      'Sprawdź przypadki z `NULL` i duplikaty (`DISTINCT`).',
    ],
    check: {
      question: 'Jak wybrać tytuły książek wydanych po 2000 roku, od najnowszej?',
      answer: '`SELECT tytul FROM ksiazki WHERE rok_wyd > 2000 ORDER BY rok_wyd DESC;`',
    },
  },
  'cs-sql-aggregate': {
    idea: [
      'Funkcje agregujące zamieniają wiele wierszy w jedną liczbę: ile ich jest (`COUNT`), ile razem (`SUM`), ile średnio (`AVG`), najmniej i najwięcej (`MIN`, `MAX`).',
      '`GROUP BY` najpierw rozkłada wiersze na „kupki” — np. osobną dla każdego autora — a funkcja agregująca liczy wynik dla każdej kupki osobno. To ta sama idea co słownik zliczający w Pythonie albo tabela przestawna w arkuszu.',
      'Kolejność ma znaczenie: `WHERE` odsiewa pojedyncze wiersze, ZANIM powstaną grupy, a `HAVING` odsiewa całe grupy, gdy wyniki `COUNT` czy `SUM` są już policzone. Dlatego warunek na liczbę elementów w grupie należy do `HAVING`.',
    ],
    method: [
      'Ustal, po czym grupujesz (klucz grupy) i co liczysz w każdej grupie.',
      'Warunki na pojedyncze wiersze zapisz w `WHERE`.',
      'Dodaj `GROUP BY` z kolumną klucza i funkcję agregującą w `SELECT`.',
      'Warunki na wynik funkcji agregującej zapisz w `HAVING`, a na końcu posortuj.',
    ],
    check: {
      question: 'Gdzie zapiszesz warunek „tylko autorzy z co najmniej trzema książkami” i dlaczego?',
      answer: 'W `HAVING COUNT(*) >= 3`, bo liczba książek istnieje dopiero po pogrupowaniu — `WHERE` działa wcześniej, na pojedynczych wierszach.',
    },
  },
  'cs-sql-join': {
    idea: [
      'Dane rozkłada się na kilka tabel, żeby się nie powtarzały: w tabeli wypożyczeń zamiast imienia i nazwiska ucznia jest tylko jego numer. Gdy uczeń zmieni nazwisko, poprawiasz je w jednym miejscu, a nie w setkach wypożyczeń.',
      'Złączenie `JOIN` skleja tabele z powrotem: dla każdego wypożyczenia szuka ucznia o pasującym numerze i dokleja jego dane. Warunek `ON` mówi, które kolumny mają się zgadzać — zwykle klucz obcy z kluczem podstawowym.',
      '`JOIN` zostawia tylko pary, które do siebie pasują. `LEFT JOIN` zostawia wszystkie wiersze lewej tabeli, nawet bez pary — tak znajdziesz np. uczniów, którzy nic nie wypożyczyli (ich kolumny z drugiej tabeli to `NULL`).',
    ],
    method: [
      'Ustal, z których tabel potrzebujesz kolumn i jak są powiązane (klucz obcy → klucz podstawowy).',
      'Zapisz `FROM tabela1 JOIN tabela2 ON warunek` i nadaj tabelom aliasy.',
      'Gdy potrzebujesz też wierszy bez pary, użyj `LEFT JOIN` i sprawdzaj `IS NULL`.',
      'Dodaj `WHERE`, `GROUP BY` po kluczu i `ORDER BY` jak w zwykłym zapytaniu.',
    ],
    check: {
      question: 'Jak znaleźć uczniów, którzy nie mają żadnego wypożyczenia?',
      answer: '`uczniowie LEFT JOIN wypozyczenia ON wypozyczenia.id_ucznia = uczniowie.id` z warunkiem `WHERE wypozyczenia.id IS NULL`.',
    },
  },
  'cs-sql-modify': {
    idea: [
      'Poza czytaniem SQL potrafi zmieniać dane: `INSERT` dodaje wiersze, `UPDATE` poprawia wartości, `DELETE` usuwa wiersze. `UPDATE` i `DELETE` mają `WHERE` tak jak `SELECT` — i działają na wszystkich wierszach, które warunek przepuści.',
      'Klucz podstawowy działa jak numer PESEL wiersza: jednoznacznie go identyfikuje i nie może się powtórzyć. Klucz obcy to odwołanie do klucza w innej tabeli — jak numer ucznia zapisany przy wypożyczeniu.',
      'Więzy integralności pilnują, żeby odwołania nie prowadziły donikąd: nie da się dodać wypożyczenia ucznia, którego nie ma w bazie. Dzięki temu dane w różnych tabelach pozostają spójne.',
    ],
    method: [
      'Zanim zmienisz dane, uruchom `SELECT` z tym samym `WHERE` i obejrzyj wiersze, które się zmienią.',
      'Zapisz `UPDATE tabela SET kolumna = wartosc WHERE ...` albo `DELETE FROM tabela WHERE ...`.',
      'Przy `INSERT` sprawdź, czy klucze obce wskazują istniejące wiersze.',
      'Pamiętaj, że warunek z `NULL` jest „nieznany” — takie wiersze nie zostaną zmienione.',
    ],
    check: {
      question: 'Co zrobi `DELETE FROM wypozyczenia;` bez `WHERE`?',
      answer: 'Usunie wszystkie wiersze tabeli — dlatego zawsze najpierw sprawdzasz warunek przez `SELECT`.',
    },
  },
  'cs-sheet-formulas': {
    idea: [
      'Formuła w arkuszu nie pamięta konkretnych komórek, tylko drogę do nich: `=A2*2` w komórce B2 znaczy „weź komórkę po lewej i pomnóż przez 2”. Dlatego po skopiowaniu wiersz niżej sama zamienia się w `=A3*2` — droga zostaje ta sama.',
      'Znak `$` to kotwica: `$B$1` przy kopiowaniu zawsze wskazuje B1 (np. komórkę ze stałą, jak kurs euro). `$A2` kotwiczy tylko kolumnę, a `A$2` tylko wiersz — to przydaje się w tabliczce mnożenia, gdzie jeden czynnik bierzesz z kolumny, a drugi z wiersza.',
      'Funkcje warunkowe (`JEŻELI`, `LICZ.JEŻELI`, `SUMA.JEŻELI`) i wyszukiwanie (`WYSZUKAJ.PIONOWO`) to w arkuszu odpowiedniki `if`, liczników i słownika z Pythona. Zadanie z arkusza często da się rozwiązać w Pythonie — i odwrotnie.',
    ],
    method: [
      'Napisz formułę dla pierwszego wiersza i sprawdź wynik ręcznie.',
      'Zdecyduj, które adresy mają się przesuwać przy kopiowaniu, a które zakotwiczyć znakiem `$`.',
      'Skopiuj formułę w dół (albo w bok) i sprawdź wynik w ostatnim wierszu.',
      'W funkcjach pilnuj kolejności argumentów, np. w `SUMA.JEŻELI`: zakres kryterium, kryterium, zakres sumy.',
    ],
    check: {
      question: 'Formułę `=B2*$E$1` skopiowano z C2 do C7. Jak teraz wygląda?',
      answer: '`=B7*$E$1` — adres względny przesunął się o 5 wierszy, a zakotwiczony został na miejscu.',
    },
  },
  'cs-sheet-analysis': {
    idea: [
      'Analiza danych to zamiana tysiąca wierszy w kilka liczb i jeden wykres, z których da się coś zrozumieć. Tabela przestawna grupuje wiersze według kategorii i podsumowuje każdą grupę — to ta sama idea co `GROUP BY` w SQL i słownik w Pythonie.',
      'Symulacja to odtwarzanie świata dzień po dniu według reguł z treści: stan na początku, a potem dla każdego dnia te same kroki w tej samej kolejności. Kolejność ma znaczenie — „najpierw dostawa, potem sprzedaż” i „najpierw sprzedaż, potem dostawa” mogą dać różne wyniki.',
      'Wykres dobierasz do pytania: zmiana w czasie — liniowy, porównanie kategorii — kolumnowy, udział części w całości — kołowy, zależność dwóch wielkości — punktowy.',
    ],
    method: [
      'Ustal, czy zadanie to podsumowanie (grupowanie), czy symulacja (stan zmieniany w czasie).',
      'Podsumowanie: wybierz klucz grupy i miarę (suma, liczba, średnia) — tabela przestawna albo słownik.',
      'Symulacja: zapisz stan początkowy, a potem dla każdego dnia wykonaj reguły dokładnie w kolejności z treści.',
      'Sprawdź pierwsze dni ręcznie (pomyłka o jeden dzień to najczęstszy błąd) i dobierz wykres do pytania.',
    ],
    check: {
      question: 'Jaki wykres najlepiej pokaże udział każdej klasy w liczbie wypożyczeń?',
      answer: 'Kołowy — pokazuje udział części w całości.',
    },
  },
  'cs-networks': {
    idea: [
      'Adres IP jest jak adres pocztowy: pierwsza część mówi, na jakiej ulicy (w jakiej sieci) jest komputer, druga — pod którym numerem domu. Maska, np. /24, mówi, ile początkowych bitów to „ulica”.',
      'Adres sieci dostajesz, zerując część „numeru domu” — to operacja AND adresu z maską. Dwa komputery są w tej samej sieci, gdy po nałożeniu maski dają ten sam adres sieci; wtedy komunikują się bezpośrednio, bez routera.',
      r`W sieci z maską $/p$ na komputery zostaje $32 - p$ bitów, czyli $2^{32-p}$ adresów. Dwa z nich są zarezerwowane: adres sieci (same zera) i adres rozgłoszeniowy (same jedynki), dlatego komputerów może być $2^{32-p} - 2$.`,
    ],
    method: [
      'Zamień istotny oktet adresu na system dwójkowy.',
      'Nałóż maskę: bity sieci zostają, bity hosta wyzeruj — to adres sieci; ustaw je na 1 — to adres rozgłoszeniowy.',
      r`Liczbę komputerów policz jako $2^{32-p} - 2$.`,
      'Porównaj adresy sieci dwóch komputerów, żeby sprawdzić, czy są w tej samej sieci.',
    ],
    check: {
      question: 'Ile komputerów zmieści się w sieci /28?',
      answer: r`$2^{4} - 2 = 14$ — na numery hostów zostają $32 - 28 = 4$ bity.`,
    },
  },
  'cs-compression': {
    idea: [
      'Kompresja bezstratna szuka w danych powtórzeń i zapisuje je sprytniej, tak żeby dało się odtworzyć każdy bit. RLE zamienia „AAAABBB” na „4A3B”, a kod Huffmana daje częstym znakom krótkie kody — jak skróty, których używasz w notatkach dla najczęstszych słów.',
      'Kompresja stratna (JPEG, MP3) idzie dalej: wyrzuca szczegóły, których człowiek prawie nie zauważy, np. drobne różnice kolorów. Plik jest dużo mniejszy, ale oryginału nie da się już odtworzyć.',
      'Żadna kompresja nie działa na wszystkich danych: gdy nie ma powtórzeń, RLE może plik wręcz powiększyć („ABCD” → „1A1B1C1D”). Dlatego metodę dobiera się do rodzaju danych.',
    ],
    method: [
      'Ustal, czy dane muszą wrócić co do bitu (bezstratna), czy wystarczy wygląd albo dźwięk (stratna).',
      'RLE: przejdź po znakach, licz długość każdej serii i zapisuj parę „liczba + znak”.',
      'Huffman: policz częstości, łącz zawsze dwa najrzadsze drzewa i odczytaj kody ze ścieżek (lewo 0, prawo 1).',
      'Porównaj rozmiar przed i po, pamiętając o tablicy kodów.',
    ],
    check: {
      question: 'Jak zakodować RLE napis „CCCDDA”?',
      answer: '„3C2D1A”.',
    },
  },
  'cs-security': {
    idea: [
      'Szyfr symetryczny ma jeden klucz — jak skrzynka z kłódką, do której obie strony mają ten sam klucz. Kłopot: jak bezpiecznie przekazać ten klucz przez internet, zanim zacznie się szyfrować?',
      'Kryptografia z kluczem publicznym działa jak kłódka, którą każdy może zatrzasnąć, ale otworzy ją tylko właściciel klucza. Kłódkę (klucz publiczny) rozdajesz wszystkim, klucz (prywatny) trzymasz u siebie. Wiadomość dla Ani zamyka się jej publiczną kłódką — otworzy ją tylko Ania.',
      'Podpis elektroniczny działa odwrotnie: nadawca „zamyka” skrót dokumentu swoim kluczem prywatnym, a każdy może to sprawdzić jego kluczem publicznym. Jeśli pasuje, podpisał to właściciel klucza, a dokument nie został zmieniony.',
    ],
    method: [
      'Ustal cel: poufność (szyfrowanie) czy autentyczność (podpis).',
      'Poufność: szyfruj kluczem publicznym ODBIORCY; odbiorca odszyfrowuje swoim kluczem prywatnym.',
      'Podpis: nadawca podpisuje swoim kluczem prywatnym; odbiorca sprawdza kluczem publicznym NADAWCY.',
      r`Rachunek RSA: szyfrogram $c = m^e \bmod n$, odszyfrowanie $m = c^d \bmod n$.`,
    ],
    check: {
      question: 'Czyim kluczem zaszyfrujesz wiadomość, którą ma przeczytać tylko Bartek?',
      answer: 'Kluczem publicznym Bartka — odszyfruje ją tylko jego klucz prywatny.',
    },
  },
};
