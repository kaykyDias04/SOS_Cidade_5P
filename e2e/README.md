# Testes E2E — SOS-Cidade

Testes ponta a ponta (E2E) com Playwright, cobrindo cadastro, login, criação
de denúncias, histórico e acesso por perfil.

## O que está coberto

| Arquivo | O que testa |
|---|---|
| `tests/fluxo-denuncia-cidadao.spec.ts` | Jornada autocontida do cidadão: cadastro, login, denúncia e histórico (`@smoke`) |
| `tests/denunciante-fluxo-completo.spec.ts` | Cadastro com aceite legal, login, senha errada, criação de denúncia e conferência em "Minhas Denúncias" |
| `tests/gestor-fluxo.spec.ts` | Login do gestor seed, acesso ao Dashboard e bloqueio do acesso administrativo para denunciante (`@smoke`) |
| `tests/demo-instavel.spec.ts` | Demonstração opcional do reporter: falha na primeira tentativa e passa na segunda |

## Pré-requisitos

A aplicação precisa estar rodando localmente antes de executar os testes. Use
o roteiro de QA isolado em `docs/testes/gestao-testes.md`, na seção
"Pendências para o responsável pelos testes E2E". Ele prepara PostgreSQL e
Redis exclusivos para QA, backend em `8000` e frontend em `3000`, além de
migrations e seed. O `docker-compose.yml` principal é de desenvolvimento; não
use seus dados como massa descartável.

O seed em `backend/prisma/seed.ts` fornece a conta de gestor
`gestor1.teste@soscidade.com`. Os fluxos de cadastro geram e-mails únicos.

## Instalação e execução

Na pasta `e2e`:

```bash
npm ci
npx playwright install --with-deps chromium
```

Na raiz do repositório, os comandos passam pelo sistema de gestão de testes:

```bash
npm run test:e2e:smoke
npm run test:e2e
npm run test:e2e:quarentena
```

Os testes marcados `@flaky` ficam fora das execuções normais e só rodam na
quarentena. Cada teste nessa lista precisa ter ID e registro aprovado em
`scripts/test-management/quarantine.json`. Falhas de tentativas anteriores
continuam fazendo o comando falhar, mesmo quando uma repetição passa.

## Demonstração de teste instável

Com a aplicação de QA em execução, no PowerShell, habilite a variável para
causar uma falha intencional na primeira tentativa e execute a suíte E2E:

```powershell
$env:CI = "true"
$env:DEMO_INSTAVEL = "1"
npm run test:e2e
```

O teste passa na repetição do Playwright, mas a execução continua sinalizando
a falha inicial para não mascarar defeitos. O arquivo
`resultados/flaky-e2e.json` registra o resultado para a action de issue. Sem
`DEMO_INSTAVEL=1`, o teste é ignorado. Remova a variável depois da demonstração.

## Por que esse fluxo foi escolhido

Cadastro → login → denúncia → listagem é o caminho crítico do sistema. O teste
de acesso de perfil valida o guard do frontend, mas a API também deve validar
permissões nas rotas protegidas; um redirecionamento no navegador, sozinho, não
é uma barreira de segurança para endpoints.

Os três cenários `@smoke` cobrem os fluxos mais importantes em PRs. A suíte
completa acrescenta os casos negativos e a jornada detalhada do denunciante.

## Limitação conhecida

Os testes usam um banco de QA persistente entre execuções e acumulam usuários e
denúncias. Isso é aceitável apenas na massa descartável isolada; nunca aponte os
testes para produção ou para um banco compartilhado de desenvolvimento.
