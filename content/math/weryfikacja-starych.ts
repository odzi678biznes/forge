import { VERIFIERS } from '../authoring';

/**
 * Niezależne wyliczenia dla pierwszych zadań kursu (pliki funkcja-kwadratowa,
 * logarytmy, ciagi, trygonometria, geometria-analityczna, prawdopodobienstwo,
 * pochodne). Powstały przed funkcją `numeric()` z polem `verify`, więc ich
 * odpowiedzi nie były sprawdzane rachunkiem. Każde wyrażenie liczy wynik
 * z treści zadania, a test w content/validate.ts porównuje go z odpowiedzią.
 */

const deg = Math.PI / 180;
const C = (n: number, k: number): number => (k === 0 ? 1 : (C(n - 1, k - 1) * n) / k);
const disc = (a: number, b: number, c: number) => b * b - 4 * a * c;

const STARE: Record<string, () => number> = {
  // Funkcja kwadratowa
  'q-disc-1': () => disc(1, -6, 5),
  'q-disc-2': () => disc(2, -3, -5),
  'q-disc-3': () => 16 / 4, // 4^2 - 4m = 0
  // m = 1: równanie liniowe 2x + 1 = 0 (jedno rozwiązanie); m = 2: Δ = 8 - 4m = 0.
  'q-disc-4': () => Math.min(1, 8 / 4),
  'q-vertex-1': () => 8 / 2,
  'q-vertex-2': () => {
    const p = 6 / 2;
    return p * p - 6 * p + 5;
  },
  'q-vertex-3': () => {
    const p = -8 / (2 * -2);
    return -2 * p * p + 8 * p - 3;
  },
  'q-vertex-4': () => (-3 + 7) / 2,
  'q-vieta-1': () => -(-7) / 1, // x1 + x2 = -b/a
  'q-vieta-2': () => -10 / 1, // x1 * x2 = c/a
  'q-vieta-3': () => 5 ** 2 - 2 * 3,

  // Logarytmy i funkcja wykładnicza
  'q-log-b-1': () => Math.log2(32),
  'q-log-b-2': () => Math.log(1 / 9) / Math.log(3),
  'q-log-b-3': () => 5 ** 3,
  'q-log-b-4': () => Math.log(8) / Math.log(1 / 2),
  'q-log-p-1': () => Math.log2(8) + Math.log2(4),
  'q-log-p-2': () => Math.log(54 / 2) / Math.log(3),
  'q-log-p-3': () => Math.log2(8 ** 2),
  'q-log-p-4': () => Math.log(2 * 3) / Math.log(6),
  'q-exp-1': () => Math.log2(16),
  'q-exp-2': () => Math.log(81) / Math.log(3) - 1,
  'q-exp-3': () => Math.log(8) / Math.log(1 / 2),
  'q-exp-4': () => Math.log(8) / Math.log(4),

  // Ciągi
  'q-seq-a-1': () => 3 + 4 * 4,
  'q-seq-a-2': () => ((2 * 2 + 9 * 5) / 2) * 10,
  'q-seq-a-3': () => (27 - 11) / (7 - 3),
  'q-seq-a-4': () => 8 / 2, // 2(x + 4) = x + 3x
  'q-seq-g-1': () => 2 * 3 ** 3,
  'q-seq-g-2': () => (5 * (2 ** 6 - 1)) / (2 - 1),
  'q-seq-g-3': () => Math.sqrt(24 / 6),
  'q-seq-g-4': () => 8 / (1 - 1 / 2),
  'q-seq-l-1': () => 3 / 1,
  'q-seq-l-2': () => 2 / 5,
  'q-seq-l-3': () => 0,
  'q-seq-l-4': () => 4 / 3,

  // Trygonometria
  'q-trig-v-1': () => Math.sin(30 * deg),
  'q-trig-v-2': () => 3 / 5,
  'q-trig-v-3': () => Math.cos(60 * deg) + Math.sin(90 * deg),
  'q-trig-v-4': () => Math.sqrt(1 - (3 / 5) ** 2),
  'q-trig-i-1': () => Math.sin(40 * deg) ** 2 + Math.cos(40 * deg) ** 2,
  'q-trig-i-2': () => 1 - (1 / 3) ** 2,
  'q-trig-i-3': () => (4 / 5) / Math.sqrt(1 - (4 / 5) ** 2),
  'q-trig-i-4': () => {
    const a = 0.7; // dowolny kąt - wynik nie zależy od a
    return (Math.sin(a) + Math.cos(a)) ** 2 - 2 * Math.sin(a) * Math.cos(a);
  },
  'q-trig-e-1': () => Math.asin(1 / 2) / deg,
  'q-trig-e-2': () => Math.acos(1 / 2) / deg,
  'q-trig-e-3': () => Math.atan(1) / deg,
  'q-trig-e-4': () => Math.asin(1) / deg / 2,

  // Geometria analityczna
  'q-geo-d-1': () => Math.hypot(3, 4),
  'q-geo-d-2': () => (-3 + 7) / 2,
  'q-geo-d-3': () => Math.hypot(6 - 2, 2 - -1),
  'q-geo-d-4': () => 2 * 3 - 1,
  'q-geo-l-1': () => (8 - 2) / (3 - 1),
  'q-geo-l-2': () => -1 / 2,
  'q-geo-l-3': () => 1 - 3 * 2,
  'q-geo-l-4': () => -1 / ((3 - 1) / (5 - 1)),
  'q-geo-c-1': () => Math.sqrt(25),
  'q-geo-c-2': () => -3,
  'q-geo-c-3': () => 3 ** 2,
  'q-geo-c-4': () => 6 / 2,

  // Prawdopodobieństwo i kombinatoryka
  'q-prob-k-1': () => 4 * 3 * 2 * 1,
  'q-prob-k-2': () => C(5, 3),
  'q-prob-k-3': () => 5 * 4 * 3,
  'q-prob-k-4': () => 9 * 9 * 8 * 7,
  'q-prob-c-1': () => 3 / 6,
  'q-prob-c-2': () => 6 * 6,
  'q-prob-c-3': () => 6 / 36,
  'q-prob-c-4': () => (4 + 13 - 1) / 52,
  'q-prob-z-1': () => 3 / 5,
  'q-prob-z-2': () => (3 / 5) * (2 / 4),
  'q-prob-z-3': () => C(3, 2) / 2 ** 3,
  'q-prob-z-4': () => 1 - (5 / 6) ** 2,

  // Pochodne
  'q-der-b-1': () => 3 * 2 ** 2,
  'q-der-b-2': () => 6 * 1 ** 2 - 6 * 1,
  'q-der-b-3': () => 2 * 3 - 4,
  'q-der-b-4': () => 6 / 2,
  'q-der-t-1': () => 2 * 3,
  'q-der-t-2': () => 3 * 1 ** 2 - 2,
  'q-der-t-3': () => 4 / 2,
  'q-der-t-4': () => 2 ** 2 - 2 * 2 * 2, // y = f(2) + f'(2)(x - 2) dla x = 0
  'q-der-e-1': () => 8 / 2,
  'q-der-e-2': () => Math.sqrt(3 / 3),
  'q-der-e-3': () => 3 ** 2 - 6 * 3 + 5,
  'q-der-e-4': () => 5 * 5,
};

for (const [id, verify] of Object.entries(STARE)) VERIFIERS.set(id, verify);

