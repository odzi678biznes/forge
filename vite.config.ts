/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
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
