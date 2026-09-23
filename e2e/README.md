# Testes E2E — SOS-Cidade

Testes ponta a ponta (E2E) usando **Playwright**, simulando o uso real da aplicação
pelo navegador: cadastro, login, criação de denúncia e verificação na listagem.

## O que está coberto

| Arquivo | O que testa |
|---|---|
| `tests/denunciante-fluxo-completo.spec.ts` | Cadastro de conta, login, login com senha errada (caminho negativo), criação de denúncia e conferência em "Minhas Denúncias" |
| `tests/gestor-fluxo.spec.ts` | Login como gestor e acesso ao Dashboard; teste de controle de acesso (denunciante tentando ver a área do gestor) |

## Pré-requisitos

A aplicação precisa estar rodando localmente **antes** de executar os testes.
Na raiz do projeto principal (não desta pasta de testes):

```bash
docker compose up -d
```

Isso sobe banco (5432), Redis (6379), backend (8000, http://localhost:8000) e
frontend (3000, http://localhost:3000) — confira o `README.md` do projeto principal.

## Instalação e execução

Dentro desta pasta:

```bash
npm install
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

O teste de "denunciante tentando acessar o Dashboard do gestor" foi incluído
porque, na análise de segurança do projeto, identificamos que essa verificação
de perfil (role) ainda não existe no backend — o teste documenta esse
comportamento de forma automatizada, e passa a falhar sozinho no dia em que
essa proteção for implementada corretamente (o que é o resultado esperado).

## Observação sobre dados de teste

Não existe script de seed no projeto, então:
- O teste do denunciante cria uma conta nova a cada execução (e-mail com timestamp), para não colidir com execuções anteriores.
- O teste do gestor cria a conta de gestor direto pela API antes do teste, porque a tela pública de cadastro só permite criar contas de denunciante (por design).

## Limitação conhecida

Os testes assumem banco de dados "vivo" entre execuções (sem reset automático).
Rodar os testes várias vezes vai acumular usuários e denúncias de teste no banco
local — isso é aceitável para o ambiente de desenvolvimento, mas não deveria
apontar para um ambiente de produção.
