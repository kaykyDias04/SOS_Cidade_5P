import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para os testes E2E do SOS-Cidade.
 *
 * Pré-requisito: a aplicação precisa estar rodando localmente antes
 * de executar os testes (ver README.md desta pasta para o passo a passo).
 * baseURL aponta para o frontend Next.js, que por sua vez fala com o
 * backend em http://localhost:8000 (conforme docker-compose.yml do projeto).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // os testes compartilham o mesmo backend/banco, então rodam em série
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
