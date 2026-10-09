/** Sterowanie syntezą mowy bez kasowania wypowiedzi podczas pauzy. */
export interface Playback {
  status: 'idle' | 'playing' | 'paused' | 'ended';
  position: number;
  length: number;
  error: string | null;
}

export const EMPTY_PLAYBACK: Playback = { status: 'idle', position: 0, length: 0, error: null };

function voiceScore(voice: SpeechSynthesisVoice): number {
  // Nazwy są jedyną wskazówką jakości udostępnianą przez Web Speech API.
  if (/natural|neural|enhanced|premium/i.test(voice.name)) return 100;
  if (/google/i.test(voice.name)) return 60;
  return voice.default ? 20 : 10;
}

export function polishVoices(voices: SpeechSynthesisVoice[], allowRemote: boolean): SpeechSynthesisVoice[] {
  return voices
    .filter((voice) => /^pl(?:[-_]|$)/i.test(voice.lang) && (allowRemote || voice.localService))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name, 'pl'));
}

/** Przewijanie zawsze zaczyna od całego słowa, również przy końcu tekstu. */
export function speechWordStart(text: string, requested: number): number {
  let position = Math.max(0, Math.min(text.length, Math.round(Number.isFinite(requested) ? requested : 0)));
  if (position === text.length) return position;
  while (position > 0 && /\S/.test(text[position - 1] ?? '') && /\S/.test(text[position] ?? '')) position--;
  while (position < text.length && /\s/.test(text[position] ?? '')) position++;
  return position;
}

function chunkEnd(text: string, start: number): number {
  const limit = Math.min(text.length, start + 280);
  const fragment = text.slice(start, limit);
  // Krótkie wypowiedzi nie są ucinane przez silniki mające limit długości.
  // Zachowujemy interpunkcję, żeby głos robił naturalne pauzy.
  const sentence = /[.!?](?:[”"»])?(?=\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = sentence.exec(fragment))) {
    const prefix = fragment.slice(0, match.index + 1);
    if (/\b(?:np|m\.in|tj|tzn|itp|itd|dr|nr)\.$/i.test(prefix)) continue;
    return start + match.index + match[0].length;
  }
  if (limit === text.length) return limit;
  const space = fragment.lastIndexOf(' ');
  return space > 0 ? start + space : limit;
}

type Synth = Pick<SpeechSynthesis, 'speak' | 'cancel' | 'pause' | 'resume'>;

export class SpeechPlayer {
  private text = '';
  private voice: SpeechSynthesisVoice | null = null;
  private rate = 1;
  private utterance: SpeechSynthesisUtterance | null = null;
  private generation = 0;
  private playback: Playback = { ...EMPTY_PLAYBACK };

  constructor(
    private readonly synth: Synth,
    private readonly createUtterance: (text: string) => SpeechSynthesisUtterance,
    private readonly onChange: (playback: Playback) => void,
  ) {}

  private update(change: Partial<Playback>) {
    this.playback = { ...this.playback, ...change };
    this.onChange(this.playback);
  }

  private cancel() {
    this.generation++;
    const active = this.utterance !== null;
    this.utterance = null;
    if (active) this.synth.cancel();
  }

  load(text: string) {
    if (text === this.text) return;
    this.cancel();
    this.text = text;
    this.update({ ...EMPTY_PLAYBACK, length: text.length });
  }

  configure(voice: SpeechSynthesisVoice | null, rate: number) {
    const nextRate = Math.min(1.5, Math.max(0.65, rate));
    if (voice?.voiceURI === this.voice?.voiceURI && nextRate === this.rate) return;
    this.voice = voice;
    this.rate = nextRate;
    const playing = this.playback.status === 'playing';
    this.cancel();
    if (playing) this.startAt(this.playback.position);
  }

  play() {
    if (!this.voice || !this.text) return;
    if (this.playback.status === 'playing') return;
    if (this.playback.status === 'paused' && this.utterance) {
      this.update({ status: 'playing', error: null });
      this.synth.resume();
      return;
    }
    this.startAt(this.playback.position >= this.text.length ? 0 : this.playback.position);
  }

  pause() {
    if (this.playback.status !== 'playing') return;
    this.update({ status: 'paused' });
    this.synth.pause();
  }

  seek(position: number) {
    const playing = this.playback.status === 'playing';
    const paused = this.playback.status === 'paused';
    this.cancel();
    const target = speechWordStart(this.text, position);
    this.update({ position: target, status: target >= this.text.length ? 'ended' : paused ? 'paused' : 'idle', error: null });
    if (playing && target < this.text.length) this.startAt(target);
  }

  stop() {
    this.cancel();
    this.update({ position: 0, status: 'idle', error: null });
  }

  dispose() {
    this.cancel();
  }

  private startAt(requested: number) {
    if (!this.voice) return;
    const start = speechWordStart(this.text, requested);
    if (start >= this.text.length) {
      this.update({ position: this.text.length, status: 'ended' });
      return;
    }
    const end = chunkEnd(this.text, start);
    const utterance = this.createUtterance(this.text.slice(start, end));
    const generation = this.generation;
    this.utterance = utterance; // Niektóre silniki wymagają żywej referencji.
    utterance.voice = this.voice;
    utterance.lang = this.voice.lang;
    utterance.rate = this.rate;
    const current = () => generation === this.generation && this.utterance === utterance;
    utterance.onboundary = (event) => {
      if (current() && this.playback.status === 'playing') {
        this.update({ position: Math.min(end, start + event.charIndex) });
      }
    };
    utterance.onend = () => {
      if (!current()) return;
      this.utterance = null;
      this.update({ position: end });
      if (end >= this.text.length) this.update({ status: 'ended' });
      else if (this.playback.status === 'playing') this.startAt(end);
    };
    utterance.onerror = () => {
      if (!current()) return;
      this.utterance = null;
      this.update({ status: 'idle', error: 'Nie udało się odczytać tekstu. Spróbuj ponownie lub wybierz inny głos.' });
    };
    this.update({ position: start, status: 'playing', error: null });
    // cancel() nie zawsze usuwa stan pauzy z globalnego syntezatora.
    this.synth.resume();
    this.synth.speak(utterance);
  }
}
