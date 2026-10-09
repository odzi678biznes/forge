import { describe, expect, it } from 'vitest';
import { MATH_CORPUS } from '@content/math/index';
import { grade } from '@/learning-engine/grading';
import { microstepsForQuestion, microstepsReachAnswer, numericMicrostepsForQuestion, directRoutineTags, numericChoices, numericValue, numericTex } from './microsteps';

const question = (id: string) => MATH_CORPUS.questions.find(item => item.id === id)!;
describe('small verified mathematical choices', () => {
  it('parses only safe numeric LaTeX and respects parentheses', () => {
    expect(numericValue('\\frac{1+3}{2^{-1}}')).toBe(8);
    expect(numericValue('4\\sqrt{3}')).toBeCloseTo(Math.sqrt(48));
    expect(numericValue('(-6)^2')).toBe(36);
    expect(numericValue('2000\\cdot1{,}05')).toBe(2100);
    expect(numericValue('\\sqrt[3]{8}')).toBeCloseTo(2);
    expect(numericValue('\\sqrt[3]{-8}')).toBeCloseTo(-2);
    expect(numericValue('\\log_2 8')).toBeCloseTo(3);
    expect(numericValue('\\log_2 3^2')).toBeCloseTo(Math.log2(9));
    expect(numericValue('\\log_{2}{3^2}')).toBeCloseTo(Math.log2(9));
    expect(numericValue('|50-48|')).toBe(2);
    for (const text of ['x+1', '\\text{SQL}', 'process.exit()', '2<3', '1/0']) expect(numericValue(text)).toBeNull();
    expect(numericTex('\\frac{1}{')).toBeNull();
  });
  it('turns sqrt48 into three concrete verified transformations with no answer-length shortcut', () => {
    const plan = microstepsForQuestion(question('n-root-3'));
    expect(microstepsReachAnswer(question('n-root-3'), plan)).toBe(true);
    expect(plan.map(step => step.rhs)).toEqual(['16 \\cdot 3', '\\sqrt{16} \\cdot \\sqrt{3}', '4\\sqrt{3}']);
    for (const step of plan) {
      expect(step.options).toHaveLength(4);
      expect(step.options.filter(option => Math.abs(option.value! - step.value!) < 1e-9)).toHaveLength(1);
      expect(new Set(step.options.map(option => option.tex.replace(/\d+/g, '#'))).size).toBe(1);
    }
  });
  it('keeps decimal probability distractors plausible and inside the probability range', () => {
    for (const answer of ['0.5', '0', '1', '1/6']) {
      const item = {...question('q-disc-1'), skillId:'prob-test', prompt:'Oblicz prawdopodobieństwo zdarzenia.', answer, acceptedVariants:[], commonErrors:[]};
      const options = numericChoices(item);
      expect(options.length).toBeGreaterThanOrEqual(3);
      expect(options.every(option => option.value >= 0 && option.value <= 1)).toBe(true);
      if (answer === '0.5') expect(options.map(option => option.value)).toEqual(expect.arrayContaining([0.4, 0.5, 0.6]));
    }
  });
  it('does not invent steps for symbolic equations, inequalities, code or a false equality', () => {
    const base = question('q-disc-1');
    expect(numericMicrostepsForQuestion({...base, steps: ['$x+3=8$', '$3<5$', '$2+2=5$']})).toEqual([]);
    expect(microstepsForQuestion({...base, format: 'code', steps: ['$2+2=4$']})).toEqual([]);
  });
  it('uses trusted numerical assignment operations without inventing symbolic algebra or quizzing given values', () => {
    const base = question('q-disc-1');
    expect(numericMicrostepsForQuestion({...base, steps: ['$a=1$', '$a=(-5-3)/2$', '$\\Delta=36-20=16$', '$x=y+1$']}))
      .toMatchObject([{ lhs: '(-5-3)/2', rhs: '-4', label: 'a' }, { lhs: '36-20', rhs: '16', label: '\\Delta' }]);
    const withoutSteps = {...base, solution: 'Podstaw: $a=6/2$.'}; delete withoutSteps.steps;
    expect(numericMicrostepsForQuestion(withoutSteps)).toMatchObject([{lhs:'6/2',rhs:'3'}]);
  });
  it('recognises learned small squares without treating big powers or decimal powers as mental arithmetic',()=>{
    const base=question('q-disc-1');
    const make=(prompt:string,answer:string)=>({...base,prompt,answer,acceptedVariants:[]});
    expect(directRoutineTags(make('Oblicz $(-4)^2$.','16'))).toContain('simple-square');
    expect(directRoutineTags(make('Oblicz $3^{12}$.','531441'))).toEqual([]);
    expect(directRoutineTags(make('Oblicz $1{,}05^2$.','1.1025'))).toEqual([]);
    expect(directRoutineTags(make('Oblicz $2^{-3}$.','0.125'))).toContain('simple-negative-power');
  });
  it('all numeric alternatives preserve grading and discard tolerated/accepted correct variants', () => {
    let numeric = 0, numericCovered = 0, stepCovered = 0, choice = 0;
    for (const item of MATH_CORPUS.questions) {
      const options = numericChoices(item);
      if (item.format === 'numeric') numeric++;
      if (item.format === 'choice') choice++;
      if (options.length) {
        numericCovered++;
        expect(options.length).toBeGreaterThanOrEqual(3);
        expect(options.length).toBeLessThanOrEqual(4);
        expect(options.filter(option => grade(item, option.answer).correctness === 'correct')).toHaveLength(1);
        expect(new Set(options.map(option => option.value)).size).toBe(options.length);
      }
      const steps = microstepsForQuestion(item);
      if (steps.length) stepCovered++;
      for (const step of steps) {
        expect(step.options.length).toBeGreaterThanOrEqual(3);
        expect(step.options.length).toBeLessThanOrEqual(4);
        expect(step.options.filter(option=>option.answer===step.rhs)).toHaveLength(1);
        const left=numericValue(step.lhs),right=numericValue(step.rhs);
        if(left!==null&&right!==null) expect(left).toBeCloseTo(right,8);
      }
    }
    console.info(JSON.stringify({ numeric, numericCovered, choice, stepCovered, total: MATH_CORPUS.questions.length }));
    expect(numericCovered).toBe(numeric);
  });
});
