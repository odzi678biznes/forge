import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'tutor.spec.ts',
  testIgnore: [],
  workers: 2,
  webServer: [
    { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI, timeout: 60_000 },
    { command: 'npx vite-node scripts/tutor-test-server.ts', env: { FORGE_TUTOR_TEST_SERVER: '1' }, url: 'http://127.0.0.1:4181/api/tutor?action=status', reuseExistingServer: false, timeout: 60_000 },
  ],
});
