import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { lektorRecording, lektorStatus, NATURAL_VOICES, type LektorStatus } from '@/features/ai/lektor-client';
import { ustawKodNauczyciela } from '@/nauka/nauczyciel-klient';
import { naturalAudioParts, type LessonAudioPart } from './lesson-audio';

function preferences(): { voice: string; rate: number } {
  try {
    const saved = JSON.parse(localStorage.getItem('forge.lesson-natural.v1') ?? '{}') as Record<string, unknown>;
    return {
      voice: NATURAL_VOICES.some((v) => v.id === saved.voice) ? saved.voice as string : NATURAL_VOICES[0].id,
      rate: typeof saved.rate === 'number' && [0.75, 0.9, 1, 1.1, 1.25, 1.5].includes(saved.rate) ? saved.rate : 1,
    };
  } catch { return { voice: NATURAL_VOICES[0].id, rate: 1 }; }
}

export function NaturalLessonPlayer({ audio, compact }: {
  audio: { text: string; parts: LessonAudioPart[] };
  compact: boolean;
}) {
  const parts = useMemo(() => naturalAudioParts(audio.parts), [audio.parts]);
  const [saved] = useState(preferences);
  const [voice, setVoice] = useState(saved.voice);
  const [rate, setRate] = useState(saved.rate);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<LektorStatus | null>(null);
  const [code, setCode] = useState('');
  const element = useRef<HTMLAudioElement>(null);
  const request = useRef<AbortController | null>(null);
  const statusRequest = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const currentIndex = useRef(0);
  const loadedIndex = useRef(-1);
  const urls = useRef(new Map<string, string>());

  const checkConnection = useCallback(async () => {
    statusRequest.current?.abort();
    const controller = new AbortController();
    statusRequest.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 10_000);
    setConnection(null);
    const result = await lektorStatus(controller.signal);
    window.clearTimeout(timer);
    if (statusRequest.current === controller && !controller.signal.aborted) setConnection(result);
    else if (statusRequest.current === controller) setConnection({ dostepny: false, powod: 'Lektor nie odpowiedział. Spróbuj połączyć ponownie.' });
  }, []);

  useEffect(() => {
    void checkConnection();
    const player = element.current;
    const recordings = urls.current;
    return () => {
      generation.current++;
      request.current?.abort();
      statusRequest.current?.abort();
      statusRequest.current = null;
      player?.pause();
      player?.removeAttribute('src');
      player?.load();
      for (const url of recordings.values()) URL.revokeObjectURL(url);
      recordings.clear();
    };
  }, [checkConnection]);

  useEffect(() => {
    if (element.current) element.current.playbackRate = rate;
    try { localStorage.setItem('forge.lesson-natural.v1', JSON.stringify({ voice, rate })); } catch { /* opcjonalne preferencje */ }
  }, [voice, rate]);

  const prepare = useCallback(async (target: number, autoplay: boolean) => {
    const part = parts[target];
    const player = element.current;
    if (!part || !player) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const id = ++generation.current;
    player.pause();
    player.removeAttribute('src');
    player.load();
    currentIndex.current = target;
    loadedIndex.current = -1;
    setIndex(target);
    setReady(false);
    setPlaying(false);
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => controller.abort(), 55_000);
    try {
      const key = JSON.stringify([voice, part.text]);
      let url = urls.current.get(key);
      if (!url) {
        const recording = await lektorRecording(part.text, voice, controller.signal);
        if (generation.current !== id || controller.signal.aborted) return;
        url = URL.createObjectURL(recording);
        urls.current.set(key, url);
      }
      if (generation.current !== id || controller.signal.aborted) return;
      player.src = url;
      player.load();
      loadedIndex.current = target;
      setReady(true);
      setLoading(false);
      if (autoplay) {
        try { await player.play(); }
        catch {
          if (generation.current === id) setError('Nagranie jest gotowe. Naciśnij odtwarzanie, aby je usłyszeć.');
        }
      }
    } catch (failure) {
      if (generation.current !== id) return;
      setLoading(false);
      setError(controller.signal.aborted ? 'Przygotowanie nagrania trwało zbyt długo. Spróbuj ponownie.'
        : failure instanceof Error ? failure.message : 'Nie udało się przygotować nagrania.');
    } finally { window.clearTimeout(timer); }
  }, [parts, voice]);

  const play = async () => {
    const player = element.current;
    if (!player) return;
    if (playing) { player.pause(); return; }
    if (loadedIndex.current === index && player.getAttribute('src')) {
      setError(null);
      try { await player.play(); } catch { setError('Nie udało się odtworzyć nagrania. Spróbuj ponownie.'); }
    } else await prepare(index, true);
  };

  const cancel = () => {
    generation.current++;
    request.current?.abort();
    element.current?.pause();
    setLoading(false);
  };

  return <section className="lesson-player card" aria-label="Odtwarzacz lekcji">
    <div className="lesson-player__controls">
      <button type="button" className="btn btn--primary lesson-player__play"
        disabled={loading || !connection?.dostepny || parts.length === 0} onClick={() => { void play(); }}>
        <Icon name={playing ? 'pause' : 'play'} size={18} />
        {loading ? 'Przygotowuję nagranie…' : playing ? 'Pauza' : ready ? 'Wznów odczyt'
          : compact ? 'Przeczytaj skrót na głos' : 'Przeczytaj lekcję na głos'}
      </button>
      <div className="lesson-player__skip">
        <button type="button" className="btn btn--small" aria-label="Poprzedni fragment" disabled={index === 0 || !connection?.dostepny}
          onClick={() => { void prepare(index - 1, playing); }}>←</button>
        <button type="button" className="btn btn--small" aria-label="Następny fragment" disabled={index >= parts.length - 1 || !connection?.dostepny}
          onClick={() => { void prepare(index + 1, playing); }}>→</button>
        {loading ? <button type="button" className="link" onClick={cancel}>Anuluj</button>
          : <button type="button" className="link" disabled={!ready} onClick={() => {
            element.current?.pause();
            if (element.current) element.current.currentTime = 0;
          }}>Od początku fragmentu</button>}
      </div>
    </div>

    <p className="lesson-player__audio-label">Przewijaj nagranie w wybranym fragmencie</p>
    <audio ref={element} className="lesson-player__audio" controls preload="metadata" aria-label="Nagranie lekcji"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onLoadedMetadata={() => { if (element.current) element.current.playbackRate = rate; }}
      onError={() => { if (element.current?.getAttribute('src')) setError('Nie udało się odtworzyć nagrania. Spróbuj ponownie.'); }}
      onEnded={() => {
        setPlaying(false);
        if (currentIndex.current + 1 < parts.length) void prepare(currentIndex.current + 1, true);
      }} />

    <div className="lesson-player__settings">
      <label className="lesson-player__part">Czytaj od fragmentu
        <select value={index} onChange={(event) => {
          const target = Number(event.target.value);
          if (connection?.dostepny) void prepare(target, playing);
          else { setIndex(target); currentIndex.current = target; }
        }}>
          {parts.map((part, i) => <option key={i} value={i}>{part.label}</option>)}
        </select>
      </label>
      <label>Głos
        <select value={voice} onChange={(event) => {
          cancel();
          element.current?.removeAttribute('src');
          element.current?.load();
          loadedIndex.current = -1;
          setReady(false);
          setVoice(event.target.value);
        }}>
          {NATURAL_VOICES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </label>
      <label>Tempo
        <select value={rate} onChange={(event) => setRate(Number(event.target.value))}>
          {[0.75, 0.9, 1, 1.1, 1.25, 1.5].map((speed) => <option key={speed} value={speed}>{speed.toLocaleString('pl')}×</option>)}
        </select>
      </label>
    </div>
    {connection === null && <p className="lesson-player__note" role="status">Łączę z naturalnym lektorem…</p>}
    {connection && !connection.dostepny && <div className="lesson-player__connection">
      <p className="lesson-player__note" role="status">{connection.powod}</p>
      {connection.wymagaKodu ? <form className="lesson-player__access" onSubmit={(event) => {
        event.preventDefault(); ustawKodNauczyciela(code); setCode(''); void checkConnection();
      }}>
        <label htmlFor="lektor-access">Kod dostępu do FORGE</label>
        <input id="lektor-access" type="password" value={code} onChange={(event) => setCode(event.target.value)} autoComplete="off" />
        <button type="submit" className="btn btn--small" disabled={!code.trim()}>Połącz lektora</button>
      </form> : <button type="button" className="link" onClick={() => { void checkConnection(); }}>Połącz ponownie</button>}
    </div>}
    {error && <p className="lesson-player__note" role="alert">{error}</p>}
    <p className="lesson-player__note">Naturalny głos jest generowany przez AI. Tekst wybranego fragmentu trafia do Microsoft; potrzebujesz internetu.</p>
    {parts[index] && <details className="lesson-player__transcript">
      <summary>Tekst wybranego fragmentu · {index + 1}/{parts.length}</summary>
      <p>{parts[index]?.text}</p>
    </details>}
  </section>;
}
