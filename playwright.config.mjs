import { defineConfig } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
  testDir: './tests',
  projects: [
    { name: 'demo', testMatch: /report\.spec\.mjs/, use: { baseURL: 'http://127.0.0.1:4173' } },
    { name: 'connected', testMatch: /accounts\.spec\.mjs/, use: { baseURL: 'http://127.0.0.1:4174' } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] }
      : {},
  },
  webServer: [{
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  }, {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    env: { VITE_SUPABASE_URL: 'https://emis-test.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-public-anon-key' },
  }],
});
