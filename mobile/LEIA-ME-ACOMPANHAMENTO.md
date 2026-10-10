# Acompanhamento 15/09/2026

## Checklist e onde está no código (nada foi alterado)

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

### 2. Arquitetura MVVM ou MVC
O projeto segue uma separação que se aproxima de MVVM:
- **Model**: `mobile/src/lib/api.ts` (tipos `Denuncia`, `User`, chamadas HTTP
  ao backend).
- **ViewModel**: `mobile/src/store/useDenunciasStore.ts` e
  `mobile/src/store/useAuthStore.ts` (Zustand) — concentram estado e regras
  de negócio (login, CRUD de denúncias) que as telas consomem via hooks.
- **View**: as telas em `mobile/app/**/*.tsx` (ex.:
  `app/(denunciante)/home.tsx`, `app/(gestor)/dashboard.tsx`), que só
  renderizam UI e chamam as stores.

### 3. Integração com o backend
- `mobile/src/lib/api.ts` centraliza as chamadas HTTP (`fetch`) para a API
  (`authAPI`, `denunciasAPI`, `usersAPI`), lendo a URL base de
  `process.env.EXPO_PUBLIC_API_URL` (ver `mobile/.env.example`).
- Autenticação via token, guardado com `expo-secure-store`
  (`SecureStore.setItemAsync('authToken', ...)` em
  `mobile/src/store/useAuthStore.ts`), enviado no header `Authorization` em
  todas as chamadas (`mobile/src/lib/api.ts`, função `apiCall`).
