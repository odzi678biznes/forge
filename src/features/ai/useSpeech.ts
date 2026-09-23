import { useCallback, useEffect, useState } from 'react';
import { promptToSpeech } from '@/learning-engine/speech';

/**
 * Odczyt treści zadania na głos — Blueprint sek. 11 („synteza mowy systemu").
 *
 * Używamy WYŁĄCZNIE głosów lokalnych (`localService === true`). W Chrome część
 * głosów, w tym polski, to usługa sieciowa Google — wybranie jej wysłałoby
 * treść zadania poza komputer. Brak lokalnego polskiego głosu oznacza brak
 * funkcji, a nie cichą zamianę na głos sieciowy.
 *
 * Nic nie jest czytane samo z siebie: odczyt startuje tylko po kliknięciu
 * (sek. 2: dźwięk opcjonalny).
 */

export interface SpeechState {
  /** null = dostępne; tekst = dlaczego nie. */
  unavailableReason: string | null;
  speaking: boolean;
  speak: (prompt: string) => void;
  stop: () => void;
}

function pickLocalPolishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.localService && v.lang.toLowerCase().startsWith('pl')) ?? null
  );
}

export function useSpeech(): SpeechState {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [checked, setChecked] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const refresh = () => {
      setVoice(pickLocalPolishVoice());
      setChecked(true);
    };
    refresh();
    // Lista głosów bywa ładowana asynchronicznie.
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (prompt: string) => {
      if (!supported || !voice) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(promptToSpeech(prompt));
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [supported, voice],
  );

  let unavailableReason: string | null = null;
  if (!supported) unavailableReason = 'Ta przeglądarka nie ma syntezy mowy.';
  else if (checked && !voice) {
    unavailableReason =
      'Brak lokalnego polskiego głosu. Głosy sieciowe są pomijane, żeby treść nie opuszczała komputera.';
  } else if (!checked) unavailableReason = 'Sprawdzam dostępne głosy…';

  return { unavailableReason, speaking, speak, stop };
}
