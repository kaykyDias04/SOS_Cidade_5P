# SOS-Cidade Mobile

Aplicativo do SOS-Cidade para Android, iOS e web. O projeto usa Expo Router e compartilha a API do backend.

## 1. Visao geral

O app atende dois perfis:

- **Cidadao/denunciante:** cria uma conta, registra problemas urbanos, pode anexar fotos e informar o bairro, recebe um protocolo e acompanha a situacao das proprias denuncias.
- **Gestor:** consulta e filtra denuncias, ve ocorrencias no mapa e no dashboard, altera situacoes e administra gestores. A criacao de gestor usa `/users/gestores`, endpoint protegido para `GESTOR`; o cadastro publico continua restrito a `DENUNCIANTE`.

A tela inicial publica apresenta o servico e encaminha para login ou cadastro.

## 2. Tecnologias e versoes

Versoes conforme as declaracoes em `package.json`:

| Tecnologia | Versao declarada |
|---|---:|
| Expo / SDK | `~58.0.26` |
| React | `19.3.0` |
| React Native | `0.88.1` |
| TypeScript | `~6.0.3` |
| Expo Router | `~58.0.32` |
| Zustand | `^5.0.13` |
| NativeWind | `^4.2.4` |
| expo-camera | `~58.0.14` |
| expo-image-picker | `~58.0.10` |
| expo-location | `~58.0.22` |
| expo-notifications | `~58.1.9` |
| react-native-maps | `1.29.11` |
| react-native-web | `^0.21.4` |

O `app.json` configura o bundler Metro para web, e `package.json` oferece o script `npm run web`. Portanto, web esta configurado; o repositorio nao o declara como PWA. NativeWind esta configurado no Babel/Metro e em `global.css`; as telas atuais usam principalmente `StyleSheet`.

## 3. Pre-requisitos

- Node.js e npm.
- Expo Go atualizado para o SDK 58. O projeto ativo e `mobile/`, nao a antiga pasta `mobile/mobile/`.
- Docker Desktop apenas para executar API, banco e seed localmente.
- Para emulacao: Android Studio e um emulador Android configurado; para iOS, macOS com Xcode.
- Expo Go basta para desenvolvimento no telefone; EAS e usado para gerar um APK/AAB distribuivel.

## 4. Testar a interface

Para apenas abrir e avaliar as telas, nao precisa configurar backend nem criar `.env`. Na pasta `mobile/`, instale as dependencias uma vez e inicie o Expo:

```powershell
npm install
npm run start:go
```

Escaneie o QR code atual com o Expo Go. O celular e o computador devem estar na mesma rede Wi-Fi. Se a rede bloquear conexoes locais, use `npm run start:go:tunnel`. No computador, a interface tambem pode ser aberta no navegador com `npm run web`.

Essa forma testa a interface publica e a navegacao. Login, cadastro, denuncias e dados do gestor precisam da API; sem ela, as operacoes de rede vao falhar.

## 5. Testar app e API localmente

O backend local completo pode ser iniciado na raiz do repositorio com Docker Desktop:

```powershell
docker compose up --build -d db redis api
```

O Compose aguarda o Postgres e o Redis, aplica as migrations e cria as duas contas de gestor de teste automaticamente. Nao precisa preencher `backend/.env`. Para verificar a API, abra `http://localhost:8000/health`; para conferir os logs, use `docker compose logs -f api`.

Para testar somente a interface no navegador, rode `npm run web` na pasta `mobile/`. Para usar o app em um celular com a API local, abra um terminal na pasta `mobile/`, crie/edite `.env` e informe o IPv4 da interface Wi-Fi do computador:

```powershell
Set-Location mobile
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Configure `EXPO_PUBLIC_API_URL=http://<IP-DO-COMPUTADOR>:8000`. Descubra o IPv4 da interface Wi-Fi com `ipconfig`; nao use IP de WSL, Docker ou adaptador virtual, e lembre que o IP pode mudar ao reconectar a rede. Computador e telefone precisam estar na mesma rede e o firewall deve permitir as portas 8081 e 8000. Antes de abrir o app, teste `http://<IP-DO-COMPUTADOR>:8000/health` no navegador do telefone. Se aparecer `Network request failed` ou `Fetch request has been canceled`, confira essa URL e reinicie o Metro depois de alterar o `.env`. No emulador Android, use `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000`. `localhost` no telefone aponta para o proprio telefone.

Depois, em outro terminal, inicie o app:

```powershell
Set-Location mobile
npm run start:go
```

O arquivo `.env` fica no computador; nao precisa recria-lo a cada execucao. Reinicie o Metro depois de alterar essa variavel. O Expo Go mantem o QR e o Metro ativos apenas enquanto o comando estiver rodando.

- `a`: abrir no emulador Android.
- `i`: abrir no simulador iOS (macOS/Xcode).
- `npx expo start --go --lan -c`: limpar o cache do Metro e iniciar novamente em modo Expo Go.

Para encerrar os servicos locais, na raiz do repositorio rode `docker compose down`. Isso para os containers e mantem os dados do volume local.

O app usa `expo-notifications` para notificacoes locais. **Notificacoes remotas/push nao estao implementadas** e nao funcionam no Expo Go.

## 6. Contas e dados de teste

O seed cria estas contas locais:

| Perfil | E-mail | Senha |
|---|---|---|
| Gestor | `gestor1.teste@soscidade.com` | `Teste@123` |
| Gestor | `gestor2.teste@soscidade.com` | `Teste@123` |
| Denunciante | `denunciante.teste@soscidade.com` | `Teste@123` |

Ao usar `docker compose up --build -d db redis api`, o seed e aplicado automaticamente. Ele cria tres denuncias marcadas como `DADO DE TESTE`, duas anonimas e uma identificada, para o gestor validar a listagem, os filtros e o dashboard.

O seed faz upsert das contas de teste e cria as denuncias somente se os protocolos ainda nao existirem. **Use somente em desenvolvimento local; nunca execute para popular contas de teste em producao.**

No formulario de denuncia, a opcao pre-selecionada e **Denunciar anonimamente**. O nome e o identificador da conta nao sao devolvidos pela API, mas o vinculo interno e mantido para o titular acompanhar a ocorrencia. Gestores com acesso direto ao banco podem relacionar esse registro a conta; portanto, nao e anonimato absoluto.

No login e no cadastro, a pessoa precisa marcar uma caixa inicialmente desmarcada, apos consultar os Termos de Uso e a Politica de Privacidade. Os aceites e a versao `1.0` ficam registrados no banco. O texto informa que o projeto e um prototipo academico e ainda precisa de revisao juridica e de um canal oficial de contato antes de uso em producao.

## 7. Estrutura de pastas e arquitetura

Estrutura ativa de rotas e codigo do app:

```text
mobile/
|-- app/                         # Expo Router: layouts e arquivos de rota
|   |-- _layout.tsx
|   |-- (public)/                # index, login, register
|   |-- (denunciante)/           # home, nova-denuncia, minhas-denuncias, detalhe-denuncia
|   `-- (gestor)/                # denuncias, dashboard, mapa, gestores
|-- index.ts                     # polyfills web e expo-router/entry
`-- src/
    |-- components/
    |   |-- ui/
    |   |-- feedback/
    |   |-- denuncia/
    |   `-- gestor/
    |-- constants/               # configuracao, bairros, tipos, situacoes, tema
    |-- hooks/                   # formularios, cadastro, gestores, guards, notificacoes
    |-- screens/routes/          # componentes de tela usados pelos arquivos de rota
    |   |-- public/
    |   |-- denunciante/
    |   `-- gestor/
    |-- services/                # servicos de dominio e http.ts
    |-- store/                   # stores Zustand
    |-- types/
    `-- utils/
```

Os arquivos em `app/` compoem layouts e encaminham para as telas em `src/screens/routes/`. No fluxo ativo, as telas combinam componentes e hooks; os hooks podem coordenar stores e servicos; as stores tambem chamam servicos; os servicos usam `src/services/http.ts` para fazer `fetch` na API. Nem todo fluxo atravessa todas as camadas: por exemplo, o cadastro usa o hook `useCadastroUsuario` e o servico de usuarios diretamente.

O ponto de entrada declarado em `package.json` e `index.ts`, que carrega `expo-router/entry`. A copia aninhada `mobile/mobile/` e os arquivos do fluxo antigo (ViewModels, navegador React Navigation, telas e modelos duplicados) foram removidos; o Expo Router em `app/` e o unico fluxo de telas.

Fluxo de criar denuncia:

```text
app/(denunciante)/nova-denuncia.tsx
  -> src/screens/routes/denunciante/NovaDenunciaScreen.tsx
    -> useDenunciaForm
      -> useDenunciasStore.createDenuncia
        -> denunciasAPI.create
          -> apiRequest (services/http.ts)
            -> POST /denuncias
```

Fluxo de login:

```text
app/(public)/login.tsx
  -> src/screens/routes/public/LoginScreen.tsx
    -> useAuthStore.login
      -> authAPI.login
        -> apiRequest (services/http.ts)
          -> POST /auth/login
        -> SecureStore: token e perfil
        -> persistencia Zustand/AsyncStorage: user e isAuthenticated
```

## 8. Mapa de rotas

| Rota | Grupo | Perfil que acessa | Funcao |
|---|---|---|---|
| `/` | `(public)` | Visitante nao autenticado | Apresentacao do app e acesso a login/cadastro |
| `/login` | `(public)` | Visitante nao autenticado | Autenticacao e encaminhamento pelo perfil retornado |
| `/register` | `(public)` | Visitante nao autenticado | Cadastro de cidadao |
| `/home` | `(denunciante)` | `DENUNCIANTE` | Resumo e ultimas denuncias do cidadao |
| `/nova-denuncia` | `(denunciante)` | `DENUNCIANTE` | Formulario, fotos e selecao de bairro/localizacao |
| `/minhas-denuncias` | `(denunciante)` | `DENUNCIANTE` | Busca, filtro e lista de denuncias do cidadao |
| `/detalhe-denuncia?id=...` | `(denunciante)` | `DENUNCIANTE` | Detalhes da denuncia selecionada |
| `/denuncias` | `(gestor)` | `GESTOR` | Lista, filtros, busca e atualizacao de status; aba inicial do grupo |
| `/dashboard` | `(gestor)` | `GESTOR` | Indicadores e distribuicao das denuncias |
| `/mapa` | `(gestor)` | `GESTOR` | Mapa nativo e filtro por tipo; na web, lista de ocorrencias agrupadas por bairro |
| `/gestores` | `(gestor)` | `GESTOR` | Lista, cadastro pela interface e remocao de gestores |

Os grupos usam `useRoleGuard`: visitante em area protegida vai para `/login`; gestor fora da area de gestor vai para `/denuncias`; denunciante que tenta acessar a area de gestor vai para `/home`. O grupo publico encaminha usuarios ja autenticados para a area correspondente.

## 9. Autenticacao e seguranca no app

- No login nativo, `useAuthStore` grava o token em `expo-secure-store` na chave `authToken` e o perfil na chave `userRole`.
- O cliente HTTP le `authToken` e envia `Authorization: Bearer <token>` quando a requisicao autenticada tem token.
- O persist middleware do Zustand usa AsyncStorage com a chave `auth-storage`. O `partialize` grava somente `user` e `isAuthenticated`; `isLoading` nao e persistido. O estado serializado pelo middleware inclui esses campos dentro do envelope de persistencia do Zustand. Senha e token nao fazem parte desse estado.
- No web, `index.ts` substitui as funcoes de `expo-secure-store` por acesso a `window.localStorage`; portanto, nesse ambiente o token nao fica em armazenamento nativo criptografado.
- `useRoleGuard` controla a navegacao e melhora a experiencia, mas nao e uma barreira de seguranca. A autorizacao real deve ser aplicada pelo servidor, que valida o token e o perfil nas rotas protegidas.

## 10. Contrato com a API

Os endpoints sao relativos a `EXPO_PUBLIC_API_URL` e, no backend atual, nao usam prefixo `/api`.

| Tela/acao | Endpoint | Metodo | Perfil permitido no backend |
|---|---|---:|---|
| Entrar | `/auth/login` | POST | Sem autenticacao |
| Sair | `/auth/logout` | POST | Rota sem middleware de autenticacao |
| Cadastro de cidadao | `/users` | POST | Sem autenticacao; o backend cria sempre `DENUNCIANTE` |
| Criar gestor pela tela de gestores | `/users/gestores` | POST | Somente `GESTOR`; o novo gestor aceita os documentos legais no primeiro login |
| Listar gestores | `/users?role=GESTOR` | GET | `GESTOR` (o helper tambem pode chamar `/users` sem `role`; ambas as rotas exigem `GESTOR`) |
| Remover gestor | `/users/:id` | DELETE | `GESTOR` |
| Listar denuncias para gestor | `/denuncias?_page=...&_limit=...&_meta=1&tipoDenuncia=...&bairroOcorrencia=...&situacao=...` | GET | `GESTOR` |
| Listar denuncias do usuario autenticado | `/denuncias/minhas?_page=...&_limit=...` | GET | Qualquer usuario autenticado; o backend filtra pelo usuario do token |
| Consultar denuncia por id | `/denuncias/:id` | GET | Titular da denuncia ou `GESTOR`; outros denunciantes recebem 404. A tela ativa de detalhes tambem pode usar a store alimentada por `/denuncias/minhas` |
| Criar denuncia | `/denuncias` | POST | Somente `DENUNCIANTE` |
| Alterar situacao | `/denuncias/:id` | PATCH | `GESTOR` |
| Excluir denuncia | `/denuncias/:id` | DELETE | `GESTOR`; a store expoe a operacao, sem chamada por tela ativa encontrada |

Cadastro e login exigem aceite explicito dos Termos de Uso e da Politica de Privacidade, desmarcado por padrao; o backend registra data e versao do aceite. A criacao administrativa de gestores nao aceita papel enviado pelo cliente e exige token de `GESTOR`; o novo gestor aceita os documentos no primeiro login. Listagens aceitam paginacao e filtros de tipo, bairro e situacao. Tipo e bairro aceitam multiplos valores, inclusive em `/denuncias/minhas`; o backend aplica os filtros aos resultados e ao total. Token ausente ou invalido retorna 401, enquanto usuario autenticado sem permissao retorna 403.

## 11. Permissoes do app

| Recurso | Configuracao e uso encontrado |
|---|---|
| Camera | `expo-image-picker` pede permissao ao escolher camera e chama `launchCameraAsync`; `app.json` declara `CAMERA` no Android e os plugins configuram os textos de permissao. |
| Galeria/fotos | `expo-image-picker` pede permissao da biblioteca e chama `launchImageLibraryAsync`; o plugin configura a mensagem de acesso a fotos. As imagens sao anexadas a denuncias. |
| Localizacao | `expo-location` pede permissao em primeiro plano, obtem coordenadas e faz geocodificacao reversa para preencher o bairro. Android declara coarse/fine location. O plugin tambem configura o texto de acesso “always and when in use”; nao foi encontrado uso de localizacao em segundo plano. |
| Notificacoes | `expo-notifications` e configurado como plugin e a aplicacao pede permissao em runtime ao iniciar; Android recebe o canal “Atualizações de denúncias”. |
| Audio | `app.json` declara `android.permission.RECORD_AUDIO`, mas nao foi encontrado uso de gravacao de audio em `app/` ou `src/`. Ver Pendencias. |

O plugin `expo-camera` esta configurado, mas a implementacao de captura encontrada usa `expo-image-picker`; nao foi encontrada chamada direta a API de `expo-camera`.

## 12. Notificacoes

O app implementa **notificacoes locais**, nao push remoto:

- Ao iniciar o app nativo, `useRegistroNotificacoes` pede permissao. No Android, cria o canal “Atualizações de denúncias”.
- Ao atualizar a situacao pela store, o dispositivo que executou a alteracao pode agendar uma notificacao local imediata.
- Ao recarregar denuncias, se o estado anterior ja estava carregado e uma denuncia do usuario autenticado mudou, o app pode avisar esse denunciante localmente.
- A notificacao mostra o tipo, protocolo e nova situacao. No web, os helpers de notificacao retornam sem agendar.

Nao foi encontrado registro de Expo Push Token, envio push no backend ou endpoint de notificacao. Portanto, notificacoes remotas nao estao implementadas nem passam a funcionar apenas por gerar um development build/APK.

## 13. Build com EAS

O projeto EAS configurado em `app.json` tem o ID `114df36c-08b7-4bc9-8bc1-f954ef5f52c4`.

| Perfil em `eas.json` | Configuracao Android |
|---|---|
| `development` | Development client, distribuicao interna, APK |
| `preview` | Distribuicao interna, APK |
| `production` | App Bundle (`.aab`) |

Os perfis definem `EXPO_PUBLIC_API_URL` para `https://sos-cidade-api.onrender.com`, o dominio esperado para o servico declarado em `render.yaml`. Essa URL so funcionara depois que o servico for publicado e estiver respondendo. Com EAS CLI disponivel:

```sh
eas login
eas build -p android --profile preview
```

O APK interno fica disponivel no link da build mostrado pelo EAS CLI e na pagina de builds do projeto EAS. O perfil `development` tambem gera APK para instalar o development client; `production` gera `.aab`, nao APK.

OTA esta desativado (`updates.enabled: false` em `app.json`). Cache offline de denuncias/requisicoes nao foi encontrado; as operacoes de API precisam de conexao.

O QR do Expo Go nao publica o aplicativo: ele serve o bundle do computador enquanto o Metro estiver em execucao. Para distribuir o app Android sem Expo Go, primeiro publique e valide a API HTTPS; depois gere o APK com o perfil `preview` do EAS.

### O que falta para publicar

Na verificacao de 19/11/2026, os enderecos de producao documentados nao estavam servindo a aplicacao: a API antiga respondeu 503/timeout, o dominio `sos-cidade-api.onrender.com` respondeu 404 em `/health` e `sos-cidade-front.vercel.app` respondeu 404. Portanto, os arquivos de configuracao nao significam que API, site ou APK ja estejam publicados.

1. **API:** conecte o repositorio ao Render usando `render.yaml` (servico `sos-cidade-api`, raiz `backend`). Configure Postgres e Redis acessiveis pela API e preencha as variaveis solicitadas pelo blueprint: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `DATA_ENCRYPTION_KEY` e `FRONTEND_URL`. Use uma chave de criptografia propria de 32 bytes em hexadecimal e um segredo JWT forte; nao reutilize as chaves locais do Compose. O comando de inicio aplica migrations. Considere a API pronta quando `https://sos-cidade-api.onrender.com/health` responder `OK`.
2. **Site web:** importe o repositorio no Vercel com a raiz do projeto `frontend/` e configure `NEXT_PUBLIC_API_URL` com a URL HTTPS da API publicada. O site web e o app React Native sao entregas distintas.
3. **App Android:** depois de a API HTTPS responder, rode `eas login` e `eas build -p android --profile preview` dentro de `mobile/`. O APK gerado no EAS pode entao ser compartilhado para instalacao. A configuracao e o `projectId` ja existem, mas e preciso ter acesso a conta EAS e completar a build.

## 14. Qualidade e testes

Na pasta `mobile/`:

```sh
npm test
npm run test:ci
npm run test:integration:backend
npx tsc --noEmit
npx expo-doctor
```

O Jest do Mobile separa testes de unidade/servico dos testes de integracao real com a API. A integracao grava dados em uma API local; use somente o banco descartavel do Compose e as contas de seed:

```powershell
docker compose up --build -d db redis api
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000"
$env:MOBILE_INTEGRATION_TESTS = "1"
$env:MOBILE_TEST_DENUNCIANTE_EMAIL = "denunciante.teste@soscidade.com"
$env:MOBILE_TEST_DENUNCIANTE_PASSWORD = "Teste@123"
$env:MOBILE_TEST_GESTOR_EMAIL = "gestor1.teste@soscidade.com"
$env:MOBILE_TEST_GESTOR_PASSWORD = "Teste@123"
npm run test:integration:backend
```

O workflow [`mobile-backend-integration.yml`](../.github/workflows/mobile-backend-integration.yml) tambem pode ser iniciado pelo botao **Run workflow**. Ele sobe Postgres, Redis e o Backend em um banco efemero, sem subir o Frontend nem um emulador.

Os testes existentes no repositorio estao em:

- [`../tests/`](../tests/): testes de API e contratos.
- [`../backend/tests/`](../backend/tests/): testes unitarios do backend.
- [`../e2e/`](../e2e/): testes end-to-end com Playwright.
- [`testes/`](./testes/): backlog e estrategia de testes mobile.
- [`src/services/__tests__/`](./src/services/__tests/): testes de servicos Mobile com dependencias isoladas.
- [`src/services/__integration__/`](./src/services/__integration__/): testes que chamam a API real usando os servicos do Mobile.
- [`../tests/mobile/`](../tests/mobile/): copia identificada da documentacao Mobile e reconciliação do backlog.
- [`../.github/workflows/`](../.github/workflows/): automacoes CI, incluindo [`unit-api.yml`](../.github/workflows/unit-api.yml), [`mobile-backend-integration.yml`](../.github/workflows/mobile-backend-integration.yml), [`regressao-completa.yml`](../.github/workflows/regressao-completa.yml) e [`e2e-smoke.yml`](../.github/workflows/e2e-smoke.yml).

Os testes de integracao verificam os servicos HTTP do Mobile contra o Backend real, mas nao substituem testes de interface nativa em Android/iOS. A automacao Maestro continua no backlog.

## 15. Problemas comuns

- **Expo Go diz que o SDK e incompatível:** confirme que o terminal esta em `...\\SOS_Escola_5P.-copy\\mobile`, pare servidores Metro antigos com `Ctrl+C` e gere um QR novo com `npm run start:go`. A antiga pasta `mobile/mobile/` era SDK 56; a raiz ativa usa SDK 58.
- **QR abre uma pagina que nao carrega:** confirme que telefone e computador estao na mesma Wi-Fi; se a rede bloquear o Metro, use `npm run start:go:tunnel`.
- **Tela branca ou `Network request failed`:** a interface pode abrir sem API, mas login e dados precisam do backend. Para o backend local, confira `/health` e use o IP do computador no `.env` do app fisico, nao `localhost`.
- **Erro da API hospedada:** em 19/11/2026, `s-o-s-cidade-1.onrender.com` retornou 503/timeout e `sos-cidade-api.onrender.com/health` retornou 404. Os enderecos configurados nao estavam servindo o backend esperado nessa verificacao.
- **Bundle desatualizado ou erro de modulo no Metro:** pare o servidor e rode `npx expo start -c`.
- **Diff muito grande sem muitas alteracoes:** confira se a diferenca e apenas de CRLF/LF antes de normalizar arquivos; evite converter a arvore inteira sem necessidade.
- **Permissao negada no emulador:** permita camera, fotos, localizacao ou notificacoes nas configuracoes do app/dispositivo e tente novamente. A localizacao e solicitada quando o usuario aciona o botao de localizacao.

## 16. Pendencias conhecidas

- A criacao de gestores usa endpoint administrativo protegido. A autorizacao do Backend continua sendo a barreira definitiva.
- Categorias, datas e valores legados de situacao ainda precisam de contrato compartilhado e estrategia de normalizacao/migracao antes de alterar registros existentes.
- `RECORD_AUDIO` esta declarado no Android sem uso de gravacao encontrado. A permissao “always” de localizacao tambem esta descrita no plugin, enquanto o codigo pede somente localizacao em primeiro plano; revisar se ambas as declaracoes sao necessarias.
- Push remoto nao esta implementado. Notificacoes atuais sao locais.
- Cache offline nao esta implementado e OTA esta desativado.
- `GET /denuncias/:id` permite acesso somente ao titular da denuncia ou a um gestor; para outro denunciante responde 404.
- `render.yaml` e configuracao para criar o servico, nao prova de publicacao. O backend exige variaveis secretas no painel Render, incluindo `DATA_ENCRYPTION_KEY`.
- A URL de frontend de exemplo `sos-cidade-front.vercel.app` respondeu 404 na verificacao de 19/11/2026; ainda e preciso publicar o projeto `frontend/` no Vercel para disponibilizar a versao web.
- A publicacao Android pelo EAS depende de uma API HTTPS publicada e acessivel; o `projectId` configurado, sozinho, nao representa um build ou publicacao concluida.
- `.expo/` e `.tsupgrader/` sao arquivos gerados e ficam ignorados pelo `.gitignore`.
- `knip` ainda nao produziu uma analise de arquivos/exports nao usados; a execucao terminou por falta de memoria.
