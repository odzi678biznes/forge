import { describe, expect, it } from 'vitest';
import { splitMath } from './Math';
import { promptToSpeech } from '@/learning-engine/speech';

describe('podzial tekstu na wzory i kod', () => {
  it('rozpoznaje wzory w dolarach', () => {
    expect(splitMath('Oblicz $x^2$.')).toEqual([
      { text: 'Oblicz ', math: false },
      { text: 'x^2', math: true },
      { text: '.', math: false },
    ]);
  });

  it('kod w odwrotnych apostrofach jest pokazywany doslownie, nawet z dolarem w srodku', () => {
    expect(splitMath('Napisz `koszt($x)` i policz $2+2$')).toEqual([
      { text: 'Napisz ', math: false },
      { text: 'koszt($x)', math: false, code: true },
      { text: ' i policz ', math: false },
      { text: '2+2', math: true },
    ]);
  });

  it('niesparowany apostrof zostaje zwyklym tekstem', () => {
    expect(splitMath('a ` b')).toEqual([{ text: 'a ` b', math: false }]);
  });

  it('kod jest czytany na glos jak slowa', () => {
    expect(promptToSpeech('Napisz funkcję `suma_dodatnich(t)`.')).toBe('Napisz funkcję suma dodatnich t.');
  });
});
