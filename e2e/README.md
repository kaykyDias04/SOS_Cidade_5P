# Testes E2E — SOS-Cidade

Testes ponta a ponta (E2E) usando **Playwright**, simulando o uso real da aplicação
pelo navegador: cadastro, login, criação de denúncia e verificação na listagem.

## O que está coberto

| Arquivo | O que testa |
|---|---|
| `tests/fluxo-denuncia-cidadao.spec.ts` | Jornada autocontida do cidadão: cadastro, login, denúncia e histórico (`@smoke`) |
| `tests/denunciante-fluxo-completo.spec.ts` | Cadastro de conta, login, login com senha errada (caminho negativo), criação de denúncia e conferência em "Minhas Denúncias" |
| `tests/gestor-fluxo.spec.ts` | Login como gestor e acesso ao Dashboard; teste de controle de acesso (denunciante tentando ver a área do gestor) |

## Pré-requisitos

A aplicação precisa estar rodando localmente **antes** de executar os testes.
Na raiz do projeto principal (não desta pasta de testes):

```bash
# Roteiro completo e isolado de QA:
# docs/testes/gestao-testes.md → "Pendências para o responsável pelos testes E2E"
```

O roteiro prepara PostgreSQL e Redis exclusivos para QA (portas 15432/16379),
backend em 8000 e frontend em 3000. Inclui chaves de teste, migrations e seed.
O `docker-compose.yml` principal é de desenvolvimento; não usar seus dados como massa descartável.

## Instalação e execução

Dentro desta pasta:

```bash
npm ci
npx playwright install --with-deps chromium   # baixa o navegador usado nos testes
npm test                                      # roda todos os testes, sem interface
npm run test:headed                           # roda mostrando o navegador (bom pra apresentação)
npm run test:ui                               # abre o modo interativo do Playwright
npm run report                                # abre o relatório em HTML da última execução
```

## Por que esse fluxo foi escolhido

O cadastro → login → nova denúncia → aparecer na listagem é o **caminho crítico**
do sistema: se ele quebrar, nenhuma outra tela (dashboard, mapa) tem dado pra
mostrar. Por isso ele foi priorizado como o cenário principal de E2E.

O teste de "denunciante tentando acessar o Dashboard do gestor" verifica a proteção
de perfil já implementada. O esperado é redirecionamento para a área do cidadão,
sem exibir o dashboard administrativo. A autorização da API também possui testes próprios.

## Observação sobre dados de teste

Existe seed em `backend/prisma/seed.ts`, executado pelo workflow antes da suíte:
- O teste do denunciante cria uma conta nova a cada execução (e-mail com timestamp), para não colidir com execuções anteriores.
- O teste do gestor usa `gestor1.teste@soscidade.com`, criado pelo seed. O cadastro público não permite criar GESTOR.

São 7 cenários em 3 arquivos; os 3 `@smoke` são subconjunto desses 7. A jornada modular
é serial e os casos posteriores dependem do cadastro inicial. Nenhum deles pode entrar
em quarentena. A execução real e a publicação posterior dos workflows são responsabilidade
do integrante designado; esta entrega da gestão de testes não afirma aprovação E2E local.

## Limitação conhecida

Os testes assumem banco de dados "vivo" entre execuções (sem reset automático).
Rodar os testes várias vezes vai acumular usuários e denúncias de teste no banco
isolado de QA. Isso é aceitável exclusivamente nessa massa descartável; nunca
apontar os testes para produção nem para um banco compartilhado de desenvolvimento.
