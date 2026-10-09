import type { Question } from '@/data/types';
import { grade } from '@/learning-engine/grading';
import type { MicroStep } from './math-learning-types';
import { specializedMathPlan } from './math-specialized-plans';
import { authoredMathSteps, authoredMathClassification } from './math-authored-plans';
import { numericTex, numericValue, numericMicrostepsForQuestion } from './math-numeric-plans';
export { numericTex, numericValue, numericMicrostepsForQuestion, numericChoices } from './math-numeric-plans';
export type { MicroOption, MicroStep } from './math-learning-types';
const equal=(a:number,b:number)=>Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b));
export function microstepsReachAnswer(question: Question, steps: MicroStep[]): boolean {
  const last = steps.at(-1);
  if (!last) return false;
  if (last.finalAnswer !== undefined) return grade(question,last.finalAnswer).correctness === 'correct';
  if (last.value === undefined) return false;
  if (/\\%$/.test(last.rhs) && /procent/i.test(question.prompt) && grade(question,String(last.value*100)).correctness==='correct') return true;
  if (question.format === 'numeric') return grade(question, String(last.value)).correctness === 'correct';
  if (question.format !== 'choice') return false;
  const expected = question.choices?.['ABCD'.indexOf(question.answer)];
  const value = expected ? numericValue(expected) : null;
  return value !== null && equal(last.value, value);
}

function arithmeticProfile(step: MicroStep, question: Question): MicroStep {
  const source = numericTex(step.lhs);
  if (!source) return {...step,stageKind:step.stageKind ?? 'transform',complexity:step.complexity ?? 'multi',load:step.load ?? 2};
  const operators=(source.match(/[+*/^]|(?<=\d|\))-/g)??[]).length;
  const square=/^\(?-?\d{1,2}\)?\s*\^\s*\(?2\)?$/.test(source.replace(/\s/g,''));
  const small=(source.match(/\d+(?:\.\d+)?/g)??[]).every(n=>Number.isInteger(Number(n))&&Number(n)<=12);
  const evaluated=numericValue(step.lhs);
  const manageablePower=!source.includes('^') || evaluated!==null && Math.max(Math.abs(evaluated), evaluated===0?0:1/Math.abs(evaluated))<=144;
  const simple=operators<=1 && small && manageablePower && !/sqrt|abs|log|ln|sin|cos|tan/.test(source);
  const tags = square ? ['routine','simple-square'] : source.includes('^') ? ['routine',/\^\(?-/.test(source)?'simple-negative-power':'simple-power']
    : source.includes('*') ? ['routine','simple-product'] : source.includes('/') ? ['routine','simple-divide'] : ['routine','simple-sum'];
  return {...step,stageKind:step.stageKind ?? 'arithmetic', complexity:simple?'simple':'multi',load:Math.max(1,operators),skills:[question.skillId],tags};
}

/** One registry for every mathematical question, shared by training and future sessions. */
export function microstepsForQuestion(question: Question): MicroStep[] {
  const specialized=specializedMathPlan(question);
  if (specialized?.length) return specialized;
  const authored=authoredMathSteps(question);
  if (authored.length) return authored.map(step=>step.value!==undefined ? arithmeticProfile(step,question) : step);
  const numeric=numericMicrostepsForQuestion(question).map(step=>arithmeticProfile(step,question));
  if(numeric.length===1 && numeric[0]?.complexity==='simple' && microstepsReachAnswer(question,numeric) && authoredMathClassification(question).complexity==='simple') return [];
  const last=numeric.at(-1);
  if (last && microstepsReachAnswer(question,numeric)) {
    last.stageKind='final'; last.finalAnswer=question.answer;
  }
  return numeric;
}
export function mathLearningRoute(question: Question) {
  const specialized=specializedMathPlan(question);
  const authored=specialized?.length ? [] : authoredMathSteps(question);
  const numeric=specialized?.length || authored.length ? [] : numericMicrostepsForQuestion(question);
  const selected=specialized?.length ? specialized : authored.length ? authored : numeric;
  const classification=authoredMathClassification(question);
  return {id:question.id,family:question.skillId,route:specialized?.length?'family':authored.length?'authored':numeric.length?'numeric':'direct',
    stages:selected.length,complexity:classification.complexity,needsGuidance:classification.complexity==='multi',reason:classification.reason};
}


export function directRoutineTags(question: Question): string[] {
  let expected: number | null = null;
  if(question.format==='numeric') expected=numericValue(question.answer);
  if(question.format==='choice') { const tex=question.choices?.['ABCD'.indexOf(question.answer)]; if(tex) expected=numericValue(tex.replace(/^\$|\$$/g,'')); }
  if(expected===null) return [];
  const formulas=[...question.prompt.matchAll(/\$([^$]+)\$/g)].map(m=>m[1]!);
  for(const lhs of formulas) {
    const value=numericValue(lhs);
    if(value===null||!equal(value,expected)) continue;
    const profile=arithmeticProfile({id:'routine-check',lhs,rhs:String(value),value,options:[]},question);
    const source=numericTex(lhs)??'';
    if(profile.complexity==='simple' && /[+*/^]|(?<=\d|\))-/g.test(source)) return profile.tags??[];
  }
  return [];
}
