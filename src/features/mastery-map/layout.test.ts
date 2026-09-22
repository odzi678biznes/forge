import { describe, expect, it } from 'vitest';
import { makeSkill } from '@/learning-engine/testing';
import { layoutSkills } from './layout';

const at = (layout: ReturnType<typeof layoutSkills>, id: string) =>
  layout.placed.find((p) => p.skill.id === id);

describe('uklad mapy kompetencji', () => {
  it('kompetencja bez warunkow wstepnych lezy w warstwie 0', () => {
    const l = layoutSkills([makeSkill({ id: 'a', prerequisites: [] })]);
    expect(at(l, 'a')?.layer).toBe(0);
  });

  it('kompetencja zalezna lezy pod swoim warunkiem', () => {
    const l = layoutSkills([
      makeSkill({ id: 'a', prerequisites: [] }),
      makeSkill({ id: 'b', prerequisites: ['a'] }),
    ]);
    expect(at(l, 'a')?.layer).toBe(0);
    expect(at(l, 'b')?.layer).toBe(1);
  });

  it('glebokosc liczy sie od NAJGLEBSZEGO warunku', () => {
    const l = layoutSkills([
      makeSkill({ id: 'a', prerequisites: [] }),
      makeSkill({ id: 'b', prerequisites: ['a'] }),
      makeSkill({ id: 'c', prerequisites: ['a', 'b'] }),
    ]);
    expect(at(l, 'c')?.layer).toBe(2);
  });

  it('rodzenstwo dzieli warstwe i zna jej rozmiar', () => {
    const l = layoutSkills([
      makeSkill({ id: 'a', prerequisites: [] }),
      makeSkill({ id: 'b', prerequisites: ['a'] }),
      makeSkill({ id: 'c', prerequisites: ['a'] }),
    ]);
    expect(at(l, 'b')?.layer).toBe(1);
    expect(at(l, 'c')?.layer).toBe(1);
    expect(at(l, 'b')?.layerSize).toBe(2);
    expect(at(l, 'b')?.column).not.toBe(at(l, 'c')?.column);
  });

  it('kazda kompetencja trafia na mape dokladnie raz', () => {
    const skills = ['a', 'b', 'c', 'd'].map((id) =>
      makeSkill({ id, prerequisites: id === 'a' ? [] : ['a'] }),
    );
    const l = layoutSkills(skills);
    expect(l.placed).toHaveLength(4);
    expect(new Set(l.placed.map((p) => p.skill.id)).size).toBe(4);
  });

  it('krawedzie odwzorowuja warunki wstepne', () => {
    const l = layoutSkills([
      makeSkill({ id: 'a', prerequisites: [] }),
      makeSkill({ id: 'b', prerequisites: ['a'] }),
    ]);
    expect(l.edges).toEqual([{ from: 'a', to: 'b' }]);
  });

  it('warunek wskazujacy na nieistniejaca kompetencje nie tworzy krawedzi', () => {
    const l = layoutSkills([makeSkill({ id: 'b', prerequisites: ['nie-ma'] })]);
    expect(l.edges).toEqual([]);
    expect(at(l, 'b')?.layer).toBe(0);
  });

  it('cykl w danych nie zawiesza ukladu', () => {
    const l = layoutSkills([
      makeSkill({ id: 'a', prerequisites: ['b'] }),
      makeSkill({ id: 'b', prerequisites: ['a'] }),
    ]);
    expect(l.placed).toHaveLength(2);
    expect(l.layerCount).toBeGreaterThan(0);
  });

  it('pusta lista daje pusta mape', () => {
    const l = layoutSkills([]);
    expect(l.placed).toEqual([]);
    expect(l.layerCount).toBe(0);
  });
});
