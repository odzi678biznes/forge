/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

/**
 * Pliki interpretera Pythona (Pyodide) kopiowane do public/pyodide, skad
 * aplikacja laduje je lokalnie - bez internetu (Blueprint sek. 12).
 * Katalog jest w .gitignore: zrodlem prawdy jest wersja z package-lock.
 */
function pyodideAssets(): Plugin {
  const files = ['pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
  const copy = () => {
    const from = fileURLToPath(new URL('./node_modules/pyodide/', import.meta.url));
    const to = fileURLToPath(new URL('./public/pyodide/', import.meta.url));
    mkdirSync(to, { recursive: true });
    for (const f of files) {
      const src = from + f;
      const dst = to + f;
      if (!existsSync(dst) || statSync(dst).size !== statSync(src).size) copyFileSync(src, dst);
    }
  };
  return { name: 'forge-pyodide-assets', buildStart: copy };
}

/**
 * Wersja przegladarkowa (telefon) - Blueprint sek. 12: dziala bez internetu.
 *
 * Service worker zapisuje "skorupe" aplikacji przy pierwszej wizycie. Python
 * (ok. 13 MB) do niej nie wchodzi - trafia do osobnej pamieci przy pierwszym
 * zadaniu z kodem albo na zyczenie z ekranu "Twoje dane". Nazwa tej pamieci
 * zawiera wersje Pyodide: pliki nie maja skrotow w nazwach, wiec po
 * aktualizacji stara kopia nie moze obsluzyc nowego kodu.
 *
 * W powloce Tauri service worker nie jest rejestrowany (src/platform/pwa.ts).
 */
const pyodideVersion: string = JSON.parse(
  readFileSync(fileURLToPath(new URL('./node_modules/pyodide/package.json', import.meta.url)), 'utf8'),
).version;
const PYODIDE_CACHE = `forge-pyodide-${pyodideVersion}`;

/** Hosting w podkatalogu (np. GitHub Pages: FORGE_BASE=/FORGE/). */
const base = process.env.FORGE_BASE ?? '/';

const pwa = VitePWA({
  // Nowa wersja czeka, az uczen sam kliknie "Odswiez" - nie przerywamy zadania.
  registerType: 'prompt',
  injectRegister: false,
  // Ikony i tak lapie globPatterns - bez tego trafilyby na liste dwa razy.
  includeManifestIcons: false,
  manifest: {
    id: base,
    name: 'FORGE — matura 2027',
    short_name: 'FORGE',
    description: 'Kurs maturalny: matematyka rozszerzona, informatyka, biznes i zarządzanie.',
    lang: 'pl',
    dir: 'ltr',
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'any',
    background_color: '#070a0f',
    theme_color: '#0c1119',
    categories: ['education'],
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    globIgnores: ['pyodide/**'],
    // Tresc kursu siedzi w glownym pakiecie; domyslne 2 MB to za malo.
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
    cleanupOutdatedCaches: true,
    // Pierwsza instalacja od razu przejmuje strone (nie ma starej wersji do
    // zastapienia); aktualizacje dalej czekaja na zgode.
    clientsClaim: true,
    navigateFallback: 'index.html',
    runtimeCaching: [
      {
        urlPattern: /\/pyodide\//,
        handler: 'CacheFirst',
        options: {
          cacheName: PYODIDE_CACHE,
          cacheableResponse: { statuses: [200] },
          // Serwer moze odpowiadac z "Vary: Origin", a Chrome wysyla Origin przy
          // import() modulu, ale nie przy zwyklym fetch - bez tego kopia
          // pobrana z ekranu "Twoje dane" nie pasowalaby do zadania workera.
          matchOptions: { ignoreVary: true },
        },
      },
    ],
  },
});

export default defineConfig({
  base,
  define: { __PYODIDE_CACHE__: JSON.stringify(PYODIDE_CACHE) },
  plugins: [react(), pyodideAssets(), pwa],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  // Pyodide laduje swoje pliki wzgledem wlasnego adresu - wstepne pakowanie
  // przez esbuild psuje te sciezki.
  optimizeDeps: { exclude: ['pyodide'] },
  worker: { format: 'es' },
  // Tauri oczekuje stalego portu i nie chce czyscic ekranu przy bledzie.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // src-tauri/target to artefakty kompilacji Rusta. Bez tego wykluczenia
      // obserwator Vite probuje czytac pliki .dll w trakcie ich zapisu przez
      // cargo i przewraca serwer deweloperski.
      ignored: ['**/src-tauri/**'],
    },
  },
  build: { target: 'chrome110', sourcemap: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'content/**/*.test.ts'],
    env: {
      // Pyodide zgaduje swoj katalog ze sladu stosu; pod Vitestem na Linuksie
      // (CI) mapa zrodel prowadzi go do node_modules/src/js/ i testy padaja.
      // Jawna sciezka dziala tak samo na kazdym systemie.
      PYODIDE_INDEX_URL: fileURLToPath(new URL('./node_modules/pyodide/', import.meta.url)).replace(/\\/g, '/'),
    },
  },
});
