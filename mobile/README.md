# SOS-Cidade Mobile

App mobile (React Native + Expo) do projeto SOS-Cidade, consumindo o mesmo backend já usado pela versão web (`frontend/`). Build restrito a Android e iOS — sem PWA/web (não há `react-native-web` nas dependências nem configuração `web` no `app.json`, de propósito).

## Arquitetura: MVVM

| Camada | Pasta | Responsabilidade |
|---|---|---|
| **Model** | `src/models/` | Só a forma dos dados (User, Denuncia). Nenhuma lógica. |
| **View** | `src/screens/` | Só desenha a tela. Lê valores de um ViewModel e chama funções dele. Não decide regra de negócio. |
| **ViewModel** | `src/viewmodels/` | Um hook customizado por tela. Guarda o estado (o que está nos campos, carregando, erro) e a lógica de "o que fazer quando o usuário faz uma ação". |
| **Service** | `src/services/` | Conversa com o backend (fetch nos endpoints). Não sabe nada sobre tela. |

Fluxo de uma ação (ex: fazer login):

```
Usuário aperta "Entrar" na LoginScreen (View)
  -> chama vm.handleLogin() (do useLoginViewModel)
    -> ViewModel valida campos, chama AuthService.login() (Service)
      -> Service faz a requisição HTTP pro backend
    -> ViewModel guarda o token, atualiza o estado (loading, erro)
  -> View re-renderiza sozinha porque o estado do ViewModel mudou
```

Por que separado assim: se amanhã a tela de login precisar mudar de visual completamente, o arquivo `LoginScreen.tsx` muda e mais nada — a lógica de autenticação continua intacta em `useLoginViewModel.ts`. E se o backend mudar um endpoint, só `authService.ts` muda.

## Autenticação: como funciona no mobile (diferente do navegador)

A versão web usa cookie (`httpOnly`) pra guardar a sessão — isso não existe da mesma forma num app nativo. Por isso:

1. O login manda usuário/senha pro backend, que responde com `{ user, token }`
2. O app guarda esse `token` usando `expo-secure-store` (armazenamento criptografado do dispositivo — nunca usar `AsyncStorage` puro pra isso, ele não é criptografado)
3. Toda requisição seguinte manda esse token no header `Authorization: Bearer <token>`
4. O middleware do backend já aceita esse header (não precisou mudar nada no backend)

## Como rodar

1. Ajustar `API_BASE_URL` em `src/services/api.ts` para o IP da máquina rodando o backend (não usar `localhost` — no emulador/celular físico isso aponta pro próprio aparelho, não pro seu computador)
2. `npm install`
3. `npx expo start`
4. Escanear o QR code com o app **Expo Go** (Android/iOS) ou apertar `a`/`i` no terminal pra abrir num emulador

## O que já está pronto (ponto de partida)

- Tela de Login, integrada com `POST /auth/login`
- Tela de Nova Denúncia, integrada com `POST /denuncias`
- Estrutura de pastas MVVM pronta pra o grupo continuar (próximas telas seguem o mesmo padrão: 1 model + 1 service + 1 viewmodel + 1 screen)

## O que falta (pro grupo continuar)

- Tela de listagem "Minhas Denúncias" (o Service `listarMinhas()` já existe em `denunciaService.ts`, falta só a tela)
- Persistir a sessão entre aberturas do app (hoje, ao fechar o app, precisa logar de novo — falta ler o token salvo no `SecureStore` na inicialização)
- Tratamento de "sem internet"
- Telas do perfil GESTOR (dashboard, lista de todas as denúncias)
