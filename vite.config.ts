/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
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

export default defineConfig({
  plugins: [react(), pyodideAssets()],
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
  },
});
