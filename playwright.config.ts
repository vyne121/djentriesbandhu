import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  use: { baseURL: "http://127.0.0.1:5173", launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined), args: ["--no-sandbox"] } },
  projects: [ { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }, { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } }, { name: "tablet", use: { ...devices["iPad Mini"], browserName: "chromium" } } ],
  webServer: { command: "npm run dev", url: "http://127.0.0.1:5173", reuseExistingServer: !process.env.CI },
});
