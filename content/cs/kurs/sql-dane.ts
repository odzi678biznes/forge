import type { SqlFixture, SqlRow } from '../../authoring';

/**
 * Bazy danych do zadań SQL: szkolna biblioteka (uczniowie, książki,
 * wypożyczenia) — typowy układ trzech tabel z zadań maturalnych.
 *
 * Każde zadanie działa na trzech bazach: przykładowej (widocznej dla
 * ucznia) i dwóch ukrytych. Ukryte mają inne dane i przypadki brzegowe:
 * powtórzone nazwiska, brak roku urodzenia (NULL), remisy, puste wyniki.
 */

export type Tabela = 'uczniowie' | 'ksiazki' | 'wypozyczenia';

const SCHEMAT: Record<Tabela, string> = {
  uczniowie: `CREATE TABLE uczniowie (
  id INTEGER PRIMARY KEY,
  imie TEXT,
  nazwisko TEXT,
  klasa TEXT,
  rok_ur INTEGER
);`,
  ksiazki: `CREATE TABLE ksiazki (
  id INTEGER PRIMARY KEY,
  tytul TEXT,
  autor TEXT,
  rok_wyd INTEGER,
  gatunek TEXT
);`,
  wypozyczenia: `CREATE TABLE wypozyczenia (
  id INTEGER PRIMARY KEY,
  id_ucznia INTEGER REFERENCES uczniowie(id),
  id_ksiazki INTEGER REFERENCES ksiazki(id),
  data_wyp TEXT,
  data_zwrotu TEXT
);`,
};

const A: Record<Tabela, SqlRow[]> = {
  uczniowie: [
    [1, 'Anna', 'Nowak', '3A', 2007],
    [2, 'Bartek', 'Kowalski', '3B', 2007],
    [3, 'Celina', 'Wiśniewska', '3A', 2008],
    [4, 'Dawid', 'Wójcik', '3C', 2006],
    [5, 'Ewa', 'Kamińska', '3B', 2008],
    [6, 'Filip', 'Lewandowski', '3A', 2007],
    [7, 'Gosia', 'Zielińska', '3A', 2007],
    [8, 'Hubert', 'Szymański', '3B', 2006],
    [9, 'Iga', 'Nowak', '3C', 2007],
  ],
  ksiazki: [
    [1, 'Lalka', 'Bolesław Prus', 1890, 'powieść'],
    [2, 'Pan Tadeusz', 'Adam Mickiewicz', 1834, 'epopeja'],
    [3, 'Solaris', 'Stanisław Lem', 1961, 'fantastyka'],
    [4, 'Cyberiada', 'Stanisław Lem', 1965, 'fantastyka'],
    [5, 'Ferdydurke', 'Witold Gombrowicz', 1937, 'powieść'],
    [6, 'Wiedźmin', 'Andrzej Sapkowski', 1990, 'fantastyka'],
    [7, 'Quo vadis', 'Henryk Sienkiewicz', 1896, 'powieść'],
    [8, 'Eden', 'Stanisław Lem', 1959, 'fantastyka'],
  ],
  wypozyczenia: [
    [1, 1, 3, '2026-09-02', '2026-09-16'],
    [2, 1, 4, '2026-09-20', null],
    [3, 2, 1, '2026-09-05', '2026-09-25'],
    [4, 3, 3, '2026-10-01', '2026-10-10'],
    [5, 3, 6, '2026-10-03', null],
    [6, 5, 2, '2026-10-07', '2026-10-21'],
    [7, 6, 6, '2026-09-12', '2026-09-30'],
    [8, 6, 5, '2026-10-15', null],
    [9, 7, 3, '2026-10-20', null],
  ],
};

const B: Record<Tabela, SqlRow[]> = {
  uczniowie: [
    [1, 'Igor', 'Nowak', '2A', 2009],
    [2, 'Julia', 'Kowalska', '2A', 2008],
    [3, 'Kamil', 'Nowak', '2B', 2009],
    [4, 'Lena', 'Mazur', '2B', 2008],
    [5, 'Marek', 'Krawczyk', '2A', 2009],
    [6, 'Nina', 'Kowalska', '2B', 2009],
    [7, 'Oskar', 'Mazur', '2B', null],
  ],
  ksiazki: [
    [1, 'Dziady', 'Adam Mickiewicz', 1823, 'dramat'],
    [2, 'Wesele', 'Stanisław Wyspiański', 1901, 'dramat'],
    [3, 'Niezwyciężony', 'Stanisław Lem', 1964, 'fantastyka'],
    [4, 'Chłopi', 'Władysław Reymont', 1904, 'powieść'],
    [5, 'Balladyna', 'Juliusz Słowacki', 1839, 'dramat'],
    [6, 'Konrad Wallenrod', 'Adam Mickiewicz', 1828, 'poemat'],
    [7, 'Głos Pana', 'Stanisław Lem', 1968, 'fantastyka'],
  ],
  wypozyczenia: [
    [1, 1, 1, '2026-11-02', '2026-11-12'],
    [2, 2, 3, '2026-11-03', null],
    [3, 2, 1, '2026-11-20', '2026-11-28'],
    [4, 4, 3, '2026-12-01', null],
    [5, 5, 2, '2026-12-05', '2026-12-15'],
    [6, 6, 3, '2026-12-10', null],
    [7, 3, 4, '2026-12-12', null],
  ],
};

const C: Record<Tabela, SqlRow[]> = {
  uczniowie: [
    [1, 'Zofia', 'Nowak', '1A', 2010],
    [2, 'Adam', 'Nowak', '1A', 2010],
    [3, 'Olga', 'Kowalska', '1B', null],
    [4, 'Piotr', 'Nowak', '1B', 2009],
  ],
  ksiazki: [
    [1, 'Solaris', 'Stanisław Lem', 1961, 'fantastyka'],
    [2, 'Lalka', 'Bolesław Prus', 1890, 'powieść'],
    [3, 'Katarynka', 'Bolesław Prus', 1880, 'nowela'],
  ],
  wypozyczenia: [
    [1, 1, 1, '2026-10-05', null],
    [2, 2, 1, '2026-10-06', '2026-10-08'],
    [3, 4, 2, '2026-09-30', null],
  ],
};

/** Struktura bazy z wybranych tabel — w kolejności podanej w zadaniu. */
export function schemat(...tabele: Tabela[]): string {
  return tabele.map((t) => SCHEMAT[t]).join('\n\n');
}

function wybierz(dane: Record<Tabela, SqlRow[]>, tabele: Tabela[]): Record<string, SqlRow[]> {
  return Object.fromEntries(tabele.map((t) => [t, dane[t]]));
}

/** Trzy bazy do zadania: przykładowa (widoczna) i dwie ukryte. */
export function bazy(...tabele: Tabela[]): SqlFixture[] {
  return [
    { name: 'przykładowe dane', data: wybierz(A, tabele) },
    { name: 'inna szkoła', data: wybierz(B, tabele) },
    { name: 'mała szkoła', data: wybierz(C, tabele) },
  ];
}

/** Tabela przykładowych danych jako tekst — do zadań „ile wierszy zwróci zapytanie”. */
export function jakoTekst(tabela: Tabela, kolumny: string[]): string {
  const wiersze = A[tabela].map((w) => w.map((v) => (v === null ? 'NULL' : String(v))));
  const szer = kolumny.map((k, i) => Math.max(k.length, ...wiersze.map((w) => w[i]!.length)));
  const linia = (w: string[]) => w.map((v, i) => v.padEnd(szer[i]!)).join(' | ').trimEnd();
  return [`-- ${tabela}`, linia(kolumny), ...wiersze.map(linia)].join('\n');
}

/** Surowe wiersze przykładowej bazy — do niezależnego wyliczania wyników w `verify`. */
export const PRZYKLAD = A;
