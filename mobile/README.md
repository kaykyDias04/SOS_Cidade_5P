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

## O que já está pronto (ponto de partida)

- Telas de login, cadastro, denúncias e gestão integradas às rotas do Expo Router
- Implementações das telas separadas dos arquivos de rota em `src/screens/routes/`

## O que falta (pro grupo continuar)

- Tratar estados de falta de conexão com a internet
