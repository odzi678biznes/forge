import { describe, expect, it } from 'vitest';
import { decodeLessonDraft, isCardDraft, LESSON_DRAFT_PREFIX, resumeCardDraft } from './lesson-draft';
import { feedEngineStamp, findResumableFeed, isFeedSession, resumeFeedSession, type FeedSession } from './feed-session';
import { LEKCJE } from './lekcje';
import { nowyStan, odpowiedz, type StanNauki } from './silnik';
import { migratePracticeCourse, practiceLesson } from './practice-course';

const lesson = LEKCJE[0]!;
const checkpoint = (): FeedSession => ({
  engineStamp: feedEngineStamp(nowyStan(), lesson), trening: 0, kolejkaTreningu: [...lesson.powtorka], dobrzeTrening: 0,
  biez: { id: lesson.seria[0]!, wynik: null }, ekran: 'karta', historia: [], podglad: null,
  zdarzenie: null, wynikSerii: null, nota: null,
});

describe('wersja robocza regularnej lekcji', () => {
  it('odczytuje niedokończone odpowiedzi wielopolowe i kod bez oceniania', () => {
    const value = { submitted: false, fields: { answers: ['121101', ''], text: 'minus pięć', 'python-code': 'print(2)' } };
    const raw = JSON.stringify({ version: 1, skillId: lesson.skillId, updatedAt: 7, value });
    const restored = decodeLessonDraft(raw, isCardDraft);
    expect(restored?.value).toEqual(value);
    expect(resumeCardDraft(restored!.value, false)).toEqual(value);
  });

  it('przy feedback zachowuje wybrany wynik, ale świeża próba nie dostaje starej odpowiedzi', () => {
    const checked = { submitted: true, fields: { choice: 2, hint: true } };
    expect(resumeCardDraft(checked, true)).toEqual(checked);
    expect(resumeCardDraft(checked, false)).toEqual({ submitted: false, fields: {} });
  });

  it('odrzuca uszkodzone dane, zamiast wyczyścić istniejący profil', () => {
    for (const raw of [undefined, 'null', '{}', '{', '{"version":1,"skillId":"x","updatedAt":1,"value":{"fields":[]}}']) {
      expect(decodeLessonDraft(raw, isCardDraft)).toBeNull();
    }
    expect(isFeedSession({ ...checkpoint(), historia: [null] })).toBe(false);
  });

  it('wznawia feedback wyłącznie przy odpowiadającym mu postępie, bez powtórnego naliczania', () => {
    const result = odpowiedz(nowyStan(), lesson, lesson.seria[0]!, true, 1000, 45000);
    const before = JSON.stringify(result.stan);
    const saved = { ...checkpoint(), engineStamp: feedEngineStamp(result.stan, lesson),
      biez: { id: lesson.seria[0]!, wynik: { poprawna: true, tekst: 'Potęga' } }, zdarzenie: result.zdarzenie };
    expect(resumeFeedSession(saved, result.stan, lesson)?.biez?.wynik?.tekst).toBe('Potęga');
    expect(JSON.stringify(result.stan)).toBe(before);
    expect(resumeFeedSession(saved, nowyStan(), lesson)).toBeNull();
  });

  it('wznawia kolejkę treningu i podgląd; nie proponuje skończonej ani nieaktualnej sesji', () => {
    const saved = checkpoint();
    saved.kolejkaTreningu.reverse();
    saved.historia = [{ id: lesson.seria[0]!, wynik: { poprawna: false, tekst: '3' } }];
    saved.podglad = 0;
    const pref = (s: FeedSession) => ({ key: `${LESSON_DRAFT_PREFIX}feed:trening:${lesson.skillId}`,
      value: JSON.stringify({ version: 1, skillId: lesson.skillId, updatedAt: 4, value: s }) });
    expect(findResumableFeed([pref(saved)], nowyStan(), [lesson])?.tryb).toBe('trening');
    expect(resumeFeedSession(saved, nowyStan(), lesson)?.kolejkaTreningu).toEqual(saved.kolejkaTreningu);
    expect(findResumableFeed([pref({ ...saved, ekran: 'koniec' })], nowyStan(), [lesson])).toBeNull();
    expect(findResumableFeed([pref({ ...saved, engineStamp: 'stary' })], nowyStan(), [lesson])).toBeNull();
    expect(findResumableFeed([pref(saved)], nowyStan(), [LEKCJE[2]!])).toBeNull();
  });

  it('po skróceniu kursu zachowuje dawne odpowiedzi i podgląd bez ponownego naliczania', () => {
    const result = odpowiedz({ wersja: 1, lekcje: {}, powtorki: {} }, lesson, lesson.seria[0]!, true, 1000, 45000);
    const oldCheckpoint: FeedSession = { ...checkpoint(), engineStamp: feedEngineStamp(result.stan, lesson),
      biez: { id: lesson.seria[1]!, wynik: null },
      historia: [{ id: lesson.seria[0]!, wynik: { poprawna: true, tekst: 'Potęga' } }], podglad: 0 };
    const migrated = migratePracticeCourse(result.stan);
    const nextLesson = practiceLesson(lesson.skillId)!;
    const before = JSON.stringify(migrated);
    const restored = resumeFeedSession(oldCheckpoint, migrated, nextLesson);
    expect(restored).toMatchObject({ biez: oldCheckpoint.biez, historia: oldCheckpoint.historia, podglad: 0,
      engineStamp: feedEngineStamp(migrated, nextLesson) });
    expect(restored?.historia).toBe(oldCheckpoint.historia);
    expect(JSON.stringify(migrated)).toBe(before);
    expect(restored?.historia[0]?.wynik).toEqual({ poprawna: true, tekst: 'Potęga' });
    const pref = { key: `${LESSON_DRAFT_PREFIX}feed:nauka:${lesson.skillId}`,
      value: JSON.stringify({ version: 1, skillId: lesson.skillId, updatedAt: 44, value: oldCheckpoint }) };
    expect(findResumableFeed([pref], migrated, [nextLesson])?.skillId).toBe(lesson.skillId);
    expect(result.stan.lekcje[lesson.skillId]?.wyniki[lesson.seria[0]!]?.proby).toBe(1);
  });

  it('zgodność starego kursu nie pozwala wznowić historii z innymi dowodami nauki', () => {
    const result = odpowiedz({ wersja: 1, lekcje: {}, powtorki: {} }, lesson, lesson.seria[0]!, true, 1000, 45000);
    const oldCheckpoint = { ...checkpoint(), engineStamp: feedEngineStamp(result.stan, lesson) };
    const migrated = migratePracticeCourse(result.stan);
    const nextLesson = practiceLesson(lesson.skillId)!;
    const later: StanNauki = structuredClone(migrated);
    later.lekcje[lesson.skillId]!.wyniki[lesson.seria[0]!]!.proby++;
    expect(resumeFeedSession(oldCheckpoint, later, nextLesson)).toBeNull();
    expect(resumeFeedSession(oldCheckpoint, { ...migrated, trening: { 'm1-p1': 9999 } }, nextLesson)).toBeNull();
    expect(resumeFeedSession({ ...oldCheckpoint, engineStamp: '{' }, migrated, nextLesson)).toBeNull();
    expect(resumeFeedSession({ ...oldCheckpoint, historia: [{ id: 'deleted-card', wynik: null }] }, migrated, nextLesson)).toBeNull();
  });
});
