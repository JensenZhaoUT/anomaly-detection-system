import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  timeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
  use: {
    headless: true,
    baseURL: 'http://44.219.129.210:3000',
    browserName: 'chromium',
  },
});
