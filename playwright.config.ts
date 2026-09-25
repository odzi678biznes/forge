import { defineConfig, devices } from '@playwright/test';

/**
 * Testy E2E na zbudowanej aplikacji (`vite preview`) - tej samej, która trafia
 * na GitHub Pages, łącznie z podkatalogiem z `FORGE_BASE` i service workerem.
 *
 * Lokalnie w zainstalowanym Edge (bez pobierania przeglądarki), w CI
 * w Chromium z `npx playwright install chromium`. Każdy test ma czysty profil
 * przeglądarki, więc zaczyna jak nowy użytkownik.
 */
const base = process.env.FORGE_BASE ?? '/';
const port = 4173;
const channel = process.env.CI ? undefined : (process.env.E2E_CHANNEL ?? 'msedge');

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}`,
    locale: 'pl-PL',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'komputer', use: { ...devices['Desktop Chrome'], channel } },
    {
      name: 'telefon',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, channel },
    },
  ],
  webServer: {
    command: `npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
