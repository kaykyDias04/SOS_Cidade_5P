import { test, expect } from "@playwright/test";

/**
 * CENÁRIO: Cidadão se cadastra, faz login, registra uma nova denúncia urbana
 * (Buraco na Via) e confirma que ela aparece no seu histórico ("Minhas Denúncias")
 * com o protocolo gerado.
 *
 * Este é o fluxo funcional central do perfil Denunciante do S.O.S Cidade:
 * cadastro -> login -> abertura de ocorrência -> acompanhamento.
 *
 * Pré-requisito: SUT rodando via `docker-compose up --build -d` na raiz do
 * projeto (frontend em http://localhost:3000, backend em http://localhost:8000).
 */
test("cidadão se cadastra, registra uma denúncia e a encontra em Minhas Denúncias", async ({
  page,
}) => {
  const timestamp = Date.now();
  const nome = "Gabriel Teste E2E";
  const email = `gabriel.e2e.${timestamp}@teste.com`;
  const senha = "senha123";
  const descricao =
    "Buraco grande na via, próximo à esquina, causando risco a motociclistas e pedestres.";

  // 1. Cadastro
  await page.goto("/login");

  await page.getByLabel("Nome Completo").fill(nome);
  // Há dois campos "Email" na página (login e cadastro) e dois "Senha";
  // o formulário de cadastro é o segundo bloco de cada um.
  await page.getByLabel("Email").nth(1).fill(email);
  await page.getByLabel("Senha").nth(1).fill(senha);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(
    page.getByText("Cadastro realizado com sucesso!")
  ).toBeVisible();

  // 2. Login
  await page.getByLabel("Email").first().fill(email);
  await page.getByLabel("Senha").first().fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/homepage-denunciante");

  // 3. Nova denúncia
  await page.goto("/nova-denuncia");

  // Selects (shadcn/Radix): 1º = Tipo do Problema, 2º = Bairro
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Buraco na Via" }).click();

  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Boa Viagem", exact: true }).click();

  await page
    .getByPlaceholder(
      "Descreva o problema com o máximo de detalhes: localização exata, gravidade, há quanto tempo existe..."
    )
    .fill(descricao);

  // Autoriza o compartilhamento dos dados (checkbox obrigatório)
  await page.getByRole("checkbox").click();

  await page.getByRole("button", { name: "Enviar Denúncia" }).click();

  // Modal de confirmação
  await expect(
    page.getByText("Confirmar Envio da Denúncia")
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar" }).click();

  // Modal de protocolo gerado
  await expect(
    page.getByText("Denúncia Registrada com Sucesso!")
  ).toBeVisible();

  const modalText = await page.getByRole("dialog").innerText();
  const protocoloMatch = modalText.match(/SOS-\d{4}-[A-Z0-9]{8}/);
  expect(protocoloMatch, "protocolo não encontrado no modal").not.toBeNull();
  const protocolo = protocoloMatch![0];

  // Fecha o modal (não há botão de ação; Esc aciona onClose -> router.push)
  await page.keyboard.press("Escape");
  await page.waitForURL("**/homepage-denunciante");

  // 4. Verifica no histórico do cidadão
  await page.goto("/minhas-denuncias");

  await expect(page.getByText(protocolo)).toBeVisible();
  await expect(page.getByText("Buraco na Via")).toBeVisible();
});
