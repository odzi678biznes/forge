/** A short decision in a mathematical solution; no persisted learning evidence lives here. */
export interface MicroOption { tex: string; answer: string; value?: number }
export type MathStageKind = 'arithmetic' | 'transform' | 'condition' | 'domain' | 'final' | 'check';
export interface MicroStep {
  id: string;
  /** Source expression/condition shown or supplied to the teacher. */
  lhs: string;
  /** Exact answer token of the correct option (may be a final A-D letter). */
  rhs: string;
  value?: number;
  options: MicroOption[];
  label?: string;
  prompt?: string;
  stageKind?: MathStageKind;
  /** Number of elementary operations held together, used to choose sensible stage sizes. */
  load?: number;
  skills?: string[];
  tags?: string[];
  complexity?: 'simple' | 'multi';
  /** Set only for a locally validated terminal stage; never for an intermediate coincidence. */
  finalAnswer?: string;
}
export interface NumericOption extends MicroOption { value: number }
export interface NumericMicroStep extends MicroStep { value: number; options: NumericOption[] }
