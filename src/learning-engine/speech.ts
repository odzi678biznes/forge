/**
 * Zamiana treści zadania na tekst do odczytania na głos — Blueprint sek. 11
 * i 15, Etap 6 („synteza mowy systemu").
 *
 * Treść zawiera LaTeX. Syntezator przeczytałby „dolar, backslash, frac…",
 * więc wzory zamieniamy na polski tekst mówiony. To przybliżenie, nie pełny
 * parser LaTeX-a: obsługuje konstrukcje, które faktycznie występują w
 * korpusie, a resztę upraszcza zamiast czytać znaczniki.
 */

const WORDS: Array<[RegExp, string]> = [
  [/\\%/g, ' procent '],
  [/\\iff/g, ' wtedy i tylko wtedy, gdy '],
  [/\\cup/g, ' suma '],
  [/\\cap/g, ' iloczyn '],
  [/\\mid/g, ' pod warunkiem '],
  [/\\vee/g, ' lub '],
  [/\\perp/g, ' prostopadła do '],
  [/\\parallel/g, ' równoległa do '],
  [/\\angle/g, ' kąt '],
  [/\\in\b/g, ' należy do '],
  [/\\ne\b/g, ' różne od '],
  [/\\ldots/g, ' i tak dalej '],
  [/\\cdot/g, ' razy '],
  [/\\times/g, ' razy '],
  [/\\leq?/g, ' mniejsze lub równe '],
  [/\\geq?/g, ' większe lub równe '],
  [/\\neq/g, ' różne od '],
  [/\\approx/g, ' w przybliżeniu '],
  [/\\Delta/g, ' delta '],
  [/\\alpha/g, ' alfa '],
  [/\\pi/g, ' pi '],
  [/\\sin/g, ' sinus '],
  [/\\cos/g, ' cosinus '],
  [/\\mathrm\{tg\}/g, ' tangens '],
  [/\\circ/g, ' stopni '],
  [/\\infty/g, ' nieskończoność '],
  [/\\langle/g, ' przedział od '],
  [/\\rangle/g, ' '],
  [/\\to/g, ' dąży do '],
];

/** Wykładniki, które mają naturalne polskie nazwy. */
function powerWord(exp: string): string {
  const e = exp.trim();
  if (e === '2') return ' do kwadratu ';
  if (e === '3') return ' do sześcianu ';
  return ` do potęgi ${e} `;
}

/** Zamienia pojedynczy wzór (bez znaków $) na tekst mówiony. */
export function latexToSpeech(tex: string): string {
  // Stopnie zapisuje się jako potęgę, ale czyta jako jednostkę.
  let s = tex
    // Układ równań: kolejne równania czytamy jako wyliczenie.
    .replace(/\\begin\{cases\}|\\end\{cases\}/g, ' ')
    .replace(/\\\\/g, ' oraz ')
    .replace(/&/g, ' ')
    // Klamry zbioru {1, 2, …} — czytamy samą zawartość.
    .replace(/\\\{|\\\}/g, ' ')
    .replace(/\^\s*\{?\\circ\}?/g, ' stopni ')
    // Przecinek dziesiętny w klamrach i odstęp tysięcy.
    .replace(/\{,\}/g, ',')
    .replace(/(\d)\\,(\d)/g, '$1$2')
    // Tekst we wzorze czytamy jak tekst.
    .replace(/\\(?:mathrm|text)\{([^{}]*)\}/g, ' $1 ')
    // Moduł.
    .replace(/\\left\|/g, '|')
    .replace(/\\right\|/g, '|')
    .replace(/\|([^|]+)\|/g, ' wartość bezwzględna z $1 ')
    // Pierwiastek wyższego stopnia.
    .replace(
      /\\sqrt\[(\d+)\]\{([^{}]*)\}/g,
      (_m, n: string, x: string) => ` pierwiastek ${n === '3' ? 'sześcienny' : `stopnia ${n}`} z ${x} `,
    )
    // Wartość funkcji czyta się „f od x". Tylko typowe nazwy funkcji —
    // `x(10-x)` to mnożenie i ma zostać odczytane jako iloczyn.
    .replace(
      /\b([fghP])('?)\(([^()]*)\)/g,
      (_m, name: string, prim: string, arg: string) =>
        ` ${name}${prim ? ' prim' : ''} od ${arg} `,
    );

  // Konstrukcje z argumentami — od najbardziej zagnieżdżonych.
  for (let i = 0; i < 4; i += 1) {
    s = s
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 przez $2 ')
      .replace(/\\sqrt\{([^{}]*)\}/g, ' pierwiastek z $1 ')
      .replace(/\\log_\{?([^{}\s]+)\}?\s*/g, ' logarytm o podstawie $1 z ')
      .replace(/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 po $2 ')
      // Opcjonalny odstęp `\,` przed wykładnikiem, np. `q^{\,n-1}`.
      .replace(/\^\{(?:\\,)?([^{}]*)\}/g, (_m, e: string) => powerWord(e))
      .replace(/\^(\w)/g, (_m, e: string) => powerWord(e))
      .replace(/_\{([^{}]*)\}/g, ' $1 ')
      .replace(/_(\w)/g, ' $1 ');
  }

  for (const [pattern, word] of WORDS) s = s.replace(pattern, word);

  s = s
    .replace(/\\left|\\right|\\big|\\,|\\;|\\!|\\ /g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ') // nieznane polecenie — pomijamy zamiast czytać
    .replace(/[{}]/g, ' ')
    .replace(/'/g, ' prim ')
    .replace(/=/g, ' równa się ')
    .replace(/</g, ' mniejsze od ')
    .replace(/>/g, ' większe od ')
    .replace(/\+/g, ' plus ')
    // Minus tylko między wyrażeniami lub przed liczbą — nie w słowach.
    .replace(/(^|[\s(=])-(?=\s*[\w(])/g, '$1 minus ')
    .replace(/(\w)\s*-\s*(?=[\w(])/g, '$1 minus ')
    .replace(/\(/g, ' ')
    .replace(/\)/g, ' ');

  return s.replace(/\s+/g, ' ').trim();
}

/** Zamienia całą treść zadania: tekst zostaje, wzory w $…$ są „czytane". */
export function promptToSpeech(prompt: string): string {
  return prompt
    // Kod w tekście czytamy jak słowa: `suma_dodatnich(t)` -> "suma dodatnich t".
    .replace(/`([^`]*)`/g, (_m, code: string) => ` ${code.replace(/[_{}()[\]\\$^'"=:,.<>]+/g, ' ')} `)
    .replace(/\$([^$]*)\$/g, (_m, tex: string) => ` ${latexToSpeech(tex)} `)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:?!])/g, '$1')
    .trim();
}
