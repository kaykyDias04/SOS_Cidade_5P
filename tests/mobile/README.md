# Documentacao e testes do Mobile

Este diretorio centraliza, com prefixo `MOBILE-`, as copias da documentacao Mobile e os materiais usados para comparar as auditorias com o backlog de 16 epicos. Os documentos originais continuam nas pastas `mobile/` e `mobile/testes/`; atualize-os junto com estas copias quando a documentacao mudar.

> A copia local inicial veio sem metadados Git. A verificacao do repositorio remoto mostrou que `main` inclui a refatoracao ate a etapa 04, mas nao os quatro commits seguintes da linha `refatoracao-07`; essa base mais nova foi mantida como pre-requisito para nao perder arquivos usados pelo Mobile. Assim, o PR para `main` tambem precisa incorporar esse delta de refatoracao.

## Comparacao das tres referencias

1. **Auditoria de testes Mobile:** informou que nao encontrou testes automatizados especificos. Isso nao corresponde ao workspace local atual: antes destas mudancas havia 7 suites Jest e 32 casos.
2. **Auditoria Frontend/Backend/Mobile e prompt de execucao:** identificou divergencias reais de autorizacao, cadastro de gestores, filtros e contratos. A alegacao de que existiam 50 testes preparados nao veio acompanhada do arquivo completo; no chat foram recebidos os casos 41-50, que foram adaptados para testes dos servicos. O arquivo anexado adicional e uma auditoria, nao a suite completa.
3. **Backlog dos 16 epicos:** adotado como referencia de produto e criterios Mobile. Os epicos HU-01 a HU-10 e as regras de papeis permanecem como norte; este backlog nao significa que todas as telas/fluxos nativos estejam homologados.

## Escopo implementado nesta rodada

- Cadastro publico continua criando somente `DENUNCIANTE`; aceite legal continua explicito no Mobile.
- Criacao de gestor usa `POST /users/gestores`, protegido por autenticacao e autorizacao `GESTOR`; Mobile e Frontend usam o endpoint dedicado.
- `POST /denuncias` aceita somente `DENUNCIANTE`; token ausente/invalido retorna 401 e falta de permissao retorna 403.
- Mobile recebeu filtros multisselecao por tipo e bairro/regiao nas listas, filtros no endpoint de denuncias proprias e busca textual ampliada para os campos exibidos pelo Frontend.
- Foram adicionados testes de contrato dos servicos Mobile e uma suite de integracao que chama um Backend real.

## Validacao e limites

`npm run test:ci --prefix mobile` tinha 7 suites e 32 testes antes desta rodada. O codigo novo acrescenta 2 suites unitarias com 13 casos e uma suite de integracao com 10 casos.

Validacoes concluidas:

- Mobile: `npm run test:ci --prefix mobile` — 9 suites, 45 testes aprovados.
- Integracao Mobile + Backend: `npm run test:integration:backend --prefix mobile` — 10 cenarios aprovados contra Backend e banco locais descartaveis.
- Backend unitario: `npm run test:unit --prefix backend -- --runInBand` — 6 suites, 31 testes aprovados. O teste de autenticacao focado tambem passou (5 testes).
- Backend: `npm run build --prefix backend` — build aprovado.
- API: `npm run test:api` — 5 suites, 59 testes aprovados.
- TypeScript: `npx tsc --noEmit` em Mobile e Frontend — ambos aprovados.
- Frontend: `npm run build --prefix frontend` — build de producao aprovado. O Next.js exibiu avisos nao bloqueantes sobre multiplos lockfiles e a convencao `middleware` depreciada.

Os 10 cenarios de integracao usam os servicos HTTP do Mobile contra uma API local e cobrem login, criacao anonima, listagem filtrada, autorizacao, protecao do cadastro publico e criacao administrativa de gestores. Eles **nao** renderizam a interface em Android/iOS e nao substituem Maestro/Detox.

Para executar em banco descartavel local:

```powershell
docker compose up --build -d db redis api
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000"
$env:MOBILE_INTEGRATION_TESTS = "1"
$env:MOBILE_TEST_DENUNCIANTE_EMAIL = "denunciante.teste@soscidade.com"
$env:MOBILE_TEST_DENUNCIANTE_PASSWORD = "Teste@123"
$env:MOBILE_TEST_GESTOR_EMAIL = "gestor1.teste@soscidade.com"
$env:MOBILE_TEST_GESTOR_PASSWORD = "Teste@123"
npm run test:integration:backend --prefix mobile
```

O workflow [`mobile-backend-integration.yml`](../../.github/workflows/mobile-backend-integration.yml) tambem tem `workflow_dispatch` para o botao **Run workflow** e executa em PRs que alteram Mobile ou Backend. Ele sobe Postgres, Redis e somente o Backend.

Os testes gravam registros unicos e tentam remove-los ao final; por isso a suite verifica que a URL aponta para `localhost` ou `127.0.0.1`. Nunca a execute contra producao ou banco compartilhado.

## Referencias copiadas

- [MOBILE-README.md](./MOBILE-README.md)
- [MOBILE-ACOMPANHAMENTO.md](./MOBILE-ACOMPANHAMENTO.md)
- [MOBILE-BACKLOG-TESTES.md](./MOBILE-BACKLOG-TESTES.md)
- [MOBILE-TAS.md](./MOBILE-TAS.md)
- [MOBILE-BACKLOG-16-EPICOS.md](./MOBILE-BACKLOG-16-EPICOS.md)
- [MOBILE-AUDITORIA-CADASTRO-E-TESTES.md](./MOBILE-AUDITORIA-CADASTRO-E-TESTES.md)
- [MOBILE-AUDITORIA-INTEGRACAO-E-PLANO.md](./MOBILE-AUDITORIA-INTEGRACAO-E-PLANO.md)
- [MOBILE-AUDITORIA-REVISAO.md](./MOBILE-AUDITORIA-REVISAO.md)
- [MOBILE-INTEGRACAO-REPOSITORIO.md](./MOBILE-INTEGRACAO-REPOSITORIO.md) e [MOBILE-PLANO-DE-INTEGRACAO.md](./MOBILE-PLANO-DE-INTEGRACAO.md) sao copias contextuais de outro repositorio; valide referencias antes de aplicar instrucoes de Git.

## Pendencias deliberadas

- Categorias, datas e situacoes continuam em formatos legados mistos. Padroniza-los requer contrato entre as tres aplicacoes, compatibilidade de leitura e estrategia de migracao dos registros existentes.
- Cookie HttpOnly e validacao confiavel do perfil no Frontend sao trabalho separado do escopo Mobile.
- Maestro em emulador Android/iOS, paginacao completa e fluxo gestor criado-ate-login continuam no backlog; nao sao alegados como cobertos pelos testes HTTP.
- O fragmento recebido dos testes preparados cobria os casos 41-50; o arquivo integral dos 50 casos nao foi localizado nem anexado como arquivo. Por isso, nao se afirma que os 50 testes originais foram integrados.
