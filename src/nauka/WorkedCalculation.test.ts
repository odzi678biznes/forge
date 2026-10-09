import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WorkedCalculation } from './WorkedCalculation';
import { getWorkedPlan } from './worked-plans';

const plan = getWorkedPlan('mat-2209-pp-1')!;
describe('widoczność wyników w obliczeniach', () => {
  it('na starcie pokazuje tylko bieżący wzór i operacje, a nie przyszłe wyniki', () => {
    const onComplete = vi.fn();
    const html = renderToStaticMarkup(createElement(WorkedCalculation, { plan, storageKey: 'ssr-initial', onComplete }));
    expect(html).toContain('Wybierz odpowiedź');
    expect(html).toContain('data-step="reciprocal"');
    expect(html.match(/class="worked-calculation__option"/g)).toHaveLength(4);
    for (const letter of ['A', 'B', 'C', 'D']) expect(html).toContain(`class="worked-calculation__letter">${letter}</span>`);
    expect(html).toContain('<summary>Więcej</summary>');
    expect(html).not.toContain('<details class="worked-calculation__history" open');
    expect(html.match(/<h2/g)).toHaveLength(1);
    expect(html).not.toContain('<h3');
    expect(html).not.toContain('Oblicz wartość wyrażenia');
    expect(html).not.toContain('\\frac{4}{25}');
    expect(html).not.toContain('\\frac{5}{2}');
    expect(html).not.toContain('Historia obliczeń (');
    for (const removed of ['Jedno zadanie ·', 'Wybierasz przekształcenie.', 'Fazy obliczeń', 'Twój wzór ·', 'Każda operacja zapisuje']) {
      expect(html).not.toContain(removed);
    }
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('seed ujawnia tylko historię już zaliczonych kroków', () => {
    const onComplete = vi.fn();
    const html = renderToStaticMarkup(createElement(WorkedCalculation, { plan, storageKey: 'ssr-seed', initialCompletedSteps: 2, onComplete }));
    expect(html).toContain('\\frac{3}{2}');
    expect(html).not.toContain('\\frac{5}{2}');
    expect(html).not.toContain('\\frac{4}{25}');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('po wszystkich starych rachunkach oferuje tylko zakończenie, bez ponownego pytania o wynik', () => {
    const onComplete = vi.fn();
    const html = renderToStaticMarkup(createElement(WorkedCalculation, { plan, storageKey: 'ssr-full-seed', initialCompletedSteps: 4, onComplete }));
    expect(html).toContain('Zakończ zadanie');
    expect(html).not.toContain('Wybierz odpowiedź');
    expect(html).toContain('\\frac{4}{25}');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('completed=true jest podglądem bez ponownego zaliczania', () => {
    const onComplete = vi.fn();
    const html = renderToStaticMarkup(createElement(WorkedCalculation, { plan, storageKey: 'ssr-completed', completed: true, onComplete }));
    expect(html).toContain('Obliczenia zakończone');
    expect(html).not.toContain('Zakończ zadanie');
    expect(html).not.toContain('Wybierz odpowiedź');
    expect(onComplete).not.toHaveBeenCalled();
  });
});
