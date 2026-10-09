import { useCallback, useEffect, useRef, useState } from 'react';
import { promptToSpeech } from '@/learning-engine/speech';
import { EMPTY_PLAYBACK, polishVoices, SpeechPlayer } from './speech-player';

const PREFERENCES_KEY = 'forge.lesson-speech.v1';

function preferences(): { voiceURI: string; rate: number } {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? '{}') as Record<string, unknown>;
    return {
      voiceURI: typeof value.voiceURI === 'string' ? value.voiceURI : '',
      rate: typeof value.rate === 'number' && Number.isFinite(value.rate) ? Math.min(1.5, Math.max(0.65, value.rate)) : 1,
    };
  } catch {
    return { voiceURI: '', rate: 1 };
  }
}

/** Głosy online są dostępne w odtwarzaczu lekcji; zadania pozostają lokalne. */
export function useSpeech({ allowRemote = false }: { allowRemote?: boolean } = {}) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [saved] = useState(preferences);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState(allowRemote ? saved.voiceURI : '');
  const [rate, setRate] = useState(allowRemote ? saved.rate : 1);
  const [checked, setChecked] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [playback, setPlayback] = useState(EMPTY_PLAYBACK);
  const player = useRef<SpeechPlayer | null>(null);
  const voice = voices.find((candidate) => candidate.voiceURI === voiceURI) ?? voices[0] ?? null;

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const controller = new SpeechPlayer(synth, (text) => new SpeechSynthesisUtterance(text), setPlayback);
    player.current = controller;
    const refresh = () => {
      setVoices(polishVoices(synth.getVoices(), allowRemote));
      setChecked(true);
    };
    refresh();
    synth.addEventListener('voiceschanged', refresh);
    const connection = () => setOnline(navigator.onLine);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    return () => {
      synth.removeEventListener('voiceschanged', refresh);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
      controller.dispose();
      player.current = null;
    };
  }, [supported, allowRemote]);

  useEffect(() => {
    player.current?.configure(voice, rate);
  }, [voice, rate]);

  useEffect(() => {
    if (!allowRemote) return;
    try {
      // Zapisujemy tylko ustawienia głosu, bez treści ani postępu ucznia.
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ voiceURI: voice?.voiceURI ?? voiceURI, rate }));
    } catch { /* Tryb prywatny może blokować pamięć preferencji. */ }
  }, [allowRemote, voice, voiceURI, rate]);

  const load = useCallback((prompt: string) => player.current?.load(promptToSpeech(prompt)), []);
  const speak = useCallback((prompt?: string) => {
    if (prompt !== undefined) player.current?.load(promptToSpeech(prompt));
    player.current?.play();
  }, []);
  const pause = useCallback(() => player.current?.pause(), []);
  const seek = useCallback((position: number) => player.current?.seek(position), []);
  const stop = useCallback(() => player.current?.stop(), []);

  let unavailableReason: string | null = null;
  if (!supported) unavailableReason = 'Ta przeglądarka nie ma syntezy mowy.';
  else if (!checked) unavailableReason = 'Sprawdzam dostępne głosy…';
  else if (!voice) unavailableReason = allowRemote
    ? 'Brak polskiego głosu. Włącz polski głos w ustawieniach urządzenia lub otwórz lekcję w przeglądarce z polskim głosem.'
    : 'Brak lokalnego polskiego głosu na tym urządzeniu.';
  else if (!voice.localService && !online) unavailableReason = 'Ten głos wymaga internetu. Wybierz głos offline.';

  return {
    unavailableReason, speaking: playback.status === 'playing', paused: playback.status === 'paused',
    playback, voices, voice, rate, setRate, setVoice: setVoiceURI, load, speak, pause, seek, stop,
  };
}
