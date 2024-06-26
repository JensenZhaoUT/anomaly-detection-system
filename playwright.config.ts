import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  timeout: 20000,
  use: {
    headless: true, // Set to false if you want to see the browser actions
    baseURL: 'http://44.219.129.210:3000',
    browserName: 'chromium', // You can also use 'firefox' or 'webkit'
  },
});
