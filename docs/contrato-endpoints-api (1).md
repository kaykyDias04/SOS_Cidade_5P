# Contrato da API Cidade Conectada
 
## Inventário de endpoints
 
| Método | Caminho | Descrição | Perfil autorizado |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Cria uma conta de cidadão. | Público |
| POST | `/api/v1/auth/login` | Autentica o usuário e emite o token de acesso. | Público |
| POST | `/api/v1/auth/logout` | Invalida o token de acesso em uso. | Cidadão, Gestor |
| GET | `/api/v1/auth/me` | Retorna os dados do usuário autenticado. | Cidadão, Gestor |
| GET | `/api/v1/users` | Lista os usuários cadastrados, com paginação e filtro por papel. | Gestor |
| GET | `/api/v1/users/{userId}` | Retorna um usuário específico. | Cidadão (o próprio), Gestor |
| POST | `/api/v1/uploads/photos` | Envia a foto da ocorrência e devolve o identificador a ser vinculado à demanda. | Cidadão |
| POST | `/api/v1/demands` | Registra uma demanda urbana. | Cidadão |
| GET | `/api/v1/demands` | Lista demandas com filtros por status, categoria e região. | Cidadão (as próprias), Gestor (todas) |
| GET | `/api/v1/demands/{demandId}` | Retorna o detalhe de uma demanda. | Cidadão (as próprias), Gestor |
| PATCH | `/api/v1/demands/{demandId}/status` | Atualiza o status de uma demanda. | Gestor |
| GET | `/api/v1/demands/{demandId}/history` | Retorna o histórico de mudanças de status da demanda. | Cidadão (as próprias), Gestor |
| GET | `/api/v1/metrics/summary` | Retorna os indicadores agregados da plataforma. | Gestor |
| GET | `/api/v1/metrics/demands-by-category` | Retorna a distribuição de demandas por categoria. | Gestor |
 
## Convenções globais
 
| Convenção | Definição |
| --- | --- |
| Versionamento | Prefixo de caminho `/api/v1`. Mudanças incompatíveis criam `/api/v2`. |
| Formato de dados | `application/json; charset=utf-8` em requisições e respostas, exceto o upload de foto (`multipart/form-data`). |
| Nomes de campos | `camelCase`, em inglês, tanto no corpo quanto nos parâmetros de query. |
| Valores de enum | `SCREAMING_SNAKE_CASE`, em inglês. |
| Identificadores | UUID v4 em formato string. |
| Datas e horas | ISO 8601 em UTC com sufixo `Z` (ex.: `2026-08-05T13:42:10Z`). |
| Durações | Segundos inteiros, em campos com sufixo `Seconds`. |
| Coordenadas | `latitude` e `longitude` como números decimais em graus (WGS84). |
| Autenticação | Cabeçalho `Authorization: Bearer <accessToken>`. Token JWT com validade de 24 h. |
| Resposta de recurso único | O objeto do recurso na raiz do corpo, sem envelope. |
| Resposta de coleção | Envelope `{ "data": [...], "pagination": {...} }`. |
| Paginação | Query `page` (inteiro ≥ 1, padrão `1`) e `pageSize` (inteiro entre 1 e 100, padrão `20`). O objeto `pagination` contém `page`, `pageSize`, `totalItems` e `totalPages`. |
| Ordenação | Query `sort`, com valores `createdAt:asc` ou `createdAt:desc` (padrão `createdAt:desc`). |
| Formato de erro | Sempre `{ "error": { "code": "...", "message": "...", "details": [...] } }`. `code` é legível por máquina; `message` é texto em português para exibição; `details` é uma lista de `{ "field": "...", "issue": "..." }`, presente apenas em erros de validação. |
| 403 versus 404 | `403 FORBIDDEN` quando a operação é vedada ao papel do chamador. `404 NOT_FOUND` quando o recurso existe mas está fora do escopo do chamador, para não permitir enumeração de recursos de terceiros. |
| Campos ausentes na resposta | Campos opcionais sem valor são retornados como `null`, nunca omitidos. |
| Idempotência | `POST` não é idempotente; o cliente mobile deve tratar reenvio por meio da confirmação de resposta, não por repetição automática. |
 
## Dicionário de dados
 
### Entidade `User`
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | sim | Gerado pelo servidor; somente leitura. | Não |
| `name` | string | sim | 3 a 120 caracteres. | Sim |
| `email` | string | sim | Formato de e-mail válido; único na base; armazenado em minúsculas. | Sim |
| `password` | string | sim | Apenas na entrada. Mínimo de 8 caracteres, com pelo menos uma letra e um número. Nunca retornado em nenhuma resposta. | Sim |
| `role` | enum `UserRole` | sim | Definido pelo servidor. O autocadastro sempre cria `CITIZEN`. | Não |
| `createdAt` | string (ISO 8601) | sim | Somente leitura. | Não |
| `updatedAt` | string (ISO 8601) | sim | Somente leitura. | Não |
 
### Entidade `Demand`
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | sim | Gerado pelo servidor; somente leitura. | Não |
| `protocol` | string | sim | Código de acompanhamento gerado pelo servidor, no padrão `DEM-<ano>-<sequencial de 6 dígitos>`. | Não |
| `category` | enum `DemandCategory` | sim | Valor da lista fechada. | Não |
| `description` | string | sim | 20 a 1000 caracteres. | Sim (texto livre preenchido pelo cidadão) |
| `status` | enum `DemandStatus` | sim | Definido pelo servidor. Criação sempre em `RECEIVED`. | Não |
| `location` | objeto `Location` | sim | Ver entidade `Location`. | Sim (indica local associado ao cidadão) |
| `photo` | objeto `Photo` \| `null` | não | Vinculada na criação por `photoId`. | Sim (imagem pode conter pessoas ou placas) |
| `author` | objeto `UserSummary` | sim | Somente leitura. Omitido para chamadores que não sejam o autor ou um gestor. | Sim |
| `createdAt` | string (ISO 8601) | sim | Somente leitura. | Não |
| `updatedAt` | string (ISO 8601) | sim | Somente leitura. | Não |
| `resolvedAt` | string (ISO 8601) \| `null` | não | Preenchido pelo servidor na transição para `RESOLVED`. Base do tempo de atendimento. | Não |
 
### Entidade `Location` (embutida em `Demand`)
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `latitude` | número | sim | Entre -90 e 90. | Sim |
| `longitude` | número | sim | Entre -180 e 180. | Sim |
| `region` | enum `Region` | sim | Enviado pelo cliente e validado contra a lista fechada. | Não |
| `addressLabel` | string \| `null` | não | Até 200 caracteres. Referência textual informada pelo cidadão. | Sim |
 
### Entidade `Photo` (embutida em `Demand`)
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | sim | Retornado por `POST /uploads/photos`. | Não |
| `url` | string | sim | URL de leitura da imagem, válida por 60 minutos e renovada em cada leitura da demanda. | Não |
| `contentType` | string | sim | `image/jpeg` ou `image/png`. | Não |
| `sizeBytes` | inteiro | sim | Máximo de 5.242.880 (5 MiB). | Não |
 
### Entidade `UserSummary` (embutida em `Demand`)
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | sim | Somente leitura. | Não |
| `name` | string | sim | Somente leitura. | Sim |
 
### Entidade `StatusChange`
 
| Campo | Tipo | Obrigatório | Regras | Dado pessoal? |
| --- | --- | --- | --- | --- |
| `id` | string (UUID) | sim | Somente leitura. | Não |
| `fromStatus` | enum `DemandStatus` \| `null` | não | `null` no evento de criação da demanda. | Não |
| `toStatus` | enum `DemandStatus` | sim | Valor da lista fechada. | Não |
| `note` | string \| `null` | não | Até 500 caracteres. | Sim (texto livre do gestor) |
| `changedBy` | objeto `UserSummary` | sim | Somente leitura. | Sim |
| `createdAt` | string (ISO 8601) | sim | Somente leitura. | Não |
 
### Enums
 
| Enum | Valores | Observação |
| --- | --- | --- |
| `UserRole` | `CITIZEN`, `MANAGER` | Corresponde aos perfis cidadão e gestor público. |
| `DemandCategory` | `ROAD_MAINTENANCE`, `PUBLIC_LIGHTING`, `WASTE_DISPOSAL`, `SANITATION`, `INSPECTION` | Mapeia buraco em via pública, poste sem iluminação, descarte irregular de lixo, saneamento e fiscalização. |
| `DemandStatus` | `RECEIVED`, `UNDER_ANALYSIS`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` | Estados intermediários e finais definidos abaixo. |
| `Region` | `RPA_1`, `RPA_2`, `RPA_3`, `RPA_4`, `RPA_5`, `RPA_6` | Lista fechada de regiões administrativas. |
 
### Máquina de estados de `DemandStatus`
 
| Status atual | Transições permitidas |
| --- | --- |
| `RECEIVED` | `UNDER_ANALYSIS`, `REJECTED` |
| `UNDER_ANALYSIS` | `IN_PROGRESS`, `REJECTED` |
| `IN_PROGRESS` | `RESOLVED` |
| `RESOLVED` | nenhuma (estado final) |
| `REJECTED` | nenhuma (estado final) |
 
Qualquer outra transição, inclusive a repetição do status atual, resulta em `409 INVALID_STATUS_TRANSITION`.
 
## Matriz de autorização
 
| Endpoint | Público | Cidadão | Gestor | Escopo |
| --- | --- | --- | --- | --- |
| `POST /auth/register` | sim | sim | sim | Cria sempre um usuário `CITIZEN`. |
| `POST /auth/login` | sim | sim | sim | — |
| `POST /auth/logout` | não | sim | sim | Invalida apenas o token apresentado. |
| `GET /auth/me` | não | sim | sim | Sempre o próprio usuário. |
| `GET /users` | não | não | sim | Todos os usuários. |
| `GET /users/{userId}` | não | sim | sim | Cidadão: apenas o próprio `userId`; outro id retorna `404`. Gestor: qualquer usuário. |
| `POST /uploads/photos` | não | sim | não | A foto fica vinculada ao autor do upload e só pode ser usada por ele. |
| `POST /demands` | não | sim | não | O autor é sempre o usuário autenticado; não é possível registrar em nome de terceiros. |
| `GET /demands` | não | sim | sim | Cidadão: apenas as demandas de que é autor, sem possibilidade de ampliar por filtro. Gestor: todas. |
| `GET /demands/{demandId}` | não | sim | sim | Cidadão: apenas as próprias; demanda de terceiro retorna `404`. Gestor: qualquer. |
| `PATCH /demands/{demandId}/status` | não | não | sim | Qualquer demanda. |
| `GET /demands/{demandId}/history` | não | sim | sim | Mesmo escopo de `GET /demands/{demandId}`. |
| `GET /metrics/summary` | não | não | sim | Agregados de toda a base. |
| `GET /metrics/demands-by-category` | não | não | sim | Agregados de toda a base. |
 
## Endpoints
 
### POST /api/v1/uploads/photos
 
Recebe a foto da ocorrência capturada pela câmera e devolve o `photoId` a ser informado na criação da demanda.
 
**Autorização:** cidadão.
 
**Parâmetros**
 
| Parâmetro | Local | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- | --- |
| `Content-Type` | cabeçalho | string | sim | `multipart/form-data`. |
| `file` | parte do corpo | arquivo binário | sim | `image/jpeg` ou `image/png`; até 5 MiB. |
 
**Requisição**
 
Corpo `multipart/form-data` com uma única parte chamada `file`:
 
```json
{
  "file": "<conteúdo binário da imagem, parte multipart>"
}
```
 
**Respostas**
 
| Código | Quando | Corpo |
| --- | --- | --- |
| 201 | Foto armazenada. | Objeto `Photo`. |
| 400 | Parte `file` ausente ou corpo malformado. | Erro `VALIDATION_ERROR`. |
| 401 | Token ausente, inválido ou expirado. | Erro `UNAUTHENTICATED`. |
| 403 | Chamador é `MANAGER`. | Erro `FORBIDDEN`. |
| 413 | Arquivo acima de 5 MiB. | Erro `PHOTO_TOO_LARGE`. |
| 415 | Tipo de imagem não suportado. | Erro `UNSUPPORTED_MEDIA_TYPE`. |
 
**Exemplo de sucesso (201)**
 
```json
{
  "id": "7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33",
  "url": "https://storage.cidadeconectada.exemplo/photos/7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33?exp=1786052530",
  "contentType": "image/jpeg",
  "sizeBytes": 1834221
}
```
 
**Exemplos de erro**
 
```json
{
  "error": {
    "code": "PHOTO_TOO_LARGE",
    "message": "A foto excede o tamanho máximo de 5 MB."
  }
}
```
 
```json
{
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "Envie a foto no formato JPEG ou PNG."
  }
}
```
 
### POST /api/v1/demands
 
Registra uma demanda urbana em nome do cidadão autenticado, no status inicial `RECEIVED`.
 
**Autorização:** cidadão.
 
**Parâmetros:** nenhum.
 
**Requisição**
 
```json
{
  "category": "ROAD_MAINTENANCE",
  "description": "Buraco de grande porte na pista da direita, próximo ao cruzamento, causando desvio dos veículos.",
  "location": {
    "latitude": -8.0578,
    "longitude": -34.8829,
    "region": "RPA_3",
    "addressLabel": "Av. Norte, altura do nº 1200"
  },
  "photoId": "7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33"
}
```
 
| Campo | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- |
| `category` | enum `DemandCategory` | sim | Valor da lista fechada. |
| `description` | string | sim | 20 a 1000 caracteres. |
| `location.latitude` | número | sim | -90 a 90. |
| `location.longitude` | número | sim | -180 a 180. |
| `location.region` | enum `Region` | sim | Valor da lista fechada. |
| `location.addressLabel` | string | não | Até 200 caracteres. |
| `photoId` | string (UUID) | não | Foto previamente enviada pelo próprio usuário e ainda não vinculada a outra demanda. |
 
**Respostas**
 
| Código | Quando | Corpo |
| --- | --- | --- |
| 201 | Demanda registrada. | Objeto `Demand`. |
| 400 | Campo ausente, fora de faixa ou enum inválido. | Erro `VALIDATION_ERROR`. |
| 401 | Token ausente, inválido ou expirado. | Erro `UNAUTHENTICATED`. |
| 403 | Chamador é `MANAGER`. | Erro `FORBIDDEN`. |
| 404 | `photoId` inexistente ou pertencente a outro usuário. | Erro `NOT_FOUND`. |
| 409 | `photoId` já vinculado a outra demanda. | Erro `PHOTO_ALREADY_LINKED`. |
 
**Exemplo de sucesso (201)**
 
```json
{
  "id": "c4a1e8d2-3f57-4b90-9a6c-1d2e3f4a5b60",
  "protocol": "DEM-2026-000412",
  "category": "ROAD_MAINTENANCE",
  "description": "Buraco de grande porte na pista da direita, próximo ao cruzamento, causando desvio dos veículos.",
  "status": "RECEIVED",
  "location": {
    "latitude": -8.0578,
    "longitude": -34.8829,
    "region": "RPA_3",
    "addressLabel": "Av. Norte, altura do nº 1200"
  },
  "photo": {
    "id": "7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33",
    "url": "https://storage.cidadeconectada.exemplo/photos/7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33?exp=1786052530",
    "contentType": "image/jpeg",
    "sizeBytes": 1834221
  },
  "author": {
    "id": "9f1c2a54-6b7e-4d2f-8a10-3c5e7b9d1122",
    "name": "Ana Ribeiro"
  },
  "createdAt": "2026-08-05T13:42:10Z",
  "updatedAt": "2026-08-05T13:42:10Z",
  "resolvedAt": null
}
```
 
**Exemplos de erro**
 
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Não foi possível registrar a demanda. Verifique os campos informados.",
    "details": [
      { "field": "description", "issue": "Deve ter no mínimo 20 caracteres." },
      { "field": "location.region", "issue": "Valor fora da lista de regiões válidas." }
    ]
  }
}
```
 
```json
{
  "error": {
    "code": "PHOTO_ALREADY_LINKED",
    "message": "Esta foto já está vinculada a outra demanda."
  }
}
```
 
### GET /api/v1/demands
 
Lista demandas com filtros por status, categoria, região e período, restrita ao escopo do chamador.
 
**Autorização:** cidadão (apenas as próprias) ou gestor (todas).
 
**Parâmetros**
 
| Parâmetro | Local | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- | --- |
| `status` | query | enum `DemandStatus` | não | Aceita múltiplos valores separados por vírgula. |
| `category` | query | enum `DemandCategory` | não | Aceita múltiplos valores separados por vírgula. |
| `region` | query | enum `Region` | não | Aceita múltiplos valores separados por vírgula. |
| `createdFrom` | query | string (ISO 8601) | não | Limite inferior de `createdAt`, inclusivo. |
| `createdTo` | query | string (ISO 8601) | não | Limite superior de `createdAt`, inclusivo; deve ser ≥ `createdFrom`. |
| `page` | query | inteiro | não | ≥ 1; padrão `1`. |
| `pageSize` | query | inteiro | não | 1 a 100; padrão `20`. |
| `sort` | query | string | não | `createdAt:asc` ou `createdAt:desc`; padrão `createdAt:desc`. |
 
Para o perfil `CITIZEN`, o servidor aplica sempre o filtro pelo autor autenticado; não existe parâmetro capaz de ampliar esse escopo.
 
**Requisição:** sem corpo.
 
**Respostas**
 
| Código | Quando | Corpo |
| --- | --- | --- |
| 200 | Consulta executada, inclusive com lista vazia. | Coleção de `Demand` com `pagination`. |
| 400 | Enum inválido, data malformada, intervalo invertido ou `pageSize` fora da faixa. | Erro `VALIDATION_ERROR`. |
| 401 | Token ausente, inválido ou expirado. | Erro `UNAUTHENTICATED`. |
 
**Exemplo de sucesso (200)**
 
```json
{
  "data": [
    {
      "id": "c4a1e8d2-3f57-4b90-9a6c-1d2e3f4a5b60",
      "protocol": "DEM-2026-000412",
      "category": "ROAD_MAINTENANCE",
      "description": "Buraco de grande porte na pista da direita, próximo ao cruzamento, causando desvio dos veículos.",
      "status": "UNDER_ANALYSIS",
      "location": {
        "latitude": -8.0578,
        "longitude": -34.8829,
        "region": "RPA_3",
        "addressLabel": "Av. Norte, altura do nº 1200"
      },
      "photo": {
        "id": "7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33",
        "url": "https://storage.cidadeconectada.exemplo/photos/7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33?exp=1786052530",
        "contentType": "image/jpeg",
        "sizeBytes": 1834221
      },
      "author": {
        "id": "9f1c2a54-6b7e-4d2f-8a10-3c5e7b9d1122",
        "name": "Ana Ribeiro"
      },
      "createdAt": "2026-08-05T13:42:10Z",
      "updatedAt": "2026-08-05T15:10:44Z",
      "resolvedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1
  }
}
```
 
**Exemplos de erro**
 
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parâmetros de consulta inválidos.",
    "details": [
      { "field": "status", "issue": "Valor 'ABERTO' não pertence à lista de status válidos." },
      { "field": "createdTo", "issue": "Deve ser maior ou igual a createdFrom." }
    ]
  }
}
```
 
```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Token de acesso ausente ou inválido."
  }
}
```
 
### PATCH /api/v1/demands/{demandId}/status
 
Atualiza o status de uma demanda respeitando a máquina de estados e registra o evento no histórico.
 
**Autorização:** gestor.
 
**Parâmetros**
 
| Parâmetro | Local | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- | --- |
| `demandId` | rota | string (UUID) | sim | UUID v4 válido. |
 
**Requisição**
 
```json
{
  "status": "IN_PROGRESS",
  "note": "Equipe de manutenção viária acionada para reparo do pavimento."
}
```
 
| Campo | Tipo | Obrigatório | Regras |
| --- | --- | --- | --- |
| `status` | enum `DemandStatus` | sim | Transição permitida a partir do status atual. |
| `note` | string | não | Até 500 caracteres. Obrigatória quando `status` é `REJECTED`. |
 
**Respostas**
 
| Código | Quando | Corpo |
| --- | --- | --- |
| 200 | Status atualizado. | Objeto `Demand` atualizado. |
| 400 | `status` ausente, enum inválido ou `note` ausente em `REJECTED`. | Erro `VALIDATION_ERROR`. |
| 401 | Token ausente, inválido ou expirado. | Erro `UNAUTHENTICATED`. |
| 403 | Chamador é `CITIZEN`. | Erro `FORBIDDEN`. |
| 404 | Demanda inexistente. | Erro `NOT_FOUND`. |
| 409 | Transição não permitida a partir do status atual. | Erro `INVALID_STATUS_TRANSITION`. |
 
**Exemplo de sucesso (200)**
 
```json
{
  "id": "c4a1e8d2-3f57-4b90-9a6c-1d2e3f4a5b60",
  "protocol": "DEM-2026-000412",
  "category": "ROAD_MAINTENANCE",
  "description": "Buraco de grande porte na pista da direita, próximo ao cruzamento, causando desvio dos veículos.",
  "status": "IN_PROGRESS",
  "location": {
    "latitude": -8.0578,
    "longitude": -34.8829,
    "region": "RPA_3",
    "addressLabel": "Av. Norte, altura do nº 1200"
  },
  "photo": {
    "id": "7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33",
    "url": "https://storage.cidadeconectada.exemplo/photos/7b3d9e01-2c48-4a6f-8b1d-5e9f0a1b2c33?exp=1786052530",
    "contentType": "image/jpeg",
    "sizeBytes": 1834221
  },
  "author": {
    "id": "9f1c2a54-6b7e-4d2f-8a10-3c5e7b9d1122",
    "name": "Ana Ribeiro"
  },
  "createdAt": "2026-08-05T13:42:10Z",
  "updatedAt": "2026-08-06T09:20:05Z",
  "resolvedAt": null
}
```
 
**Exemplos de erro**
 
```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Não é possível alterar o status de RESOLVED para IN_PROGRESS."
  }
}
```
 
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Não foi possível atualizar o status.",
    "details": [
      { "field": "note", "issue": "Obrigatória quando o status é REJECTED." }
    ]
  }
}
```
 
## Erros padronizados
 
| Código HTTP | `code` | Significado |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Corpo, parâmetro de rota ou de query inválido. Sempre acompanha `details`. |
| 401 | `UNAUTHENTICATED` | Token ausente, malformado, expirado ou invalidado por logout. |
| 401 | `INVALID_CREDENTIALS` | E-mail ou senha incorretos no login. |
| 403 | `FORBIDDEN` | Papel do chamador não permite a operação. |
| 404 | `NOT_FOUND` | Recurso inexistente ou fora do escopo do chamador. |
| 409 | `EMAIL_ALREADY_REGISTERED` | Já existe conta com o e-mail informado. |
| 409 | `PHOTO_ALREADY_LINKED` | A foto informada já está vinculada a outra demanda. |
| 409 | `INVALID_STATUS_TRANSITION` | Transição de status não permitida pela máquina de estados. |
| 413 | `PHOTO_TOO_LARGE` | Imagem acima de 5 MiB. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Tipo de conteúdo não aceito pelo endpoint. |
| 429 | `RATE_LIMITED` | Limite de requisições excedido em `register` e `login`. |
| 500 | `INTERNAL_ERROR` | Falha não tratada no servidor; `details` ausente. |
 
