import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const raizProjeto = path.resolve(__dirname, '..');

/**
 * Configuração do Playwright para os testes E2E do SOS-Cidade.
 *
 * Pré-requisito: a aplicação precisa estar rodando localmente antes
 * de executar os testes (ver README.md desta pasta para o passo a passo).
 * baseURL aponta para o frontend Next.js, que por sua vez fala com o
 * backend em http://localhost:8000 (conforme docker-compose.yml do projeto).
 */
const quarantine = process.env.TEST_MODE === 'quarantine';
const quarantineRetries = Number(process.env.QUARANTINE_RETRIES ?? 2);
if (!Number.isInteger(quarantineRetries) || quarantineRetries < 0 || quarantineRetries > 20) throw new Error('QUARANTINE_RETRIES inválido');
const reportDir = process.env.TEST_REPORT_DIR;
const junitOutput = process.env.E2E_JUNIT_FILE
  ? path.resolve(raizProjeto, process.env.E2E_JUNIT_FILE)
  : quarantine && reportDir
    ? path.join(reportDir, 'e2e.xml')
    : path.resolve(raizProjeto, 'resultados/e2e.xml');
const htmlOutput = process.env.PLAYWRIGHT_HTML_REPORT
  ? path.resolve(raizProjeto, process.env.PLAYWRIGHT_HTML_REPORT)
  : quarantine && reportDir
    ? path.join(reportDir, 'html')
    : path.resolve(__dirname, 'playwright-report');

export default defineConfig({
  grep: quarantine ? /(?:^|\s)@flaky(?:\s|$)/ : undefined,
  grepInvert: quarantine ? undefined : /(?:^|\s)@flaky(?:\s|$)/,
  forbidOnly: !!process.env.CI,
  outputDir: process.env.TEST_REPORT_DIR ? path.join(process.env.TEST_REPORT_DIR, 'test-results') : 'test-results',
  testDir: './tests',
  fullyParallel: false, // os testes compartilham o mesmo backend/banco, então rodam em série
  retries: quarantine ? quarantineRetries : process.env.CI ? 1 : 0,
  workers: 1,
  // junit: resultado em XML para a pipeline (artefato e métricas).
  // Contrato: resultados/e2e.xml na raiz do repositório.
  reporter: [
    ['html', { open: 'never', outputFolder: htmlOutput }],
    ['list'],
    [path.resolve(__dirname, '../scripts/test-management/playwright-reporter.cjs')],
    ['junit', { outputFile: junitOutput }],
    [path.resolve(__dirname, 'reporters/flaky-reporter.ts')],
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
