import { test, expect, request } from '@playwright/test';

/**
 * E2E — Login do Gestor e acesso ao Dashboard
 *
 * Observação importante sobre este teste:
 * a tela de cadastro pública só cria contas com perfil DENUNCIANTE
 * (é assim por design — um gestor não deveria poder se autopromover
 * pela tela de cadastro). Por isso, para ter uma conta de GESTOR
 * disponível para testar o login, este teste cria o usuário direto
 * pela API antes de usar a interface — é a forma padrão de "preparar
 * massa de dados" num E2E quando a jornada de criação não passa pela UI.
 *
 * Isso também documenta, na prática, o achado de segurança já registrado
 * separadamente: hoje a própria API aceita a criação de um GESTOR sem
 * exigir que quem está pedindo já seja um gestor autenticado.
 */

test.describe('Jornada do Gestor: login e acesso ao painel', () => {
  let gestorEmail: string;
  const gestorPassword = 'senha123';

  test.beforeAll(async () => {
    gestorEmail = `gestor.e2e.${Date.now()}@sos.com`;
    const api = await request.newContext({ baseURL: 'http://localhost:8000' });

    const response = await api.post('/users', {
      data: {
        name: 'Gestor Teste E2E',
        email: gestorEmail,
        password: gestorPassword,
        role: 'GESTOR',
      },
    });

    expect(response.ok()).toBeTruthy();
    await api.dispose();
  });

  test('deve logar como gestor e acessar o Dashboard Interativo', async ({ page }) => {
    await page.goto('/login');

    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(gestorEmail);
    await loginForm.getByLabel('Senha').fill(gestorPassword);
    await loginForm.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard Interativo' })).toBeVisible();
  });

  test('denunciante comum não deve conseguir acessar rota do gestor', async ({ page, request }) => {
    // usa o próprio cadastro público (sempre cria DENUNCIANTE)
    const denuncianteEmail = `denunciante.e2e.${Date.now()}@sos.com`;
    const api = await request.newContext({ baseURL: 'http://localhost:8000' });
    await api.post('/users', {
      data: { name: 'Denunciante Teste', email: denuncianteEmail, password: 'senha123', role: 'DENUNCIANTE' },
    });

    await page.goto('/login');
    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(denuncianteEmail);
    await loginForm.getByLabel('Senha').fill('senha123');
    await loginForm.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/homepage-denunciante/);

    // tenta acessar a página do gestor diretamente pela URL
    await page.goto('/dashboard');

    // Comportamento esperado (segurança): um DENUNCIANTE não deveria conseguir
    // ver o Dashboard do GESTOR só de digitar a URL. Se este teste falhar,
    // é sinal de que a verificação de perfil (role) ainda não existe —
    // ver o requisito RS-02 no documento de requisitos de segurança.
    await expect(page.getByRole('heading', { name: 'Dashboard Interativo' })).not.toBeVisible({ timeout: 5_000 });
  });
});
