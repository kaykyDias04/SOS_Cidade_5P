import { test, expect } from '@playwright/test';
import { generateTestUser, denunciaValida } from './fixtures/testData';

/**
 * E2E — Jornada completa do Cidadão (perfil DENUNCIANTE)
 *
 * Por que esse fluxo foi escolhido:
 * é o "caminho feliz" mais importante do sistema — sem ele, nenhuma outra
 * funcionalidade (dashboard do gestor, mapa, etc.) tem dado pra mostrar.
 * O teste passa pela aplicação real, do jeito que uma pessoa usaria:
 * navegador -> frontend -> backend -> banco -> volta pro navegador.
 *
 * Pré-requisito: aplicação rodando em http://localhost:3000 (frontend)
 * e http://localhost:8000 (backend), conforme README deste projeto.
 */

test.describe('Jornada do Cidadão: cadastro, login e registro de denúncia', () => {
  const usuario = generateTestUser();

  test('deve permitir cadastrar uma nova conta de cidadão', async ({ page }) => {
    await page.goto('/login');

    // O formulário de cadastro fica na mesma tela de login, lado a lado
    await page.getByRole('heading', { name: 'Cadastro' }).waitFor();

    // Há dois campos "Nome/Email/Senha" na tela (login e cadastro lado a lado) —
    // por isso todo o preenchimento é escopado dentro do <form> do bloco "Cadastro".
    const registerForm = page.getByRole('heading', { name: 'Cadastro' }).locator('..').locator('form');
    await registerForm.getByLabel('Nome Completo').fill(usuario.name);
    await registerForm.getByLabel('Email').fill(usuario.email);
    await registerForm.getByLabel('Senha').fill(usuario.password);
    await registerForm.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText('Cadastro realizado com sucesso')).toBeVisible();
  });

  test('deve logar com a conta recém-criada e cair na home do denunciante', async ({ page }) => {
    await page.goto('/login');

    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(usuario.email);
    await loginForm.getByLabel('Senha').fill(usuario.password);
    await loginForm.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/homepage-denunciante/);
    await expect(page.getByText('Login realizado com sucesso')).toBeVisible();
  });

  test('não deve logar com senha incorreta (caminho negativo)', async ({ page }) => {
    await page.goto('/login');

    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(usuario.email);
    await loginForm.getByLabel('Senha').fill('senhaErradaXYZ');
    await loginForm.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('E-mail ou senha incorretos')).toBeVisible();
    // Garante que continuou na tela de login, não vazou pra área logada
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve registrar uma nova denúncia e vê-la em "Minhas Denúncias"', async ({ page }) => {
    // login
    await page.goto('/login');
    const loginForm = page.getByRole('heading', { name: 'Entrar' }).locator('..').locator('form');
    await loginForm.getByLabel('Email').fill(usuario.email);
    await loginForm.getByLabel('Senha').fill(usuario.password);
    await loginForm.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/homepage-denunciante/);

    // ir para o formulário de nova denúncia
    await page.goto('/nova-denuncia');
    await expect(page.getByRole('heading', { name: 'Nova Denúncia' })).toBeVisible();

    // Tipo do Problema (select estilo shadcn/Radix)
    await page.getByRole('combobox', { name: /Tipo do Problema/i }).click();
    await page.getByRole('option', { name: denunciaValida.tipoCategoria }).click();

    // Bairro
    await page.getByRole('combobox', { name: /Bairro/i }).click();
    await page.getByRole('option', { name: denunciaValida.bairro, exact: true }).click();

    // Descrição
    await page.getByLabel('Descrição do Problema').fill(denunciaValida.descricao);

    // Consentimento (obrigatório para habilitar o envio)
    await page
      .getByText('Autorizo o compartilhamento desta denúncia')
      .locator('..')
      .getByRole('checkbox')
      .check();

    await page.getByRole('button', { name: 'Enviar Denúncia' }).click();

    // Modal de confirmação
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Modal de protocolo gerado
    await expect(page.getByText(/SOS-\d{4}-[A-Z0-9]{8}/)).toBeVisible();
    await expect(page.getByText('Denúncia registrada com sucesso')).toBeVisible();

    // fecha o modal de protocolo (volta pra home) e confere na listagem
    await page.getByRole('dialog').getByRole('button').last().click().catch(() => {});

    await page.goto('/minhas-denuncias');
    await expect(page.getByText(denunciaValida.bairro).first()).toBeVisible({ timeout: 10_000 });
  });
});
