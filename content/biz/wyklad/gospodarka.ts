import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: gospodarka i państwo. */
export const WYKLAD_GOSPODARKA: Record<string, LessonExplanation> = {
  'biz-macro-indicators': {
    idea: [
      'Gospodarkę kraju ocenia się jak zdrowie pacjenta — kilkoma podstawowymi pomiarami. PKB mówi, ile wytworzono, inflacja — jak szybko rosną ceny, a stopa bezrobocia — ilu chętnych do pracy jej nie ma.',
      'PKB nominalny rośnie z dwóch powodów: bo produkujemy więcej albo bo wszystko drożeje. Tylko ten pierwszy powód oznacza, że żyje się lepiej. Dlatego od wzrostu nominalnego „odejmuje się” inflację i patrzy na wzrost realny.',
      'Inflacja to tempo wzrostu cen, a nie poziom cen. Gdy spada z 10% do 4%, ceny nadal rosną — tylko wolniej. Spadek cen to deflacja. Gospodarka porusza się falami: ożywienie, rozkwit, recesja, depresja — to cykl koniunkturalny.',
    ],
    method: [
      r`Inflacja z koszyka: $\frac{\text{nowa cena} - \text{stara cena}}{\text{stara cena}} \cdot 100\%$.`,
      r`Inflacje kolejnych lat mnóż: $(1 + i_1)(1 + i_2) - 1$, a nie dodawaj.`,
      r`Wzrost realny: $1 + r = \frac{1 + n}{1 + i}$, w przybliżeniu $n - i$.`,
      'Do porównań poziomu życia między krajami używaj PKB na mieszkańca, a nie całego PKB.',
    ],
    check: {
      question: 'Inflacja spadła z 8% do 3%. Czy to znaczy, że ceny spadły?',
      answer: 'Nie — ceny nadal rosną, tylko wolniej. Spadek cen to deflacja.',
    },
  },
  'biz-state-budget': {
    idea: [
      'Budżet państwa działa jak domowy, tylko w miliardach: są dochody (głównie podatki) i wydatki (emerytury, zdrowie, edukacja, wojsko, drogi). Gdy wydatki są większe od dochodów, powstaje deficyt, który trzeba pożyczyć.',
      'Deficyt to „dziura” jednego roku, a dług publiczny to suma wszystkich niespłaconych pożyczek z wielu lat. Każdy deficyt powiększa dług. Nawet gdy deficyt maleje, dług nadal rośnie — tylko wolniej. Maleje dopiero przy nadwyżce budżetowej.',
      'Największe wpływy daje VAT — płaci go każdy przy każdych zakupach, choć nie zawsze o tym myśli. Wysoki dług oznacza wysokie odsetki, a pieniądze na odsetki nie idą na szkoły ani szpitale.',
    ],
    method: [
      'Deficyt (albo nadwyżka) = dochody − wydatki w danym roku.',
      r`Relacja do PKB: $\frac{\text{deficyt lub dług}}{\text{PKB}} \cdot 100\%$ — obie wielkości w tych samych jednostkach.`,
      'Dług na koniec roku = dług z początku roku + deficyt (albo − nadwyżka).',
      'Rozróżnij podatki pośrednie (VAT, akcyza — w cenie towaru) i bezpośrednie (PIT, CIT — od dochodu).',
    ],
    check: {
      question: 'Dochody budżetu wyniosły 600 mld zł, a wydatki 690 mld zł. Ile wynosi deficyt?',
      answer: '90 mld zł — tyle państwo musi pożyczyć i o tyle wzrośnie dług.',
    },
  },
  'biz-fiscal-monetary': {
    idea: [
      'Państwo ma dwa „pokrętła” do sterowania gospodarką. Polityka fiskalna to podatki i wydatki — kręci nią rząd z parlamentem. Polityka monetarna to stopy procentowe i ilość pieniądza — kręci nią bank centralny, w Polsce NBP, a stopy ustala Rada Polityki Pieniężnej.',
      'Podwyżka stóp procentowych podraża kredyty i czyni oszczędzanie bardziej opłacalnym. Ludzie i firmy mniej wydają, popyt słabnie, a ceny rosną wolniej. Dlatego przy wysokiej inflacji RPP stopy podnosi, a w recesji — obniża, żeby pobudzić gospodarkę.',
      'W podatku progresywnym wyższą stawkę płacisz tylko od nadwyżki ponad próg, a nie od całego dochodu. Przy skali 12% i 32% z progiem 120 000 zł ktoś, kto zarobi 121 000 zł, zapłaci 32% tylko od tego ostatniego tysiąca.',
    ],
    method: [
      'Ustal, kto działa: rząd i sejm (fiskalna) czy NBP i RPP (monetarna).',
      'Określ cel: pobudzić gospodarkę (ekspansywna) czy ostudzić inflację (restrykcyjna).',
      r`Podatek wg skali: $12\% \cdot 120\,000 + 32\% \cdot (\text{dochód} - 120\,000)$ dla dochodu powyżej progu.`,
      'Opisz skutek łańcuchem: stopy → koszt kredytu → wydatki → popyt → ceny.',
    ],
    check: {
      question: 'Oblicz podatek według skali 12% do 120 000 zł i 32% od nadwyżki dla dochodu 130 000 zł (bez kwoty wolnej).',
      answer: '14 400 zł + 32% · 10 000 zł = 14 400 zł + 3200 zł = 17 600 zł.',
    },
  },
  'biz-global': {
    idea: [
      'Kurs walutowy to cena jednej waluty wyrażona w innej. Gdy euro kosztuje mniej złotych, złoty się umocnił (aprecjacja); gdy więcej — osłabił się (deprecjacja).',
      'Kto zyskuje, zależy od kierunku pieniędzy. Eksporter dostaje euro i wymienia je na złote — słabszy złoty daje mu więcej złotych za każde euro. Importer płaci w euro — dla niego lepszy jest mocny złoty, bo zagraniczny towar tanieje.',
      'Unia Europejska to wspólny rynek z czterema swobodami: przepływu towarów, usług, kapitału i osób. Polska jest w UE, ale nie w strefie euro — ma własnego złotego, a stopy procentowe nadal ustala RPP.',
    ],
    method: [
      'Ustal, czy firma dostaje walutę (eksporter), czy ją wydaje (importer).',
      'Ustal kierunek zmiany kursu: więcej złotych za euro — złoty słabnie; mniej — złoty się umacnia.',
      'Przelicz: kwota w euro · kurs = kwota w złotych; porównaj przed i po zmianie.',
      'Przy wejściu na rynek zagraniczny uporządkuj formy od najmniej do najbardziej ryzykownej: eksport, licencja, franczyza, joint venture, własna filia.',
    ],
    check: {
      question: 'Złoty osłabił się wobec euro. Kto na tym zyskuje: polski eksporter czy polski importer?',
      answer: 'Eksporter — za każde otrzymane euro dostaje więcej złotych. Importer traci, bo płaci drożej.',
    },
  },
};
