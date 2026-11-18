import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para os testes E2E do SOS-Cidade.
 *
 * Pré-requisito: a aplicação precisa estar rodando localmente antes
 * de executar os testes (ver README.md desta pasta para o passo a passo).
 * baseURL aponta para o frontend Next.js, que por sua vez fala com o
 * backend em http://localhost:8000 (conforme docker-compose.yml do projeto).
 */
const quarantine = process.env.TEST_MODE === 'quarantine';
const retries = Number(process.env.QUARANTINE_RETRIES ?? 2);
if (!Number.isInteger(retries) || retries < 0 || retries > 20) throw new Error('QUARANTINE_RETRIES inválido');

export default defineConfig({
  grep: quarantine ? /(?:^|\s)@flaky(?:\s|$)/ : undefined,
  grepInvert: quarantine ? undefined : /(?:^|\s)@flaky(?:\s|$)/,
  forbidOnly: !!process.env.CI,
  outputDir: process.env.TEST_REPORT_DIR ? path.join(process.env.TEST_REPORT_DIR, 'test-results') : 'test-results',
  testDir: './tests',
  fullyParallel: false, // os testes compartilham o mesmo backend/banco, então rodam em série
  retries: quarantine ? retries : 0,
  workers: 1,
  // junit: resultado em XML para a pipeline (artefato e métricas).
  // Contrato: resultados/e2e.xml na raiz do repositório.
  reporter: [
    ['html', { open: 'never', outputFolder: quarantine ? path.join(process.env.TEST_REPORT_DIR!, 'html') : 'playwright-report' }],
    ['list'],
    [path.resolve(__dirname, '../scripts/test-management/playwright-reporter.cjs')],
    ['junit', { outputFile: quarantine ? path.join(process.env.TEST_REPORT_DIR!, 'e2e.xml') : path.resolve(__dirname, '../resultados/e2e.xml') }],
  ],
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
