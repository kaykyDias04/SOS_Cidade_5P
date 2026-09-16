# Testes E2E — S.O.S Cidade (Entrega Individual)

## Cenário automatizado

**Fluxo:** Cidadão se cadastra → faz login → registra uma nova denúncia
("Buraco na Via") → confirma o envio → recebe o protocolo → encontra a
denúncia na tela "Minhas Denúncias".

Esse fluxo cobre a funcionalidade central do perfil Denunciante
(HU de cadastro/login + abertura de ocorrência + acompanhamento),
exercitando o sistema de ponta a ponta pela interface, exatamente como
um cidadão usaria na prática.

Arquivo do teste: `tests/fluxo-denuncia-cidadao.spec.ts`

## Como rodar

1. Suba o SUT completo (frontend + backend + banco) a partir da raiz do
   projeto:
   ```
   docker-compose up --build -d
   ```
   Aguarde alguns segundos para o banco terminar de subir.

2. Nesta pasta (`tests/e2e`), instale as dependências e os navegadores do
   Playwright:
   ```
   npm install
   npx playwright install --with-deps chromium
   ```

3. Rode o teste:
   ```
   npm test
   ```
   Para ver o navegador rodando: `npm run test:headed`
   Para ver o relatório com screenshots/vídeo em caso de falha: `npm run report`

O teste cria um usuário novo a cada execução (email com timestamp), então
pode ser rodado repetidamente sem conflito de dados.

## Observação para a suíte do grupo

Este teste foi escrito para conviver na mesma pasta `tests/` dos testes de
API (Jest/Supertest) já existentes no repositório, só que em sua própria
subpasta `e2e/` com dependências isoladas (Playwright), já que os dois
frameworks não se misturam no mesmo `package.json`.
