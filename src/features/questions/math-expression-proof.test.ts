import { describe, expect, it } from 'vitest';
import { exactExpressionIdentity } from './math-expression-proof';

describe('bounded exact polynomial/rational identity proof', () => {
  it('expands cubics, products, signs and multivariate polynomials exactly', () => {
    const pairs = [
      ['(x+1)^3', 'x^3+3x^2+3x+1'],
      ['(2x-3)^3', '8x^3-36x^2+54x-27'],
      ['x^3-8', '(x-2)(x^2+2x+4)'],
      ['x^4-2x^3-x^2+2x', 'x(x-2)(x-1)(x+1)'],
      ['(a+b)^3', 'a^3+3a^2*b+3a*b^2+b^3'],
      ['(x+1)^6', 'x^6+6x^5+15x^4+20x^3+15x^2+6x+1'],
      ['-x^2', '-(x*x)'], ['(-x)^2', 'x^2'],
    ];
    for (const [a,b] of pairs) expect(exactExpressionIdentity(a!,b!),`${a} = ${b}`).toBe(true);
    expect(exactExpressionIdentity('(x+1)^3','x^3+3x+1')).toBe(false);
    expect(exactExpressionIdentity('-x^2','(-x)^2')).toBe(false);
  });
  it('uses exact reduced fractions, never floating equality or sampled points', () => {
    expect(exactExpressionIdentity('0.1x+0.2x','0.3x')).toBe(true);
    expect(exactExpressionIdentity('0.1+0.2','0.30000000000000004')).toBe(false);
    expect(exactExpressionIdentity('9007199254740993x','9007199254740992x')).toBe(false);
    expect(exactExpressionIdentity('(x+10000000000000000)^2','x^2+20000000000000000x+100000000000000000000000000000000')).toBe(true);
    expect(exactExpressionIdentity('(x+10000000000000000)^2','x^2+20000000000000000x+100000000000000000000000000000001')).toBe(false);
    expect(exactExpressionIdentity('1e-20*x','x/100000000000000000000')).toBe(true);
    expect(exactExpressionIdentity('x/3+x/6','x/2')).toBe(true);
  });
  it('cross multiplies on the common domain without declaring cancelled points valid', () => {
    expect(exactExpressionIdentity('(x^2-1)/(x-1)','x+1')).toBe(true); // still undefined at x=1 on the left
    expect(exactExpressionIdentity('1/(x+1)+1/(x-1)','2x/(x^2-1)')).toBe(true);
    expect(exactExpressionIdentity('x/(x+1)','1-1/(x+1)')).toBe(true);
    expect(exactExpressionIdentity('x^(-2)','1/x^2')).toBe(true);
    expect(exactExpressionIdentity('(x^2-1)/(x-1)','x-1')).toBe(false);
    expect(exactExpressionIdentity('1/(x-x)','1')).toBeNull();
    expect(exactExpressionIdentity('0^0','1')).toBeNull();
  });
  it('returns unknown for functions, excessive degree/terms/depth and malformed input', () => {
    for (const source of ['sin(x)','sqrt(x)','log(x)','pi*x','x=1','x^y','x^0.5','x^7','x^(-7)',
      '(a+b+c+d+e+f)^6', '('.repeat(40)+'x'+')'.repeat(40), '1e999','x+','x;process.exit()', 'x'.repeat(1100)]) {
      expect(exactExpressionIdentity(source,source),source).toBeNull();
    }
    expect(exactExpressionIdentity('x^3','x^3')).toBe(true);
  });
});
