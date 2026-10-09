/** Exact equality on the common domain, not a proof that the domains coincide.
 * A small AST grammar deliberately excludes functions, assignments and TeX.
 * Every coefficient remains a reduced BigInt fraction, including decimal input.
 */
type Fraction = { n: bigint; d: bigint };
type Polynomial = Map<string, Fraction>; // sorted variable letters: xxy means x²y
type Rational = { numerator: Polynomial; denominator: Polynomial };
type Node = { kind: 'number'; text: string } | { kind: 'variable'; name: string }
  | { kind: 'negate'; value: Node }
  | { kind: 'operation'; operator: '+' | '-' | '*' | '/' | '^'; left: Node; right: Node };

const MAX_DEGREE = 6;
const MAX_TERMS = 100;
const MAX_NODES = 256;
const MAX_DEPTH = 32;
const MAX_DIGITS = 160;
const ZERO: Fraction = { n: 0n, d: 1n };
const ONE: Fraction = { n: 1n, d: 1n };

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  while (b) { const remainder = a % b; a = b; b = remainder; }
  return a;
}
function fraction(n: bigint, d = 1n): Fraction {
  if (!d || n.toString().length > MAX_DIGITS || d.toString().length > MAX_DIGITS) throw new Error('coefficient bound');
  if (!n) return ZERO;
  if (d < 0n) { n = -n; d = -d; }
  const common = gcd(n, d);
  return { n: n / common, d: d / common };
}
const addFraction = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
const multiplyFraction = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
const constant = (value: Fraction): Polynomial => new Map(value.n ? [['', value]] : []);

function decimal(text: string): Fraction {
  const match = /^(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!match || text.length > 64) throw new Error('numeric grammar');
  const exponent = Number(match[2] ?? 0);
  if (!Number.isInteger(exponent) || Math.abs(exponent) > 40) throw new Error('decimal exponent bound');
  const parts = match[1]!.split('.');
  const scale = (parts[1]?.length ?? 0) - exponent;
  const digits = BigInt((parts[0] || '0') + (parts[1] ?? ''));
  return scale >= 0 ? fraction(digits, 10n ** BigInt(scale)) : fraction(digits * 10n ** BigInt(-scale));
}

function parse(source: string): Node {
  if (source.length > 1024) throw new Error('source bound');
  const tokens: string[] = [];
  for (let at = 0; at < source.length;) {
    if (/\s/.test(source[at]!)) { at++; continue; }
    const token = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|^[A-Za-z]|^[()+*/^\-]/.exec(source.slice(at));
    if (!token) throw new Error('unsupported token');
    tokens.push(token[0]); at += token[0].length;
    if (tokens.length > MAX_NODES * 2) throw new Error('token bound');
  }
  let at = 0, nodes = 0;
  const node = (value: Node): Node => { if (++nodes > MAX_NODES) throw new Error('AST bound'); return value; };
  const depthCheck = (depth: number) => { if (depth > MAX_DEPTH) throw new Error('AST depth'); };
  function atom(depth: number): Node {
    depthCheck(depth);
    const token = tokens[at++];
    if (token === '(') {
      const value = sum(depth + 1);
      if (tokens[at++] !== ')') throw new Error('unbalanced parentheses');
      return value;
    }
    if (token && /^(?:\d|\.)/.test(token)) return node({ kind: 'number', text: token });
    if (token && /^[A-Za-z]$/.test(token)) return node({ kind: 'variable', name: token });
    throw new Error('missing atom');
  }
  function unary(depth: number): Node {
    depthCheck(depth);
    if (tokens[at] === '+') { at++; return unary(depth + 1); }
    if (tokens[at] === '-') { at++; return node({ kind: 'negate', value: unary(depth + 1) }); }
    let value = atom(depth + 1);
    if (tokens[at] === '^') { at++; value = node({ kind: 'operation', operator: '^', left: value, right: unary(depth + 1) }); }
    return value;
  }
  function product(depth: number): Node {
    let value = unary(depth + 1);
    while (at < tokens.length) {
      const token = tokens[at]!;
      const implicit = /^(?:[A-Za-z(]|\d|\.)/.test(token);
      if (token !== '*' && token !== '/' && !implicit) break;
      if (!implicit) at++;
      value = node({ kind: 'operation', operator: token === '/' ? '/' : '*', left: value, right: unary(depth + 1) });
    }
    return value;
  }
  function sum(depth: number): Node {
    let value = product(depth + 1);
    while (tokens[at] === '+' || tokens[at] === '-') {
      const operator = tokens[at++] as '+' | '-';
      value = node({ kind: 'operation', operator, left: value, right: product(depth + 1) });
    }
    return value;
  }
  // An adjacent word denotes a function/unsupported named constant, not the
  // product of its letters. Single variables and implicit 2x remain supported.
  if (/[A-Za-z]{2,}/.test(source.replace(/\d[eE][+-]?\d+/g, '0'))) throw new Error('unsupported word');
  const result = sum(0);
  if (at !== tokens.length) throw new Error('trailing input');
  return result;
}

function addPolynomial(a: Polynomial, b: Polynomial, sign = 1n): Polynomial {
  const result = new Map(a);
  for (const [term, coefficient] of b) {
    const value = addFraction(result.get(term) ?? ZERO, fraction(sign * coefficient.n, coefficient.d));
    if (value.n) result.set(term, value); else result.delete(term);
    if (result.size > MAX_TERMS) throw new Error('monomial bound');
  }
  return result;
}
function multiplyPolynomial(a: Polynomial, b: Polynomial): Polynomial {
  const result: Polynomial = new Map();
  for (const [left, x] of a) for (const [right, y] of b) {
    const term = [...left, ...right].sort().join('');
    if (term.length > MAX_DEGREE) throw new Error('polynomial degree bound');
    const value = addFraction(result.get(term) ?? ZERO, multiplyFraction(x, y));
    if (value.n) result.set(term, value); else result.delete(term);
    if (result.size > MAX_TERMS) throw new Error('monomial bound');
  }
  return result;
}
function rational(numerator: Polynomial, denominator = constant(ONE)): Rational {
  if (!denominator.size) throw new Error('identically zero denominator');
  return { numerator, denominator };
}
function power(a: Rational, n: number): Rational {
  if (!Number.isInteger(n) || Math.abs(n) > MAX_DEGREE) throw new Error('power bound');
  if (n === 0 && !a.numerator.size) throw new Error('undefined zero power');
  if (n < 0) a = rational(a.denominator, a.numerator);
  let result = rational(constant(ONE));
  for (let i = 0; i < Math.abs(n); i++) result = rational(
    multiplyPolynomial(result.numerator, a.numerator), multiplyPolynomial(result.denominator, a.denominator));
  return result;
}
function normalize(node: Node, depth = 0): Rational {
  if (depth > MAX_DEPTH) throw new Error('normalization depth');
  if (node.kind === 'number') return rational(constant(decimal(node.text)));
  if (node.kind === 'variable') return rational(new Map([[node.name, ONE]]));
  if (node.kind === 'negate') {
    const value = normalize(node.value, depth + 1);
    return rational(multiplyPolynomial(constant(fraction(-1n)), value.numerator), value.denominator);
  }
  const a = normalize(node.left, depth + 1), b = normalize(node.right, depth + 1);
  if (node.operator === '^') {
    if ([...b.numerator.keys(), ...b.denominator.keys()].some(key => key !== '')) throw new Error('variable exponent');
    const numerator = b.numerator.get('') ?? ZERO, denominator = b.denominator.get('')!;
    const exponent = fraction(numerator.n * denominator.d, numerator.d * denominator.n);
    if (exponent.d !== 1n || exponent.n < -6n || exponent.n > 6n) throw new Error('noninteger or excessive power');
    return power(a, Number(exponent.n));
  }
  if (node.operator === '*') return rational(multiplyPolynomial(a.numerator, b.numerator), multiplyPolynomial(a.denominator, b.denominator));
  if (node.operator === '/') return rational(multiplyPolynomial(a.numerator, b.denominator), multiplyPolynomial(a.denominator, b.numerator));
  return rational(addPolynomial(multiplyPolynomial(a.numerator, b.denominator), multiplyPolynomial(b.numerator, a.denominator), node.operator === '-' ? -1n : 1n),
    multiplyPolynomial(a.denominator, b.denominator));
}

/** true/false is exact; null means unsupported or a resource bound was reached.
 * Cross multiplication proves equality only wherever BOTH inputs are defined.
 * It deliberately provides no domain or cancelled-denominator substitutions.
 */
export function exactExpressionIdentity(left: string, right: string): boolean | null {
  try {
    const a = normalize(parse(left)), b = normalize(parse(right));
    return addPolynomial(multiplyPolynomial(a.numerator, b.denominator), multiplyPolynomial(b.numerator, a.denominator), -1n).size === 0;
  } catch { return null; }
}
