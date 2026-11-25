Pensou por 1m 23s

### Auditoria técnica — Frontend × Backend × Mobile

Projeto S.O.S. Escola / S.O.S. Cidade · Análise do ZIP enviado

Desta vez, analisei especificamente a relação entre o frontend web (Next.js), o backend (Express/Prisma) e o mobile (Expo/React Native).

A ideia é verificar não apenas se cada parte funciona isoladamente, mas se as três estão falando a mesma língua: mesmos campos, mesmos valores, mesmos estados e mesmas regras de negócio.

Também comparei os formulários, serviços HTTP, tipos TypeScript, rotas, controladores, serviços e tabelas.

Resultado geral

Existem ajustes necessários

Encontrei incompatibilidades de cadastro, diferenças nos dados das denúncias e pontos de segurança e consistência que merecem correção.

Principal atenção: frontend e mobile não utilizam exatamente o mesmo padrão de categorias e datas para as denúncias.

### 1\. Problemas encontrados por prioridade

### 1.1. Cadastro de gestores não funciona corretamente

P1 — Alta prioridade

Arquivos:

* `frontend/src/components/criar-gestor-modal.tsx`

* `frontend/src/lib/api.ts`

* `backend/src/routes/user.routes.ts`

* `backend/src/controllers/user.controller.ts`

* `backend/src/services/user.service.ts`

O frontend tenta cadastrar um gestor enviando:

```typescript
usersAPI.create({
  name: pendingData.name,
  email: pendingData.email,
  password: pendingData.password,
  role: "GESTOR",
});
```

Porém, o backend possui:

```typescript
role: 'DENUNCIANTE',
```

Ou seja, o backend ignora o perfil solicitado e transforma qualquer cadastro público em DENUNCIANTE.

Além disso, o cadastro de gestores não envia os aceites legais exigidos pelo backend.

Consequência: a criação de gestores pela interface web não funciona como esperado.

Correção recomendada:

* Criar endpoint administrativo específico para gestores.

* Exigir autenticação de gestor.

* Criar método específico no serviço para essa operação.

* Manter o cadastro público restrito a denunciantes.

Esse problema também existe na integração com o mobile, conforme a auditoria anterior.

### 1.2. Frontend e mobile possuem categorias de denúncia diferentes

P1 — Alta prioridade de consistência

Arquivos:

* `frontend/src/components/form-denuncias.tsx`

* `frontend/src/components/gestor-data-table.tsx`

* `frontend/src/components/denunciante-data-table.tsx`

* `mobile/src/constants/tipos.ts`

* `backend/prisma/schema.prisma`

Encontrei uma diferença importante.

O frontend disponibiliza 14 categorias, entre elas:

* Poda de árvore.

* Calçada irregular.

* Foco de dengue.

* Sinalização danificada.

* Limpeza de bueiro.

* Manutenção de parques.

* Animal solto.

* Poluição sonora.

* Vazamento de água.

* Terreno baldio.

Já o mobile disponibiliza 7 categorias:

* Foco de Dengue.

* Iluminação Pública.

* Falta D'água.

* Alagamento.

* Descarte Irregular de Lixo.

* Buraco na Via.

* Outro.

O backend aceita os valores como `String`, sem uma enumeração compartilhada que valide as categorias.

Consequência:

Uma denúncia criada pelo frontend pode chegar ao mobile com uma categoria que ele não conhece.

O registro não necessariamente falha, mas a apresentação visual, os filtros e a classificação podem ficar inconsistentes.

Correção recomendada:

Criar uma lista única de categorias, compartilhada pelos dois aplicativos e validada pelo backend.

O ideal é utilizar identificadores estáveis, como:

```typescript
type TipoDenuncia =
  | 'FOCO_DENGUE'
  | 'ILUMINACAO_PUBLICA'
  | 'FALTA_AGUA'
  | 'ALAGAMENTO'
  | 'DESCARTE_LIXO'
  | 'BURACO_VIA'
  | 'OUTRO';
```

Os nomes apresentados na tela podem ser diferentes dos identificadores armazenados.

### 1.3. Formatos de data diferentes entre frontend e mobile

P1 — Alta prioridade de consistência

Arquivos:

* `frontend/src/components/form-denuncias.tsx`

* `mobile/src/screens/routes/denunciante/NovaDenunciaScreen.tsx`

* `backend/prisma/schema.prisma`

No frontend:

```typescript
dataOcorrencia: new Date().toLocaleDateString("pt-BR"),
```

O resultado será semelhante a:

```text
24/11/2026
```

No mobile:

```typescript
const [data, setData] = useState(
  new Date().toISOString().split('T')[0]
);
```

O resultado será:

```text
2026-11-24
```

O backend armazena o campo como `String`, aceitando os dois formatos.

Consequência:

O mesmo campo pode conter datas em padrões diferentes.

Isso prejudica a padronização, a ordenação e futuras consultas por período.

Correção recomendada:

Padronizar os dois aplicativos para:

```text
YYYY-MM-DD
```

E deixar a formatação brasileira apenas para apresentação visual.

### 1.4. Status das denúncias possui variação de escrita

P2 — Média prioridade

Arquivos:

* `frontend/src/components/form-denuncias.tsx`

* `frontend/src/components/edit-status-cell.tsx`

* `mobile/src/constants/situacao.ts`

* `backend/src/services/denuncia.service.ts`

No frontend, a criação utiliza:

```typescript
situacao: "Em andamento",
```

No mobile:

```typescript
SITUACAO_INICIAL = 'Em Andamento'
```

O backend também utiliza:

```typescript
situacao: data.situacao || 'Em Andamento',
```

A diferença parece pequena, mas o backend realiza filtros por igualdade exata:

```typescript
situacao: filtros.situacao
```

Portanto, se uma consulta utilizar `"Em andamento"`, poderá não encontrar registros armazenados como `"Em Andamento"`.

Correção recomendada:

Padronizar os estados:

```typescript
type Situacao =
  | 'EM_ANDAMENTO'
  | 'FINALIZADA';
```

Assim, a interface pode mostrar `Em andamento`, enquanto o banco armazena `EM_ANDAMENTO`.

### 1.5. Token de autenticação do frontend não utiliza cookie HttpOnly

P2 — Segurança

Arquivos:

* `frontend/src/store/useAuthStore.ts`

* `frontend/src/lib/api.ts`

* `frontend/src/middleware.ts`

O frontend utiliza:

```typescript
Cookies.set('authToken', response.data.token, {
  expires: 7
});
```

E posteriormente lê o token pelo JavaScript:

```typescript
document.cookie
  .split('; ')
  .find(c => c.startsWith('authToken='));
```

Isso significa que o token fica acessível ao JavaScript executado na página.

Risco: caso ocorra uma vulnerabilidade XSS, o token poderá ser acessado por scripts maliciosos.

Correção recomendada:

Avaliar uma arquitetura com cookie `HttpOnly`, `Secure` e `SameSite` adequado, preferencialmente utilizando uma camada de servidor para encaminhar as requisições à API.

Não é uma incompatibilidade de campos entre frontend e backend, mas é um ponto importante de segurança.

### 1.6. Proteção das páginas depende de cookies manipuláveis

P2 — Segurança

Arquivo: `frontend/src/middleware.ts`

O middleware utiliza:

```typescript
const token = request.cookies.get('authToken')?.value;
const role = request.cookies.get('userRole')?.value;
```

A decisão de encaminhar o usuário para as páginas de gestor ou denunciante depende do valor do cookie `userRole`.

Como esse cookie é criado pelo JavaScript, pode ser alterado pelo próprio usuário.

Importante: o backend já possui proteção de autorização em várias rotas. Portanto, não estou afirmando que alterar o cookie concede acesso aos dados protegidos da API.

O problema é que a proteção de navegação do frontend não deve ser tratada como uma barreira de segurança.

Correção recomendada:

Validar a identidade e o perfil em uma camada confiável do servidor, além de manter as verificações de autorização no backend.

### 2\. Comparação das três aplicações — Denúncias

Esta é a tabela principal que você pediu. Comparei os dados utilizados na criação e consulta das denúncias nos três projetos.

### 2.1. Campos e formatos

| Campo               | Mobile           | Backend              | Frontend         |
| ------------------- | ---------------- | -------------------- | ---------------- |
| tipoDenuncia        | Texto            | String               | Texto            |
| identificacao       | Boolean          | Boolean              | Boolean          |
| nomeDenunciante     | Texto            | String criptografada | Texto            |
| userId              | Número           | Relação com User     | Opcional         |
| bairroOcorrencia    | Texto            | String               | Texto            |
| descricaoOcorrencia | Texto            | String criptografada | Texto            |
| dataOcorrencia      | ISO YYYY-MM-DD   | String               | DD/MM/YYYY       |
| protocolo           | Texto            | String única         | Texto            |
| situacao            | Em Andamento     | String               | Em andamento     |
| imagens             | Array de imagens | String JSON          | Array de imagens |
| createdAt           | ISO              | DateTime             | ISO              |
| updatedAt           | ISO              | DateTime             | ISO              |

Ajustes identificados

Os principais pontos de divergência são:

* Formato da data.

* Categorias disponíveis.

* Escrita dos estados.

* Padronização dos identificadores de categorias e estados.

Os demais campos apresentam correspondência estrutural.

Uma observação: `nomeDenunciante` e `descricaoOcorrencia` são criptografados no backend e descriptografados antes de serem devolvidos. Portanto, é correto que frontend e mobile recebam texto legível, enquanto o banco armazena os valores protegidos.

### 2.2. Operações de denúncias

| Operação           | Mobile                | Backend               | Frontend              |
| ------------------ | --------------------- | --------------------- | --------------------- |
| Criar denúncia     | POST /denuncias       | POST /denuncias       | POST /denuncias       |
| Listar próprias    | /denuncias/minhas     | GET /denuncias/minhas | GET /denuncias/minhas |
| Listar todas       | GET /denuncias        | GET /denuncias        | GET /denuncias        |
| Consultar por ID   | GET /denuncias/:id    | GET /denuncias/:id    | GET /denuncias/:id    |
| Atualizar situação | PATCH /denuncias/:id  | PATCH /denuncias/:id  | PATCH /denuncias/:id  |
| Excluir            | DELETE /denuncias/:id | DELETE /denuncias/:id | DELETE /denuncias/:id |

Contratos de rotas compatíveis

As rotas utilizadas pelos dois clientes correspondem às rotas implementadas no backend.

Existe, porém, uma observação importante:

* O backend restringe a listagem geral a GESTOR.

* A atualização e exclusão também exigem GESTOR.

* A consulta individual verifica a propriedade da denúncia.

* A criação exige autenticação, mas não restringe o perfil a DENUNCIANTE.

Portanto, a principal correção de autorização continua sendo a restrição da criação.

### 2.3. Regras de negócio por perfil

| Regra                             | Mobile                        | Backend            | Frontend                      |
| --------------------------------- | ----------------------------- | ------------------ | ----------------------------- |
| Denunciante cria denúncia         | Permite                       | Permite            | Permite                       |
| Gestor cria denúncia              | Interface não oferece o fluxo | Atualmente permite | Interface não oferece o fluxo |
| Denunciante vê próprias denúncias | Permite                       | Permite            | Permite                       |
| Gestor vê todas                   | Permite                       | Permite            | Permite                       |
| Gestor atualiza situação          | Permite                       | Permite            | Permite                       |
| Gestor exclui denúncia            | Permite                       | Permite            | Permite                       |
| Denunciante atualiza situação     | Não oferece                   | Bloqueado          | Não oferece                   |
| Denunciante exclui denúncia       | Não oferece                   | Bloqueado          | Não oferece                   |

O backend precisa ser a autoridade definitiva dessas regras. A interface não pode ser a única responsável por impedir operações.

### 3\. Análise específica do frontend com backend

Agora, além das divergências entre os três projetos, estes são os pontos que encontrei na integração web.

### 3.1. Comunicação HTTP

Arquivo: `frontend/src/lib/api.ts`

O frontend utiliza:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

E realiza as chamadas com:

```typescript
fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers,
  credentials: 'include',
});
```

O backend disponibiliza:

```typescript
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/denuncias', denunciaRoutes);
```

Os caminhos correspondem.

Não encontrei incompatibilidade de prefixo entre os endpoints.

Atenção: em produção, `NEXT_PUBLIC_API_URL` precisa estar configurada com a URL correta do backend. O endereço padrão `localhost:8000` só funciona no ambiente local.

Também é necessário manter `FRONTEND_URL` configurada no backend para aceitar a origem publicada do frontend.

### 3.2. Respostas JSON e paginação

O frontend define:

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

O backend devolve:

```typescript
{
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 50
  }
}
```

O formato está compatível.

O frontend também trata a resposta com:

```typescript
const items = Array.isArray(paginatedData)
  ? paginatedData
  : (paginatedData.data || []);
```

Isso permite lidar com respostas em array ou paginadas.

Avaliação: não encontrei incompatibilidade relevante nesse contrato.

### 3.3. Atualização da situação

Arquivo: `frontend/src/components/edit-status-cell.tsx`

O frontend envia:

```typescript
const response = await denunciasAPI.update(
  denuncia.id,
  { situacao: pendingStatus }
);
```

O backend recebe:

```typescript
const { situacao } = req.body;

const denuncia =
  await this.denunciaService.updateDenuncia(
    id,
    { situacao }
  );
```

A estrutura está correta.

Entretanto, existe um ponto de melhoria: o frontend atualiza a tabela e o estado local depois da requisição, mas não utiliza a denúncia devolvida pelo backend para sincronizar o registro.

Recomendo atualizar o estado com a resposta real da API ou executar uma nova consulta depois da alteração.

Isso evita que o frontend apresente dados diferentes do que realmente foi salvo.

### 3.4. Exibição das categorias

Arquivos:

* `frontend/src/components/gestor-data-table.tsx`

* `frontend/src/components/denunciante-data-table.tsx`

* `frontend/src/components/mapa-ocorrencias.tsx`

Encontrei outro detalhe.

As tabelas possuem configurações visuais para categorias como:

* Alagamento / Esgoto.

* Assalto / Violência.

* Buraco na Via.

* Descarte Irregular de Lixo.

* Iluminação Pública.

* Problema de Trânsito.

* Vandalismo.

Mas o formulário atual possui várias categorias diferentes.

Quando uma categoria não está configurada, a tabela utiliza o estilo de `outro`.

Isso não impede a denúncia de aparecer, mas deixa a identificação visual inconsistente.

Correção recomendada: centralizar o catálogo de categorias e suas configurações visuais em um único local compartilhado.

### 3.5. Carregamento das denúncias

Arquivos:

* `frontend/src/hooks/useDenuncias.ts`

* `frontend/src/store/useDenunciasStore.ts`

* `frontend/src/app/(gestor)/denuncias-recentes/page.tsx`

* `frontend/src/app/(denunciante)/minhas-denuncias/page.tsx`

Encontrei uma diferença na estratégia de carregamento.

A página de denúncias recentes do gestor utiliza:

```typescript
useDenuncias(1, 50);
```

Portanto, recebe inicialmente apenas 50 registros.

A página de minhas denúncias percorre páginas de 100 registros, mas estabelece:

```typescript
const MAX_PAGES = 10;
```

Isso limita a consulta a 1.000 registros.

Consequência: se houver mais denúncias que esses limites, a interface poderá não mostrar todo o histórico.

Correção recomendada:

Implementar paginação real nas tabelas, permitindo que o usuário navegue por todos os registros sem precisar carregar tudo de uma vez.

### 4\. Ordem de prioridade para correções

Esta seria minha ordem de trabalho, considerando os três projetos juntos.

### Plano de correção recomendado

* Corrigir o cadastro de gestores

    P1

    Backend, frontend e mobile. Criar endpoint administrativo protegido e fluxo correto de cadastro.

* Padronizar categorias de denúncias

    P1

    Criar catálogo único para frontend e mobile, com validação no backend.

* Padronizar datas

    P1

    Utilizar `YYYY-MM-DD` nos dois aplicativos.

* Padronizar situações

    P2

    Utilizar identificadores únicos, como `EM_ANDAMENTO` e `FINALIZADA`.

* Melhorar a segurança da autenticação web

    P2

    Avaliar cookies HttpOnly e validação de perfil no servidor.

* Restringir a criação de denúncias

    P1

    Somente DENUNCIANTE deve poder criar denúncias.

* Melhorar a sincronização após atualizações

    P2

    Utilizar a resposta do backend para atualizar o estado do frontend.

* Implementar paginação completa

    P2

    Evitar limites fixos de 50 ou 1.000 registros.

* Centralizar configurações visuais

    P3

    Manter nomes, cores e identificadores das categorias em um catálogo único.

### 5\. Documentação recomendada

Agora que o projeto possui três aplicações, recomendo organizar a documentação pensando na integração entre elas.

| Documento         | Objetivo                                      |
| ----------------- | --------------------------------------------- |
| ARCHITECTURE.md   | Explicar como as três aplicações se comunicam |
| API_CONTRACT.md   | Documentar endpoints e formatos JSON          |
| DENUNCIAS.md      | Documentar campos, categorias e estados       |
| AUTHORIZATION.md  | Definir permissões por perfil                 |
| DATABASE.md       | Explicar entidades e relacionamentos          |
| FRONTEND_SETUP.md | Configuração do Next.js                       |
| MOBILE_SETUP.md   | Configuração do Expo                          |
| BACKEND_SETUP.md  | Configuração da API                           |
| DEPLOY.md         | Publicação das três aplicações                |
| TESTING.md        | Testes unitários, integração e E2E            |

Minha sugestão mais importante é criar um documento chamado `CONTRATOS_DE_DADOS.md`.

Ele deve definir uma única fonte de verdade para:

* Categorias de denúncias.

* Situações.

* Formatos de datas.

* Campos obrigatórios.

* Formatos de imagens.

* Regras de anonimato.

* Permissões de cada perfil.

Isso reduziria bastante o risco de uma aplicação evoluir e as outras ficarem incompatíveis.

### 6\. Conclusão

Avaliação das três aplicações

Frontend ↔ Backend

Ajustes necessários

Mobile ↔ Backend

Ajustes necessários

Frontend ↔ Mobile

Padronização necessária

Minha avaliação técnica

A arquitetura geral está organizada. Os três projetos possuem serviços de comunicação, separação de responsabilidades e utilização coerente dos principais campos das denúncias.

Entretanto, ainda existem diferenças de regras e formatos que podem causar inconsistências conforme os usuários utilizem plataformas diferentes.

### O que eu faria antes de considerar o projeto pronto?

Não começaria refazendo as telas nem a arquitetura.

Faria primeiro quatro coisas:

* Criaria um contrato único de dados para as denúncias.

* Corrigiria os cadastros e as permissões no backend.

* Sincronizaria os formatos de dados do frontend e mobile.

* Executaria testes reais de integração nas três aplicações.

Uma ressalva: esta foi uma auditoria estática do código do ZIP. Não executei as três aplicações simultaneamente, nem realizei testes com banco de dados e requisições reais. Portanto, os pontos identificados são incompatibilidades ou riscos encontrados no código, não uma homologação de produção.

### Minha próxima recomendação

Acredito que seria muito interessante fazer uma terceira etapa: uma auditoria de fluxo completo, acompanhando uma denúncia desde o momento em que é criada até aparecer nas outras duas aplicações.

Por exemplo:

Fluxo que deveríamos validar

* Denunciante cria uma denúncia pelo mobile.

* Backend valida e salva no banco.

* Frontend web recebe e apresenta a denúncia.

* Gestor altera a situação pelo frontend.

* Backend salva a alteração.

* Mobile recebe a nova situação na consulta seguinte.

Teste ponta a ponta

Esse teste é especialmente importante porque permite descobrir problemas que uma simples comparação de arquivos não consegue comprovar.

Posso também montar uma matriz de testes com os cenários, resultado esperado, resultado obtido e arquivo responsável por cada correção, para você utilizar como checklist de validação do projeto.
