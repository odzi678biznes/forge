import type { MisconceptionTag } from './typy';

/**
 * Katalog typowych błędów w rozumowaniu (pamięć błędów).
 *
 * Zapisujemy PRZYCZYNĘ, nie objaw: „zapomniany warunek Δ > 0” to ten sam błąd
 * w każdym zadaniu z parametrem. Dzięki temu kolejne sesje mogą celować
 * w powtarzające się słabe punkty. Nazwy są dla ucznia, `naprawa` — zasada,
 * którą trzeba sobie przypomnieć.
 */
export interface OpisBledu {
  nazwa: string;
  naprawa: string;
  /** Umiejętność kursu, której dotyczy błąd. */
  skill: string;
}

export const BLEDY: Record<MisconceptionTag, OpisBledu> = {
  'discriminant-nonstrict': {
    nazwa: 'Δ ≥ 0 zamiast Δ > 0',
    naprawa: 'Dwa RÓŻNE rozwiązania wymagają Δ > 0; przy Δ = 0 jest jedno (podwójne).',
    skill: 'quad-discriminant',
  },
  'discriminant-sign-error': {
    nazwa: 'Znak w Δ = b² − 4ac',
    naprawa: 'W wyróżniku jest MINUS 4ac — przy c < 0 iloczyn −4ac staje się dodatni.',
    skill: 'quad-discriminant',
  },
  'coefficient-sign-error': {
    nazwa: 'Znak współczynnika b',
    naprawa: 'Współczynnik b bierzesz razem ze znakiem stojącym przed x: −(m + 2)x daje b = −(m + 2).',
    skill: 'quad-forms',
  },
  'square-of-sum-error': {
    nazwa: '(a + b)² bez wyrazu środkowego',
    naprawa: '(a + b)² = a² + 2ab + b² — nie a² + b².',
    skill: 'quad-discriminant',
  },
  'quadratic-ineq-direction': {
    nazwa: 'Odczyt nierówności kwadratowej',
    naprawa: 'Dla a > 0 parabola jest POD osią między miejscami zerowymi, NAD osią — na zewnątrz.',
    skill: 'quad-ineq',
  },
  'sqrt-forgot-negative': {
    nazwa: 'Zgubione rozwiązanie ujemne',
    naprawa: 'm² > 16 to m > 4 LUB m < −4 — kwadrat liczby ujemnej też jest duży.',
    skill: 'quad-ineq',
  },
  'vieta-sign-error': {
    nazwa: 'Znak we wzorze Viète’a',
    naprawa: 'x₁ + x₂ = −b/a — minus stoi we wzorze, nie tylko w b.',
    skill: 'quad-vieta',
  },
  'sum-of-squares-identity': {
    nazwa: 'x₁² + x₂² bez −2x₁x₂',
    naprawa: 'x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂.',
    skill: 'quad-vieta',
  },
  'vieta-without-delta': {
    nazwa: 'Viète bez warunku istnienia pierwiastków',
    naprawa: 'Wzory Viète’a opisują pierwiastki, które istnieją — najpierw Δ.',
    skill: 'quad-param',
  },
  'forgot-domain-condition': {
    nazwa: 'Zapomniany warunek z początku zadania',
    naprawa: 'Wynik to CZĘŚĆ WSPÓLNA wszystkich warunków — także Δ > 0 z pierwszego kroku.',
    skill: 'quad-param',
  },
  'interval-endpoint-error': {
    nazwa: 'Domknięcie końca przedziału',
    naprawa: 'Nierówność ostra (<, >) — koniec otwarty; nieostra (≤, ≥) — domknięty, o ile nie wyklucza go inny warunek.',
    skill: 'quad-ineq',
  },
  'minus-b-sign': {
    nazwa: 'Znak w −b we wzorze na pierwiastki',
    naprawa: 'x = (−b ± √Δ)/(2a): przy b = 3 licznik zaczyna się od −3.',
    skill: 'quad-discriminant',
  },
  'denominator-2a': {
    nazwa: 'Mianownik 2a we wzorze na pierwiastki',
    naprawa: 'x = (−b ± √Δ)/(2a) — przy a = 2 dzielisz przez 4, nie przez 2.',
    skill: 'quad-discriminant',
  },
  'factored-form-sign': {
    nazwa: 'Miejsca zerowe z postaci iloczynowej',
    naprawa: '(x − 3) zeruje się dla x = 3, (x + 5) — dla x = −5.',
    skill: 'quad-forms',
  },
  'ineq-divide-negative': {
    nazwa: 'Dzielenie nierówności przez liczbę ujemną',
    naprawa: 'Mnożąc lub dzieląc nierówność przez liczbę ujemną, zmieniasz zwrot znaku.',
    skill: 'quad-ineq',
  },
  'step-order': {
    nazwa: 'Krok przed tym, z czego wynika',
    naprawa: 'Każdy krok musi wynikać z poprzedniego — najpierw dane, potem wynik.',
    skill: 'quad-discriminant',
  },
  'vertex-sign-error': {
    nazwa: 'Znak p w postaci kanonicznej',
    naprawa: 'a(x − p)² + q: przy (x + 3)² jest p = −3.',
    skill: 'quad-forms',
  },
  'parabola-direction': {
    nazwa: 'Kierunek ramion paraboli',
    naprawa: 'a > 0 — ramiona w górę, a < 0 — w dół.',
    skill: 'quad-forms',
  },
  'probability-added-instead-of-multiplied': {
    nazwa: 'Dodane zamiast pomnożone prawdopodobieństwa',
    naprawa: 'Zdarzenia po kolei (i, i) — mnożysz wzdłuż gałęzi; dodajesz różne gałęzie (lub).',
    skill: 'prob-conditional',
  },
  'log-product-rule': {
    nazwa: 'log(x + y) zamiast log x + log y',
    naprawa: 'log(xy) = log x + log y; logarytm sumy nie rozkłada się.',
    skill: 'log-properties',
  },
  'power-exponent-add-mult': {
    nazwa: 'Wykładniki: dodawanie a mnożenie',
    naprawa: 'aᵐ·aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ.',
    skill: 'num-powers',
  },
};

export function opisBledu(tag: MisconceptionTag): OpisBledu {
  return BLEDY[tag] ?? { nazwa: tag, naprawa: '', skill: '' };
}
