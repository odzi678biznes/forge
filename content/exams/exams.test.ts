import { describe, expect, it } from 'vitest';
import { MATH_CORPUS } from '../math';
import { REQUIREMENTS_2024, skillsForCode } from '../math/requirements';
import { MATH_EXAMS } from './math-exams';
import { CS_EXAMS } from './cs-exams';
import { CS_CORPUS } from '../cs';

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

describe('katalog arkuszy CKE z informatyki', () => {
  const csSkills = new Set(CS_CORPUS.skills.map((s) => s.id));

  it('linki do arkusza, zasad i danych prowadza do cke.gov.pl', () => {
    const ids = CS_EXAMS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of CS_EXAMS) {
      expect(e.subjectId, e.id).toBe('cs');
      expect(e.sheetUrl, e.id).toMatch(/^https:\/\/cke\.gov\.pl\/.+\.pdf$/);
      expect(e.keyUrl, e.id).toMatch(/^https:\/\/cke\.gov\.pl\/.+\.pdf$/);
      expect(e.dataUrl, e.id).toMatch(/^https:\/\/cke\.gov\.pl\/.+\.zip$/);
    }
  });

  it('arkusz ma 50 punktow i 210 minut, jak matura z informatyki', () => {
    for (const e of CS_EXAMS) {
      expect(e.maxPoints, e.id).toBe(50);
      expect(e.minutes, e.id).toBe(210);
      expect(e.level, e.id).toBe('PR');
    }
  });

  it('kazde zadanie prowadzi do istniejacych umiejetnosci kursu informatyki', () => {
    for (const e of CS_EXAMS) {
      const nos = e.tasks.map((x) => x.no);
      expect(new Set(nos).size, e.id).toBe(nos.length);
      for (const task of e.tasks) {
        expect(task.skills?.length ?? 0, `${e.id} zad. ${task.no}`).toBeGreaterThan(0);
        for (const s of task.skills ?? []) expect(csSkills.has(s), `${e.id} zad. ${task.no} -> ${s}`).toBe(true);
      }
    }
  });
});
