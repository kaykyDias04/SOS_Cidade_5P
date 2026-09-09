# Relatório de Entrega: Automação de Testes de API

**Disciplina / Contexto:** Projeto Integrador — Projetos 5  
**Sistema sob Teste (SUT):** S.O.S-Cidade (Recife)  
**Squad:** S.O.S-Cidade / Projetos 5  
**Data:** Setembro de 2026  
**Status da Suíte:** 100% Aprovada (5 Suítes, 47 Testes Passando, 0 Falhas)

---

## 1. Identificação do Sistema sob Teste (SUT)

O **S.O.S-Cidade** é uma plataforma de gestão e registro de ocorrências de zeladoria urbana desenvolvida especificamente para o município do Recife. A solução conecta os cidadãos recifenses aos gestores públicos municipais, permitindo a abertura de denúncias (identificadas ou anônimas) georreferenciadas por bairro e acompanhadas em tempo real através de dashboards e mapas temáticos.

### 1.1. Arquitetura e Stack Tecnológica da API
- **Ambiente de Execução:** Node.js (v20+ / v24)
- **Framework Web:** Express 4.19+ com suporte a middleware de CORS, JSON e cookies
- **Linguagem:** TypeScript 5
- **ORM / Persistência:** Prisma ORM integrado a banco de dados relacional PostgreSQL
- **Mecanismo de Cache:** Redis (`ioredis`) com política de cache-aside e degradação graciosa
- **Autenticação e Sessão:** JSON Web Tokens (JWT) trafegados de forma segura e híbrida: via Cookies `HttpOnly` (`authToken`) e cabeçalho `Authorization: Bearer <token>`
- **Documentação da API:** OpenAPI 3.0 via Swagger UI (`/api-docs`)

---

## 2. Endpoints Contemplados

A suíte automatizada cobre **100% dos endpoints** disponibilizados pela API do SUT:

| Módulo | Verbo HTTP | Endpoint | Descrição / Regra de Negócio | Autenticação Requerida |
| :--- | :---: | :--- | :--- | :---: |
| **Infraestrutura** | `GET` | `/health` | Liveness probe e verificação de saúde da aplicação | Não |
| **Documentação** | `GET` | `/api-docs` | Interface gráfica interativa da especificação OpenAPI | Não |
| **Autenticação** | `POST` | `/auth/login` | Autenticação com email/senha, emissão de JWT e cookie HttpOnly | Não |
| **Autenticação** | `POST` | `/auth/logout` | Encerramento de sessão e limpeza do cookie `authToken` | Não |
| **Usuários** | `POST` | `/users` | Cadastro de novos usuários (Denunciante ou Gestor) | Não |
| **Usuários** | `GET` | `/users` | Listagem de usuários filtrada por query param `role` | Não |
| **Usuários** | `DELETE` | `/users/:id` | Exclusão de usuário com validação de ID numérico | Não |
| **Denúncias** | `POST` | `/denuncias` | Abertura de denúncia (identificada/anônima, protocolo SOS) | **Sim (JWT/Cookie)** |
| **Denúncias** | `GET` | `/denuncias` | Listagem paginada (`_page`, `_limit`) com cache Redis | **Sim (JWT/Cookie)** |
| **Denúncias** | `GET` | `/denuncias/:id` | Consulta detalhada por ID com desserialização de imagens | **Sim (JWT/Cookie)** |
| **Denúncias** | `PATCH` | `/denuncias/:id` | Atualização de status da ocorrência e fotos anexadas | **Sim (JWT/Cookie)** |
| **Denúncias** | `DELETE` | `/denuncias/:id` | Remoção de denúncia e invalidação do cache Redis | **Sim (JWT/Cookie)** |

---

## 3. Relação dos Cenários Automatizados

A suíte contempla **47 cenários de testes automatizados**, categorizados em testes positivos (fluxos esperados), testes negativos (rejeições intencionais) e validações de exceções/segurança:

### Módulo 01: Infraestrutura, Roteamento e Segurança Base (`01_health_and_routing.test.ts`)
| ID | Endpoint | Descrição do Cenário | Tipo | Status HTTP | Resultado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CT-INF-01** | `GET /health` | Liveness probe deve responder status 200 e texto "OK" | Positivo | 200 OK | **Aprovado** |
| **CT-INF-02** | `GET /api-docs/` | Acesso à documentação Swagger UI interativa | Positivo | 200/301 | **Aprovado** |
| **CT-INF-03** | `GET /rota-inexistente` | Requisição a rota não mapeada deve retornar 404 | Negativo | 404 Not Found | **Aprovado** |
| **CT-INF-04** | `PUT /health` | Método HTTP não suportado em rota válida deve retornar 404 | Negativo | 404 Not Found | **Aprovado** |
| **CT-INF-05** | `GET /health` (CORS) | Origem permitida (`localhost:3000`) recebe headers CORS e credentials | Segurança | 200 OK | **Aprovado** |
| **CT-INF-06** | `OPTIONS /denuncias` | Pre-flight CORS deve autorizar verbos (GET, POST, PATCH, DELETE) | Segurança | 200/204 | **Aprovado** |

### Módulo 02: Autenticação, Sessão e Proteção de Rotas (`02_auth.test.ts`)
| ID | Endpoint | Descrição do Cenário | Tipo | Status HTTP | Resultado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CT-AUT-01** | `POST /auth/login` | Login com sucesso de Denunciante retorna JWT e perfil sem senha | Positivo | 200 OK | **Aprovado** |
| **CT-AUT-02** | `POST /auth/login` | Injeção de Cookie seguro `authToken` com flag `HttpOnly` | Segurança | 200 OK | **Aprovado** |
| **CT-AUT-03** | `POST /auth/login` | Login com sucesso de Gestor retorna cargo GESTOR | Positivo | 200 OK | **Aprovado** |
| **CT-AUT-04** | `POST /auth/login` | Rejeição de login com senha incorreta | Negativo | 401 Unauthorized | **Aprovado** |
| **CT-AUT-05** | `POST /auth/login` | Rejeição de login com email não cadastrado no banco | Negativo | 401 Unauthorized | **Aprovado** |
| **CT-AUT-06** | `POST /auth/login` | Rejeição de login com corpo de requisição vazio | Exceção | 401 Unauthorized | **Aprovado** |
| **CT-AUT-07** | `POST /auth/logout` | Encerramento de sessão limpa o cookie `authToken` | Positivo | 200 OK | **Aprovado** |
| **CT-AUT-08** | `GET /denuncias` | Bloqueio de rota protegida sem fornecimento de token | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-AUT-09** | `GET /denuncias` | Bloqueio de requisição com token JWT forjado/inválido | Segurança | 403 Forbidden | **Aprovado** |
| **CT-AUT-10** | `GET /denuncias` | Acesso autorizado utilizando token no Cookie `authToken` | Positivo | 200 OK | **Aprovado** |
| **CT-AUT-11** | `GET /denuncias` | Acesso autorizado utilizando token no Header `Authorization: Bearer` | Positivo | 200 OK | **Aprovado** |

### Módulo 03: Gestão de Usuários (`03_users.test.ts`)
| ID | Endpoint | Descrição do Cenário | Tipo | Status HTTP | Resultado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CT-USR-01** | `POST /users` | Cadastro de usuário com role default `DENUNCIANTE` e hash bcrypt | Positivo | 200 OK | **Aprovado** |
| **CT-USR-02** | `POST /users` | Cadastro explícito de usuário com perfil `GESTOR` | Positivo | 200 OK | **Aprovado** |
| **CT-USR-03** | `POST /users` | Tratamento amigável de erro P2002 para email duplicado | Regra Negócio | 400 Bad Request | **Aprovado** |
| **CT-USR-04** | `GET /users?role=DENUNCIANTE` | Listagem filtrada por role DENUNCIANTE sem vazamento de senhas | Positivo | 200 OK | **Aprovado** |
| **CT-USR-05** | `GET /users?role=GESTOR` | Listagem filtrada por role GESTOR sem vazamento de senhas | Positivo | 200 OK | **Aprovado** |
| **CT-USR-06** | `GET /users` | Consulta sem query param `role` retorna array vazio `[]` | Regra Negócio | 200 OK | **Aprovado** |
| **CT-USR-07** | `DELETE /users/:id` | Exclusão de usuário com ID numérico existente | Positivo | 200 OK | **Aprovado** |
| **CT-USR-08** | `DELETE /users/:id` | Rejeição de ID alfanumérico inválido (ex: `abc`) | Validação | 400 Bad Request | **Aprovado** |
| **CT-USR-09** | `DELETE /users/:id` | Exclusão de ID inexistente captura erro de persistência | Exceção | 500 Internal Server | **Aprovado** |

### Módulo 04: Gestão de Denúncias e Ocorrências Urbanas (`04_denuncias.test.ts`)
| ID | Endpoint | Descrição do Cenário | Tipo | Status HTTP | Resultado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CT-DEN-01** | `POST /denuncias` | Criação de denúncia identificada com geração de protocolo `SOS-AAAA-XXXXXXXX` | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-02** | `POST /denuncias` | Criação de denúncia anônima oculta denunciante gravando `Anônimo` | Regra Negócio | 200 OK | **Aprovado** |
| **CT-DEN-03** | `POST /denuncias` | Suporte a fotos em base64 com desserialização automática em array | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-04** | `POST /denuncias` | Rejeição de criação sem autenticação | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-DEN-05** | `GET /denuncias` | Paginação padrão (`page=1`, `limit=50`) com envelope `data` e `meta` | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-06** | `GET /denuncias` | Respeito aos parâmetros de query customizados `_page` e `_limit` | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-07** | `GET /denuncias` | Leitura otimizada do cache Redis quando chave existente | Performance | 200 OK | **Aprovado** |
| **CT-DEN-08** | `GET /denuncias` | Rejeição de listagem sem token de autenticação | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-DEN-09** | `GET /denuncias/:id` | Consulta de detalhes de denúncia existente por ID | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-10** | `GET /denuncias/:id` | Consulta de denúncia com ID inexistente retorna 404 | Negativo | 404 Not Found | **Aprovado** |
| **CT-DEN-11** | `GET /denuncias/:id` | Rejeição de consulta de detalhe sem autenticação | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-DEN-12** | `PATCH /denuncias/:id` | Atualização de status da denúncia (ex: `Finalizada`) por Gestor | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-13** | `PATCH /denuncias/:id` | Atualização/substituição de imagens anexadas à ocorrência | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-14** | `PATCH /denuncias/:id` | Rejeição de atualização sem autenticação | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-DEN-15** | `DELETE /denuncias/:id` | Exclusão de denúncia existente do banco de dados | Positivo | 200 OK | **Aprovado** |
| **CT-DEN-16** | `DELETE /denuncias/:id` | Rejeição de exclusão sem autenticação | Segurança | 401 Unauthorized | **Aprovado** |
| **CT-DEN-17** | `* /denuncias` | Invalidação automática de chaves de cache `denuncias:*` no Redis | Consistência | 200 OK | **Aprovado** |

### Módulo 05: Contratos de Dados e OpenAPI/Swagger (`05_api_contracts.test.ts`)
| ID | Endpoint | Descrição do Cenário | Tipo | Status HTTP | Resultado |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **CT-CON-01** | `POST /users` | Validação de conformidade do modelo User com o schema `swagger.json` | Contrato | 200 OK | **Aprovado** |
| **CT-CON-02** | `GET /denuncias/:id` | Validação de conformidade do modelo Denuncia com o `swagger.json` | Contrato | 200 OK | **Aprovado** |
| **CT-CON-03** | `GET /denuncias` | Validação estrutural do envelope paginado (`data` e `meta`) | Contrato | 200 OK | **Aprovado** |
| **CT-CON-04** | Erros de API | Padronização estrutural dos payloads de erro `{ success: false, error: string }` | Contrato | 401/403/404 | **Aprovado** |

---

## 4. Código-Fonte da Suíte de Testes

Toda a suíte foi construída e estruturada dentro da pasta `tests/`:

```text
tests/
├── 01_health_and_routing.test.ts    # Testes de Liveness probe, CORS, 404 e Swagger UI
├── 02_auth.test.ts                  # Testes de Login, Logout, Cookies HttpOnly e Bearer JWT
├── 03_users.test.ts                 # Testes de Usuários, Hashing, Unicidade e Filtros
├── 04_denuncias.test.ts             # CRUD de Denúncias, Anonimato, Protocolo e Cache Redis
├── 05_api_contracts.test.ts         # Validação de conformidade estrutural com swagger.json
├── helpers/
│   ├── authHelper.ts                # Utilitário de tokens JWT válidos e forjados
│   └── mockDb.ts                    # Mock in-memory do Prisma e Redis (isolado e determinístico)
├── evidencias/
│   └── test-execution-report.txt    # Log integral da execução dos testes
├── jest.config.js                   # Configuração do Jest + ts-jest
├── package.json                     # Scripts de teste e dependências
├── tsconfig.json                    # Mapeamento TypeScript
├── setup.ts                         # Polyfill para compatibilidade de MIME no superagent
├── run-tests.ps1                    # Script de execução rápida para Windows PowerShell
├── run-tests.sh                     # Script de execução rápida para Linux/macOS
└── RELATORIO_ENTREGA.md             # Este relatório técnico de entrega
```

### Destaques Técnicos da Implementação:
1. **Supertest com Aplicação Express Real:** Os testes instanciam o `app` Express real (`backend/src/app.ts`), exercitando todos os middlewares, parsers, rotas e controladores em memória, sem necessidade de portas de rede ocupadas.
2. **Execução 100% Determinística (Zero Flakiness):** Através do `mockDb.ts`, as operações do Prisma e Redis são emuladas com total fidelidade às regras relacionais do PostgreSQL (ex: código de erro `P2002` para unicidade de email), permitindo que a suíte seja executada em qualquer máquina, pipeline de CI/CD ou ambiente de correção acadêmica sem depender de contêineres Docker ativos.
3. **Autenticação Híbrida Realista:** O `authHelper.ts` gera e assina tokens criptográficos reais com o segredo da aplicação (`JWT_SECRET`), validando tanto o tráfego de credenciais por Cookie seguro quanto pelo cabeçalho `Authorization: Bearer`.

---

## 5. Instruções Necessárias para Configuração e Execução

### 5.1. Pré-requisitos
- **Node.js:** Versão 18 ou superior (testado e validado em Node.js v24.13.0).
- **NPM:** Gerenciador de pacotes (testado na versão 11.6.2).

### 5.2. Como Executar os Testes

#### Opção A — Execução a partir da Raiz do Projeto
```bash
# Na raiz de S.O.S-Cidade
npm test
```

#### Opção B — Execução de dentro da pasta `tests/`
```bash
cd tests
npm test
```

#### Opção C — Execução via Script PowerShell (Windows)
```powershell
cd tests
powershell -ExecutionPolicy Bypass -File .\run-tests.ps1
```

#### Opção D — Execução via Script Bash (Linux / macOS)
```bash
cd tests
chmod +x run-tests.sh
./run-tests.sh
```

---

## 6. Evidências da Execução dos Testes

O arquivo de log completo está salvo em [tests/evidencias/test-execution-report.txt](file:///c:/Users/kayky.oliveira/Desktop/repos/S.O.S-Cidade/tests/evidencias/test-execution-report.txt). Abaixo encontra-se o resumo da execução consolidada:

```text
================================================================================
EVIDÊNCIA DE EXECUÇÃO DA SUÍTE DE TESTES DE API
SUT: S.O.S-Cidade (Recife) - Projeto Integrador (Projetos 5)
Data da Execução: 2026-09-09 12:01:04
Ambiente: Node.js v24.13.0 / Jest 29 / Supertest 6
Status: SUCESSO (100% dos testes aprovados)
================================================================================

PASS ./04_denuncias.test.ts (17 testes)
PASS ./02_auth.test.ts (11 testes)
PASS ./03_users.test.ts (9 testes)
PASS ./05_api_contracts.test.ts (4 testes)
PASS ./01_health_and_routing.test.ts (6 testes)

Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        2.554 s
Ran all test suites.
```

---

## 7. Breve Análise dos Resultados Obtidos

A execução da suíte automatizada forneceu percepções valiosas sobre o comportamento, a maturidade técnica e as oportunidades de melhoria na API do SUT **S.O.S-Cidade**:

### 7.1. Pontos Fortes do SUT Identificados
1. **Segurança no Tratamento de Credenciais:**
   - O SUT utiliza hash forte (`bcryptjs` com salt 10) para armazenamento de senhas.
   - Os responses das rotas de criação e listagem de usuários sanitizam o retorno, **nunca expondo o hash da senha**.
   - As sessões utilizam cookies `HttpOnly` com `SameSite: none` e flag `secure: true`, protegendo contra ataques XSS.
2. **Respeito às Regras de Anonimato:**
   - O SUT garante a privacidade do cidadão: quando `identificacao: false`, o campo `nomeDenunciante` é rigorosamente preenchido como `"Anônimo"`, ocultando dados de identificação do cidadão até mesmo da visão do gestor.
3. **Consistência na Invalidação do Cache:**
   - As operações de escrita (`POST`, `PATCH`, `DELETE`) em denúncias garantem a invalidação das chaves residuais de cache no Redis (`denuncias:*`), evitando que os gestores vejam dados defasados.
4. **Resiliência e Degradação Graciosa:**
   - O cliente Redis verifica se a variável `REDIS_URL` está presente. Na ausência de cache, a API degrada graciosamente e atende diretamente via banco de dados sem quebrar.

### 7.2. Falhas, Limitações e Comportamentos Inesperados Identificados
Durante a automação, a equipe identificou as seguintes oportunidades de refatoração no SUT:
1. **Status HTTP no Tratamento de Exclusão de Usuário Inexistente:**
   - No endpoint `DELETE /users/:id`, ao passar um ID inexistente, o Prisma lança o erro `P2025` (*Record to delete does not exist*). O controlador captura no `catch` genérico e responde com **HTTP 500** (`Erro interno no servidor`). O comportamento HTTP padrão da indústria seria responder com **HTTP 404 Not Found**.
2. **Validação de Schemas no Backend:**
   - Embora o frontend faça validação de campos obrigatórios via Zod/React Hook Form, alguns endpoints do backend (como `POST /denuncias`) não possuem validação estrita com middleware de schema (como Joi ou Zod no Express). Se uma requisição direta enviar campos vazios, pode gerar erros não formatados na camada de banco de dados.
3. **Controle Fino de Autorização (RBAC):**
   - O middleware `auth.middleware.ts` valida se o usuário possui um token válido (autenticação), mas não valida se a rota `PATCH /denuncias/:id` (mudança de status da ocorrência) é restrita exclusivamente a usuários com role `GESTOR`. Recomenda-se adicionar um middleware `authorize(['GESTOR'])` nessa rota.

### 7.3. Conclusão da Qualidade do SUT
O SUT **S.O.S-Cidade** demonstra uma arquitetura sólida, moderna e bem estruturada, cumprindo com êxito os requisitos funcionais do Projeto Integrador de Projetos 5. A suíte automatizada de testes com 47 cenários consolida uma rede de segurança essencial, viabilizando refatorações contínuas e garantindo a confiabilidade da aplicação.
