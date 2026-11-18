# Acompanhamento 15/09/2026

## Checklist e estrutura atual

### 1. Aplicação em React Native com Expo, build somente para Android e iOS
- Projeto Expo (SDK 56) com `expo-router`, `expo-dev-client`, etc. — ver
  `mobile/package.json` e `mobile/app.json`.
- `mobile/app.json` tem os blocos `"ios"` (`bundleIdentifier`) e
  `"android"` (`package`, permissões) configurados para build nativo.
- ⚠️ **Atenção**: `mobile/app.json` também tem um bloco `"web"` (bundler
  metro + favicon) e `mobile/package.json` tem o script
  `"web": "expo start --web"` mais a dependência `react-native-web`. O
  enunciado pede para **não** habilitar PWA/web. Não removi nada (conforme
  pedido), mas fica registrado para vocês avaliarem se isso pode ser
  interpretado como o framework "habilitado" para web.

### 2. Arquitetura
- **Rotas**: `mobile/app/` contém os layouts e arquivos finos do Expo Router.
- **Telas**: `mobile/src/screens/routes/` contém a interface dos fluxos
  público, denunciante e gestor.
- **Estado**: `mobile/src/store/` contém as stores Zustand.
- **Guarda de perfil**: `mobile/src/hooks/useRoleGuard.ts` centraliza os
  redirecionamentos por autenticação e perfil.
- **Tipos e serviços**: `mobile/src/types/` define os contratos e
  `mobile/src/services/` contém cliente HTTP, serviços de domínio e notificações.

### 3. Integração com o backend
- `mobile/src/services/http.ts` centraliza as chamadas HTTP (`fetch`) e lê
  `process.env.EXPO_PUBLIC_API_URL`.
- Os serviços `authService.ts`, `denunciaService.ts` e `userService.ts`
  encapsulam as chamadas por domínio. `mobile/src/lib/api.ts` mantém
  re-exportações para compatibilidade com imports existentes.
- Autenticação via token, guardado com `expo-secure-store`
  (`SecureStore.setItemAsync('authToken', ...)` em
  `mobile/src/store/useAuthStore.ts`), enviado no header `Authorization` em
  todas as chamadas (`mobile/src/services/http.ts`, função `apiCall`).
