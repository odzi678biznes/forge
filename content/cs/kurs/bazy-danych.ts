import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, sqlTask, tip, warn, type SqlTaskSpec } from '../../authoring';
import { bazy, jakoTekst, PRZYKLAD, schemat } from './sql-dane';
import { SQL_WYNIKI } from './sql-wyniki';

/**
 * Informatyka, dział 8: bazy danych i SQL.
 *
 * Podstawa programowa 2024: II.3d (baza z co najmniej dwóch tabel, relacje,
 * kwerendy), II.R3c (relacyjna baza z wielu tabel, SQL do wyszukiwania
 * i modyfikacji, integralność danych).
 *
 * Zapytania wykonuje SQLite (wbudowany w Pyodide, offline). Na maturze
 * można użyć dowolnego systemu baz danych — różnice składni omawia lekcja.
 */

export const DB_TOPIC: Topic = {
  id: 'cs-databases',
  subjectId: 'cs',
  name: 'Bazy danych i SQL',
  summary: 'Zapytania SELECT, grupowanie i funkcje agregujące, złączenia tabel, zmiana danych oraz klucze i integralność — na bazie szkolnej biblioteki.',
};

/** Zadanie SQL z oczekiwanymi wynikami z pliku generowanego. */
const zadanieSql = (spec: SqlTaskSpec): Question => sqlTask({ ...spec, expected: SQL_WYNIKI[spec.id] ?? {} });

const U = PRZYKLAD.uczniowie;
const K = PRZYKLAD.ksiazki;
const W = PRZYKLAD.wypozyczenia;

export const DB_SKILLS: Skill[] = [
  {
    id: 'cs-sql-select',
    topicId: 'cs-databases',
    name: 'SELECT: wybieranie, filtrowanie, sortowanie',
    level: 'PR',
    ckeRequirement: 'Wyszukiwanie informacji w bazie: kwerendy wybierające, filtrowanie i sortowanie (II.3d, II.R3c)',
    prerequisites: ['cs-files'],
    examValue: 0.9,
  },
  {
    id: 'cs-sql-aggregate',
    topicId: 'cs-databases',
    name: 'Grupowanie i funkcje agregujące',
    level: 'PR',
    ckeRequirement: 'Kwerendy z funkcjami agregującymi, grupowanie, warunki na grupach (II.R3c)',
    prerequisites: ['cs-sql-select'],
    examValue: 0.9,
  },
  {
    id: 'cs-sql-join',
    topicId: 'cs-databases',
    name: 'Złączenia tabel i podzapytania',
    level: 'PR',
    ckeRequirement: 'Relacje między tabelami, zapytania do kilku tabel (II.3d, II.R3c)',
    prerequisites: ['cs-sql-aggregate'],
    examValue: 0.9,
  },
  {
    id: 'cs-sql-modify',
    topicId: 'cs-databases',
    name: 'Zmiana danych, klucze i integralność',
    level: 'PR',
    ckeRequirement: 'Projektowanie bazy, modyfikacja danych w SQL, integralność i bezpieczeństwo danych (II.R3c)',
    prerequisites: ['cs-sql-join'],
    examValue: 0.6,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const DB_LESSONS: Lesson[] = [
  {
    skillId: 'cs-sql-select',
    minutes: 15,
    intro:
      'Relacyjna baza danych to zbiór tabel: wiersz to jeden obiekt (uczeń, książka), kolumna — jedna jego cecha. SQL to język, w którym opisujesz, CO chcesz dostać, a baza sama wie, jak to znaleźć.',
    blocks: [
      listing("SELECT imie, nazwisko          -- które kolumny\nFROM uczniowie                  -- z której tabeli\nWHERE klasa = '3A'              -- które wiersze\n  AND rok_ur >= 2007\nORDER BY nazwisko, imie;        -- w jakiej kolejności"),
      p('Warunki łączysz przez `AND`, `OR` i `NOT`. `LIKE` porównuje ze wzorcem: `%` oznacza dowolny ciąg znaków, `_` — jeden znak. `BETWEEN a AND b` to przedział domknięty. `DISTINCT` usuwa powtórzone wiersze, `LIMIT n` zostawia n pierwszych.'),
      p('Brak wartości to `NULL`. Nie da się go porównać znakiem `=`: warunek piszesz jako `kolumna IS NULL` albo `IS NOT NULL`. Każde porównanie z NULL daje „nieznane”, więc taki wiersz nie przechodzi przez WHERE.'),
      tip('Na maturze możesz użyć dowolnego systemu baz danych. W MS Access zamiast `LIMIT 3` piszesz `SELECT TOP 3`, a we wzorcach `*` zamiast `%`. W FORGE zapytania wykonuje SQLite.'),
      warn('Tekst w SQL piszesz w apostrofach: `klasa = \'3A\'`. Cudzysłów podwójny oznacza w SQLite nazwę kolumny, nie tekst.'),
    ],
    examples: [
      example(
        'Które wiersze tabeli uczniowie wybierze warunek `WHERE klasa = \'3A\' AND rok_ur = 2007`?',
        [['Oba warunki muszą być spełnione jednocześnie.', 'AND'], 'Z klasy 3A urodzeni w 2007 r.: Anna, Filip i Gosia.'],
        'trzy wiersze',
      ),
      example(
        'Jak znaleźć wypożyczenia z października 2026, jeśli daty są zapisane jako tekst RRRR-MM-DD?',
        [["`data_wyp LIKE '2026-10-%'`", 'data zaczyna się od roku i miesiąca'], "Albo: `strftime('%Y-%m', data_wyp) = '2026-10'`."],
        "WHERE data_wyp LIKE '2026-10-%'",
      ),
    ],
    pitfalls: ['`= NULL` zamiast `IS NULL`.', 'Tekst bez apostrofów.', 'Zapomniane ORDER BY, gdy zadanie wymaga kolejności.'],
  },
  {
    skillId: 'cs-sql-aggregate',
    minutes: 15,
    intro:
      'Funkcje agregujące zamieniają wiele wierszy w jedną liczbę: `COUNT` liczy, `SUM` sumuje, `AVG` liczy średnią, `MIN` i `MAX` szukają skrajnych wartości. Z `GROUP BY` robią to osobno dla każdej grupy — np. dla każdej klasy.',
    blocks: [
      listing("SELECT klasa, COUNT(*) AS liczba, ROUND(AVG(rok_ur), 1) AS sredni_rok\nFROM uczniowie\nWHERE rok_ur IS NOT NULL      -- filtr wierszy PRZED grupowaniem\nGROUP BY klasa\nHAVING COUNT(*) >= 3          -- filtr grup PO grupowaniu\nORDER BY liczba DESC;"),
      p('Kolejność działania: FROM → WHERE (wiersze) → GROUP BY → HAVING (grupy) → SELECT → ORDER BY → LIMIT. Dlatego w WHERE nie ma jeszcze wyników COUNT, a w HAVING — już są.'),
      p('`COUNT(*)` liczy wiersze, a `COUNT(kolumna)` — tylko te, w których kolumna nie jest NULL. Podobnie `AVG`, `SUM`, `MIN`, `MAX` pomijają NULL.'),
      tip('Każda kolumna w SELECT obok funkcji agregującej powinna być w GROUP BY. Inaczej nie wiadomo, z którego wiersza grupy ma pochodzić jej wartość.'),
      warn('Warunek na wynik funkcji agregującej (np. „co najmniej 2 książki”) idzie do HAVING. `WHERE COUNT(*) >= 2` to błąd.'),
    ],
    examples: [
      example(
        'Ile wypożyczeń zwrócono, jeśli w kolumnie data_zwrotu 4 z 9 wierszy to NULL?',
        [['`COUNT(data_zwrotu)` pomija NULL.', 'NULL oznacza brak zwrotu'], '9 − 4 = 5.'],
        '5',
      ),
      example(
        'Jak znaleźć autorów z co najmniej dwiema książkami?',
        ['`GROUP BY autor` tworzy grupy książek jednego autora.', '`HAVING COUNT(*) >= 2` zostawia większe grupy.'],
        'SELECT autor, COUNT(*) FROM ksiazki GROUP BY autor HAVING COUNT(*) >= 2',
      ),
    ],
    pitfalls: ['Warunek na COUNT w WHERE zamiast w HAVING.', '`COUNT(kolumna)` tam, gdzie trzeba policzyć wszystkie wiersze.', 'Kolumna w SELECT spoza GROUP BY.'],
  },
  {
    skillId: 'cs-sql-join',
    minutes: 16,
    intro:
      'Dane w bazie są rozłożone na kilka tabel, żeby się nie powtarzały: wypożyczenie przechowuje tylko numery ucznia i książki. Złączenie (JOIN) składa je z powrotem — dla każdego wypożyczenia dopasowuje wiersz ucznia i wiersz książki.',
    blocks: [
      listing('SELECT u.imie, u.nazwisko, k.tytul\nFROM wypozyczenia w\nJOIN uczniowie u ON u.id = w.id_ucznia\nJOIN ksiazki k   ON k.id = w.id_ksiazki\nWHERE w.data_zwrotu IS NULL;', 'Aliasy (w, u, k) skracają zapis i rozstrzygają, o którą kolumnę id chodzi.'),
      p('`JOIN` (złączenie wewnętrzne) zostawia tylko pary, które do siebie pasują. `LEFT JOIN` zostawia wszystkie wiersze lewej tabeli — gdy nie ma pary, kolumny prawej tabeli są NULL. Tak znajduje się „uczniów, którzy nic nie wypożyczyli”.'),
      listing('SELECT u.imie, u.nazwisko\nFROM uczniowie u\nLEFT JOIN wypozyczenia w ON w.id_ucznia = u.id\nWHERE w.id IS NULL;\n\n-- to samo podzapytaniem:\nSELECT imie, nazwisko FROM uczniowie\nWHERE id NOT IN (SELECT id_ucznia FROM wypozyczenia);'),
      tip('Grupuj po kluczu (`GROUP BY u.id`), a nie po imieniu i nazwisku — dwie osoby mogą się tak samo nazywać.'),
      warn('Złączenie bez warunku ON łączy KAŻDY wiersz z każdym (iloczyn kartezjański): 9 uczniów × 9 wypożyczeń = 81 bezsensownych wierszy.'),
    ],
    examples: [
      example(
        'Ile wierszy da `uczniowie JOIN wypozyczenia ON wypozyczenia.id_ucznia = uczniowie.id`, jeśli jest 9 wypożyczeń, każde przez istniejącego ucznia?',
        [['Każde wypożyczenie dostaje dokładnie jednego ucznia.', 'klucz obcy wskazuje jeden wiersz'], 'Uczniowie bez wypożyczeń nie pojawią się wcale.'],
        '9',
      ),
      example(
        'Jak policzyć wypożyczenia każdego ucznia razem z jego nazwiskiem?',
        ['Złącz uczniów z wypożyczeniami.', '`GROUP BY u.id` i `COUNT(*)` w każdej grupie.'],
        'JOIN + GROUP BY u.id',
      ),
    ],
    pitfalls: ['Brak warunku ON — iloczyn kartezjański.', 'Niejednoznaczna kolumna `id` bez nazwy tabeli.', 'JOIN tam, gdzie potrzebny LEFT JOIN (znikają wiersze bez pary).'],
  },
  {
    skillId: 'cs-sql-modify',
    minutes: 14,
    intro:
      'SQL nie tylko czyta dane, ale też je zmienia: INSERT dodaje wiersze, UPDATE poprawia wartości, DELETE usuwa wiersze, a CREATE TABLE tworzy nowe tabele. Klucze pilnują, żeby dane w tabelach do siebie pasowały.',
    blocks: [
      listing("INSERT INTO uczniowie VALUES (10, 'Jan', 'Kot', '3C', 2008);\n\nUPDATE uczniowie SET klasa = '4A' WHERE klasa = '3A';\n\nDELETE FROM wypozyczenia WHERE data_zwrotu IS NOT NULL;\n\nCREATE TABLE oceny (\n  id_ucznia INTEGER REFERENCES uczniowie(id),\n  przedmiot TEXT,\n  ocena INTEGER\n);"),
      p('Klucz podstawowy (PRIMARY KEY) jednoznacznie identyfikuje wiersz — nie może się powtarzać. Klucz obcy (np. `id_ucznia`) wskazuje wiersz innej tabeli. Relacja uczniowie–wypożyczenia to „jeden do wielu”: jeden uczeń ma wiele wypożyczeń, każde wypożyczenie należy do jednego ucznia.'),
      p('Więzy integralności nie pozwalają np. dodać wypożyczenia ucznia, którego nie ma w bazie. Integralność, kopie zapasowe i uprawnienia użytkowników to elementy bezpieczeństwa danych.'),
      tip('UPDATE i DELETE bez WHERE działają na WSZYSTKICH wierszach. Zanim wykonasz zmianę, uruchom SELECT z tym samym warunkiem i sprawdź, które wiersze zostaną zmienione.'),
      p('W warunku UPDATE można użyć podzapytania: `WHERE id_ucznia IN (SELECT id FROM uczniowie WHERE nazwisko = \'Nowak\')`.'),
    ],
    examples: [
      example(
        'Jakiego typu jest relacja między tabelą ksiazki a wypozyczenia?',
        [['Jedna książka może być wypożyczana wiele razy.', 'id_ksiazki powtarza się w wypożyczeniach'], 'Każde wypożyczenie dotyczy jednej książki.'],
        'jeden do wielu',
      ),
      example(
        'Co zrobi `DELETE FROM wypozyczenia WHERE data_zwrotu < \'2026-10-01\'` z wierszem, w którym data_zwrotu to NULL?',
        ['Porównanie z NULL daje „nieznane”, a nie prawdę.', 'Wiersz nie spełnia warunku, więc zostaje.'],
        'nic — wiersz zostaje',
      ),
    ],
    pitfalls: ['UPDATE lub DELETE bez WHERE.', 'Powtórzona wartość klucza podstawowego przy INSERT.', 'Zła liczba wartości w INSERT.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const KOL_U = ['id', 'imie', 'nazwisko', 'klasa', 'rok_ur'];
const KOL_K = ['id', 'tytul', 'autor', 'rok_wyd', 'gatunek'];
const KOL_W = ['id', 'id_ucznia', 'id_ksiazki', 'data_wyp', 'data_zwrotu'];

export const DB_QUESTIONS: Question[] = [
  // cs-sql-select -------------------------------------------------------------
  choice({
    id: 'db-s-1',
    skill: 'cs-sql-select',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Która część zapytania SQL wybiera tylko te wiersze, które spełniają warunek?',
    choices: ['WHERE', 'ORDER BY', 'SELECT', 'FROM'],
    answer: 'A',
    hints: ['Za co odpowiada każda część zapytania?', 'SELECT — kolumny, FROM — tabela.', 'ORDER BY ustala kolejność, nie usuwa wierszy.', 'Filtr wierszy to…'],
    steps: ['WHERE zostawia wiersze spełniające warunek.', 'SELECT wybiera kolumny, FROM tabelę, ORDER BY kolejność.'],
    errors: [
      ['B', 'ORDER BY tylko sortuje.', 'Filtr wierszy to WHERE.'],
      ['C', 'SELECT wybiera kolumny, nie wiersze.', 'Filtr wierszy to WHERE.'],
      ['D', 'FROM wskazuje tabelę.', 'Filtr wierszy to WHERE.'],
    ],
  }),
  numeric({
    id: 'db-s-2',
    skill: 'cs-sql-select',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Ile wierszy zwróci zapytanie dla tych danych?',
    listing: `${jakoTekst('uczniowie', KOL_U)}\n\nSELECT * FROM uczniowie\nWHERE klasa = '3A' AND rok_ur = 2007;`,
    answer: 3,
    verify: () => U.filter((w) => w[3] === '3A' && w[4] === 2007).length,
    hints: ['Ile warunków musi spełnić wiersz?', 'Dwa naraz — łączy je AND.', 'Najpierw znajdź uczniów z klasy podanej w warunku.', 'Spośród nich policz urodzonych w roku podanym w warunku.'],
    steps: ['Klasa 3A: Anna, Celina, Filip, Gosia.', 'Rok 2007: Anna, Filip, Gosia — 3 wiersze.'],
    errors: [['4', 'Pominięty drugi warunek.', 'AND wymaga spełnienia obu warunków.']],
  }),
  zadanieSql({
    id: 'db-s-3',
    skill: 'cs-sql-select',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Wypisz imiona i nazwiska uczniów urodzonych w 2008 roku lub później.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    model: 'SELECT imie, nazwisko FROM uczniowie WHERE rok_ur >= 2008;',
    hints: ['Które dwie kolumny mają się znaleźć w wyniku?', 'imie i nazwisko — wymień je po SELECT.', 'Warunek na rok zapisz w WHERE.', '„2008 lub później” to `rok_ur >= 2008`.'],
    steps: ['SELECT imie, nazwisko FROM uczniowie.', 'WHERE rok_ur >= 2008 — wiersze z NULL w roku nie przechodzą warunku.'],
  }),
  zadanieSql({
    id: 'db-s-4',
    skill: 'cs-sql-select',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Podaj tytuły i lata wydania wszystkich książek Stanisława Lema, od najstarszej do najnowszej.',
    schema: schemat('ksiazki'),
    fixtures: bazy('ksiazki'),
    ordered: true,
    model: "SELECT tytul, rok_wyd FROM ksiazki WHERE autor = 'Stanisław Lem' ORDER BY rok_wyd;",
    hints: ['Jak zapisać w warunku tekst — nazwisko autora?', "W apostrofach: `autor = 'Stanisław Lem'`.", 'Kolejność ustala ORDER BY.', 'Rosnąco (od najstarszej) to domyślny kierunek.'],
    steps: ["WHERE autor = 'Stanisław Lem' wybiera książki Lema.", 'ORDER BY rok_wyd ustawia je od najstarszej.'],
  }),
  zadanieSql({
    id: 'db-s-5',
    skill: 'cs-sql-select',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Podaj wszystkie RÓŻNE nazwiska uczniów (każde raz), w kolejności alfabetycznej.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    ordered: true,
    model: 'SELECT DISTINCT nazwisko FROM uczniowie ORDER BY nazwisko;',
    hints: ['Które słowo usuwa powtórzone wiersze z wyniku?', 'DISTINCT, zaraz po SELECT.', 'Wynik ma jedną kolumnę: nazwisko.', 'Kolejność alfabetyczną daje ORDER BY nazwisko.'],
    steps: ['SELECT DISTINCT nazwisko usuwa powtórzenia.', 'ORDER BY nazwisko sortuje alfabetycznie.'],
  }),
  zadanieSql({
    id: 'db-s-6',
    skill: 'cs-sql-select',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Podaj tytuły i lata wydania trzech najstarszych książek, od najstarszej.',
    schema: schemat('ksiazki'),
    fixtures: bazy('ksiazki'),
    ordered: true,
    model: 'SELECT tytul, rok_wyd FROM ksiazki ORDER BY rok_wyd LIMIT 3;',
    hints: ['Jak ustawić książki od najstarszej?', 'ORDER BY rok_wyd (rosnąco).', 'Jak zostawić tylko pierwsze trzy wiersze?', 'LIMIT 3 na końcu zapytania (w Accessie: SELECT TOP 3).'],
    steps: ['ORDER BY rok_wyd ustawia książki od najstarszej.', 'LIMIT 3 zostawia trzy pierwsze.'],
  }),
  zadanieSql({
    id: 'db-s-7',
    skill: 'cs-sql-select',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Podaj identyfikatory wypożyczeń z października 2026 roku, które nie zostały jeszcze zwrócone. Daty są zapisane jako tekst w postaci RRRR-MM-DD.',
    schema: schemat('wypozyczenia'),
    fixtures: bazy('wypozyczenia'),
    model: "SELECT id FROM wypozyczenia WHERE data_wyp LIKE '2026-10-%' AND data_zwrotu IS NULL;",
    hints: ['Jak rozpoznać datę z października 2026 w zapisie RRRR-MM-DD?', "Zaczyna się od „2026-10-” — wzorzec `LIKE '2026-10-%'`.", 'Niezwrócone wypożyczenie ma pustą datę zwrotu.', 'Brak wartości sprawdzasz przez `IS NULL`, nie `= NULL`.'],
    steps: ["data_wyp LIKE '2026-10-%' wybiera październik 2026.", 'data_zwrotu IS NULL — wypożyczenia bez zwrotu.'],
  }),

  // cs-sql-aggregate ----------------------------------------------------------
  numeric({
    id: 'db-a-1',
    skill: 'cs-sql-aggregate',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Jaką liczbę zwróci zapytanie dla tych danych?',
    listing: `${jakoTekst('ksiazki', KOL_K)}\n\nSELECT COUNT(*) FROM ksiazki\nWHERE gatunek = 'fantastyka';`,
    answer: 4,
    verify: () => K.filter((w) => w[4] === 'fantastyka').length,
    hints: ['Co liczy COUNT(*)?', 'Wiersze, które przeszły warunek WHERE.', 'Które książki mają gatunek „fantastyka”?', 'Policz je.'],
    steps: ['Fantastyka: Solaris, Cyberiada, Wiedźmin, Eden.', 'COUNT(*) = 4.'],
    errors: [['3', 'Pominięta jedna z książek.', 'Sprawdź wszystkie wiersze, także ostatni.']],
  }),
  numeric({
    id: 'db-a-2',
    skill: 'cs-sql-aggregate',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jaką liczbę zwróci zapytanie dla tych danych?',
    listing: `${jakoTekst('wypozyczenia', KOL_W)}\n\nSELECT COUNT(data_zwrotu) FROM wypozyczenia;`,
    answer: 5,
    verify: () => W.filter((w) => w[4] !== null).length,
    hints: ['Czym różni się COUNT(kolumna) od COUNT(*)?', 'COUNT(kolumna) pomija wiersze z NULL w tej kolumnie.', 'Ile wypożyczeń ma pustą datę zwrotu?', 'Odejmij je od liczby wszystkich wierszy.'],
    steps: ['Wierszy jest 9, w czterech data_zwrotu to NULL.', 'COUNT(data_zwrotu) = 5.'],
    errors: [['9', 'COUNT(kolumna) potraktowane jak COUNT(*).', 'COUNT(kolumna) nie liczy wartości NULL.']],
  }),
  choice({
    id: 'db-a-3',
    skill: 'cs-sql-aggregate',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Gdzie w zapytaniu z GROUP BY zapisuje się warunek `COUNT(*) >= 2`, który ma zostawić tylko większe grupy?',
    choices: ['w HAVING', 'w WHERE', 'w ORDER BY', 'w SELECT'],
    answer: 'A',
    hints: ['Kiedy baza wykonuje WHERE — przed czy po grupowaniu?', 'Przed — COUNT grup jeszcze nie istnieje.', 'Która klauza filtruje już utworzone grupy?', 'Ta, która stoi po GROUP BY.'],
    steps: ['WHERE działa na wierszach przed grupowaniem.', 'Warunek na wynik funkcji agregującej to HAVING.'],
    errors: [
      ['B', 'WHERE działa przed grupowaniem.', 'Funkcje agregujące filtruje HAVING.'],
      ['C', 'ORDER BY tylko sortuje.', 'Filtr grup to HAVING.'],
      ['D', 'SELECT wybiera kolumny.', 'Filtr grup to HAVING.'],
    ],
  }),
  zadanieSql({
    id: 'db-a-4',
    skill: 'cs-sql-aggregate',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Dla każdej klasy podaj jej nazwę i liczbę uczniów.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    model: 'SELECT klasa, COUNT(*) FROM uczniowie GROUP BY klasa;',
    hints: ['Jak podzielić uczniów na grupy według klasy?', 'GROUP BY klasa.', 'Jaka funkcja policzy wiersze w każdej grupie?', 'COUNT(*) — obok kolumny klasa w SELECT.'],
    steps: ['GROUP BY klasa tworzy grupę dla każdej klasy.', 'SELECT klasa, COUNT(*) podaje nazwę i liczebność.'],
  }),
  zadanieSql({
    id: 'db-a-5',
    skill: 'cs-sql-aggregate',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Dla każdego gatunku podaj: gatunek, liczbę książek i rok wydania najstarszej książki tego gatunku.',
    schema: schemat('ksiazki'),
    fixtures: bazy('ksiazki'),
    model: 'SELECT gatunek, COUNT(*), MIN(rok_wyd) FROM ksiazki GROUP BY gatunek;',
    hints: ['Według jakiej kolumny grupujesz?', 'Według gatunku.', 'Liczbę książek daje COUNT(*).', 'Najstarsza książka to najmniejszy rok: MIN(rok_wyd).'],
    steps: ['GROUP BY gatunek.', 'W każdej grupie COUNT(*) i MIN(rok_wyd).'],
  }),
  zadanieSql({
    id: 'db-a-6',
    skill: 'cs-sql-aggregate',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Podaj autorów, którzy mają w bibliotece co najmniej dwie książki, razem z liczbą ich książek.',
    schema: schemat('ksiazki'),
    fixtures: bazy('ksiazki'),
    model: 'SELECT autor, COUNT(*) FROM ksiazki GROUP BY autor HAVING COUNT(*) >= 2;',
    hints: ['Jakie grupy tworzysz?', 'Grupę książek każdego autora: GROUP BY autor.', 'Warunek dotyczy liczby książek w grupie.', 'Warunek na grupy to HAVING COUNT(*) >= 2.'],
    steps: ['GROUP BY autor i COUNT(*) w każdej grupie.', 'HAVING COUNT(*) >= 2 zostawia autorów z co najmniej dwiema książkami.'],
  }),
  zadanieSql({
    id: 'db-a-7',
    skill: 'cs-sql-aggregate',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Dla klas liczących co najmniej 3 uczniów podaj klasę i średni rok urodzenia zaokrąglony do jednego miejsca po przecinku (funkcja ROUND). Uporządkuj od największej średniej, a przy równej średniej — alfabetycznie według klasy. Uwaga: uczeń bez podanego roku też liczy się do liczebności klasy.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    ordered: true,
    model: 'SELECT klasa, ROUND(AVG(rok_ur), 1) AS sredni FROM uczniowie GROUP BY klasa HAVING COUNT(*) >= 3 ORDER BY sredni DESC, klasa;',
    hints: ['Czy uczeń z pustym rokiem wchodzi do COUNT(*) i do AVG(rok_ur)?', 'Do COUNT(*) tak, a AVG pomija wartości NULL — i o to chodzi.', 'Warunek na liczebność klasy: HAVING COUNT(*) >= 3.', 'Sortowanie po dwóch kryteriach: ORDER BY sredni DESC, klasa.'],
    steps: ['GROUP BY klasa; HAVING COUNT(*) >= 3 liczy wszystkich uczniów klasy.', 'ROUND(AVG(rok_ur), 1) — AVG pomija NULL; ORDER BY średnia malejąco, potem klasa.'],
  }),

  // cs-sql-join ---------------------------------------------------------------
  choice({
    id: 'db-j-1',
    skill: 'cs-sql-join',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Który warunek poprawnie łączy tabelę wypozyczenia z tabelą uczniowie?',
    choices: [
      '`ON wypozyczenia.id_ucznia = uczniowie.id`',
      '`ON wypozyczenia.id = uczniowie.id`',
      '`ON wypozyczenia.id_ksiazki = uczniowie.id`',
      '`ON uczniowie.id_ucznia = wypozyczenia.id`',
    ],
    answer: 'A',
    hints: ['Która kolumna tabeli wypozyczenia wskazuje ucznia?', 'id_ucznia — to klucz obcy.', 'Na co wskazuje klucz obcy?', 'Na klucz podstawowy tabeli uczniowie: uczniowie.id.'],
    steps: ['Klucz obcy id_ucznia wskazuje uczniowie.id.', 'Warunek złączenia: wypozyczenia.id_ucznia = uczniowie.id.'],
    errors: [
      ['B', 'Porównane dwa klucze podstawowe.', 'Numer wypożyczenia nie ma związku z numerem ucznia.'],
      ['C', 'id_ksiazki wskazuje książkę, nie ucznia.', 'Ucznia wskazuje id_ucznia.'],
      ['D', 'Tabela uczniowie nie ma kolumny id_ucznia.', 'Klucz obcy jest w tabeli wypozyczenia.'],
    ],
  }),
  numeric({
    id: 'db-j-2',
    skill: 'cs-sql-join',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Tabela uczniowie ma 9 wierszy, a tabela wypozyczenia wygląda jak niżej (każde wypożyczenie dotyczy istniejącego ucznia). Ile wierszy zwróci zapytanie?',
    listing: `${jakoTekst('wypozyczenia', KOL_W)}\n\nSELECT * FROM uczniowie\nJOIN wypozyczenia ON wypozyczenia.id_ucznia = uczniowie.id;`,
    answer: 9,
    verify: () => W.filter((w) => U.some((u) => u[0] === w[1])).length,
    hints: ['Ile uczniów pasuje do jednego wypożyczenia?', 'Dokładnie jeden — ten o numerze id_ucznia.', 'A co z uczniami, którzy nic nie wypożyczyli?', 'W złączeniu wewnętrznym nie pojawiają się wcale.'],
    steps: ['Każde wypożyczenie łączy się z jednym uczniem.', 'Wierszy wyniku jest tyle, ile wypożyczeń: 9.'],
    errors: [['81', 'Iloczyn kartezjański.', 'Warunek ON dopasowuje tylko pasujące pary.']],
  }),
  zadanieSql({
    id: 'db-j-3',
    skill: 'cs-sql-join',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Podaj tytuły książek wypożyczonych przez ucznia o identyfikatorze 1 (jeśli wypożyczył książkę kilka razy, tytuł może się powtórzyć).',
    schema: schemat('ksiazki', 'wypozyczenia'),
    fixtures: bazy('ksiazki', 'wypozyczenia'),
    model: 'SELECT k.tytul FROM wypozyczenia w JOIN ksiazki k ON k.id = w.id_ksiazki WHERE w.id_ucznia = 1;',
    hints: ['W której tabeli jest tytuł, a w której numer ucznia?', 'Tytuł w ksiazki, numer ucznia w wypozyczenia.', 'Połącz je warunkiem ON k.id = w.id_ksiazki.', 'Na koniec WHERE w.id_ucznia = 1.'],
    steps: ['JOIN ksiazki ON k.id = w.id_ksiazki dokleja tytuł do wypożyczenia.', 'WHERE w.id_ucznia = 1 zostawia wypożyczenia ucznia nr 1.'],
  }),
  zadanieSql({
    id: 'db-j-4',
    skill: 'cs-sql-join',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Dla każdego niezwróconego wypożyczenia podaj imię i nazwisko ucznia oraz tytuł książki.',
    schema: schemat('uczniowie', 'ksiazki', 'wypozyczenia'),
    fixtures: bazy('uczniowie', 'ksiazki', 'wypozyczenia'),
    model: 'SELECT u.imie, u.nazwisko, k.tytul FROM wypozyczenia w JOIN uczniowie u ON u.id = w.id_ucznia JOIN ksiazki k ON k.id = w.id_ksiazki WHERE w.data_zwrotu IS NULL;',
    hints: ['Z ilu tabel pochodzą dane wyniku?', 'Z trzech: uczniowie, ksiazki, wypozyczenia.', 'Zacznij od wypożyczeń i dołącz obie pozostałe tabele przez klucze obce.', 'Niezwrócone: data_zwrotu IS NULL.'],
    steps: ['FROM wypozyczenia JOIN uczniowie (po id_ucznia) JOIN ksiazki (po id_ksiazki).', 'WHERE data_zwrotu IS NULL.'],
  }),
  zadanieSql({
    id: 'db-j-5',
    skill: 'cs-sql-join',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Dla każdego ucznia, który wypożyczył co najmniej jedną książkę, podaj imię, nazwisko i liczbę jego wypożyczeń.',
    schema: schemat('uczniowie', 'wypozyczenia'),
    fixtures: bazy('uczniowie', 'wypozyczenia'),
    model: 'SELECT u.imie, u.nazwisko, COUNT(*) FROM uczniowie u JOIN wypozyczenia w ON w.id_ucznia = u.id GROUP BY u.id;',
    hints: ['Jak dołączyć wypożyczenia do uczniów?', 'JOIN wypozyczenia ON w.id_ucznia = u.id.', 'Po czym grupować, żeby liczyć wypożyczenia każdej osoby osobno?', 'Po kluczu ucznia: GROUP BY u.id — imiona mogą się powtarzać.'],
    steps: ['Złączenie uczniów z wypożyczeniami (uczniowie bez wypożyczeń odpadają).', 'GROUP BY u.id i COUNT(*) w każdej grupie.'],
  }),
  zadanieSql({
    id: 'db-j-6',
    skill: 'cs-sql-join',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Podaj imiona i nazwiska uczniów, którzy nie wypożyczyli żadnej książki.',
    schema: schemat('uczniowie', 'wypozyczenia'),
    fixtures: bazy('uczniowie', 'wypozyczenia'),
    model: 'SELECT u.imie, u.nazwisko FROM uczniowie u LEFT JOIN wypozyczenia w ON w.id_ucznia = u.id WHERE w.id IS NULL;',
    hints: ['Dlaczego zwykły JOIN tu nie wystarczy?', 'Uczniowie bez wypożyczeń w ogóle nie pojawiają się w wyniku JOIN.', 'LEFT JOIN zostawia każdego ucznia; bez pary kolumny wypożyczenia są NULL.', 'Albo: WHERE id NOT IN (SELECT id_ucznia FROM wypozyczenia).'],
    steps: ['LEFT JOIN wypozyczenia zachowuje wszystkich uczniów.', 'WHERE w.id IS NULL zostawia tych bez żadnego wypożyczenia.'],
  }),
  zadanieSql({
    id: 'db-j-7',
    skill: 'cs-sql-join',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Podaj tytuł najczęściej wypożyczanej książki i liczbę jej wypożyczeń (w każdej bazie jest jedna taka książka).',
    schema: schemat('ksiazki', 'wypozyczenia'),
    fixtures: bazy('ksiazki', 'wypozyczenia'),
    model: 'SELECT k.tytul, COUNT(*) AS ile FROM wypozyczenia w JOIN ksiazki k ON k.id = w.id_ksiazki GROUP BY k.id ORDER BY ile DESC LIMIT 1;',
    hints: ['Jak policzyć wypożyczenia każdej książki?', 'Złącz wypożyczenia z książkami i grupuj po k.id.', 'Jak wybrać grupę z największą liczbą?', 'ORDER BY liczba DESC i LIMIT 1.'],
    steps: ['JOIN ksiazki, GROUP BY k.id, COUNT(*) AS ile.', 'ORDER BY ile DESC LIMIT 1 zostawia najczęściej wypożyczaną.'],
  }),

  // cs-sql-modify -------------------------------------------------------------
  choice({
    id: 'db-m-1',
    skill: 'cs-sql-modify',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Czym jest klucz podstawowy tabeli?',
    choices: [
      'kolumną, której wartość jednoznacznie identyfikuje wiersz',
      'kolumną, według której tabela jest posortowana',
      'kolumną wskazującą wiersz w innej tabeli',
      'hasłem chroniącym dostęp do tabeli',
    ],
    answer: 'A',
    hints: ['Czy dwa wiersze mogą mieć ten sam klucz podstawowy?', 'Nie — wartość musi być unikalna.', 'Do czego służy unikalna wartość?', 'Pozwala wskazać dokładnie jeden wiersz.'],
    steps: ['Klucz podstawowy ma wartości unikalne i niepuste.', 'Dzięki temu jednoznacznie wskazuje wiersz.'],
    errors: [
      ['B', 'Klucz nie określa kolejności wierszy.', 'Kolejność ustala ORDER BY w zapytaniu.'],
      ['C', 'To opis klucza obcego.', 'Klucz obcy wskazuje klucz podstawowy innej tabeli.'],
      ['D', 'Klucz nie jest zabezpieczeniem hasłem.', 'Klucz identyfikuje wiersze.'],
    ],
  }),
  choice({
    id: 'db-m-2',
    skill: 'cs-sql-modify',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jakiego typu jest relacja między tabelami uczniowie i wypozyczenia?',
    choices: ['jeden do wielu', 'jeden do jednego', 'wiele do wielu', 'tabele nie są powiązane'],
    answer: 'A',
    hints: ['Ile wypożyczeń może mieć jeden uczeń?', 'Dowolnie wiele.', 'Ilu uczniów może mieć jedno wypożyczenie?', 'Dokładnie jednego — wskazanego przez id_ucznia.'],
    steps: ['Jeden uczeń — wiele wypożyczeń.', 'Jedno wypożyczenie — jeden uczeń: relacja jeden do wielu.'],
    errors: [
      ['B', 'Uczeń może mieć wiele wypożyczeń.', 'Po stronie wypożyczeń jest „wiele”.'],
      ['C', 'Wypożyczenie należy do jednego ucznia.', 'Po stronie uczniów jest „jeden”.'],
      ['D', 'Łączy je klucz obcy id_ucznia.', 'Tabele są powiązane relacją.'],
    ],
  }),
  zadanieSql({
    id: 'db-m-3',
    skill: 'cs-sql-modify',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Dodaj do tabeli uczniowie nowego ucznia: id 10, Jan Kot, klasa 3C, rok urodzenia 2008.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    check: 'SELECT * FROM uczniowie ORDER BY id;',
    ordered: true,
    model: "INSERT INTO uczniowie VALUES (10, 'Jan', 'Kot', '3C', 2008);",
    hints: ['Która instrukcja dodaje wiersz?', 'INSERT INTO tabela VALUES (…).', 'W jakiej kolejności podać wartości?', 'W kolejności kolumn tabeli: id, imie, nazwisko, klasa, rok_ur; tekst w apostrofach.'],
    steps: ['INSERT INTO uczniowie VALUES (…).', 'Wartości w kolejności kolumn; teksty w apostrofach, liczby bez.'],
  }),
  zadanieSql({
    id: 'db-m-4',
    skill: 'cs-sql-modify',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij brakujące dane: wszystkim uczniom, którzy nie mają wpisanego roku urodzenia, ustaw rok 2008.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    check: 'SELECT id, rok_ur FROM uczniowie ORDER BY id;',
    ordered: true,
    model: 'UPDATE uczniowie SET rok_ur = 2008 WHERE rok_ur IS NULL;',
    hints: ['Która instrukcja zmienia wartości w istniejących wierszach?', 'UPDATE tabela SET kolumna = wartość WHERE …', 'Jak wybrać wiersze bez roku urodzenia?', 'WHERE rok_ur IS NULL — nie „= NULL”.'],
    steps: ['UPDATE uczniowie SET rok_ur = 2008.', 'WHERE rok_ur IS NULL ogranicza zmianę do uczniów bez roku.'],
  }),
  zadanieSql({
    id: 'db-m-5',
    skill: 'cs-sql-modify',
    kind: 'typical',
    difficulty: 3,
    prompt: "Usuń z tabeli wypozyczenia wszystkie wypożyczenia zwrócone przed 1 października 2026 roku (data zwrotu wcześniejsza niż '2026-10-01').",
    schema: schemat('wypozyczenia'),
    fixtures: bazy('wypozyczenia'),
    check: 'SELECT id FROM wypozyczenia ORDER BY id;',
    ordered: true,
    model: "DELETE FROM wypozyczenia WHERE data_zwrotu < '2026-10-01';",
    hints: ['Która instrukcja usuwa wiersze?', 'DELETE FROM tabela WHERE …', 'Czy daty w postaci RRRR-MM-DD można porównywać jak tekst?', "Tak — kolejność tekstowa to kolejność dat: data_zwrotu < '2026-10-01'."],
    steps: ["DELETE FROM wypozyczenia WHERE data_zwrotu < '2026-10-01'.", 'Wiersze z NULL w dacie zwrotu nie spełniają warunku i zostają.'],
  }),
  choice({
    id: 'db-m-6',
    skill: 'cs-sql-modify',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Kolumna `wypozyczenia.id_ucznia` jest kluczem obcym wskazującym `uczniowie.id`. Która operacja naruszyłaby więzy integralności?',
    choices: [
      'dodanie wypożyczenia ucznia nr 99, gdy w tabeli uczniowie nie ma takiego ucznia',
      'dodanie ucznia, który jeszcze nic nie wypożyczył',
      'usunięcie zwróconego wypożyczenia',
      'zmiana tytułu książki w tabeli ksiazki',
    ],
    answer: 'A',
    hints: ['Czego pilnuje klucz obcy?', 'Żeby wskazywał istniejący wiersz tabeli nadrzędnej.', 'Która operacja tworzy „wiszące” odwołanie?', 'Odwołanie do ucznia, którego nie ma.'],
    steps: ['Klucz obcy musi wskazywać istniejący klucz podstawowy.', 'Wypożyczenie ucznia nr 99, którego nie ma, łamie tę zasadę.'],
    errors: [
      ['B', 'Uczeń bez wypożyczeń jest poprawny.', 'Relacja jeden do wielu dopuszcza zero wypożyczeń.'],
      ['C', 'Usunięcie wypożyczenia nie tworzy wiszących odwołań.', 'Nic nie wskazuje na wypożyczenia.'],
      ['D', 'Tytuł nie jest kluczem.', 'Zmiana zwykłej kolumny nie narusza więzów.'],
    ],
  }),
  zadanieSql({
    id: 'db-m-7',
    skill: 'cs-sql-modify',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Utwórz tabelę `oceny` z kolumnami `id_ucznia` (liczba całkowita), `przedmiot` (tekst) i `ocena` (liczba całkowita), a następnie jednym poleceniem wpisz ocenę 5 z informatyki każdemu uczniowi o nazwisku Nowak.',
    schema: schemat('uczniowie'),
    fixtures: bazy('uczniowie'),
    check: 'SELECT id_ucznia, przedmiot, ocena FROM oceny ORDER BY id_ucznia;',
    ordered: true,
    model: "CREATE TABLE oceny (id_ucznia INTEGER, przedmiot TEXT, ocena INTEGER);\nINSERT INTO oceny SELECT id, 'informatyka', 5 FROM uczniowie WHERE nazwisko = 'Nowak';",
    hints: ['Jak wygląda instrukcja tworząca tabelę?', 'CREATE TABLE nazwa (kolumna TYP, …);', 'INSERT może wstawić wynik zapytania: INSERT INTO oceny SELECT …', "Zapytanie wybiera id Nowaków i dokleja stałe 'informatyka' i 5."],
    steps: ['CREATE TABLE oceny (id_ucznia INTEGER, przedmiot TEXT, ocena INTEGER);', "INSERT INTO oceny SELECT id, 'informatyka', 5 FROM uczniowie WHERE nazwisko = 'Nowak';"],
  }),
  zadanieSql({
    id: 'db-m-8',
    skill: 'cs-sql-modify',
    kind: 'transfer',
    difficulty: 5,
    prompt: "Wszystkim niezwróconym wypożyczeniom uczniów o nazwisku Nowak ustaw datę zwrotu '2026-12-31'. Pozostałych wypożyczeń nie zmieniaj.",
    schema: schemat('uczniowie', 'wypozyczenia'),
    fixtures: bazy('uczniowie', 'wypozyczenia'),
    check: 'SELECT id, data_zwrotu FROM wypozyczenia ORDER BY id;',
    ordered: true,
    model: "UPDATE wypozyczenia SET data_zwrotu = '2026-12-31' WHERE data_zwrotu IS NULL AND id_ucznia IN (SELECT id FROM uczniowie WHERE nazwisko = 'Nowak');",
    hints: ['Które wiersze tabeli wypozyczenia mają się zmienić?', 'Niezwrócone i należące do Nowaków.', 'Nazwisko jest w innej tabeli — jak z niej skorzystać w warunku UPDATE?', "Podzapytaniem: id_ucznia IN (SELECT id FROM uczniowie WHERE nazwisko = 'Nowak')."],
    steps: ["UPDATE wypozyczenia SET data_zwrotu = '2026-12-31'.", 'WHERE data_zwrotu IS NULL AND id_ucznia IN (podzapytanie o Nowaków).'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const DB_CARDS: Flashcard[] = [
  card('c-db-s-1', 'cs-sql-select', 'pulapka', 'Jak sprawdzić brak wartości w SQL?', '`kolumna IS NULL` — nigdy `= NULL`.'),
  card('c-db-s-2', 'cs-sql-select', 'definicja', 'Co oznacza `%` we wzorcu LIKE?', 'Dowolny ciąg znaków (w Accessie `*`).'),

  card('c-db-a-1', 'cs-sql-aggregate', 'definicja', 'WHERE czy HAVING dla warunku na COUNT?', 'HAVING — działa po grupowaniu.'),
  card('c-db-a-2', 'cs-sql-aggregate', 'pulapka', 'COUNT(*) a COUNT(kolumna)?', 'COUNT(kolumna) pomija NULL.'),

  card('c-db-j-1', 'cs-sql-join', 'metoda', 'Jak znaleźć wiersze bez pary w drugiej tabeli?', 'LEFT JOIN … WHERE prawa.id IS NULL (albo NOT IN z podzapytaniem).'),
  card('c-db-j-2', 'cs-sql-join', 'pulapka', 'Co daje JOIN bez warunku ON?', 'Iloczyn kartezjański: każdy wiersz z każdym.'),

  card('c-db-m-1', 'cs-sql-modify', 'definicja', 'Klucz podstawowy a klucz obcy?', 'Podstawowy identyfikuje wiersz; obcy wskazuje wiersz innej tabeli.'),
  card('c-db-m-2', 'cs-sql-modify', 'pulapka', 'Co zrobi UPDATE bez WHERE?', 'Zmieni WSZYSTKIE wiersze tabeli.'),
];
