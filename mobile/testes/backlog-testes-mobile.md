# Backlog de testes do app mobile (S.O.S Cidade)

Estado atualizado em 25/11/2026: o app (`mobile/`, Expo SDK 58 + React Native) tem 9 suites Jest com 45 testes unitarios/servico. Um workflow manual e de PR executa 10 cenarios de integracao dos servicos Mobile contra Backend real em banco descartavel. Ainda nao ha fluxos Maestro nem workflow de teste de interface nativa. A cobertura de cada item abaixo e computada pelas linhas marcadas `✅`; integracao de servicos nao equivale a E2E nativo.

**Legenda.** Tipo: **Smoke** (fluxo crítico), **E2E** (fluxo completo), **Unit** (função isolada), **Seg** (segurança). Status ✅ significa coberto por teste automatizado; 🔲 significa que ainda falta implementar ou executar a cobertura completa. Prioridade segue a política do plano de testes da equipe.

## Decisões de ferramenta

| Camada | Ferramenta | Por quê |
|---|---|---|
| E2E e smoke | **Maestro (proposta)** | Fluxos YAML a criar e calibrar num emulador Android; ainda não há E2E nativo Maestro |
| Unitários | Jest + `jest-expo` | Padrão do Expo. Testa regras de validação e stores sem emulador |

**Maestro é difícil?** O fluxo em si é a parte fácil: cada passo é uma linha (`tapOn`, `inputText`, `assertVisible`). A parte trabalhosa é o **ambiente**: o emulador no CI, o build do app e o app falando com o backend. Essa infraestrutura ainda não existe neste repositório; M-00 deve começar por configurá-la e executar o primeiro fluxo nativo.

## Fase 0: infraestrutura

| ID | Item | Tipo | Prioridade | Status |
|---|---|---|---|---|
| M-00 | Primeira execução real do workflow de E2E nativo `mobile-e2e` e ajuste de tempos e seletores | E2E | Alta | 🔲 |
| M-01 | Fluxos Maestro com tags `smoke`, `e2e` e `flaky` e script com nova tentativa e quarentena | E2E | Alta | 🔲 |
| M-02 | Subflows reutilizáveis (abrir app, cadastrar e logar, logar gestor, criar denúncia) | E2E | Alta | 🔲 |
| M-03 | Workflow `mobile-e2e` (emulador Android, backend local, Metro) | E2E | Alta | 🔲 |
| M-04 | Tornar `mobile-e2e` check obrigatório da `main` depois de 10 execuções verdes seguidas | E2E | Média | 🔲 |
| M-05 | Configurar Jest com `jest-expo` e script `npm test` no `mobile/` | Unit | Alta | ✅ |
| M-06 | Workflow `mobile-backend-integration` com execucao manual e API real | Integracao | Alta | ✅ |

## Fase 1: smoke (3 fluxos, roda em PR que mexe em `mobile/`)

| ID | Fluxo | Arquivo | Status |
|---|---|---|---|
| MS-01 | Gestor faz login e vê o painel | `smoke-01-login-gestor.yaml` | 🔲 |
| MS-02 | Denunciante se cadastra, registra uma denúncia e vê o protocolo | `smoke-02-denunciante-registra-denuncia.yaml` | 🔲 |
| MS-03 | Denunciante comum não vê as telas do gestor | `smoke-03-denunciante-sem-acesso-gestor.yaml` | 🔲 |

## Fase 2: E2E

| ID | Fluxo | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| ME-01 | Login: validação dos campos e aceite legal obrigatório | `e2e-01-login-validacoes.yaml` | Média | 🔲 |
| ME-02 | Login: senha errada não entra | `e2e-02-login-credenciais-invalidas.yaml` | Alta | 🔲 |
| ME-03 | Cadastro: validações, senhas diferentes e aceite legal | `e2e-03-cadastro-validacoes.yaml` | Média | 🔲 |
| ME-04 | Nova denúncia exige tipo e bairro | `e2e-04-nova-denuncia-validacoes.yaml` | Média | 🔲 |
| ME-05 | Denúncia registrada aparece em Minhas Denúncias | `e2e-05-minhas-denuncias.yaml` | Alta | 🔲 |
| ME-06 | Logout volta para a tela inicial | `e2e-06-logout.yaml` | Média | 🔲 |
| ME-07 | Gestor navega entre as abas | `e2e-07-gestor-navega-abas.yaml` | Média | 🔲 |
| ME-08 | Busca em Minhas Denúncias filtra por tipo e bairro | `e2e-08-minhas-denuncias-busca.yaml` | Baixa | 🔲 |
| ME-09 | Detalhe da denúncia mostra os dados enviados | | Média | 🔲 |
| ME-10 | Gestor busca a denúncia pelo protocolo e abre o detalhe | `e2e-09-gestor-busca.yaml` | Média | 🔲 |
| ME-11 | Gestor cria outro gestor (bloqueado até existir endpoint administrativo adequado) | `int-07-gestor-cria-gestor.yaml` | Média | 🔲 |
| ME-12 | Dashboard do gestor abre e mostra o total | `e2e-10-dashboard-gestor.yaml` | Baixa | 🔲 |
| ME-13 | Mapa do gestor abre (depende de chave de mapas e de GPS: candidato a `flaky`) | | Baixa | 🔲 |
| ME-14 | Anexar imagem à denúncia (limite de 4) | | Baixa | 🔲 |
| ME-15 | Permissões de câmera, galeria e localização: negar e conceder | | Média | 🔲 |
| ME-16 | Sessão persiste ao fechar e reabrir o app (hoje não persiste: o README do mobile lista como pendência) | | Média | 🔲 |
| ME-17 | Sem internet: o app mostra erro claro (também pendência do README) | | Média | 🔲 |

## Fase 3: unitários (Jest)

| ID | O que testar | Onde | Prioridade | Status |
|---|---|---|---|---|
| MU-01 | Validação de login (e-mail e senha) | `app/(public)/login.tsx` (extrair a função) | Média | ✅ |
| MU-02 | Validação de cadastro (nome, e-mail, senha, confirmação) | `app/(public)/register.tsx` | Média | ✅ |
| MU-03 | Cliente HTTP: envia `Authorization`, trata erros, timeout e resposta de filtros repetidos | `src/services/http.ts`, `src/services/denunciaService.ts` | Alta | ✅ |
| MU-04 | `useAuthStore`: login guarda o token, logout apaga | `src/store/useAuthStore.ts` | Alta | ✅ |
| MU-05 | `useDenunciasStore`: cache, lista, paginacao e filtros | `src/store/useDenunciasStore.ts` | Média | ✅ |

## Fase 4: segurança do app

| ID | Verificação | Tipo | Prioridade | Status |
|---|---|---|---|---|
| MX-01 | Denunciante comum não vê as telas do gestor | Seg / Smoke | Alta | 🔲 |
| MX-02 | O token fica no `expo-secure-store`, nunca em `AsyncStorage` | Seg / Unit | Alta | ✅ |
| MX-03 | Logout apaga o token do armazenamento seguro | Seg / Unit | Alta | ✅ |
| MX-04 | A API rejeita token adulterado; falta validar expiração e retorno ao login | Seg / E2E | Alta | 🔲 |
| MX-05 | O app em produção só fala HTTPS (as URLs do `eas.json` são HTTPS; conferir que não sobra `http://` no código) | Seg | Média | 🔲 |
| MX-06 | Nenhuma senha ou token aparece em log do app | Seg | Média | 🔲 |
| MX-07 | Rota do gestor acessada direto por link profundo (`soscidade://`) por denunciante é bloqueada | Seg / E2E | Alta | 🔲 |

## Fase 5: integração app + backend

Os fluxos de integração propostos poderão chamar a API para preparar dados e conferir o que o app gravou. Isso testa o app e o backend juntos, em duas direções: app para backend e backend para app.

| ID | O que verifica | Arquivo | Prioridade | Status |
|---|---|---|---|---|
| MI-01 | Denuncia criada pelo servico Mobile chega ao Backend com campos e protocolo | `src/services/__integration__/backend.integration.test.ts` | Alta | ✅ (API; sem UI nativa) |
| MI-02 | Denúncia criada pela API aparece no app, com descrição no detalhe | `int-02-backend-cria-app-mostra.yaml` | Alta | 🔲 |
| MI-03 | Gestor altera situação e o backend grava | `int-03-gestor-altera-status-backend-confirma.yaml` | Alta | 🔲 |
| MI-04 | Status alterado pela API aparece para o denunciante | `int-04-backend-resolve-app-mostra.yaml` | Média | 🔲 |
| MI-05 | Perfil denunciante recebe 403 nas rotas de gestor e token invalido e recusado | `src/services/__integration__/backend.integration.test.ts` | Alta | ✅ (API; sem UI nativa) |
| MI-06 | Denunciante não lê a denúncia de outra pessoa (`GET /denuncias/:id`) | `int-06-seguranca-denunciante-nao-le-denuncia-alheia.yaml` | Alta | 🔲 (regra coberta pela suíte API, sem E2E mobile) |
| MI-07 | Endpoint protegido cria gestor com papel GESTOR | `src/services/__integration__/backend.integration.test.ts` | Alta | ✅ (login do novo gestor ainda sem cenário) |
| MI-08 | Denuncia anonima: nome fica "Anonimo" na resposta do Backend | `src/services/__integration__/backend.integration.test.ts` | Media | ✅ |
| MI-09 | Envio de imagem: o backend recebe e devolve até 4 imagens | | Baixa | 🔲 |
| MI-10 | Backend fora do ar: a camada HTTP trata falha de rede sem travar | `src/services/__tests__/http.test.ts` | Media | ✅ (unidade; sem indisponibilidade real) |
| MI-11 | Exclusao usa o endpoint do Backend durante limpeza de dados de integracao | `src/services/__integration__/backend.integration.test.ts` | Media | ✅ (servico; sem UI nativa) |

### Achados atuais

Os fluxos Maestro acima ainda não existem. A leitura do código identificou:

- **MI-07:** `backend/src/services/user.service.ts` força `DENUNCIANTE` em cadastro público. A tela de gestão envia `GESTOR`, mas o endpoint não cria esse perfil; a interface precisa ser corrigida ou o backend ganhar um fluxo administrativo protegido.
- **MI-06:** corrigido: `GET /denuncias/:id` agora limita acesso ao titular ou a um gestor e responde 404 para outro denunciante. Há teste de regressão na suíte API; falta o E2E mobile.

Se a execução confirmar, a política manda tratá-los como `falha:sut`: abrir issue pelo formulário, **não** pôr em quarentena nem apagar o teste. Se a equipe decidir que algum comportamento é intencional, a decisão vira `falha:esperada` e o teste muda no mesmo pull request.

## Cobertura atual

| Área do app | Cobertura | Observação |
|---|---|---|
| Login, cadastro e logout | Boa | Caminho feliz, validações e senha errada |
| Registro de denúncia (tipo, bairro, descrição) | Boa | App e backend conferidos |
| Minhas denúncias, detalhe, busca | Média | Falta o filtro por situação |
| Painel do gestor (lista, busca, status) | Média | Falta o filtro por tipo e bairro |
| Dashboard | Fraca | Só abre e mostra "Total", sem conferir números |
| Mapa | Nenhuma | Depende de chave de mapas e de GPS |
| Gestores (criar e remover) | Parcial | Criar tem teste (que deve falhar), remover não |
| Imagens, câmera, localização, permissões | Nenhuma | Exigem permissão do sistema no emulador |
| Notificações | Nenhuma | Disparam na mudança de status |
| Sessão ao reabrir o app e modo offline | Nenhuma | O README do mobile lista como pendência |
| Controle de acesso (API) | Média | Rotas de gestor e token, mais dois testes para as falhas acima |
| Unitários/serviços (Jest) | 45 casos | Nove suites executaveis; inclui os casos de contrato 41-50 recebidos no chat |
| Integração Mobile + Backend | 10 casos | Chamadas reais por serviços Mobile; executados em banco descartável |

## Pendências e riscos conhecidos

- **Seletores por texto.** Os fluxos usam os rótulos de acessibilidade (`accessibilityLabel`). Se alguém trocar um rótulo, o fluxo quebra: é `falha:esperada` ou `falha:tas` (ver `docs/tas-mobile.md`). Item de melhoria: acrescentar `testID` nos elementos críticos.
- **Só Android.** O iOS exige Mac e não está no CI. Fica para depois do M-04.
- **Os fluxos não foram executados.** Foram escritos a partir das telas e dos textos do código.
- **Dados.** Os fluxos criam usuários com e-mail único (`maestro.<hora>@sos.com`) e não apagam nada. Em banco descartável do CI isso não importa. Contra um banco compartilhado, vão acumular lixo.
