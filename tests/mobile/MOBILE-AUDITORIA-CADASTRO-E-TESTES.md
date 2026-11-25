Pensou por 24s

Sim! E você tinha razão em lembrar dos testes E2E. O projeto já possui testes E2E, mas eles não estão cobrindo o aplicativo Mobile nativo.

Conferi novamente os arquivos do ZIP e encontrei:

* 8 cenários E2E, distribuídos em 4 arquivos.

* Eles usam Playwright, com projeto `chromium` e navegador Desktop Chrome.

* A URL-base é `http://localhost:3000`, ou seja, os testes navegam pelo Frontend web.

* Cobrem cadastro e login de cidadão, criação e histórico de denúncias, login de gestor, acesso ao Dashboard e alteração de situação.

* O README da pasta E2E ainda menciona 7 cenários em 3 arquivos; essa informação está desatualizada em relação aos arquivos atuais.

Então, esses testes são importantes e devem ser preservados, mas não substituem testes de telas, hooks, serviços e fluxos do Expo/React Native no Android e iOS.

### 1\. Arquivos de teste que preparei

Criei uma suíte inicial com 50 casos de teste, além da configuração do Jest para Expo:

* Arquivo com os 50 testes

* Configuração do Jest

A suíte contempla validações de cadastro e login, categorias, situações, datas, imagens e chamadas dos serviços de autenticação, usuários e denúncias.

Importante: são testes unitários iniciais. Eles não equivalem a 50 testes de interface nem garantem cobertura completa do Mobile. O Copilot deverá integrá-los ao projeto, verificar compatibilidade e ampliar a cobertura de telas e hooks.

### 2\. Prompt completo para o GitHub Copilot

Preparei um prompt para ele trabalhar no projeto inteiro, corrigindo as falhas encontradas e implementando os testes sem modificar os papéis principais do sistema.

# Tarefa: corrigir integrações e ampliar a cobertura de testes do S.O.S. Escola / S.O.S. Cidade

Faça uma análise do repositório completo antes de alterar qualquer arquivo. O projeto possui Backend, Frontend Web e Mobile Expo/React Native.

O objetivo é corrigir as falhas de integração encontradas na auditoria e ampliar a cobertura automatizada do Mobile.

## 1. REGRAS OBRIGATÓRIAS — NÃO ALTERAR A REGRA DE NEGÓCIO DOS PAPÉIS

**Não renomeie, remova, substitua ou modifique os papéis principais do sistema:**

- `GESTOR`
- `DENUNCIANTE`

Esses valores devem continuar exatamente como estão, inclusive em:
- Types e interfaces;
- Enums e constantes;
- Banco de dados e Prisma;
- JWT e autenticação;
- Middlewares e autorização;
- Rotas e serviços;
- Stores;
- Telas e navegação;
- Testes automatizados.

Não substitua esses papéis por nomes diferentes, não inverta suas permissões e não altere o significado de cada perfil.

Regras que precisam ser preservadas:
- DENUNCIANTE: pode cadastrar-se publicamente, realizar login, criar denúncias e consultar suas próprias denúncias.
- GESTOR: pode acessar as funcionalidades administrativas e gerenciar denúncias e gestores conforme as permissões existentes.
- O cadastro público não pode permitir que uma pessoa se torne GESTOR apenas enviando `role: "GESTOR"` na requisição.

Não faça refatorações desnecessárias nem alterações visuais fora do escopo.

## 2. CORREÇÕES DE INTEGRAÇÃO

### 2.1 Cadastro público no Mobile

Analise:
- `mobile/src/screens/routes/public/RegisterScreen.tsx` (ou o caminho equivalente na estrutura atual);
- `mobile/src/services/userService.ts`;
- `mobile/src/hooks/useCadastroUsuario.ts`;
- Backend: `user.service.ts` e `user.routes.ts`.

Corrigir o cadastro para:
- Exibir aceite explícito dos Termos de Uso;
- Exibir aceite explícito da Política de Privacidade;
- Impedir o envio se os aceites obrigatórios não forem realizados;
- Enviar `acceptedTerms: true` e `acceptedPrivacy: true` somente após o aceite;
- Apresentar mensagens de validação adequadas.

Não presumir aceite automaticamente.

### 2.2 Cadastro de gestores

Atualmente, os fluxos de cadastro de gestores do Frontend e do Mobile utilizam o endpoint público `/users`, mas o Backend força a criação de usuários como `DENUNCIANTE`.

Corrigir a arquitetura:

- Preservar o endpoint público de cadastro de cidadãos.
- Criar um endpoint administrativo específico para criação de gestores.
- Proteger esse endpoint com autenticação e autorização de `GESTOR`.
- Validar os campos recebidos no Backend.
- Garantir que somente um gestor autorizado possa criar outro gestor.
- Ajustar o Mobile e o Frontend para utilizarem o endpoint administrativo.
- Não confiar no papel enviado pelo cliente como mecanismo de autorização.

Não remover nem enfraquecer as proteções existentes.

### 2.3 Permissão para criar denúncias

Em `backend/src/routes/denuncia.routes.ts`, verificar a rota POST `/`.

Aplicar a autorização adequada para que somente `DENUNCIANTE` possa criar denúncias, conforme a regra de negócio existente.

Testar:
- DENUNCIANTE autenticado consegue criar denúncia.
- GESTOR não consegue criar denúncia.
- Usuário sem autenticação não consegue criar denúncia.
- Token inválido ou expirado não permite criação.

### 2.4 Autenticação e códigos HTTP

Revisar o middleware de autenticação e o tratamento de erros no Mobile.

Padronizar:
- HTTP 401: token ausente, inválido ou expirado.
- HTTP 403: usuário autenticado sem permissão para aquela operação.

Ajustar o Mobile para encerrar a sessão corretamente quando receber uma resposta de sessão inválida.

Não encerrar a sessão quando o usuário receber um 403 por falta de permissão.

## 3. PADRONIZAÇÃO DOS CONTRATOS

### 3.1 Categorias de denúncias

Comparar:
- `mobile/src/constants/tipos.ts`;
- `frontend/src/components/form-denuncias.tsx`;
- Backend e schema Prisma.

Atualmente existem categorias diferentes entre Mobile e Frontend.

Criar um catálogo consistente entre as aplicações, preservando os nomes e as categorias válidas do negócio.

Preferir identificadores padronizados internamente e labels em português na interface.

Não excluir categorias existentes sem avaliar compatibilidade com registros antigos.

Validar as categorias no Backend.

### 3.2 Datas

Padronizar o envio e armazenamento das datas de ocorrência para `YYYY-MM-DD`.

A formatação brasileira deve acontecer somente na apresentação ao usuário.

Garantir compatibilidade com registros antigos, caso existam datas no formato `DD/MM/YYYY`.

### 3.3 Situação das denúncias

Atualmente existem diferenças de capitalização entre `Em Andamento` e `Em andamento`.

Padronizar o valor utilizado nos contratos entre Mobile, Frontend e Backend.

Preservar os estados de negócio existentes, especialmente:
- `Em Andamento`
- `Finalizada`

Se for necessário introduzir identificadores internos, fazer a conversão nas camadas de apresentação e manter compatibilidade com registros existentes.

Garantir que os filtros por situação funcionem independentemente da capitalização dos registros antigos.

## 4. TESTES AUTOMATIZADOS DO MOBILE

O Mobile já possui Jest e jest-expo nas dependências, mas não possui uma suíte própria de testes implementada.

Utilizar os arquivos fornecidos:
- `mobile-coverage.test.ts`;
- `jest.config.js`.

Integrar os arquivos nos caminhos corretos:
- `mobile/__tests__/mobile-coverage.test.ts`;
- `mobile/jest.config.js`.

Verificar imports, aliases, mocks, dependências e compatibilidade com a versão atual do Expo.

Não simplesmente copiar os arquivos sem validar sua execução.

### 4.1 Os 50 casos iniciais

Manter e validar os 50 casos preparados, corrigindo eventuais incompatibilidades sem remover cenários válidos.

### 4.2 Acrescentar pelo menos 30 novos testes

Criar pelo menos mais 30 casos, totalizando no mínimo 80 testes unitários/integrados do Mobile.

Distribuir os novos testes entre:

**Autenticação**
- Login com sucesso;
- Login com credenciais inválidas;
- Ausência de aceite legal;
- Logout;
- Persistência de sessão;
- Expiração de token;
- Tratamento de erro 401;
- Tratamento de erro 403.

**Cadastro**
- Campos obrigatórios;
- E-mail inválido;
- Senha inválida;
- Confirmação de senha;
- Aceite dos termos;
- Aceite da política;
- Tratamento de e-mail já cadastrado.

**Denúncias**
- Criação de denúncia identificada;
- Criação de denúncia anônima;
- Validação de campos obrigatórios;
- Envio de imagens;
- Falha na criação;
- Listagem de denúncias próprias;
- Paginação;
- Consulta de detalhes;
- Atualização de situação, conforme permissões;
- Tratamento de resposta vazia.

**Gestores**
- Acesso permitido para GESTOR;
- Acesso negado para DENUNCIANTE;
- Criação de gestor por usuário autorizado;
- Bloqueio de criação de gestor por usuário não autorizado;
- Listagem e exclusão conforme permissões.

**Conectividade e armazenamento**
- Falha de conexão;
- Timeout;
- Recuperação de cache;
- Persistência de dados;
- Limpeza dos dados da sessão após logout;
- Resposta inválida da API.

**Interface e hooks**
- Validação de formulários;
- Estado de carregamento;
- Prevenção de envio duplicado;
- Exibição de erros;
- Exibição de sucesso;
- Navegação e proteção de rotas por perfil.

Priorizar testes que validem comportamento real dos hooks e componentes. Não criar testes que apenas repetem a implementação ou passam sem verificar resultados.

## 5. TESTES END-TO-END EXISTENTES

IMPORTANTE: já existe uma suíte E2E em `e2e/`, utilizando Playwright.

Antes de criar novos testes E2E:
- Ler `e2e/README.md`;
- Ler `e2e/playwright.config.ts`;
- Revisar todos os arquivos de `e2e/tests/`;
- Identificar os cenários já cobertos;
- Não duplicar cenários existentes sem justificativa.

Os testes atuais usam Chromium e acessam o Frontend Web em `localhost:3000`. Portanto, não considerar que eles cobrem automaticamente o aplicativo Expo/React Native nativo.

Preservar os testes existentes e os workflows do GitHub Actions.

Se possível, propor uma estratégia adicional para testes de interface Mobile em ambiente Android/iOS, sem substituir a suíte Playwright atual.

## 6. CONFIGURAÇÃO E EXECUÇÃO

Configurar os comandos necessários no `mobile/package.json`, preservando os comandos atuais.

Disponibilizar, se compatível:
- `npm test`;
- `npm run test:ci`;
- `npm run test:coverage`.

Configurar relatório de cobertura e facilitar a execução local e na CI.

Não modificar workflows existentes sem necessidade.

## 7. CRITÉRIOS DE ACEITAÇÃO

A tarefa somente poderá ser considerada concluída quando:

1. Os papéis `GESTOR` e `DENUNCIANTE` permanecerem intactos.
2. O cadastro público continuar criando somente `DENUNCIANTE`.
3. A criação de gestores utilizar endpoint administrativo protegido.
4. A autorização de criação de denúncias estiver corrigida.
5. O Mobile enviar os aceites legais corretamente.
6. Categorias, datas e situações estiverem consistentes entre as aplicações.
7. Os 50 testes iniciais estiverem integrados e funcionando.
8. Pelo menos 30 novos testes tiverem sido adicionados.
9. Os testes existentes do Backend e E2E continuarem preservados.
10. Os testes executados apresentarem resultados documentados.

## 8. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, apresentar:

- Arquivos criados;
- Arquivos modificados;
- Correções realizadas;
- Testes adicionados;
- Quantidade total de testes;
- Quantidade de testes aprovados;
- Quantidade de testes falhos;
- Comandos utilizados;
- Problemas ainda pendentes;
- Confirmação de que `GESTOR` e `DENUNCIANTE` não foram renomeados nem tiveram suas regras de negócio alteradas.

Não afirmar que os testes passaram sem executá-los.

Não ocultar falhas, não desativar testes para obter aprovação e não alterar expectativas apenas para fazer a suíte ficar verde.

Trabalhe em etapas, revise as alterações e mantenha a compatibilidade entre Backend, Frontend e Mobile.

### 3\. Como eu sugiro executar no Copilot

Eu faria em duas etapas para reduzir o risco de ele alterar muita coisa de uma vez:

* Primeiro, envie o prompt e peça para ele fazer a análise e implementar as correções de integração.

* Depois, peça para integrar os 50 testes, criar os 30 adicionais e executar a suíte.

Uma observação importante: não peça ao Copilot para garantir simplesmente que existam 80 testes. Peça que ele demonstre que os 80 verificam comportamentos reais. Teste que só confirma que uma função existe não representa cobertura significativa.

E preserve a pasta `e2e/`: ela já contém testes importantes do fluxo web. O que falta é uma camada específica para o aplicativo React Native, incluindo componentes, hooks e, posteriormente, execução em emulador Android/iOS.
