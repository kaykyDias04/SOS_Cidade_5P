import { test, expect } from '@playwright/test';
import { API_URL, gestorSeed } from './fixtures/testData';

/**
 * E2E: login do Gestor e acesso ao Dashboard
 *
 * O cadastro público (tela e POST /users) só cria contas DENUNCIANTE, por design:
 * desde o ajuste de segurança, a API ignora o campo role no cadastro.
 * Por isso o GESTOR usado aqui é o do seed do backend (backend/prisma/seed.ts),
 * que precisa rodar antes da suíte: npx prisma db seed.
 */

test.describe('Jornada do Gestor: login e acesso ao painel', () => {
  test('deve logar como gestor e acessar o Dashboard Interativo @smoke', async ({ page }) => {
    await page.goto('/login');

    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(gestorSeed.email);
    await loginForm.getByLabel('Senha').fill(gestorSeed.password);
    await loginForm.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard Interativo' })).toBeVisible();
  });

  test('denunciante comum não deve conseguir acessar rota do gestor @smoke', async ({ page, request }) => {
    // usa o próprio cadastro público (sempre cria DENUNCIANTE)
    const denuncianteEmail = `denunciante.e2e.${Date.now()}@sos.com`;
    const cadastro = await request.post(`${API_URL}/users`, {
      data: { name: 'Denunciante Teste', email: denuncianteEmail, password: 'senha123' },
    });
    expect(cadastro.ok()).toBeTruthy();

    await page.goto('/login');
    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(denuncianteEmail);
    await loginForm.getByLabel('Senha').fill('senha123');
    await loginForm.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/homepage-denunciante/);

    // tenta acessar a página do gestor diretamente pela URL
    await page.goto('/dashboard');

    // Esperado (segurança): o middleware devolve o DENUNCIANTE para a home dele
    // e o Dashboard do GESTOR nunca aparece.
    await expect(page).toHaveURL(/\/homepage-denunciante/);
    await expect(page.getByRole('heading', { name: 'Dashboard Interativo' })).not.toBeVisible({ timeout: 5_000 });
  });
});
