import { parse, format } from 'mathjs';

export interface Calculation { expression: string; result: string; value: number; variable?: string; id?: string; expressionTex?: string }
const functions = new Set(['sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'log10']);
const operators = new Set(['+', '-', '*', '/', '^']);

/** Deliberately limited grammar: no programs, arrays, property access or arbitrary calls. */
export function normalizeCalculation(input: string): string {
  return input.trim().toLowerCase()
    .replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/÷|:/g, '/')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/do (?:potęgi drugiej|kwadratu)/g, '^2').replace(/do sześcianu/g, '^3')
    .replace(/do potęgi/g, '^').replace(/podzielone przez|dzielone przez/g, '/')
    .replace(/pomnożone przez|razy/g, '*').replace(/plus/g, '+').replace(/minus/g, '-')
    .replace(/równa się/g, '=').replace(/pierwiastek z\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)')
    .replace(/nawias otwarty/g, '(').replace(/nawias zamknięty/g, ')');
}

function parseCalculation(input: string, knownVariables?: ReadonlySet<string>) {
  if (/\blog\s*\([^)]*[,;]/i.test(input)) throw new Error('W log(...) użyj kropki dziesiętnej. Logarytm o innej podstawie zapisz np. log(8)/log(2). Przecinek może oznaczać ułamek albo separator podstawy.');
  const expression = normalizeCalculation(input);
  if (!expression || expression.length > 300) throw new Error('Wpisz działanie do 300 znaków.');
  let source = expression;
  let variable: string | undefined;
  if (source.includes('=')) {
    const assignment = source.match(/^([a-z])\s*=\s*([^=]+)$/);
    if (!assignment || assignment[1] === 'e') throw new Error('To równanie. Zapisz je w brudnopisie i omów z nauczycielem. Kalkulator liczy działania, np. (43-8)/3,5.');
    variable = assignment[1]!;
    source = assignment[2]!;
  }
  if (/[^\da-z\s.+*/^()%-]/.test(source) || (source.match(/[()]/g)?.length ?? 0) > 40)
    throw new Error('Użyj liczb, nawiasów i działań + − × / ^. Pierwiastek: sqrt(16).');
  // A percentage is a number divided by 100; never a remainder operator.
  source = source.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
  // Polish school notation: log means base 10; ln means the natural logarithm.
  source = source.replace(/\blog\s*\(/g, 'log10(').replace(/\bln\s*\(/g, 'log(');
  try {
    const tree = parse(source);
    let nodes = 0;
    tree.traverse(node => {
      if (++nodes > 100) throw new Error('Działanie jest za długie. Rozbij je na mniejsze kroki.');
      if (node.type === 'OperatorNode') {
        if (!operators.has((node as unknown as {op: string}).op)) throw new Error('Nieobsługiwane działanie.');
      } else if (node.type === 'FunctionNode') {
        if (!functions.has((node as unknown as {name: string}).name)) throw new Error('Dostępne funkcje: sqrt, abs, sin, cos, tan, log (podstawa 10), ln.');
      } else if (node.type === 'SymbolNode') {
        const name = (node as unknown as {name: string}).name;
        if (!functions.has(name) && !['pi', 'e'].includes(name) && !(knownVariables ? knownVariables.has(name) : /^[a-df-z]$/.test(name)))
          throw new Error(`Nie znam wartości „${name}”. Najpierw wpisz np. ${/^[a-z]$/.test(name) ? name : 'a'}=3 albo zapisz wyrażenie w brudnopisie.`);
      } else if (!['ConstantNode', 'ParenthesisNode'].includes(node.type)) throw new Error('Ten zapis nie jest działaniem liczbowym.');
    });
    return { expression, tree, ...(variable ? { variable } : {}) };
  } catch (error) {
    if (error instanceof Error && !/Unexpected|Value expected|Parenthesis|End of|Syntax|Undefined/.test(error.message)) throw error;
    throw new Error('Nie mogę odczytać działania. Sprawdź nawiasy i znaki, np. (-6)^2-4*1*5.');
  }
}

/** Syntax-only check for AI transcription: never computes or solves the learner's expression. */
export function isSupportedCalculation(input: string): boolean {
  try { parseCalculation(input); return true; } catch { return false; }
}

export function calculate(input: string, variables: Record<string, number> = {}): Calculation {
  const scope = new Map<string, number>();
  for (const [name, value] of Object.entries(variables)) {
    if (/^[a-df-z]$/.test(name) && Number.isFinite(value)) scope.set(name, value);
  }
  const { expression, tree, variable } = parseCalculation(input, new Set(scope.keys()));
  const value: unknown = tree.evaluate(scope);
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Brak skończonego wyniku rzeczywistego. Sprawdź dzielenie przez zero i dziedzinę.');
  return { expression, expressionTex: `${variable ? variable + "=" : ""}${tree.toTex({parenthesis:"keep"})}`, value, result: format(value, { precision: 14 }), ...(variable ? { variable } : {}) };
}

/** Display only; uses the same restricted syntax as the calculator. */
export function calculationTex(input: string): string { return parseCalculation(input).tree.toTex({parenthesis:'keep'}); }
