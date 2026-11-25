# Backlog de testes do app mobile

O app tem uma suíte Jest com `jest-expo`, executada pelo job `unit-api`.
Esses testes validam regras e serviços; não simulam telas nativas nem substituem
testes em Android ou iOS. `mobile-smoke` e `build:web` ainda não existem neste
checkout, portanto os fluxos de interface abaixo continuam pendentes.

**Legenda:** ✅ coberto por teste automatizado; 🔲 ainda não automatizado.

## Infraestrutura

| ID | Item | Status |
|---|---|---|
| M-00 | Implementar e calibrar a primeira suíte de interface mobile | 🔲 |
| M-01 | Criar fluxos mobile com smoke, E2E e quarentena | 🔲 |
| M-02 | Extrair subfluxos reutilizáveis de cadastro, login e denúncia | 🔲 |
| M-03 | Criar workflow de interface mobile com backend de teste | 🔲 |
| M-04 | Tornar o workflow mobile obrigatório após 10 execuções verdes | 🔲 |
| M-05 | Configurar Jest, `jest-expo` e JUnit para testes unitários | ✅ |

## Smoke de interface

| ID | Fluxo | Status |
|---|---|---|
| MS-01 | Gestor faz login e vê o painel | 🔲 |
| MS-02 | Denunciante se cadastra, registra denúncia e vê o protocolo | 🔲 |
| MS-03 | Denunciante não acessa as telas do gestor | 🔲 |

## E2E de interface e integração

| ID | Fluxo | Status |
|---|---|---|
| ME-01 | Login valida e-mail e senha | 🔲 |
| ME-02 | Senha incorreta não inicia sessão | 🔲 |
| ME-03 | Cadastro valida campos e aceite legal | 🔲 |
| ME-04 | Logout retorna à tela inicial | 🔲 |
| ME-05 | Sessão persiste ao recarregar ou reabrir o app | 🔲 |
| ME-06 | Falta de conexão mostra aviso e dados em cache | 🔲 |
| ME-07 | Denúncia registrada aparece em "Minhas Denúncias" | 🔲 |
| ME-08 | Gestor altera situação e o denunciante vê a atualização | 🔲 |

## Unitários (Jest)

| ID | O que cobre | Arquivo | Status |
|---|---|---|---|
| MU-01 | Validações de login, cadastro, gestor e denúncia | `src/utils/validation.ts` | ✅ |
| MU-02 | Tradução de erros HTTP e expiração de token | `src/utils/apiErrors.ts` | ✅ |
| MU-03 | Sucesso, sessão expirada, permissões, offline e erros do servidor | `src/services/http.ts` | ✅ |
| MU-04 | Salvar, ler e limpar somente o prefixo de cache | `src/services/cacheService.ts` | ✅ |
| MU-05 | Armazenamento seguro nativo e fallback web | `src/services/secureStorage.ts` | ✅ |
| MU-06 | Lista online, cache offline, erro sem cache e logout | `src/store/useDenunciasStore.ts` | ✅ |
| MU-07 | Login, logout, expiração única e verificação de sessão | `src/store/useAuthStore.ts` | ✅ |

## Segurança e riscos pendentes

| ID | Verificação | Status |
|---|---|---|
| MX-01 | Denunciante não acessa telas nem rotas do gestor | 🔲 |
| MX-02 | Token usa armazenamento seguro no app nativo | ✅ |
| MX-03 | Logout apaga o token armazenado | ✅ |
| MX-04 | Token vencido retorna ao login com aviso claro | 🔲 |
| MX-05 | URLs de produção usam HTTPS e segredos não aparecem em logs | 🔲 |
| MI-01 | Denúncia do app chega ao backend com protocolo | 🔲 |
| MI-02 | Alteração do gestor é persistida e aparece para o denunciante | 🔲 |

Os testes unitários já cobrem armazenamento e expiração da sessão no nível de
serviços e stores. A confirmação desses comportamentos na interface real depende
da futura suíte mobile; nenhum resultado unitário prova o funcionamento nativo
em Android ou iOS.
