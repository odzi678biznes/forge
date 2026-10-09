import type { Question } from '@/data/types';
import { grade } from '@/learning-engine/grading';
import { calculate } from '@/features/workspace/calculator';

import type { NumericOption, NumericMicroStep } from './math-learning-types';

/** A deliberately small numeric LaTeX grammar, never a symbolic proof parser. */
export function numericTex(input: string): string | null {
  let text = input.trim().replace(/^\$+|\$+$/g, '').replace(/\\(?:left|right)/g, '')
    .replace(/\\(?:cdot|times)/g, '*').replace(/\\div/g, '/').replace(/\\[,!;]/g, '')
    .replace(/\\pi/g, 'pi').replace(/\{,\}/g, '.').replace(/\\%/g, '%')
    .replace(/\\(sin|cos|tan|ln)/g, '$1');
  const group = (at: number): [string, number] | null => {
    if (text[at] !== '{') return /[0-9]/.test(text[at] ?? '') ? [text[at]!, at+1] : null;
    let depth = 1;
    for (let end = at + 1; end < text.length; end++) {
      if (text[end] === '{') depth++;
      if (text[end] === '}') { depth--; if (depth === 0) return [text.slice(at + 1, end), end + 1]; }
    }
    return null;
  };
  // Rewrite outer commands, recursively validating their arguments.
  for (let attempts = 0; attempts < 20 && /\\(?:[dt]?frac|sqrt)/.test(text); attempts++) {
    const command = /\\([dt]?frac|sqrt)(?:\[([^\]]+)\])?/.exec(text)!;
    const start = command.index;
    const first = group(start + command[0].length);
    if (!first) return null;
    const a = numericTex(first[0]);
    if (!a) return null;
    let replacement = `sqrt(${a})`, end = first[1];
    if(command[1] === 'sqrt' && command[2]) {
      const degree=Number(command[2]); if(!Number.isInteger(degree)||degree<2||degree>20)return null;
      const value=numericValue(first[0]);
      if(value!==null&&value<0) { if(degree%2===0)return null; replacement=`-(abs(${a})^(1/${degree}))`; }
      else replacement=`((${a})^(1/${degree}))`;
    }
    if (command[1] !== 'sqrt') {
      const second = group(end);
      if (!second) return null;
      const b = numericTex(second[0]);
      if (!b) return null;
      replacement = `((${a})/(${b}))`; end = second[1];
    }
    text = text.slice(0, start) + replacement + text.slice(end);
  }
  text=text.replace(/\\log_(?:\{([^}]+)\}|([0-9]))\s*(?:\{([^}]+)\}|\(([^)]+)\)|(\d+(?:\.\d+)?(?:\^(?:\{-?\d+\}|-?\d+))?))/g,
    (_m,bracedBase:string,base:string,bracedArg:string,parenthesizedArg:string,plainArg:string)=>`(log(${bracedArg ?? parenthesizedArg ?? plainArg})/log(${bracedBase ?? base}))`)
    .replace(/\\log/g,'log');
  text=text.replace(/\|([^|]+)\|/g, 'abs($1)');
  text = text.replace(/\{/g, '(').replace(/\}/g, ')');
  if (text.length > 100 || /\\|[=<>;]/.test(text) || !/^[\d\s.,()+*/^%a-z-]+$/.test(text)) return null;
  if (/[a-z]+/g.test(text.replace(/sqrt|pi|log10|log|ln|abs|sin|cos|tan|e/g, ''))) return null;
  return text;
}

export function numericValue(tex: string): number | null {
  const source = numericTex(tex);
  if (!source) return null;
  try { return calculate(source).value; } catch { return null; }
}
const equal = (a: number, b: number) => Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b));
const shape = (text: string) => text.replace(/\d+(?:[.,]\d+)?/g, '#').replace(/\s/g, '');
function mutations(tex: string): string[] {
  const alternatives: string[] = [];
  for (const number of tex.matchAll(/\d+(?:[.,]\d+)?/g)) {
    const decimals = number[0].split(/[.,]/)[1]?.length ?? 0;
    for (const difference of [-1, 1, -2, 2, -10, 10, -20, 20, -100, 100]) {
      const value = Number((Number(number[0].replace(',', '.')) + difference * 10 ** -decimals).toFixed(decimals));
      if (value >= 0) alternatives.push(tex.slice(0, number.index) + String(value) + tex.slice(number.index! + number[0].length));
    }
  }
  return alternatives;
}
function ordered<T>(items: T[], seed: string): T[] {
  let hash = [...seed].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    const at = hash % (i + 1); [result[i], result[at]] = [result[at]!, result[i]!];
  }
  return result;
}

function optionsFor(tex: string, value: number, seed: string, errors: string[], isCorrect: (raw: string) => boolean, probability = false): NumericOption[] {
  const options: NumericOption[] = [{ tex, answer: tex, value }];
  // Same syntactic shape prevents the correct choice being the only long formula.
  const candidates = [...errors.filter(error => shape(error) === shape(tex)), ...mutations(tex), ...(probability ? ['0.25', '0.5', '0.75', '0', '1'] : [])];
  for (const candidate of candidates) {
    if (candidate.length > 60 || isCorrect(candidate)) continue;
    const candidateValue = numericValue(candidate);
    if (candidateValue === null || options.some(option => equal(option.value, candidateValue))) continue;
    if (probability && (candidateValue < 0 || candidateValue > 1)) continue;
    options.push({ tex: candidate, answer: candidate, value: candidateValue });
    if (options.length === 4) break;
  }
  if (probability && Number.isInteger(value)) for (const option of options) option.tex = option.value.toFixed(2);
  return options.length >= 3 ? ordered(options, seed) : [];
}

export function numericChoices(question: Question): NumericOption[] {
  if (question.format !== 'numeric') return [];
  const value = numericValue(question.answer);
  if (value === null || grade(question, question.answer).correctness !== 'correct') return [];
  return optionsFor(question.answer, value, question.id, question.commonErrors.flatMap(error => error.matches),
    raw => grade(question, raw).correctness === 'correct', value >= 0 && value <= 1 && /prawdopodobieństw/i.test(question.prompt));
}


export function numericMicrostepsForQuestion(question: Question): NumericMicroStep[] {
  if (question.format === 'code' || !['numeric', 'choice'].includes(question.format)) return [];
  const steps: NumericMicroStep[] = [];
  const append = (lhs: string, rhs: string, label?: string) => {
    const left = numericValue(lhs), right = numericValue(rhs);
    if (left === null || right === null || !equal(left, right) || lhs === rhs) return;
    if (steps.some(step => step.lhs === lhs && step.rhs === rhs)) return;
    const options = optionsFor(rhs, right, `${question.id}:${steps.length}`, [], raw => {
      const value = numericValue(raw); return value !== null && equal(value, right);
    });
    if (options.length < 3) return;
    steps.push({ id: `${question.id}:micro:${steps.length}`, lhs, rhs, value: right, options, ...(label ? {label} : {}) });
  };
  for (const line of question.steps ?? [question.solution]) {
    for (const formula of line.matchAll(/\$([^$]+)\$/g)) {
      const parts = formula[1]!.split('=').map(part => part.trim());
      if (parts.length < 2 || parts.some(part => part.length > 60)) continue;
      const label = /^(?:[a-zA-Z](?:_\{?\d+\}?)?|\\Delta|Δ)$/.test(parts[0]!) ? parts[0] : undefined;
      // Trusted worked solutions can name a numerical operation (a=..., Δ=...).
      // Compute only an actual operation, not a given value like a=1; never solve
      // a symbolic equation or replace a proof with a numerical example.
      if (label && parts.length === 2) {
        const expression = numericTex(parts[1]!);
        if (expression && /[+*/^]|sqrt|\d\s*-/.test(expression)) {
          try {
            const calculation = calculate(expression);
            // Do not claim an approximate decimal is an exact transformation.
            if (Number(calculation.result) === calculation.value) append(parts[1]!, calculation.result, label);
          } catch { /* Not a supported finite calculation. */ }
        }
      }
      for (let i = 1; i < parts.length; i++) {
        const lhs = parts[i - 1]!, rhs = parts[i]!;
        append(lhs, rhs, label);
        if (steps.length === 8) return steps;
      }
    }
  }
  return steps;
}
