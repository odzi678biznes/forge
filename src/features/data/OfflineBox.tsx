import { useEffect, useState, useSyncExternalStore } from 'react';
import { isTauri } from '@/data/create-storage';
import {
  cachePython,
  canInstall,
  offlineReady,
  promptInstall,
  pwaAvailable,
  pythonCached,
  requestPersistence,
  runningInstalled,
  storagePersisted,
  subscribePwa,
} from '@/platform/pwa';

/**
 * Telefon i praca offline — tylko w wersji przeglądarkowej.
 *
 * Wszystko tu jest na żądanie: instalacja, pobranie Pythona (kilkanaście MB)
 * i trwałe przechowywanie. Ekran mówi, co jest gotowe, a czego brakuje.
 */
export function OfflineBox() {
  const installable = useSyncExternalStore(subscribePwa, canInstall);
  const [python, setPython] = useState<'checking' | 'missing' | 'downloading' | 'ready' | 'error'>('checking');
  const [persisted, setPersisted] = useState<boolean | null>(null);

  const available = pwaAvailable();

  useEffect(() => {
    if (!available) return;
    void pythonCached().then((ok) => setPython(ok ? 'ready' : 'missing'));
    void storagePersisted().then(setPersisted);
  }, [available]);

  // Aplikacja desktopowa ma wszystko na dysku — ta sekcja nie ma tam sensu.
  if (isTauri()) return null;

  if (!available) {
    return (
      <section className="data__box">
        <h2>Telefon i praca offline</h2>
        <p>
          Ta strona jest otwarta bez szyfrowania (http), więc przeglądarka nie pozwala jej działać offline
          ani zainstalować się na ekranie początkowym. Otwórz FORGE pod adresem https.
        </p>
      </section>
    );
  }

  const downloadPython = async () => {
    setPython('downloading');
    try {
      await cachePython();
      setPython('ready');
    } catch {
      setPython('error');
    }
  };

  const askPersistence = async () => {
    setPersisted(await requestPersistence());
  };

  const installed = runningInstalled();

  return (
    <section className="data__box">
      <h2>Telefon i praca offline</h2>
      <p>
        Dodana do ekranu początkowego FORGE otwiera się jak zwykła aplikacja i działa bez internetu. Dane
        zostają na tym urządzeniu — postęp z komputera przenosisz synchronizacją powyżej.
      </p>
      <ul className="data__status">
        <li>
          <span className="data__status-label">Działanie bez internetu</span>
          <span>
            {offlineReady()
              ? 'gotowe'
              : 'jeszcze nie — odśwież stronę raz, gdy masz internet'}
          </span>
        </li>
        <li>
          <span className="data__status-label">Na ekranie początkowym</span>
          <span>{installed ? 'tak' : 'nie'}</span>
          {!installed && installable && (
            <button type="button" className="data__secondary" onClick={() => void promptInstall()}>
              Zainstaluj
            </button>
          )}
        </li>
        <li>
          <span className="data__status-label">Python do zadań z informatyki</span>
          <span>
            {python === 'checking' && 'sprawdzam…'}
            {python === 'ready' && 'pobrany, działa offline'}
            {python === 'missing' && 'nie pobrany (ok. 13 MB — najlepiej przez Wi-Fi)'}
            {python === 'downloading' && 'pobieram…'}
            {python === 'error' && 'pobieranie się nie udało — sprawdź internet i spróbuj jeszcze raz'}
          </span>
          {(python === 'missing' || python === 'error') && (
            <button type="button" className="data__secondary" onClick={() => void downloadPython()}>
              Pobierz Pythona
            </button>
          )}
        </li>
        {persisted !== null && (
          <li>
            <span className="data__status-label">Trwałe przechowywanie danych</span>
            <span>{persisted ? 'włączone' : 'wyłączone'}</span>
            {!persisted && (
              <button type="button" className="data__secondary" onClick={() => void askPersistence()}>
                Włącz
              </button>
            )}
          </li>
        )}
      </ul>
      {!installed && !installable && (
        <p>
          Instalacja: na Androidzie w Chrome menu ⋮ → „Zainstaluj aplikację”; na iPhonie w Safari
          „Udostępnij” → „Do ekranu początkowego”.
        </p>
      )}
      <p>
        Przeglądarka może usunąć dane strony, gdy brakuje miejsca, a Safari na iPhonie — po tygodniu bez
        wizyty, jeśli FORGE nie jest na ekranie początkowym. Trwałe przechowywanie i instalacja chronią
        przed tym; kopia JSON od czasu do czasu chroni zawsze.
      </p>
    </section>
  );
}
