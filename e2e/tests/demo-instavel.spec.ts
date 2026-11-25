import { test } from '@playwright/test';

test('CT-DEMO-01: demonstração de teste instável', async ({}, testInfo) => {
  test.skip(process.env.DEMO_INSTAVEL !== '1', 'Defina DEMO_INSTAVEL=1 para executar a demonstração.');

  if (testInfo.retry === 0) {
    throw new Error('Falha intencional da primeira tentativa da demonstração.');
  }
});
