// PLIK GENEROWANY — nie edytuj ręcznie.
// Źródło: wzorcowe zapytania zadań SQL; odśwież: npx vite-node scripts/sql-expected.ts
import type { SqlValue } from '@/data/types';

export const SQL_WYNIKI: Record<string, Record<string, SqlValue[][]>> = {
  "db-s-3": {
    "przykładowe dane": [["Celina","Wiśniewska"],["Ewa","Kamińska"]],
    "inna szkoła": [["Igor","Nowak"],["Julia","Kowalska"],["Kamil","Nowak"],["Lena","Mazur"],["Marek","Krawczyk"],["Nina","Kowalska"]],
    "mała szkoła": [["Zofia","Nowak"],["Adam","Nowak"],["Piotr","Nowak"]],
  },
  "db-s-4": {
    "przykładowe dane": [["Eden",1959],["Solaris",1961],["Cyberiada",1965]],
    "inna szkoła": [["Niezwyciężony",1964],["Głos Pana",1968]],
    "mała szkoła": [["Solaris",1961]],
  },
  "db-s-5": {
    "przykładowe dane": [["Kamińska"],["Kowalski"],["Lewandowski"],["Nowak"],["Szymański"],["Wiśniewska"],["Wójcik"],["Zielińska"]],
    "inna szkoła": [["Kowalska"],["Krawczyk"],["Mazur"],["Nowak"]],
    "mała szkoła": [["Kowalska"],["Nowak"]],
  },
  "db-s-6": {
    "przykładowe dane": [["Pan Tadeusz",1834],["Lalka",1890],["Quo vadis",1896]],
    "inna szkoła": [["Dziady",1823],["Konrad Wallenrod",1828],["Balladyna",1839]],
    "mała szkoła": [["Katarynka",1880],["Lalka",1890],["Solaris",1961]],
  },
  "db-s-7": {
    "przykładowe dane": [[5],[8],[9]],
    "inna szkoła": [],
    "mała szkoła": [[1]],
  },
  "db-a-4": {
    "przykładowe dane": [["3A",4],["3B",3],["3C",2]],
    "inna szkoła": [["2A",3],["2B",4]],
    "mała szkoła": [["1A",2],["1B",2]],
  },
  "db-a-5": {
    "przykładowe dane": [["epopeja",1,1834],["fantastyka",4,1959],["powieść",3,1890]],
    "inna szkoła": [["dramat",3,1823],["fantastyka",2,1964],["poemat",1,1828],["powieść",1,1904]],
    "mała szkoła": [["fantastyka",1,1961],["nowela",1,1880],["powieść",1,1890]],
  },
  "db-a-6": {
    "przykładowe dane": [["Stanisław Lem",3]],
    "inna szkoła": [["Adam Mickiewicz",2],["Stanisław Lem",2]],
    "mała szkoła": [["Bolesław Prus",2]],
  },
  "db-a-7": {
    "przykładowe dane": [["3A",2007.3],["3B",2007]],
    "inna szkoła": [["2A",2008.7],["2B",2008.7]],
    "mała szkoła": [],
  },
  "db-j-3": {
    "przykładowe dane": [["Solaris"],["Cyberiada"]],
    "inna szkoła": [["Dziady"]],
    "mała szkoła": [["Solaris"]],
  },
  "db-j-4": {
    "przykładowe dane": [["Anna","Nowak","Cyberiada"],["Celina","Wiśniewska","Wiedźmin"],["Filip","Lewandowski","Ferdydurke"],["Gosia","Zielińska","Solaris"]],
    "inna szkoła": [["Julia","Kowalska","Niezwyciężony"],["Lena","Mazur","Niezwyciężony"],["Nina","Kowalska","Niezwyciężony"],["Kamil","Nowak","Chłopi"]],
    "mała szkoła": [["Zofia","Nowak","Solaris"],["Piotr","Nowak","Lalka"]],
  },
  "db-j-5": {
    "przykładowe dane": [["Anna","Nowak",2],["Bartek","Kowalski",1],["Celina","Wiśniewska",2],["Ewa","Kamińska",1],["Filip","Lewandowski",2],["Gosia","Zielińska",1]],
    "inna szkoła": [["Igor","Nowak",1],["Julia","Kowalska",2],["Kamil","Nowak",1],["Lena","Mazur",1],["Marek","Krawczyk",1],["Nina","Kowalska",1]],
    "mała szkoła": [["Zofia","Nowak",1],["Adam","Nowak",1],["Piotr","Nowak",1]],
  },
  "db-j-6": {
    "przykładowe dane": [["Dawid","Wójcik"],["Hubert","Szymański"],["Iga","Nowak"]],
    "inna szkoła": [["Oskar","Mazur"]],
    "mała szkoła": [["Olga","Kowalska"]],
  },
  "db-j-7": {
    "przykładowe dane": [["Solaris",3]],
    "inna szkoła": [["Niezwyciężony",3]],
    "mała szkoła": [["Solaris",2]],
  },
  "db-m-3": {
    "przykładowe dane": [[1,"Anna","Nowak","3A",2007],[2,"Bartek","Kowalski","3B",2007],[3,"Celina","Wiśniewska","3A",2008],[4,"Dawid","Wójcik","3C",2006],[5,"Ewa","Kamińska","3B",2008],[6,"Filip","Lewandowski","3A",2007],[7,"Gosia","Zielińska","3A",2007],[8,"Hubert","Szymański","3B",2006],[9,"Iga","Nowak","3C",2007],[10,"Jan","Kot","3C",2008]],
    "inna szkoła": [[1,"Igor","Nowak","2A",2009],[2,"Julia","Kowalska","2A",2008],[3,"Kamil","Nowak","2B",2009],[4,"Lena","Mazur","2B",2008],[5,"Marek","Krawczyk","2A",2009],[6,"Nina","Kowalska","2B",2009],[7,"Oskar","Mazur","2B",null],[10,"Jan","Kot","3C",2008]],
    "mała szkoła": [[1,"Zofia","Nowak","1A",2010],[2,"Adam","Nowak","1A",2010],[3,"Olga","Kowalska","1B",null],[4,"Piotr","Nowak","1B",2009],[10,"Jan","Kot","3C",2008]],
  },
  "db-m-4": {
    "przykładowe dane": [[1,2007],[2,2007],[3,2008],[4,2006],[5,2008],[6,2007],[7,2007],[8,2006],[9,2007]],
    "inna szkoła": [[1,2009],[2,2008],[3,2009],[4,2008],[5,2009],[6,2009],[7,2008]],
    "mała szkoła": [[1,2010],[2,2010],[3,2008],[4,2009]],
  },
  "db-m-5": {
    "przykładowe dane": [[2],[4],[5],[6],[8],[9]],
    "inna szkoła": [[1],[2],[3],[4],[5],[6],[7]],
    "mała szkoła": [[1],[2],[3]],
  },
  "db-m-7": {
    "przykładowe dane": [[1,"informatyka",5],[9,"informatyka",5]],
    "inna szkoła": [[1,"informatyka",5],[3,"informatyka",5]],
    "mała szkoła": [[1,"informatyka",5],[2,"informatyka",5],[4,"informatyka",5]],
  },
  "db-m-8": {
    "przykładowe dane": [[1,"2026-09-16"],[2,"2026-12-31"],[3,"2026-09-25"],[4,"2026-10-10"],[5,null],[6,"2026-10-21"],[7,"2026-09-30"],[8,null],[9,null]],
    "inna szkoła": [[1,"2026-11-12"],[2,null],[3,"2026-11-28"],[4,null],[5,"2026-12-15"],[6,null],[7,"2026-12-31"]],
    "mała szkoła": [[1,"2026-12-31"],[2,"2026-10-08"],[3,"2026-12-31"]],
  },
};
