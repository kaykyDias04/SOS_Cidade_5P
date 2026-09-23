import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para a suíte E2E do S.O.S Cidade.
 * O SUT (frontend + backend + banco) deve estar rodando via docker-compose
 * antes de executar os testes (ver README.md desta pasta).
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
