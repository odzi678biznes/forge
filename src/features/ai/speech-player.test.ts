import { describe, expect, it, vi } from 'vitest';
import { EMPTY_PLAYBACK, polishVoices, SpeechPlayer, speechWordStart } from './speech-player';

function voice(name = 'Polski', localService = true, lang = 'pl-PL'): SpeechSynthesisVoice {
  return { name, voiceURI: name, lang, localService, default: false };
}

function setup(text = 'Pierwsze zdanie. Drugie zdanie. Trzecie zdanie.') {
  const synth = { speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn() };
  const utterances: SpeechSynthesisUtterance[] = [];
  let state = EMPTY_PLAYBACK;
  const player = new SpeechPlayer(synth, (content) => {
    const utterance = { text: content } as SpeechSynthesisUtterance;
    utterances.push(utterance);
    return utterance;
  }, (next) => { state = next; });
  player.configure(voice(), 1);
  player.load(text);
  const boundary = (u: SpeechSynthesisUtterance, charIndex: number) => u.onboundary?.({ charIndex } as SpeechSynthesisEvent);
  const end = (u: SpeechSynthesisUtterance) => u.onend?.({} as SpeechSynthesisEvent);
  return { player, synth, utterances, state: () => state, boundary, end };
}

describe('odtwarzacz lekcji', () => {
  it('pauza i wznowienie zachowują tę samą wypowiedź oraz pozycję', () => {
    const test = setup();
    test.player.play();
    const original = test.utterances[0]!;
    test.boundary(original, 9);
    test.player.pause();
    expect(test.state()).toMatchObject({ status: 'paused', position: 9 });
    expect(test.synth.cancel).not.toHaveBeenCalled();
    test.player.play();
    expect(test.synth.speak).toHaveBeenCalledTimes(1);
    expect(test.synth.pause).toHaveBeenCalledTimes(1);
    expect(test.synth.resume).toHaveBeenCalledTimes(2);
    expect(test.state()).toMatchObject({ status: 'playing', position: 9 });
  });

  it('przewija podczas odczytu do całego słowa i ignoruje spóźnione zdarzenia', () => {
    const test = setup();
    test.player.play();
    const original = test.utterances[0]!;
    test.player.seek(19);
    expect(test.utterances[1]?.text).toBe('Drugie zdanie.');
    expect(test.state().position).toBe(17);
    test.boundary(original, 0);
    test.end(original);
    original.onerror?.({} as SpeechSynthesisErrorEvent);
    expect(test.utterances).toHaveLength(2);
    expect(test.state()).toMatchObject({ status: 'playing', position: 17, error: null });
  });

  it('przewijanie na pauzie nie uruchamia dźwięku', () => {
    const test = setup();
    test.player.play();
    test.player.pause();
    test.player.seek(34);
    expect(test.synth.speak).toHaveBeenCalledTimes(1);
    expect(test.state().status).toBe('paused');
    test.player.play();
    expect(test.utterances[1]?.text).toBe('Trzecie zdanie.');
  });

  it('czyta kolejne zdania do końca i można powtórzyć od początku', () => {
    const test = setup();
    test.player.play();
    test.end(test.utterances[0]!);
    expect(test.utterances[1]?.text).toBe('Drugie zdanie.');
    test.end(test.utterances[1]!);
    test.end(test.utterances[2]!);
    expect(test.state()).toMatchObject({ status: 'ended', position: test.state().length });
    test.player.play();
    expect(test.utterances[3]?.text).toBe('Pierwsze zdanie.');
  });

  it('długi tekst dzieli bez utraty słów i z zachowaniem interpunkcji', () => {
    const content = 'słowo '.repeat(220).trim() + '.';
    const test = setup(content);
    test.player.play();
    for (let i = 0; i < 20 && test.state().status === 'playing'; i++) test.end(test.utterances[i]!);
    expect(test.state().status).toBe('ended');
    expect(test.utterances.map((u) => u.text).join(' ')).toBe(content);
    expect(test.utterances.every((u) => u.text.length <= 280)).toBe(true);
  });

  it('zmiana tempa podczas pauzy zachowuje wybrany moment', () => {
    const test = setup();
    test.player.play();
    test.boundary(test.utterances[0]!, 9);
    test.player.pause();
    test.player.configure(voice('Inny naturalny'), 1.25);
    expect(test.synth.speak).toHaveBeenCalledTimes(1);
    test.player.play();
    expect(test.utterances[1]).toMatchObject({ text: 'zdanie.', rate: 1.25, voice: voice('Inny naturalny') });
  });

  it('nowa lekcja i wyjście unieważniają zdarzenia starej wypowiedzi', () => {
    const test = setup();
    test.player.play();
    const original = test.utterances[0]!;
    test.player.load('Nowa lekcja.');
    test.end(original);
    expect(test.state()).toMatchObject({ status: 'idle', position: 0, length: 12 });
    test.player.play();
    test.player.dispose();
    test.end(test.utterances[1]!);
    expect(test.synth.speak).toHaveBeenCalledTimes(2);
    expect(test.synth.cancel).toHaveBeenCalledTimes(2);
  });

  it('błąd jest widoczny, a ponowna próba zachowuje miejsce', () => {
    const test = setup();
    test.player.play();
    const original = test.utterances[0]!;
    test.boundary(original, 9);
    original.onerror?.({} as SpeechSynthesisErrorEvent);
    expect(test.state().error).toContain('wybierz inny głos');
    test.player.play();
    expect(test.utterances[1]?.text).toBe('zdanie.');
    expect(test.state().error).toBeNull();
  });

  it('przesunięcie do końca zatrzymuje odczyt, a reset wraca do zera', () => {
    const test = setup();
    test.player.play();
    test.player.seek(Infinity);
    expect(test.state().position).toBe(0);
    test.player.seek(test.state().length);
    expect(test.state().status).toBe('ended');
    test.player.stop();
    expect(test.state()).toMatchObject({ status: 'idle', position: 0 });
    expect(speechWordStart('pierwsze drugie', 12)).toBe(9);
  });
});

describe('polskie głosy', () => {
  const voices = [voice('System'), voice('Google polski', false), voice('Polski Natural', false), voice('English Natural', true, 'en-US')];
  it('preferuje naturalny głos i udostępnia głosy online tylko na żądanie', () => {
    expect(polishVoices(voices, true).map((v) => v.name)).toEqual(['Polski Natural', 'Google polski', 'System']);
    expect(polishVoices(voices, false).map((v) => v.name)).toEqual(['System']);
  });
});
