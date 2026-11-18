import { test, expect, type Page } from '@playwright/test';
import { API_URL, gestorSeed } from './fixtures/testData';

/**
 * Acompanhamento de uma denúncia: o Gestor muda a situação e o Denunciante vê a atualização.
 *
 * Sobre "notificar": no web o Denunciante não recebe um aviso ativo. A notificação ao autor
 * (notificarMudancaStatus) existe só no app mobile, como notificação local, e é desligada no web
 * (mobile/src/lib/notifications.ts). Este teste cobre o que o web entrega de fato: a nova
 * situação aparece em "Minhas Denúncias" assim que o Gestor confirma a mudança.
 */

async function entrar(page: Page, email: string, senha: string) {
  await page.goto('/login');
  const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
  await loginForm.getByLabel('Email').fill(email);
  await loginForm.getByLabel('Senha').fill(senha);
  await loginForm.getByRole('button', { name: 'Entrar' }).click();
}

test.describe('Acompanhamento: Gestor atualiza a situação e o Denunciante vê a mudança', () => {
  test('CT-E2E-08: Denunciante vê "Finalizada" em Minhas Denúncias depois que o Gestor finaliza a denúncia', async ({
    page,
    request,
    browser,
  }, testInfo) => {
    const email = `status.e2e.${Date.now()}@sos.com`;
    const senha = 'senha123';

    // Preparação pela API: cadastro, login e uma denúncia nova ("Em Andamento").
    const cadastro = await request.post(`${API_URL}/users`, {
      data: { name: 'Denunciante Status E2E', email, password: senha },
    });
    expect(cadastro.ok()).toBeTruthy();

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: senha } });
    expect(login.ok()).toBeTruthy();
    const { token } = await login.json();

    const criada = await request.post(`${API_URL}/denuncias`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        tipoDenuncia: 'Buraco na Via',
        identificacao: true,
        bairroOcorrencia: 'Boa Viagem',
        descricaoOcorrencia:
          'Buraco grande e profundo na via, próximo ao ponto de ônibus, oferecendo risco a pedestres e veículos.',
        dataOcorrencia: '2026-11-18',
      },
    });
    expect(criada.ok()).toBeTruthy();
    const { protocolo } = await criada.json();
    expect(protocolo).toMatch(/^SOS-\d{4}-[A-Z0-9]{8}$/);

    // 1. Denunciante: a denúncia aparece "Em andamento".
    await entrar(page, email, senha);
    await expect(page).toHaveURL(/\/homepage-denunciante/);
    await page.goto('/minhas-denuncias');
    const linhaDenunciante = page.getByRole('row').filter({ hasText: protocolo });
    await expect(linhaDenunciante).toBeVisible();
    await expect(linhaDenunciante).toContainText(/em andamento/i);

    // 2. Gestor, em outro contexto (outra sessão), finaliza a mesma denúncia.
    const contextoGestor = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    try {
      const paginaGestor = await contextoGestor.newPage();
      await entrar(paginaGestor, gestorSeed.email, gestorSeed.password);
      await expect(paginaGestor).toHaveURL(/\/dashboard/);

      await paginaGestor.goto('/denuncias-recentes');
      await paginaGestor.getByPlaceholder('Pesquise por bairro ou protocolo').fill(protocolo);
      const linhaGestor = paginaGestor.getByRole('row').filter({ hasText: protocolo });
      await expect(linhaGestor).toBeVisible();

      await linhaGestor.getByRole('button', { name: 'Editar' }).click();
      await paginaGestor.getByRole('menuitem', { name: 'Finalizada' }).click();

      const dialogo = paginaGestor.getByRole('dialog');
      await expect(dialogo).toContainText(protocolo);
      // Espera o PATCH terminar antes de olhar pelo lado do Denunciante.
      const gravou = paginaGestor.waitForResponse(
        (r) => r.request().method() === 'PATCH' && r.url().includes('/denuncias/')
      );
      await dialogo.getByRole('button', { name: 'Confirmar' }).click();
      expect((await gravou).ok()).toBeTruthy();

      await expect(linhaGestor).toContainText(/finalizada/i);
    } finally {
      await contextoGestor.close();
    }

    // 3. Denunciante: ao recarregar, a nova situação aparece.
    await page.reload();
    const linhaAtualizada = page.getByRole('row').filter({ hasText: protocolo });
    await expect(linhaAtualizada).toContainText(/finalizada/i);
    await expect(linhaAtualizada).not.toContainText(/em andamento/i);
  });
});
