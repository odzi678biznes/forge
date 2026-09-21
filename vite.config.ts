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
  server: { port: 1420, strictPort: true },
  build: { target: 'chrome110', sourcemap: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'content/**/*.test.ts'],
  },
});
