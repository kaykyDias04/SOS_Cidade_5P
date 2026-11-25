# Revisao da integracao da refatoracao

Repositorio: [EllySantiago/SOS_Escola_5P.-copy](https://github.com/EllySantiago/SOS_Escola_5P.-copy)

Este documento resume as mudancas da refatoracao, a situacao dos PRs e o que
falta para levar todas as etapas a `main`. Estado consultado em 24/11/2026.

## Mudancas por etapa

| Etapa | Escopo |
|---|---|
| Backend e API | Consentimento legal no modelo e na migracao; ajustes de autenticacao, usuarios e denuncias; seed, contrato Swagger, testes de API/unitarios e configuracao de servicos. |
| Web | Fluxos e componentes de cadastro, login e denuncias atualizados; textos e documentos legais; consentimento integrado ao cadastro. |
| Limpeza mobile | Remocao da copia redundante do app em `mobile/mobile/`; o app mantido e o de `mobile/`. |
| Fundacao mobile | Configuracao Expo/EAS, layouts e navegacao, servicos HTTP/API, sessao, armazenamento seguro, cache, validacao e hooks. |
| Interface mobile | Telas de denunciante e gestor, componentes reutilizaveis, filtros, formularios, mapas, estados de erro/carregamento e consentimento. |
| Testes e CI | Jest para os servicos, stores e validacoes mobile; reporter e quarentena para E2E instaveis; ajustes de workflows e integracao com a gestao de testes existente. |
| Labels, metricas e docs | Labels padronizadas e triagem de manutencao; link de triagem em issues automaticas; metricas mobile/flaky; backlog e documentacao do quality gate. |

## Situacao dos PRs

| PR | Branch de origem | Base atual | Estado | O que significa para `main` |
|---|---|---|---|---|
| [#1](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/1) | `refatoracao-01-backend-api` | `main` | Mesclado | Backend/API ja chegou a `main`. |
| [#2](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/2) | `refatoracao-02-web-consent` | `refatoracao-01-backend-api` | Fechado, mesclado na branch base | Web e limpeza mobile (#3) foram integradas a uma branch de trabalho, nao a `main`. |
| [#3](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/3) | `refatoracao-03-mobile-cleanup` | `refatoracao-02-web-consent` | Fechado, mesclado na branch base | A limpeza mobile foi integrada a outra branch de trabalho, nao diretamente a `main`. |
| [#4](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/4) | `refatoracao-04-mobile-foundation` | `refatoracao-03-mobile-cleanup` | Aberto | Fundacao e servicos mobile. |
| [#5](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/5) | `refatoracao-05-mobile-ui` | `refatoracao-04-mobile-foundation` | Aberto | Telas e componentes mobile. |
| [#6](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/6) | `refatoracao-06-testes-e2e` | `refatoracao-05-mobile-ui` | Aberto | Testes mobile, reporter/quarentena E2E e workflows. |
| [#7](https://github.com/EllySantiago/SOS_Escola_5P.-copy/pull/7) | `refatoracao-07-labels-relatorios` | `refatoracao-06-testes-e2e` | Aberto | Labels, relatorios, backlog e documentacao. |

**Importante:** os PRs #2 e #3 estao fechados, mas seus merges foram feitos nas
branches anteriores da pilha. A `main` ainda nao recebeu essas mudancas. A ponta
atual de `refatoracao-01-backend-api` e `bdd79a1`; a `main` e `0598739`. A
comparacao entre elas mostra 51 arquivos, incluindo os fluxos web e a remocao
da arvore duplicada `mobile/mobile/`.

### Caminho recomendado para concluir a integracao

1. Abrir um novo PR de `refatoracao-01-backend-api` para `main`. Ele leva o
   conteudo dos antigos PRs #2 e #3, que foi mesclado nessa branch apos o PR #1.
2. Depois desse PR chegar a `main`, atualizar a base do PR #4 para `main` e
   revisar/mesclar as etapas mobile em ordem: #4, #5, #6 e #7.
3. Antes de cada merge, conferir o diff e os checks do PR; nao mesclar uma etapa
   posterior antes da sua base.

## CI e testes mobile

- **Unitarios mobile: configurados.** `unit-api` e `regressao-completa` instalam
  `mobile` e executam `npm run test:unit:mobile`. Isso cobre a logica testada
  pelo Jest, nao a compilacao nativa nem a execucao em aparelho.
- **Smoke web mobile: ainda nao configurado.** Nao ha script `build:web`,
  workflow `.github/workflows/mobile-smoke.yml` nem specs em `e2e/mobile-web/`.
  Portanto, nenhum smoke de telas mobile-web roda em PR.
- `unit-api` roda em push e em PR para `main`; `e2e-smoke` roda em PR para
  `main`; `regressao-completa` esta configurado para rodar diariamente e por
  acionamento manual. Os checks obrigatorios mantem os nomes `unit-api` e
  `e2e-smoke`.
- A regressao existente roda a suite E2E web e os unitarios mobile; ela nao
  substitui um smoke mobile-web nem testes nativos.

## Configuracao manual no GitHub

1. Em **Settings → Branches** (ou **Rulesets**), configurar protecao para
   `main` exigindo PR, checks `unit-api` e `e2e-smoke`, branches atualizadas e
   bloqueio de force push. Nao selecionar `mobile-smoke` enquanto esse workflow
   nao existir e tiver execucoes verdes.
2. Depois que o workflow de labels estiver em `main`, executa-lo uma vez por
   **Actions → criar-labels → Run workflow** para criar as labels iniciais.
3. Confirmar que GitHub Actions esta habilitado para o repositorio e que as
   permissoes `issues: write` dos workflows sao permitidas pela politica do
   repositorio/organizacao.

Um check obrigatorio que nao roda por filtro de `paths` pode deixar o PR
pendente. Os workflows que fornecem os checks obrigatorios nao devem receber
filtros de caminhos.

## Validacoes registradas

Na preparacao das branches foram executados: Jest mobile (7 suites, 32 testes),
selftest da gestao de testes (6/6), testes das metricas (8/8), testes das labels
(3/3), validacao dos YAMLs e `bash -n`. A regressao E2E completa contra a stack
Docker nao foi executada localmente. Os checks atuais do GitHub devem ser
conferidos em cada PR antes do merge.
