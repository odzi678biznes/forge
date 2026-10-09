import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { useSpeech } from '@/features/ai/useSpeech';
import type { LessonAudioPart } from './lesson-audio';
import { NaturalLessonPlayer } from './NaturalLessonPlayer';

type Props = {
  audio: { text: string; parts: LessonAudioPart[] };
  compact: boolean;
};

export function LessonSpeechPlayer(props: Props) {
  const [natural, setNatural] = useState(() => {
    try { return localStorage.getItem('forge.lesson-reader.v1') !== 'system'; } catch { return true; }
  });
  const choose = (online: boolean) => {
    setNatural(online);
    try { localStorage.setItem('forge.lesson-reader.v1', online ? 'natural' : 'system'); } catch { /* opcjonalne preferencje */ }
  };
  return <div className="lesson__reader">
    <div className="lesson__mode" role="group" aria-label="Rodzaj lektora">
      <button type="button" aria-pressed={natural} onClick={() => choose(true)}>Naturalny lektor online</button>
      <button type="button" aria-pressed={!natural} onClick={() => choose(false)}>Głos urządzenia</button>
    </div>
    {natural ? <NaturalLessonPlayer {...props} /> : <SystemLessonPlayer {...props} />}
  </div>;
}

function SystemLessonPlayer({ audio, compact }: Props) {
  const speech = useSpeech({ allowRemote: true });
  const { load } = speech;
  useEffect(() => { load(audio.text); }, [load, audio.text]);

  const position = speech.playback.position;
  const progress = audio.text.length ? Math.round(position / audio.text.length * 100) : 0;
  let index = 0;
  for (let i = 0; i < audio.parts.length; i++) {
    if ((audio.parts[i]?.start ?? Infinity) <= position) index = i;
  }
  const part = audio.parts[index];
  const disabled = speech.unavailableReason !== null || !audio.text;
  const label = speech.speaking ? 'Pauza' : speech.paused ? 'Wznów odczyt'
    : speech.playback.status === 'ended' ? 'Odtwórz ponownie'
      : compact ? 'Przeczytaj skrót na głos' : 'Przeczytaj lekcję na głos';

  return (
    <section className="lesson-player card" aria-label="Odtwarzacz lekcji">
      <div className="lesson-player__controls">
        <button type="button" className="btn btn--primary lesson-player__play"
          disabled={disabled && !speech.speaking} title={speech.unavailableReason ?? undefined}
          onClick={() => speech.speaking ? speech.pause() : speech.speak()}>
          <Icon name={speech.speaking ? 'pause' : 'play'} size={18} /> {label}
        </button>
        <div className="lesson-player__skip">
          <button type="button" className="btn btn--small" aria-label="Poprzedni fragment"
            disabled={index === 0 && position === 0}
            onClick={() => speech.seek(audio.parts[Math.max(0, index - 1)]?.start ?? 0)}>←</button>
          <button type="button" className="btn btn--small" aria-label="Następny fragment"
            disabled={index >= audio.parts.length - 1}
            onClick={() => speech.seek(audio.parts[index + 1]?.start ?? 0)}>→</button>
          <button type="button" className="link" onClick={speech.stop} disabled={position === 0 && !speech.speaking && !speech.paused}>
            Od początku
          </button>
        </div>
      </div>

      <div className="lesson-player__progress">
        <label htmlFor="lesson-speech-position">Miejsce odczytu <span>{progress}%</span></label>
        <input id="lesson-speech-position" type="range" min={0} max={audio.text.length || 1} step={1}
          value={position} disabled={!audio.text}
          aria-valuetext={`${progress} procent, ${part?.label ?? 'początek'}`}
          onChange={(event) => speech.seek(Number(event.target.value))} />
      </div>

      <div className="lesson-player__settings">
        <label className="lesson-player__part">Czytaj od fragmentu
          <select value={index} onChange={(event) => speech.seek(audio.parts[Number(event.target.value)]?.start ?? 0)}>
            {audio.parts.map((item, i) => <option key={item.start} value={i}>{item.label}</option>)}
          </select>
        </label>
        <label>Głos
          <select value={speech.voice?.voiceURI ?? ''} disabled={speech.voices.length === 0}
            onChange={(event) => speech.setVoice(event.target.value)}>
            {speech.voices.length === 0 && <option value="">Brak polskiego głosu</option>}
            {speech.voices.map((voice, i) => <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} · {voice.localService ? 'offline' : 'online'}{i === 0 ? ' · polecany' : ''}
            </option>)}
          </select>
        </label>
        <label>Tempo
          <select value={speech.rate} onChange={(event) => speech.setRate(Number(event.target.value))}>
            {[0.75, 0.9, 1, 1.1, 1.25, 1.5].map((rate) => <option key={rate} value={rate}>{rate.toLocaleString('pl')}×</option>)}
          </select>
        </label>
      </div>
      {speech.unavailableReason && <p className="lesson-player__note" role="status">{speech.unavailableReason}</p>}
      {speech.playback.error && <p className="lesson-player__note" role="alert">{speech.playback.error}</p>}
      {speech.voice && <p className="lesson-player__note">
        {speech.voice.localService
          ? 'Ten głos działa offline. Naturalność zależy od głosów dostępnych na urządzeniu.'
          : 'Głos online wymaga internetu. Czytany tekst jest przesyłany do dostawcy głosu.'}
      </p>}
      {part && <details className="lesson-player__transcript">
        <summary>Tekst wybranego fragmentu · {index + 1}/{audio.parts.length}</summary>
        <p>{part.text}</p>
      </details>}
    </section>
  );
}
