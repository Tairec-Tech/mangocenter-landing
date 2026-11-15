import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests', workers: 2, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:5174', reducedMotion: 'reduce', launchOptions: { executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
});
