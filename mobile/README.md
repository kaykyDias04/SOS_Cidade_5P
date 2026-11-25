# SOS-Cidade Mobile

App mobile (React Native + Expo) do projeto SOS-Cidade, consumindo o mesmo backend já usado pela versão web (`frontend/`). Build restrito a Android e iOS — sem PWA/web (não há `react-native-web` nas dependências nem configuração `web` no `app.json`, de propósito).

## Arquitetura

| Camada | Pasta | Responsabilidade |
|---|---|---|
| **Rotas** | `app/` | Arquivos finos do Expo Router que apontam para as telas. |
| **Telas** | `src/screens/routes/` | Componentes de página; concentram a composição da interface de cada fluxo. |
| **Estado** | `src/store/` | Stores Zustand compartilhadas pelas telas. |
| **Serviços** | `src/services/` e `src/lib/` | Comunicação com o backend e integrações nativas. |

Novos elementos reutilizáveis devem ficar em `src/components/`, regras compartilhadas
em `src/hooks/`, constantes em `src/constants/`, tipos em `src/types/` e funções
auxiliares em `src/utils/`.

Fluxo de uma ação (ex: fazer login):

```
Usuário aperta "Entrar" na LoginScreen (View)
  -> o componente da tela chama a store de autenticação
    -> a store usa o cliente de API para autenticar
    -> a store guarda o token e atualiza o estado
  -> a tela re-renderiza quando o estado da store muda
```

As rotas não devem conter interface nem regra de negócio. Quando um fluxo precisar
de componentes ou hooks reutilizáveis, eles devem ser extraídos para as pastas
correspondentes em `src/`.

## Autenticação: como funciona no mobile (diferente do navegador)

A versão web usa cookie (`httpOnly`) pra guardar a sessão — isso não existe da mesma forma num app nativo. Por isso:

1. O login manda usuário/senha pro backend, que responde com `{ user, token }`
2. O app guarda esse `token` usando `expo-secure-store` (armazenamento criptografado do dispositivo — nunca usar `AsyncStorage` puro pra isso, ele não é criptografado)
3. Toda requisição seguinte manda esse token no header `Authorization: Bearer <token>`
4. O middleware do backend já aceita esse header (não precisou mudar nada no backend)

## Como rodar

1. Definir `EXPO_PUBLIC_API_URL` com o endereço do backend (não usar `localhost` em emulador/celular físico, pois aponta para o próprio aparelho)
2. `npm install`
3. `npx expo start`
4. Escanear o QR code com o app **Expo Go** (Android/iOS) ou apertar `a`/`i` no terminal pra abrir num emulador

## Integração e autorização

- O cadastro público cria somente `DENUNCIANTE` e exige aceite explícito dos documentos legais.
- A criação administrativa de gestores usa `POST /users/gestores`, protegido para usuários `GESTOR`; não confie em papéis enviados pelo cliente.
- `POST /denuncias` aceita somente `DENUNCIANTE`. Token ausente, inválido ou expirado retorna `401`; usuário autenticado sem permissão retorna `403`.
- As listas permitem filtrar por situação e por múltiplos tipos e bairros. Os filtros do denunciante também são enviados ao endpoint `/denuncias/minhas`.
- A interface de gestores e a interface pública consomem os mesmos endpoints e contratos do Backend.

## Testes automatizados

Na pasta `mobile/`, rode a suíte unitária e de serviços:

```powershell
npm run test:ci
```

Os testes de integração fazem chamadas reais dos serviços Mobile contra uma API local com banco descartável. Inicie o stack de desenvolvimento na raiz do repositório (`docker compose up --build -d db redis api`), configure a URL, a flag de segurança e as contas de teste criadas pelo seed, e execute:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000"
$env:MOBILE_INTEGRATION_TESTS = "1"
$env:MOBILE_TEST_DENUNCIANTE_EMAIL = "denunciante.teste@soscidade.com"
$env:MOBILE_TEST_DENUNCIANTE_PASSWORD = "Teste@123"
$env:MOBILE_TEST_GESTOR_EMAIL = "gestor1.teste@soscidade.com"
$env:MOBILE_TEST_GESTOR_PASSWORD = "Teste@123"
npm run test:integration:backend
```

O workflow [`mobile-backend-integration.yml`](../.github/workflows/mobile-backend-integration.yml) pode ser iniciado manualmente em **Actions → Mobile + Backend integration → Run workflow** e também roda em PRs que alteram Mobile ou Backend. A suite de integração é de API/serviços; não substitui testes de interface nativa em Android ou iOS.

Os testes de integração aceitam somente `localhost` ou `127.0.0.1`, criam registros e tentam removê-los ao final. Nunca os execute contra produção nem contra um banco compartilhado. A última execução validada teve 45 testes unitários/de serviços e 10 cenários de integração.

As coberturas atuais e o backlog restante estão em [`testes/backlog-testes-mobile.md`](./testes/backlog-testes-mobile.md). Fluxos Maestro, validação em emuladores e algumas situações offline continuam pendentes.
