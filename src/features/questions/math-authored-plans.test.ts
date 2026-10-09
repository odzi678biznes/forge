import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import katex from 'katex';
import { MATH_CORPUS } from '@content/math';
import { authoredAlternativesDiffer, authoredRelationAlternativesDiffer, authoredMathClassification, authoredMathSteps } from './math-authored-plans';
import { numericValue } from './math-numeric-plans';

const q = (id: string) => MATH_CORPUS.questions.find(q => q.id === id)!;
describe('authored mathematical stages', () => {
  it('rejects equivalent algebra, rational expressions and interval unions as distractors', () => {
    for (const [a, b] of [['x+x', '2x'], ['(x+1)^2', 'x^2+2x+1'], ['(x+1000000)^2', 'x^2+2000000x+1000000000000'], ['\\frac{x}{2}', '0.5x'],
      ['(-2,3)', '(-2,0]\\cup(0,3)'], ['\\{-1,0,2\\}', '\\{2,0,-1\\}']]) expect(authoredAlternativesDiffer(a!, b!), `${a} vs ${b}`).toBe(false);
    for (const [a, b] of [['x^2+2x+1', 'x^2+3x+1'], ['\\frac1{x+1}', '\\frac1{x+2}'],
      ['(-2,3)', '(-2,3]'], ['\\{-1,0,2\\}', '\\{-1,1,2\\}']]) expect(authoredAlternativesDiffer(a!, b!), `${a} vs ${b}`).toBe(true);
    expect(authoredAlternativesDiffer('process.exit()', 'x+1')).toBe(false);
  });
  it('offers concrete expansion, derivative and interval stages without a prose answer quiz', () => {
    expect(authoredMathSteps(q('a-exp-1')).map(s => s.rhs)).toContain('x^2 + 6x + 9');
    expect(authoredMathSteps(q('d-rul-1'))).toMatchObject([{lhs:"f'(x)",rhs:'2x + 1'}]);
    expect(authoredMathSteps(q('w-inq-2'))).toMatchObject([{stageKind:'condition',rhs:'(-2, 1) \\cup (3, +\\infty)'}]);
    expect(authoredMathSteps({...q('a-exp-1'), steps:['Dobrze rozumujesz.', '$x+1=x+2$']})).toEqual([]);
    expect(authoredMathSteps(q('a-cub-2')).map(s=>s.rhs)).toContain('x^3 + 3x^2 + 3x + 1');
    expect(authoredMathSteps(q('a-fac-6')).length).toBeGreaterThanOrEqual(2);
    expect(authoredMathSteps(q('a-exp-8')).map(s=>s.rhs)).toContain('x^2 - 2 + \\frac{1}{x^2}');
  });
  it('keeps reviewed bridges for logarithms, parameter conditions and optimization short and distinct', () => {
    for (const id of ['x-le-3','x-le-7','s-ser-8','s-mix-8','k-prm-6','k-prm-8','t-frm-8','t-eq-4','d-rul-7','d-rul-8','d-opt-7','w-eq-8']) {
      const plan=authoredMathSteps(q(id));
      expect(plan.length,id).toBeGreaterThan(0);
      expect(plan.length,id).toBeLessThanOrEqual(3);
      expect(new Set(plan.map(s=>s.rhs)).size,id).toBe(plan.length);
    }
    expect(authoredMathSteps(q('x-le-3'))[0]?.rhs).toBe('(1, +\\infty)');
    expect(authoredMathSteps(q('k-prm-8')).at(-1)?.rhs).toBe('(0,1)');
    expect(authoredMathSteps(q('t-eq-4')).at(-1)?.rhs).toBe('\\{30,90,150\\}');
    expect(authoredMathSteps(q('d-opt-7')).map(s=>s.rhs)).toEqual(['\\frac{16}{r^2}','2r^2+\\frac{32}{r}','4r-\\frac{32}{r^2}']);
    expect(authoredRelationAlternativesDiffer('x=2','2x=4')).toBe(false);
    expect(authoredRelationAlternativesDiffer('x=2','x=3')).toBe(true);
    expect(authoredRelationAlternativesDiffer('x^2=1','x=1')).toBe(false); // unsupported is never treated as proof of difference
  });
  it('uses actual substitutions and named formulas without calling them universal identities', () => {
    expect(authoredMathSteps(q('g-fig-3'))).toMatchObject([
      {lhs:'P',rhs:'\\frac12 \\cdot 6 \\cdot 5',tags:expect.arrayContaining(['authored-substitution'])},
      {rhs:'15',stageKind:'arithmetic'},
    ]);
    const geometry={...q('g-fig-3'),id:'geometry-formula',steps:['$P=ab/2$.','$V=\\frac13\\pi r^2h$.']};
    const stages=authoredMathSteps(geometry);
    expect(stages).toHaveLength(2);
    expect(stages.every(s=>s.prompt?.startsWith('Który wzór'))).toBe(true);
    expect(stages.every(s=>!s.finalAnswer)).toBe(true);
    expect(authoredAlternativesDiffer('\\log_2 8','3')).toBe(false);
    expect(authoredAlternativesDiffer('\\log_2 8','4')).toBe(true);
    expect(authoredAlternativesDiffer('\\log_2 3^2','2\\log_2 3')).toBe(false);
    expect(authoredAlternativesDiffer('\\log_2 3^2','(\\log_2 3)^2')).toBe(true);
    expect(authoredAlternativesDiffer('\\sin 30^\\circ','\\frac12')).toBe(false);
    expect(authoredAlternativesDiffer('\\sin 30^\\circ','\\sin 60^\\circ')).toBe(true);
    expect(authoredAlternativesDiffer('\\cos^2\\alpha','1-\\sin^2\\alpha')).toBe(false);
    expect(authoredMathSteps(q('n-abs-7')).some(s=>s.rhs.includes('36{,}3'))).toBe(true);
    const incidental={...q('g-fig-3'),format:'choice' as const,answer:'A',choices:['$15$','$16$','$17$','$18$']};
    expect(authoredMathSteps(incidental).every(s=>!s.finalAnswer)).toBe(true);
  });
  it('unpacks compressed geometry and trigonometry without dropping the actual calculations',()=>{
    const expected:Record<string,string[]>={
      'p-circ-3':['90','55'], 'g-fig-5':['1+6-5','2','4','6'],
      'u-vec-8':['\\frac{1+3\\cdot5}{4}','4','7','11'],
      'st-pr-7':['\\frac{6^2\\sqrt3}{4}','9\\sqrt3','90\\sqrt3'],
      'st-adv-5':['\\frac{4^2+4^2}{4}','8','8','2\\sqrt2'],
      'st-adv-7':['10','48','16','3'], 'u-gprf-8':['4\\cdot9','36','6'],
      't-val-3':['\\sqrt5','\\frac2{\\sqrt5}\\cdot\\frac1{\\sqrt5}','\\frac25'],
      't-id-3':['\\frac{\\tan\\alpha+1}{\\tan\\alpha-1}','2'],
    };
    for(const [id,answers] of Object.entries(expected)){
      const stages=authoredMathSteps(q(id));
      expect(stages.map(s=>s.rhs),id).toEqual(answers);
      for(const stage of stages){
        const left=numericValue(stage.lhs),right=numericValue(stage.rhs);
        if(left!==null&&right!==null)expect(left,stage.id).toBeCloseTo(right,9);
      }
    }
  });
  it('inventories all 761 questions and checks every generated choice against its peers', () => {
    const rows = MATH_CORPUS.questions.map(question => {
      const steps = authoredMathSteps(question);
      for (const step of steps) {
        expect(step.options.length, step.id).toBeGreaterThanOrEqual(3);
        expect(step.options.length, step.id).toBeLessThanOrEqual(4);
        expect(step.options.filter(o => o.answer === step.rhs), step.id).toHaveLength(1);
        for (let i = 0; i < step.options.length; i++) {
          const option = step.options[i]!;
          expect(() => katex.renderToString(option.tex, {throwOnError:true,strict:false}), step.id).not.toThrow();
          for (const other of step.options.slice(i + 1)) {
            const differs=step.tags?.includes('authored-arithmetic')
              ? numericValue(option.tex)! !== numericValue(other.tex)!
              : (step.tags?.includes('linear-relation') ? authoredRelationAlternativesDiffer : authoredAlternativesDiffer)(option.tex, other.tex);
            expect(differs, `${step.id}: ${option.tex} / ${other.tex}`).toBe(true);
          }
        }
      }
      const classification = authoredMathClassification(question);
      return {id:question.id, ...classification, authoredSteps:steps.length, kinds:steps.map(s=>s.stageKind),
        coverage:steps.length ? 'authored' : classification.complexity === 'simple' ? 'simple-one-step-candidate' : 'multi-needs-other-plan',
        stageIds:steps.map(s=>s.id)};
    });
    expect(rows).toHaveLength(761);
    expect(new Set(rows.map(r=>r.id)).size).toBe(rows.length);
    const summary = {total:rows.length, authored:rows.filter(r=>r.authoredSteps).length, simpleWithoutAuthored:rows.filter(r=>r.coverage==='simple-one-step-candidate').length,
      multiWithoutAuthored:rows.filter(r=>r.coverage==='multi-needs-other-plan').length};
    console.info(JSON.stringify(summary));
    if (process.env.FORGE_AUTHORED_REPORT) writeFileSync('docs/math-authored-coverage.json', JSON.stringify({scope:'Coverage of authored symbolic stages only; numeric and family solvers are tracked by the integrated plan inventory.',summary,rows},null,2)+'\n');
  }, 60_000);
});
