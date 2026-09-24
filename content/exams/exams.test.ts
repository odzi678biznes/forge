import { describe, expect, it } from 'vitest';
import { MATH_CORPUS } from '../math';
import { REQUIREMENTS_2024, skillsForCode } from '../math/requirements';
import { MATH_EXAMS } from './math-exams';

const skillIds = new Set(MATH_CORPUS.skills.map((s) => s.id));

describe('wymagania z podstawy programowej 2024', () => {
  it('kody sa unikalne, a kazdy wskazuje istniejace umiejetnosci kursu', () => {
    const codes = REQUIREMENTS_2024.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const r of REQUIREMENTS_2024) {
      expect(r.skills.length, r.code).toBeGreaterThan(0);
      for (const s of r.skills) expect(skillIds.has(s), `${r.code} -> ${s}`).toBe(true);
    }
  });

  it('kazda umiejetnosc kursu (poza dodatkowymi) sluzy jakiemus wymaganiu', () => {
    const covered = new Set(REQUIREMENTS_2024.flatMap((r) => r.skills));
    for (const s of MATH_CORPUS.skills.filter((x) => !x.extra)) {
      expect(covered.has(s.id), `${s.id}: nie odpowiada zadnemu wymaganiu`).toBe(true);
    }
  });
});

describe('katalog arkuszy CKE', () => {
  it('identyfikatory sa unikalne, linki prowadza do cke.gov.pl', () => {
    const ids = MATH_EXAMS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of MATH_EXAMS) {
      expect(e.sheetUrl, e.id).toMatch(/^https:\/\/cke\.gov\.pl\/.+\.pdf$/);
      expect(e.keyUrl, e.id).toMatch(/^https:\/\/cke\.gov\.pl\/.+\.pdf$/);
    }
  });

  it('suma punktow zgadza sie z maksimum arkusza (PR 50, PP 45-50)', () => {
    for (const e of MATH_EXAMS) {
      if (e.level === 'PR') expect(e.maxPoints, e.id).toBe(50);
      else {
        expect(e.maxPoints, e.id).toBeGreaterThanOrEqual(45);
        expect(e.maxPoints, e.id).toBeLessThanOrEqual(50);
      }
    }
  });

  it('numery zadan w arkuszu sa unikalne', () => {
    for (const e of MATH_EXAMS) {
      const nos = e.tasks.map((x) => x.no);
      expect(new Set(nos).size, e.id).toBe(nos.length);
    }
  });

  it('kazde zadanie ma kod wymagania prowadzacy do umiejetnosci kursu', () => {
    for (const e of MATH_EXAMS) {
      for (const task of e.tasks) {
        expect(task.codes.length, `${e.id} zad. ${task.no}`).toBeGreaterThan(0);
        const skills = task.codes.flatMap((c) => skillsForCode(c, e.era));
        expect(skills.length, `${e.id} zad. ${task.no}: ${task.codes.join(', ')}`).toBeGreaterThan(0);
        for (const s of skills) expect(skillIds.has(s), `${e.id} zad. ${task.no} -> ${s}`).toBe(true);
      }
    }
  });
});
