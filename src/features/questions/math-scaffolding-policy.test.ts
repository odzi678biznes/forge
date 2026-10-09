import { describe, expect, it } from 'vitest';
import { emptySkillState, MasteryLevel } from '@/data/types';
import { makeAttempt } from '@/learning-engine/testing';
import { scaffoldingOmissions, readStepEvidence, type ScaffoldingEvidence, type ScaffoldingStep } from './math-scaffolding-policy';
const square: ScaffoldingStep={id:'square',tags:['simple-square','arithmetic'],load:1,complexity:'simple',stageKind:'arithmetic'};
const steps:ScaffoldingStep[]=[{id:'delta',tags:['discriminant'],load:3,complexity:'multi'},square,{id:'final',tags:['simple-square'],load:1,complexity:'simple',stageKind:'final'}];
const trusted=():ScaffoldingEvidence=>({skillId:'s',state:{...emptySkillState('s'),level:MasteryLevel.Independent,independentStreak:3},attempts:[1,2,3].map(i=>makeAttempt({skillId:'s',questionId:`q${i}`,answeredAt:i,correctness:'correct',hintLevel:0})),stageAnswers:{},completed:[]});
const earned=()=>[1,2,3].map(i=>({questionId:`q${i}`,tags:['simple-square'],at:i,correct:true,assisted:false}));
describe('adaptive mathematical scaffolding',()=>{
 it('shortens elementary arithmetic anywhere, preserving strategy and final stages',()=>{
  expect(scaffoldingOmissions(steps,trusted())).toEqual(['square']);
  expect(scaffoldingOmissions([{id:'unknown'}],trusted())).toEqual([]);
  expect(scaffoldingOmissions([{...square,tags:['simple-square','zero']}],trusted())).toEqual([]);
 });
 it('requires real independent attempts, not a label or repeated same question',()=>{
  expect(scaffoldingOmissions(steps,{...trusted(),attempts:[]})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...trusted(),attempts:trusted().attempts.map(a=>({...a,hintLevel:5}))})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...trusted(),attempts:trusted().attempts.map(a=>({...a,questionId:'one'}))})).toEqual([]);
 });
 it('learns a simple tag from three unassisted stages on distinct questions without declaring full mastery',()=>{
  const evidence={...trusted(),state:emptySkillState('s'),attempts:[],stepEvidence:earned()};
  expect(scaffoldingOmissions(steps,evidence)).toEqual(['square']);
  expect(scaffoldingOmissions(steps,{...evidence,stepEvidence:earned().map(row=>({...row,assisted:true}))})).toEqual([]);
  expect(scaffoldingOmissions([{...square,tags:['simple-square','simple-divide']}],evidence)).toEqual([]);
  expect(scaffoldingOmissions([{...square,tags:['simple-negative-power']}],{...evidence,stepEvidence:earned().map(row=>({...row,tags:['simple-power']}))})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...evidence,stepEvidence:earned().map(row=>({...row,questionId:'same'}))})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...evidence,stepEvidence:[...earned(),{...earned()[0]!,at:4,correct:false}]})).toEqual([]);
 });
 it('restores guidance after errors and preserves started stages',()=>{
  const evidence=trusted(); evidence.attempts=[makeAttempt({skillId:'s',answeredAt:4,correctness:'incorrect'}),...evidence.attempts];
  expect(scaffoldingOmissions(steps,evidence)).toEqual([]);
  expect(scaffoldingOmissions(steps,{...trusted(),stageAnswers:{__error:'true'}})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...trusted(),stageAnswers:{square:'4'}})).toEqual([]);
  expect(scaffoldingOmissions(steps,{...trusted(),completed:['square']})).toEqual([]);
 });
 it('ignores malformed persisted stage evidence',()=>{
  expect(readStepEvidence({bad:'{',unknown:'{}',valid:JSON.stringify(earned()[0])})).toEqual([earned()[0]]);
 });
});
