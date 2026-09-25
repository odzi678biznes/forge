import { isTauri } from '@/data/create-storage';

/**
 * Wersja przeglądarkowa jako aplikacja na telefonie (PWA).
 *
 * - Service worker trzyma pliki aplikacji, więc po pierwszej wizycie FORGE
 *   otwiera się bez internetu.
 * - Nowa wersja nie podmienia się sama w trakcie nauki: czeka, aż uczeń
 *   kliknie „Odśwież” (Blueprint sek. 14 — aplikacja nie przerywa pracy).
 * - Python (ok. 13 MB) pobiera się dopiero przy pierwszym zadaniu z kodem
 *   albo gdy uczeń sam o to poprosi — nie zużywamy transferu bez pytania.
 *
 * W powłoce Tauri nic z tego nie działa: aplikacja desktopowa ma pliki na
 * dysku, a service worker tylko by przeszkadzał.
 */

export function pwaAvailable(): boolean {
  return (
    !isTauri() &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    // Service worker wymaga https (albo localhost).
    window.isSecureContext
  );
}

let applyUpdate: (() => Promise<void>) | null = null;
let installEvent: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Zdarzenie Chrome/Edge pozwalające pokazać systemowe okno instalacji. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !pwaAvailable()) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Bez domyślnego paska przeglądarki — przycisk jest na ekranie „Twoje dane”.
    e.preventDefault();
    installEvent = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    notify();
  });

  void import('virtual:pwa-register').then(({ registerSW }) => {
    const update = registerSW({
      onNeedRefresh() {
        applyUpdate = () => update(true);
        notify();
      },
      onRegisterError(err: unknown) {
        console.warn('FORGE: nie udało się zarejestrować pracy offline.', err);
      },
    });
  });

  void dropOldPythonCaches();
}

export function subscribePwa(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const updateReady = (): boolean => applyUpdate !== null;
export const canInstall = (): boolean => installEvent !== null;

export function installUpdate(): void {
  void applyUpdate?.();
}

export async function promptInstall(): Promise<void> {
  const e = installEvent;
  if (!e) return;
  await e.prompt();
  await e.userChoice;
  installEvent = null;
  notify();
}

/** Czy strona działa jako zainstalowana aplikacja (ekran początkowy). */
export function runningInstalled(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches;
}

/** Czy strona jest już obsługiwana przez service worker (działa offline). */
export function offlineReady(): boolean {
  return pwaAvailable() && navigator.serviceWorker.controller !== null;
}

// --- Python offline ------------------------------------------------------

/** Te same pliki, które kopiuje `pyodideAssets` w vite.config.ts. */
const PYODIDE_FILES = ['pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

const pyodideUrls = () =>
  PYODIDE_FILES.map((f) => new URL(`${import.meta.env.BASE_URL}pyodide/${f}`, window.location.origin).href);

export async function pythonCached(): Promise<boolean> {
  if (!('caches' in window) || !(await caches.has(__PYODIDE_CACHE__))) return false;
  const cache = await caches.open(__PYODIDE_CACHE__);
  // ignoreVary - jak w regule service workera (vite.config.ts).
  const hits = await Promise.all(pyodideUrls().map((u) => cache.match(u, { ignoreVary: true })));
  return hits.every((h) => h !== undefined);
}

/** Pobiera Pythona do tej samej pamięci, z której korzysta service worker. */
export async function cachePython(): Promise<void> {
  const cache = await caches.open(__PYODIDE_CACHE__);
  await cache.addAll(pyodideUrls());
}

/** Po aktualizacji Pyodide stara kopia (kilkanaście MB) jest bezużyteczna. */
async function dropOldPythonCaches(): Promise<void> {
  if (!('caches' in window)) return;
  for (const key of await caches.keys()) {
    if (key.startsWith('forge-pyodide-') && key !== __PYODIDE_CACHE__) await caches.delete(key);
  }
}

// --- Trwałość danych -----------------------------------------------------

/**
 * Przeglądarka może usunąć dane strony, gdy brakuje miejsca (a Safari na
 * iPhonie — po tygodniu bez wizyty, jeśli strona nie jest na ekranie
 * początkowym). Trwałe przechowywanie chroni przed pierwszym przypadkiem.
 * `null` = przeglądarka tego nie obsługuje.
 */
export async function storagePersisted(): Promise<boolean | null> {
  if (!navigator.storage?.persisted) return null;
  return navigator.storage.persisted();
}

export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}
