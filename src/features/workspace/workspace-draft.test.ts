import { describe, expect, it } from 'vitest';
import { decodeWorkspaceDraft } from './workspace-draft';

const saved = { version: 1, updatedAt: 123, notes: 'Mój pomysł', input: '35/3,5',
  calculations: [{ expression: '43-8', result: '35', value: 35 }],
  steps: { first: '35' }, done: ['first'], activeStep: 1, guided: true };

describe('wznowienie brudnopisu', () => {
  it('zachowuje wcześniejszy zapis bez nowych pól', () => {
    expect(decodeWorkspaceDraft(JSON.stringify(saved))).toEqual(saved);
  });
  it('nie gubi notatek i dobrych rachunków przez jeden uszkodzony wiersz importu', () => {
    const draft = decodeWorkspaceDraft(JSON.stringify({ ...saved, calculations: [null, { expression: 7 }, ...saved.calculations] }));
    expect(draft).toEqual(saved);
  });
  it('pomija uszkodzone opcjonalne dane zamiast blokować wznowienie', () => {
    const draft = decodeWorkspaceDraft(JSON.stringify({ ...saved, teacherWatch: 'tak', usedNotationId: 9,
      calculations: [{ ...saved.calculations[0], expressionTex: { invalid: true } }] }));
    expect(draft).toEqual(saved);
  });
  it('zachowuje zatwierdzony zapis i nadzór nauczyciela', () => {
    const draft = { ...saved, teacherWatch: true, usedNotationId: 'reply-1',
      calculations: [{ ...saved.calculations[0], expressionTex: '43-8' }] };
    expect(decodeWorkspaceDraft(JSON.stringify(draft))).toEqual(draft);
  });
  it.each([null, '{', JSON.stringify({ ...saved, version: 2 }), JSON.stringify({ ...saved, activeStep: -1 })])('odrzuca nieznany lub nieczytelny format %s', text => {
    expect(decodeWorkspaceDraft(text)).toBeNull();
  });
});
