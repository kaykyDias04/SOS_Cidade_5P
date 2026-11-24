import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite } from '@playwright/test/reporter';

type TesteInstavel = {
  titulo: string;
  arquivo: string;
  tentativas: number;
  erro: string;
};

export default class FlakyReporter implements Reporter {
  private suite?: Suite;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  async onEnd(_result: FullResult): Promise<void> {
    const testes: TesteInstavel[] = (this.suite?.allTests() ?? [])
      .filter((test) => test.outcome() === 'flaky')
      .map((test) => {
        const primeiraFalha = test.results.find((result) => result.status !== 'passed');
        const mensagem = primeiraFalha?.errors[0]?.message ?? '';
        const erro = mensagem
          .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
          .split(/\r?\n/, 1)[0]
          .trim();

        return {
          titulo: test.titlePath().filter(Boolean).join(' › '),
          arquivo: path.relative(path.resolve(__dirname, '../..'), test.location.file),
          tentativas: test.results.length,
          erro,
        };
      });

    const raizProjeto = path.resolve(__dirname, '../..');
    const destino = path.resolve(
      raizProjeto,
      process.env.E2E_FLAKY_FILE || 'resultados/flaky-e2e.json',
    );
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, `${JSON.stringify(testes, null, 2)}\n`, 'utf8');
  }
}
