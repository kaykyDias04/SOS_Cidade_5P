# Backlog de Produto — 16 Histórias Épicas do S.O.S. Cidade

> **Objetivo deste documento:** estabelecer a direção funcional e técnica do S.O.S. Cidade para que o GitHub Copilot e a equipe possam derivar histórias menores, tarefas SMART e critérios INVEST, especialmente para planejar e implementar a estratégia de testes do Mobile.
>
> **Base documental:** repositório `SOS_Escola_5P.-copy-main` (ZIP analisado em 25/11/2026), `README.md`, `mobile/README.md`, `mobile/LEIA-ME-ACOMPANHAMENTO.md`, `Atividade Projeto Integrado -SEC.md`, estrutura atual de `mobile/`, `backend/`, `frontend/` e `e2e/`.
>
> **Importante:** este documento descreve o norte do produto e o comportamento esperado. Não declara que todos os requisitos já estejam implementados ou homologados. O Copilot deve conferir o código atual antes de alterar qualquer coisa e registrar divergências.

---

## 1. Visão do produto

O **S.O.S. Cidade** é uma plataforma de comunicação entre cidadãos do Recife e a gestão pública para registrar, acompanhar, visualizar e tratar ocorrências de zeladoria urbana. O produto possui três partes integradas:

- **Mobile:** aplicativo React Native com Expo, direcionado a Android e iOS.
- **Frontend Web:** aplicação Next.js.
- **Backend:** API REST em Node.js/Express, TypeScript, Prisma e PostgreSQL, com Redis para cache.

O sistema trabalha com dois perfis centrais, cujos nomes e responsabilidades são invariáveis:

| Papel | Responsabilidade de negócio |
|---|---|
| `DENUNCIANTE` | Pessoa cidadã que pode se cadastrar publicamente, autenticar-se, registrar denúncias e consultar o próprio histórico. |
| `GESTOR` | Pessoa responsável pela gestão pública, com acesso às funcionalidades administrativas para consultar, filtrar, acompanhar e atualizar denúncias e gerenciar gestores conforme autorização. Não cria denúncias. |

### Regras invioláveis para qualquer implementação

1. Preservar literalmente os papéis `GESTOR` e `DENUNCIANTE`. Não renomear, remover, substituir ou mudar seu significado.
2. O cadastro público cria somente `DENUNCIANTE`. O cliente nunca pode promover a própria conta enviando `role: "GESTOR"`.
3. A criação e a administração de gestores são operações administrativas e devem ser autorizadas no Backend.
4. O `GESTOR` não pode criar denúncias.
5. A autorização deve ser validada no Backend. Guardas de navegação no Mobile/Web melhoram a experiência, mas não substituem autorização da API.
6. Denúncias anônimas devem ter o anonimato garantido pelo Backend, não apenas pela interface.
7. Não quebrar compatibilidade com registros existentes sem estratégia de migração/normalização.
8. Preservar os testes existentes, workflows e contratos válidos, salvo mudança justificada e documentada.

---

## 2. Como transformar épicos em tarefas SMART e INVEST

As 16 histórias abaixo são **épicas**: amplas demais para serem implementadas em um único PR. Cada épico deve ser decomposto em histórias menores e tarefas técnicas.

### SMART — cada tarefa derivada deve ser

- **S — Específica:** indicar tela, serviço, endpoint, regra ou cenário exato.
- **M — Mensurável:** ter critério verificável, como resposta HTTP esperada, estado da tela, persistência ou teste aprovado.
- **A — Atingível:** caber no escopo de uma entrega e respeitar a arquitetura existente.
- **R — Relevante:** contribuir diretamente para uma das 16 histórias e para a visão do produto.
- **T — Temporal:** ter prazo ou janela de execução definida pela equipe. O Copilot não deve inventar datas; deve deixar o campo para priorização humana.

### INVEST — cada história derivada deve ser

- **I — Independent (Independente):** minimizar dependências com outras histórias.
- **N — Negotiable (Negociável):** definir o resultado, sem impor implementação desnecessária.
- **V — Valuable (Valiosa):** entregar benefício perceptível ao cidadão, gestor ou operação.
- **E — Estimable (Estimável):** ter escopo e critérios suficientes para estimativa.
- **S — Small (Pequena):** caber em uma entrega curta, idealmente um PR focado.
- **T — Testable (Testável):** possuir critérios de aceite reproduzíveis e verificáveis.

**Atenção:** INVEST é aplicado principalmente às histórias menores derivadas dos épicos, não ao épico inteiro. Se uma história derivada não puder ser testada isoladamente, dividir ou explicitar sua dependência.

### Modelo obrigatório para cada tarefa derivada

```md
## [ID] Título da tarefa

- Épico: [HU-XX]
- Tipo: Produto | Mobile | Backend | Frontend | QA | Segurança | DevOps
- Prioridade: Must | Should | Could
- Papel/ator: DENUNCIANTE | GESTOR | Público | Sistema
- Objetivo SMART:
- Contexto/evidência no repositório:
- Escopo incluído:
- Fora de escopo:
- Critérios de aceite:
  - [ ] ...
- Cenários de teste:
  - Positivo:
  - Negativo:
  - Limite/erro:
- Dependências:
- Arquivos/componentes candidatos (confirmar antes de alterar):
- Estimativa:
- Prazo:
- Checklist INVEST: I [ ] N [ ] V [ ] E [ ] S [ ] T [ ]
```

---

# 3. As 16 histórias épicas

## HU-01 — Acesso inicial, cadastro público e orientação do cidadão

**História épica**

Como pessoa cidadã que utiliza o S.O.S. Cidade, quero acessar o aplicativo, entender sua finalidade, criar minha conta e entrar no sistema, para registrar e acompanhar problemas urbanos.

**Valor de negócio**

Reduzir a barreira de entrada e permitir que cidadãos utilizem o serviço com clareza e segurança.

**Escopo funcional**
- Tela inicial/boas-vindas.
- Navegação entre apresentação, cadastro e login.
- Cadastro público de `DENUNCIANTE`.
- Validação de nome, e-mail, senha e confirmação de senha.
- Aceite explícito dos Termos de Uso e da Política de Privacidade.
- Mensagens de sucesso e de validação.

**Critérios de aceite do épico**
- [ ] Uma pessoa consegue chegar às telas de cadastro e login a partir do fluxo público.
- [ ] O cadastro público cria somente o papel `DENUNCIANTE`.
- [ ] O cadastro não é enviado sem os aceites legais obrigatórios.
- [ ] Os aceites são enviados ao Backend nos campos contratuais esperados (`acceptedTerms` e `acceptedPrivacy`), após manifestação explícita.
- [ ] Erros de validação e de API são apresentados de forma compreensível.
- [ ] O cadastro existente no Frontend Web não é quebrado.

**Direção de testes**
- Testes unitários de validação dos campos.
- Testes de componente para aceite obrigatório e estado do botão.
- Testes de serviço para payload de cadastro.
- Teste de integração com API para cadastro válido, e-mail duplicado e ausência de aceite.
- E2E Web existente deve ser preservado; não presumir que cobre a tela nativa.

**Pontos de partida no repositório**
- `mobile/app/(public)/`
- `mobile/src/screens/routes/public/`
- `mobile/src/hooks/useCadastroUsuario.ts`
- `mobile/src/services/userService.ts`
- `mobile/src/utils/validation.ts`
- `frontend/src/components/register-form.tsx`
- `backend/src/routes/user.routes.ts`
- `backend/src/services/user.service.ts`

---

## HU-02 — Autenticação, sessão segura e encerramento de acesso

**História épica**

Como usuário `DENUNCIANTE` ou `GESTOR`, quero autenticar-me e manter uma sessão segura no dispositivo, para acessar somente as funcionalidades permitidas ao meu perfil.

**Valor de negócio**

Proteger contas, dados pessoais e operações do sistema, mantendo uma experiência de sessão previsível.

**Escopo funcional**
- Login e logout.
- Validação de credenciais.
- Persistência segura do token no Mobile.
- Restauração da sessão ao abrir o aplicativo.
- Tratamento de token ausente, inválido ou expirado.
- Estado de carregamento durante a restauração.
- Diferenciação entre falha de autenticação (401) e falta de permissão (403).

**Critérios de aceite do épico**
- [ ] Login válido autentica e identifica o usuário e seu papel.
- [ ] Credenciais inválidas não criam sessão.
- [ ] O token do Mobile é armazenado com `expo-secure-store`, nunca em AsyncStorage puro.
- [ ] O token é enviado no header `Authorization: Bearer`.
- [ ] Logout remove a sessão local e encerra a sessão conforme contrato do Backend.
- [ ] A navegação protegida aguarda a restauração da sessão.
- [ ] Resposta 401 por sessão inválida conduz ao fluxo de autenticação.
- [ ] Resposta 403 por falta de permissão não deve, por si só, apagar a sessão.
- [ ] O mecanismo de cookie HttpOnly do Web não é copiado literalmente para o Mobile; respeitar as diferenças entre plataforma nativa e navegador.

**Direção de testes**
- Testar login válido/inválido, logout, restauração e expiração.
- Testar armazenamento seguro com mock do SecureStore.
- Testar headers da API.
- Testar 401 versus 403.
- Testar reinicialização do app com sessão válida e inválida.

**Pontos de partida**
- `mobile/src/store/useAuthStore.ts`
- `mobile/src/hooks/useSessao.ts`
- `mobile/src/hooks/useRoleGuard.ts`
- `mobile/src/services/authService.ts`
- `mobile/src/services/http.ts`
- `mobile/src/services/secureStorage.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/middlewares/auth.middleware.ts`

---

## HU-03 — Autorização por perfil e proteção de rotas e operações

**História épica**

Como usuário do sistema, quero visualizar e executar somente as operações permitidas ao meu papel, para que os dados e recursos administrativos sejam protegidos.

**Valor de negócio**

Impedir elevação indevida de privilégios e acesso não autorizado, independentemente da interface utilizada.

**Escopo funcional**
- Preservar `GESTOR` e `DENUNCIANTE`.
- Guardas de rotas no Mobile e Frontend.
- Autorização centralizada no Backend.
- Proteção de listagem geral, atualização e exclusão de denúncias.
- Proteção de gerenciamento de usuários/gestores.
- Regras de propriedade para detalhes e histórico do denunciante.

**Critérios de aceite do épico**
- [ ] `DENUNCIANTE` acessa suas próprias denúncias e não acessa funções administrativas.
- [ ] `GESTOR` acessa funções administrativas autorizadas.
- [ ] `GESTOR` não cria denúncias.
- [ ] A API rejeita operações não autorizadas mesmo quando chamadas diretamente, sem passar pela interface.
- [ ] Usuário não autenticado não acessa endpoints protegidos.
- [ ] A consulta de detalhes respeita as regras de propriedade e o acesso administrativo definido.
- [ ] Nenhuma alteração renomeia ou modifica o significado dos papéis.

**Direção de testes**
- Matriz de autorização por endpoint e papel.
- Testes unitários dos middlewares.
- Testes de integração HTTP com token de cada papel.
- Testes de guardas e redirecionamento do Mobile.
- Testes negativos para chamadas diretas à API.

**Pontos de partida**
- `backend/src/middlewares/auth.middleware.ts`
- `backend/src/middlewares/authorize.middleware.ts`
- `backend/src/routes/denuncia.routes.ts`
- `backend/src/routes/user.routes.ts`
- `mobile/src/hooks/useRoleGuard.ts`
- `mobile/app/(denunciante)/`
- `mobile/app/(gestor)/`

---

## HU-04 — Administração segura de gestores

**História épica**

Como `GESTOR` autorizado, quero cadastrar, consultar e administrar outros gestores conforme as permissões definidas, para manter o acesso administrativo do sistema sob controle.

**Valor de negócio**

Permitir gestão de contas administrativas sem expor a criação de privilégios no cadastro público.

**Escopo funcional**
- Fluxo de criação de gestores na área administrativa.
- Endpoint administrativo dedicado, se confirmado como necessário na análise técnica.
- Validação de autorização no Backend.
- Listagem e exclusão conforme regras existentes.
- Integração entre tela Mobile, Frontend e API.
- Auditoria dos erros de permissão.

**Critérios de aceite do épico**
- [ ] Cadastro público continua criando apenas `DENUNCIANTE`.
- [ ] Enviar `role: "GESTOR"` ao endpoint público não promove a conta.
- [ ] Somente `GESTOR` autorizado cria outro gestor.
- [ ] `DENUNCIANTE` não lista, cria ou exclui gestores.
- [ ] A interface apresenta retorno claro de sucesso ou falha.
- [ ] Os contratos Mobile/Web são compatíveis com o endpoint administrativo.
- [ ] Não se cria uma segunda regra de papéis divergente da regra central do Backend.

**Direção de testes**
- Testar endpoint público contra tentativa de autopromoção.
- Testar criação administrativa com token de `GESTOR`.
- Testar bloqueio com token de `DENUNCIANTE` e sem token.
- Testar validação de payload, duplicidade e resposta da API.
- Testar telas/hooks de gerenciamento no Mobile.

**Pontos de partida**
- `mobile/src/screens/routes/gestor/GestoresScreen.tsx`
- `mobile/src/hooks/useGestores.ts`
- `mobile/src/services/userService.ts`
- `frontend/src/components/criar-gestor-modal.tsx`
- `backend/src/routes/user.routes.ts`
- `backend/src/controllers/user.controller.ts`
- `backend/src/services/user.service.ts`

---

## HU-05 — Registro de denúncia pelo cidadão

**História épica**

Como `DENUNCIANTE`, quero registrar uma ocorrência urbana informando categoria, localidade, descrição, data e evidências, para comunicar um problema à gestão pública.

**Valor de negócio**

Garantir que o caminho central do produto — registrar um problema urbano — seja simples, íntegro e confiável.

**Escopo funcional**
- Formulário de nova denúncia.
- Seleção de categoria e bairro.
- Descrição e data de ocorrência.
- Identificação ou anonimato.
- Protocolo.
- Envio para API.
- Validação e prevenção de envio duplicado.
- Mensagem de sucesso/erro.

**Critérios de aceite do épico**
- [ ] Somente `DENUNCIANTE` consegue criar denúncia.
- [ ] Campos obrigatórios são validados antes do envio.
- [ ] O payload segue o contrato definido pela API.
- [ ] O Backend associa a denúncia ao usuário autenticado quando aplicável.
- [ ] A resposta de sucesso apresenta protocolo ou identificador retornado pelo Backend.
- [ ] Falhas de rede/API não são exibidas como sucesso.
- [ ] O usuário não consegue disparar múltiplos envios acidentais enquanto a operação está em andamento.
- [ ] Categorias e situações respeitam o catálogo/contrato compartilhado.

**Direção de testes**
- Testar formulário válido e inválido.
- Testar envio, payload e resposta.
- Testar falha de API, timeout e envio duplicado.
- Testar criação identificada e anônima.
- Testar que `GESTOR` não consegue criar denúncia pela API.

**Pontos de partida**
- `mobile/src/screens/routes/denunciante/NovaDenunciaScreen.tsx`
- `mobile/src/hooks/useDenunciaForm.ts`
- `mobile/src/services/denunciaService.ts`
- `mobile/src/types/denuncia.ts`
- `backend/src/routes/denuncia.routes.ts`
- `backend/src/controllers/denuncia.controller.ts`
- `backend/src/services/denuncia.service.ts`

---

## HU-06 — Anonimato, privacidade e proteção dos dados da denúncia

**História épica**

Como `DENUNCIANTE`, quero escolher se minha denúncia será identificada ou anônima e ter essa escolha respeitada pelo sistema, para comunicar ocorrências sem exposição indevida da minha identidade.

**Valor de negócio**

Proteger dados pessoais e cumprir a promessa de anonimato com controles aplicados no servidor.

**Escopo funcional**
- Opção de identificação/anonimato.
- Regra de anonimização aplicada no Backend.
- Proteção de nome e descrição em repouso conforme implementação documentada.
- Controle de dados devolvidos pela API.
- Proteção de logs e erros.
- Acesso do denunciante ao próprio histórico, inclusive denúncias anônimas associadas à conta conforme regra documentada.
- Compatibilidade com requisitos LGPD e política de retenção já documentada.

**Critérios de aceite do épico**
- [ ] `identificacao: false` não pode revelar nome do denunciante por manipulação do payload.
- [ ] A regra de anonimização é aplicada no Backend, não confiada à interface.
- [ ] Respostas públicas/administrativas expõem somente os campos necessários a cada perfil.
- [ ] O vínculo interno necessário para o histórico do titular não é confundido com exposição pública da identidade.
- [ ] Nome e descrição permanecem protegidos conforme a estratégia de criptografia existente.
- [ ] Erros/logs não registram desnecessariamente dados pessoais ou conteúdo sensível.
- [ ] Regras de retenção e anonimização automática documentadas são preservadas e testadas.

**Direção de testes**
- Testes de serviço para `identificacao: false` com nome malicioso/informado.
- Testes de resposta para verificar ausência de identificação indevida.
- Testes de acesso ao histórico do titular.
- Testes de criptografia/descriptografia e de não exposição de valores em claro no banco/logs.
- Testes da rotina de retenção/anonimização, com relógio e dados controlados.

**Pontos de partida**
- `backend/src/services/denuncia.service.ts`
- `backend/src/lib/crypto.ts`
- `backend/src/jobs/cron.ts`
- `backend/src/repositories/denuncia.repository.ts`
- `backend/prisma/schema.prisma`
- `mobile/src/screens/routes/denunciante/NovaDenunciaScreen.tsx`
- `Atividade Projeto Integrado -SEC.md`, seções 3, 5, 7, 8 e 9.

---

## HU-07 — Anexos e evidências fotográficas

**História épica**

Como `DENUNCIANTE`, quero anexar imagens à denúncia, para fornecer evidências que ajudem a gestão a compreender a ocorrência.

**Valor de negócio**

Melhorar a qualidade das informações recebidas e apoiar a triagem e resolução das ocorrências.

**Escopo funcional**
- Seleção/captura de imagem, conforme recursos já presentes.
- Pré-visualização e remoção de imagem antes do envio.
- Serialização e transporte no formato aceito pelo Backend.
- Persistência e leitura das imagens.
- Tratamento de permissões negadas, arquivos inválidos e falhas de envio.

**Critérios de aceite do épico**
- [ ] O usuário consegue anexar imagem nos limites definidos pelo produto.
- [ ] O usuário consegue revisar/remover anexo antes de enviar.
- [ ] O formato enviado corresponde ao contrato da API.
- [ ] A ausência de imagem continua permitindo denúncia quando permitido.
- [ ] Falha ao processar ou enviar imagem é comunicada claramente.
- [ ] A leitura posterior da denúncia trata imagens ausentes ou malformadas sem quebrar a tela.
- [ ] A política de privacidade para evidências é respeitada.

**Direção de testes**
- Testar seleção, remoção e estado de anexos.
- Testar serialização/parse de imagens.
- Testar denúncia com zero, uma e múltiplas imagens dentro dos limites.
- Testar permissão negada, arquivo inválido e erro de rede.
- Testar resposta da API com campo de imagem nulo ou JSON inválido.

**Pontos de partida**
- `mobile/src/screens/routes/denunciante/NovaDenunciaScreen.tsx`
- `mobile/src/utils/parseImagens.ts`
- `mobile/src/services/denunciaService.ts`
- `backend/src/services/denuncia.service.ts`
- Dependências Expo relacionadas a imagem, a confirmar no `mobile/package.json`.

---

## HU-08 — Histórico e detalhes das denúncias do cidadão

**História épica**

Como `DENUNCIANTE`, quero consultar minhas denúncias e abrir seus detalhes, para acompanhar o andamento das ocorrências que registrei.

**Valor de negócio**

Dar transparência ao cidadão e permitir acompanhamento sem acesso aos dados de outros usuários.

**Escopo funcional**
- Lista de denúncias próprias.
- Paginação/carregamento.
- Detalhes da denúncia.
- Exibição de protocolo, categoria, bairro, data, descrição, imagens e situação.
- Estados de carregamento, vazio e erro.
- Atualização do histórico.

**Critérios de aceite do épico**
- [ ] O Mobile utiliza o endpoint de denúncias próprias (`GET /denuncias/minhas`) para o perfil `DENUNCIANTE`.
- [ ] O cidadão não recebe listagem geral de denúncias de terceiros.
- [ ] A paginação não duplica nem perde registros.
- [ ] A tela de detalhes apresenta os campos disponíveis de forma consistente.
- [ ] Estados vazio, carregando e erro são tratados.
- [ ] Denúncia anônima continua acessível ao titular conforme regra de negócio, sem expor sua identidade.
- [ ] Alteração de situação feita por gestor é refletida após atualização/refetch.

**Direção de testes**
- Testar serviço `listarMinhas`, paginação e `getById`.
- Testar store com respostas vazias, paginadas e falhas.
- Testar renderização de lista e detalhe.
- Testar que IDs de terceiros não são acessíveis por usuário não autorizado.
- Testar atualização do estado após retorno à tela.

**Pontos de partida**
- `mobile/src/screens/routes/denunciante/MinhasDenunciasScreen.tsx`
- `mobile/src/screens/routes/denunciante/DetalheDenunciaScreen.tsx`
- `mobile/src/store/useDenunciasStore.ts`
- `mobile/src/services/denunciaService.ts`
- `backend/src/routes/denuncia.routes.ts`
- `backend/src/services/denuncia.service.ts`

---

## HU-09 — Painel e indicadores para o gestor

**História épica**

Como `GESTOR`, quero visualizar indicadores e resumos das denúncias, para compreender a situação das ocorrências e apoiar a priorização das ações públicas.

**Valor de negócio**

Transformar os registros em informação operacional útil para a gestão.

**Escopo funcional**
- Dashboard administrativo Mobile.
- Indicadores disponíveis no produto.
- Resumo por situação, categoria ou bairro quando suportado pelos dados.
- Estados de carregamento, erro e ausência de dados.
- Controle de acesso por papel.

**Critérios de aceite do épico**
- [ ] Somente `GESTOR` acessa o Dashboard.
- [ ] Os indicadores são derivados de dados retornados pela API, sem números fictícios.
- [ ] Filtros e agregações refletem os critérios definidos pelo Backend.
- [ ] Dados vazios são apresentados sem erro.
- [ ] Falha de API não apresenta indicadores antigos como se fossem atuais sem sinalização.
- [ ] A interface Mobile não altera a regra de autorização da API.

**Direção de testes**
- Testar guarda de rota para `GESTOR` e bloqueio para `DENUNCIANTE`.
- Testar transformação de dados para indicadores.
- Testar estado vazio, erro, carregamento e sucesso.
- Testar consistência de contagens com fixtures conhecidas.
- Testar chamadas de API e filtros usados pelo Dashboard.

**Pontos de partida**
- `mobile/src/screens/routes/gestor/DashboardScreen.tsx`
- `mobile/src/store/useDenunciasStore.ts`
- `mobile/src/services/denunciaService.ts`
- `backend/src/controllers/denuncia.controller.ts`
- `backend/src/repositories/denuncia.repository.ts`

---

## HU-10 — Triagem, listagem, filtros e atualização de denúncias

**História épica**

Como `GESTOR`, quero consultar, filtrar e atualizar as denúncias, para acompanhar o trabalho de zeladoria e registrar a evolução de cada ocorrência.

**Valor de negócio**

Organizar o fluxo operacional de atendimento e permitir que a gestão acompanhe as ocorrências.

**Escopo funcional**
- Listagem geral para gestor.
- Paginação.
- Filtros por categoria, bairro e situação.
- Visualização dos detalhes.
- Atualização de situação permitida.
- Exclusão, quando prevista e autorizada.
- Atualização da interface após operação.

**Critérios de aceite do épico**
- [ ] Somente `GESTOR` acessa a listagem geral.
- [ ] Filtros enviados usam os nomes e valores do contrato da API.
- [ ] Paginação apresenta resultados sem duplicação.
- [ ] Atualização aceita somente os campos permitidos pelo Backend.
- [ ] O Frontend/Mobile reflete o valor confirmado pela API, por resposta ou refetch.
- [ ] Falhas de atualização não são exibidas como sucesso.
- [ ] `DENUNCIANTE` não altera situação nem exclui denúncias.
- [ ] Valores legados de situação não desaparecem silenciosamente dos filtros.

**Direção de testes**
- Testar filtros individualmente e combinados.
- Testar paginação e lista vazia.
- Testar PATCH autorizado e não autorizado.
- Testar rejeição de campos extras na atualização.
- Testar atualização otimista/retorno/refetch e rollback em falha.

**Pontos de partida**
- `mobile/src/screens/routes/gestor/DenunciasScreen.tsx`
- `mobile/src/store/useDenunciasStore.ts`
- `mobile/src/services/denunciaService.ts`
- `frontend/src/components/gestor-data-table.tsx`
- `frontend/src/components/edit-status-cell.tsx`
- `backend/src/controllers/denuncia.controller.ts`
- `backend/src/services/denuncia.service.ts`

---

## HU-11 — Mapa georreferenciado das ocorrências

**História épica**

Como `GESTOR`, quero visualizar a distribuição das denúncias em um mapa, para identificar concentrações territoriais e apoiar a priorização das ações.

**Valor de negócio**

Dar contexto geográfico às ocorrências e facilitar a leitura territorial dos problemas urbanos.

**Escopo funcional**
- Tela de mapa para gestor.
- Exibição de ocorrências e agrupamentos conforme dados disponíveis.
- Uso de bairro/localidade e coordenadas somente quando existentes e autorizadas.
- Fallback para dados sem coordenada.
- Estados de permissão, carregamento e erro.
- Compatibilidade com a estratégia documentada de geocodificação/referência territorial.

**Critérios de aceite do épico**
- [ ] Somente `GESTOR` acessa o mapa administrativo.
- [ ] O mapa representa dados reais retornados pela API.
- [ ] A ausência de coordenadas não causa falha geral da tela.
- [ ] O fallback territorial não inventa precisão geográfica.
- [ ] A permissão de localização do dispositivo é solicitada somente quando necessária.
- [ ] Dados de localização não são enviados além do necessário para a finalidade do sistema.
- [ ] Erros de carregamento e de permissão são tratados.

**Direção de testes**
- Testar transformação dos registros em marcadores.
- Testar agrupamento/fallback para dados sem coordenadas.
- Testar mapa sem ocorrências.
- Testar falha de API e permissão negada.
- Testar proteção da rota por papel.

**Pontos de partida**
- `mobile/src/screens/routes/gestor/MapaScreen.tsx`
- `mobile/src/constants/bairros.ts`
- `mobile/src/services/denunciaService.ts`
- `frontend/src/components/mapa-ocorrencias.tsx`
- `README.md`, seção de mapas.

---

## HU-12 — Localização, bairros e qualidade do endereço da ocorrência

**História épica**

Como `DENUNCIANTE`, quero informar o bairro da ocorrência com apoio de recursos de localização quando disponíveis, para reduzir erros de localização e facilitar o encaminhamento da denúncia.

**Valor de negócio**

Aumentar a qualidade do dado territorial sem coletar ou expor coordenadas desnecessárias.

**Escopo funcional**
- Seleção manual de bairro.
- Uso de localização do dispositivo quando autorizado e suportado.
- Geocodificação reversa para sugerir/preencher bairro, conforme implementação existente.
- Fallback manual quando GPS, rede ou permissão não estiverem disponíveis.
- Não transmitir coordenadas brutas no texto da descrição, conforme documentação de segurança.

**Critérios de aceite do épico**
- [ ] O usuário consegue informar bairro manualmente.
- [ ] Se a localização automática estiver disponível e autorizada, o app pode sugerir bairro.
- [ ] Se a permissão for negada ou o GPS falhar, o fluxo manual continua funcionando.
- [ ] A localização não bloqueia a criação da denúncia.
- [ ] Coordenadas brutas não são anexadas à descrição nem transmitidas sem finalidade/contrato explícito.
- [ ] A interface informa quando o bairro foi sugerido automaticamente e permite correção pelo usuário.

**Direção de testes**
- Testar permissão concedida/negada.
- Testar localização indisponível e timeout.
- Testar geocodificação reversa com resultado, sem resultado e erro.
- Testar seleção manual e correção do bairro.
- Verificar payload para garantir ausência de coordenadas indevidas.

**Pontos de partida**
- `mobile/src/screens/routes/denunciante/NovaDenunciaScreen.tsx`
- `mobile/src/constants/bairros.ts`
- `mobile/src/hooks/useDenunciaForm.ts`
- `mobile/LEIA-ME-ACOMPANHAMENTO.md`, seção de integração com Backend.

---

## HU-13 — Conectividade, cache e resiliência do aplicativo

**História épica**

Como usuário do Mobile, quero receber respostas claras quando a conexão falhar e manter uma experiência estável durante carregamentos e indisponibilidades, para não perder informações nem interpretar erros como sucesso.

**Valor de negócio**

Aumentar confiabilidade em uso real, inclusive em redes móveis instáveis.

**Escopo funcional**
- Tratamento centralizado de erro HTTP.
- Timeout e falha de conexão.
- Cache existente e política de atualização.
- Estados de carregamento, vazio, sucesso e erro.
- Repetição segura quando aplicável.
- Proteção contra envio duplicado.
- Tratamento de respostas inválidas.

**Critérios de aceite do épico**
- [ ] Falha de rede é distinguida de erro de validação e de autorização.
- [ ] O app informa ao usuário quando não consegue concluir uma operação.
- [ ] Uma operação não é marcada como concluída sem confirmação do Backend.
- [ ] Reenvios não criam duplicações silenciosas.
- [ ] Cache não apresenta dado obsoleto como atualizado sem critério.
- [ ] Dados sensíveis não são persistidos em cache inseguro.
- [ ] A sessão e o estado da aplicação permanecem coerentes após recuperação de conexão.

**Direção de testes**
- Mock de timeout, offline, 4xx, 5xx e JSON inválido.
- Testar cache hit/miss/invalidação conforme comportamento implementado.
- Testar retry e prevenção de duplicidade.
- Testar atualização após reconexão.
- Testar feedback de erro nas telas principais.

**Pontos de partida**
- `mobile/src/services/http.ts`
- `mobile/src/services/cacheService.ts`
- `mobile/src/utils/apiErrors.ts`
- `mobile/src/store/useAuthStore.ts`
- `mobile/src/store/useDenunciasStore.ts`
- `mobile/README.md`, pendência de falta de conexão.

---

## HU-14 — Contratos consistentes entre Mobile, Frontend e Backend

**História épica**

Como equipe responsável pelo produto, quero que Mobile, Frontend e Backend compartilhem contratos consistentes, para que uma funcionalidade se comporte da mesma forma em todas as plataformas.

**Valor de negócio**

Reduzir falhas de integração, divergência de dados e regressões entre aplicações.

**Escopo funcional**
- Contratos de autenticação e usuários.
- Contratos de denúncias.
- Catálogo de categorias.
- Formato de datas.
- Situações/status.
- Paginação e filtros.
- Formato de imagens.
- Tratamento uniforme de respostas e erros.
- Compatibilidade com dados legados.

**Critérios de aceite do épico**
- [ ] Os campos enviados pelo Mobile correspondem ao contrato do Backend.
- [ ] Os campos enviados pelo Frontend correspondem ao mesmo contrato.
- [ ] Categorias não divergem entre as plataformas.
- [ ] Datas de ocorrência têm formato de transporte e armazenamento definido.
- [ ] Situações são comparáveis sem depender de diferenças de caixa ou acentuação.
- [ ] Paginação e filtros têm comportamento documentado e testado.
- [ ] Alterações de contrato possuem testes de contrato ou integração.
- [ ] Mudanças não invalidam registros existentes sem migração compatível.

**Direção de testes**
- Testes de contrato de payloads e respostas.
- Testes de serialização de data/categoria/situação.
- Testes de paginação e filtros.
- Testes de compatibilidade com fixtures legadas.
- Executar testes de integração entre clientes e API.

**Pontos de partida**
- `mobile/src/types/`
- `mobile/src/constants/tipos.ts`
- `mobile/src/constants/situacao.ts`
- `mobile/src/services/`
- `frontend/src/lib/api.ts`
- `frontend/src/components/form-denuncias.tsx`
- `backend/src/controllers/`
- `backend/src/services/`
- `backend/prisma/schema.prisma`

---

## HU-15 — Segurança da informação e conformidade com privacidade

**História épica**

Como pessoa usuária do S.O.S. Cidade, quero que minhas credenciais e informações pessoais sejam tratadas com controles de segurança e privacidade, para confiar no uso da plataforma.

**Valor de negócio**

Reduzir riscos de acesso indevido, exposição de dados e descumprimento das obrigações de privacidade documentadas pelo projeto.

**Escopo funcional**
- Hash de senha e validação no Backend.
- Chave de assinatura segura, sem segredo padrão fraco.
- Limitação de tentativas de login.
- Proteção de endpoints e autorização.
- Criptografia dos campos sensíveis já definidos.
- Minimização de dados em logs e respostas.
- Política de retenção/anonimização implementada.
- Consentimentos e documentos legais.
- Armazenamento seguro de token no Mobile.
- Verificação de dependências e configuração.

**Critérios de aceite do épico**
- [ ] Senhas nunca são armazenadas ou retornadas em texto puro.
- [ ] O Backend valida robustez mínima de senha, não apenas a interface.
- [ ] Segredos críticos não possuem fallback previsível em produção.
- [ ] Tentativas repetidas de login são limitadas conforme política documentada.
- [ ] Dados sensíveis são protegidos conforme a implementação de criptografia existente.
- [ ] Logs não incluem senhas, tokens ou conteúdo sensível desnecessário.
- [ ] Política de retenção documentada é testável e executada pelo mecanismo previsto.
- [ ] Consentimentos legais são registrados conforme os campos existentes.
- [ ] O Mobile utiliza armazenamento seguro de sessão.
- [ ] Não introduzir coleta de dados pessoais além do necessário.

**Direção de testes**
- Testes de autenticação e autorização.
- Testes de limite de tentativas.
- Testes de validação de senha no servidor.
- Testes de criptografia e anonimização.
- Testes de expurgo/retention com dados controlados.
- Testes de ausência de segredos/dados sensíveis em respostas e logs.
- Revisão de configuração e dependências.

**Pontos de partida**
- `Atividade Projeto Integrado -SEC.md`
- `backend/src/services/auth.service.ts`
- `backend/src/middlewares/`
- `backend/src/lib/crypto.ts`
- `backend/src/jobs/cron.ts`
- `backend/src/constants/legal.ts`
- `backend/prisma/schema.prisma`
- `mobile/src/services/secureStorage.ts`

---

## HU-16 — Qualidade contínua, testes automatizados e entrega confiável

**História épica**

Como equipe de desenvolvimento e manutenção, quero uma estratégia de testes automatizados que cubra Backend, Frontend Web, Mobile nativo e fluxos integrados, para detectar regressões antes de disponibilizar novas versões.

**Valor de negócio**

Dar confiança às entregas, proteger os fluxos críticos e manter a evolução do produto sem quebrar funcionalidades existentes.

**Escopo funcional**
- Testes unitários de utilitários, regras, stores, hooks e serviços Mobile.
- Testes de componentes e telas Mobile.
- Testes de integração Mobile/API.
- Testes de autorização e regras no Backend.
- Testes E2E Web existentes com Playwright.
- Estratégia de E2E nativo para Android/iOS, se adotada pela equipe.
- Relatórios de execução e cobertura.
- Execução local e CI.
- Massa de teste isolada e segura.

**Critérios de aceite do épico**
- [ ] O comando `npm test` do Mobile executa a suíte Mobile.
- [ ] O comando `npm run test:ci` executa em modo adequado à CI.
- [ ] Existe comando de cobertura e relatório reproduzível.
- [ ] Os testes Mobile cobrem fluxos positivos, negativos, limites e erros.
- [ ] Os testes não dependem de serviços reais externos sem controle/mocks apropriados.
- [ ] Os testes de integração utilizam ambiente e dados isolados, nunca produção.
- [ ] Os testes E2E Playwright existentes são preservados e continuam identificados como Web/Chromium.
- [ ] A equipe não afirma que E2E Web cobre Android/iOS nativo.
- [ ] A suíte não desativa ou enfraquece testes para obter resultado verde.
- [ ] Relatórios informam quantidade executada, aprovada, falha, ignorada e cobertura.
- [ ] Falhas são rastreáveis a uma HU e a um requisito/critério de aceite.

**Direção de testes**
- Criar pirâmide de testes: unitários na base, integração no meio, E2E no topo.
- Começar por validações, serviços, stores e hooks.
- Cobrir componentes críticos: login, cadastro, nova denúncia, histórico, detalhes, dashboard, lista administrativa, mapa e gestores.
- Adicionar testes nativos E2E apenas após definir dispositivo/emulador, dados de QA e ferramenta.
- Medir cobertura por comportamento/fluxo, não apenas percentual de linhas.

**Estado atual observado no ZIP**
- `mobile/package.json` já contém `jest`, `jest-expo`, `@types/jest` e scripts `test` e `test:ci`; não há script `test:coverage` no arquivo analisado.
- Não foi localizada uma suíte própria de testes Mobile no inventário de arquivos do ZIP.
- `backend/tests/unit/` contém testes unitários.
- `frontend/tests/` contém testes ATDD/BDD/TDD.
- `e2e/` contém quatro arquivos `.spec.ts` com **8 declarações `test(...)`** no total.
- `e2e/playwright.config.ts` usa o projeto `chromium`, `Desktop Chrome` e `baseURL` `http://localhost:3000`; portanto, a suíte atual é E2E do Frontend Web, não E2E nativo do Mobile.
- `e2e/README.md` informa 7 cenários em 3 arquivos, mas essa contagem está desatualizada em relação aos quatro arquivos e oito declarações `test(...)` observados no ZIP. Atualizar a documentação depois de confirmar execução real.

**Pontos de partida**
- `mobile/package.json`
- `mobile/src/`
- `mobile/app/`
- `backend/tests/`
- `frontend/tests/`
- `e2e/`
- `.github/workflows/`

---

# 4. Mapa de rastreabilidade: épicos → áreas → estratégia de teste

| Épico | Área principal | Camada de teste prioritária |
|---|---|---|
| HU-01 | Cadastro público e onboarding | Unitário + componente + integração |
| HU-02 | Login e sessão | Unitário + integração |
| HU-03 | Autorização e rotas | Unitário + integração API + navegação |
| HU-04 | Gestão de gestores | Integração API + componente |
| HU-05 | Criação de denúncia | Unitário + componente + integração |
| HU-06 | Anonimato e privacidade | Backend unitário + integração + segurança |
| HU-07 | Imagens/evidências | Unitário + componente + integração |
| HU-08 | Histórico e detalhes | Store/serviço + componente + integração |
| HU-09 | Dashboard | Transformação de dados + componente |
| HU-10 | Triagem e status | Unitário + integração API + componente |
| HU-11 | Mapa | Unitário de dados + componente/dispositivo |
| HU-12 | Localização e bairro | Unitário + integração nativa com mocks |
| HU-13 | Rede, cache e erros | Unitário + integração |
| HU-14 | Contratos entre aplicações | Contrato + integração |
| HU-15 | Segurança e LGPD | Unitário + integração + revisão de segurança |
| HU-16 | Qualidade e CI | Todas as camadas + pipeline |

---

# 5. Estratégia de testes recomendada

## 5.1 Pirâmide

1. **Unitários:** funções puras, validadores, normalizadores, serializadores, regras de domínio, stores e utilitários.
2. **Componentes:** formulários, botões, estados de loading/erro/vazio, telas e componentes com interação.
3. **Integração:** serviços Mobile com API simulada/controlada, autenticação, autorização, cache e persistência.
4. **E2E Web:** manter Playwright para os fluxos do navegador.
5. **E2E Mobile nativo:** planejar ferramenta e infraestrutura próprias para Android/iOS; não contar Playwright Chromium como cobertura nativa.

## 5.2 Fluxos críticos mínimos do Mobile

A equipe deve derivar casos de teste, no mínimo, para:

- Inicialização e restauração de sessão.
- Cadastro público com consentimento legal.
- Login válido e inválido.
- Logout e remoção da sessão.
- Proteção de rotas por `GESTOR` e `DENUNCIANTE`.
- Criação de denúncia identificada.
- Criação de denúncia anônima.
- Validação e envio de imagens.
- Seleção de bairro/localização e fallback manual.
- Consulta paginada das próprias denúncias.
- Visualização de detalhe e protocolo.
- Listagem geral e filtros para gestor.
- Atualização de situação pelo gestor.
- Bloqueio de criação de denúncia pelo gestor.
- Cadastro administrativo de gestor.
- Tratamento de rede offline, timeout, 401, 403 e 5xx.
- Cache, restauração e limpeza de sessão.
- Dashboard e mapa com dados vazios, válidos e com erro.

## 5.3 Regras para qualidade dos testes

- Um teste deve validar comportamento observável, não detalhes triviais da implementação.
- Cada cenário deve ter dados próprios e previsíveis.
- Mockar serviços nativos e dependências externas quando o objetivo for testar a lógica da aplicação.
- Manter testes de integração reais em ambiente isolado quando o objetivo for validar o contrato com a API.
- Não apontar testes para produção.
- Não depender da ordem de execução, salvo quando houver justificativa explícita.
- Evitar testes frágeis baseados em textos ou seletores que mudam sem impacto funcional.
- Testar também falhas e permissões negadas.
- Não duplicar um cenário E2E Web já coberto sem explicar a lacuna que a nova cobertura resolve.
- Toda correção de bug deve incluir um teste de regressão.

---

# 6. Prioridade inicial sugerida

A priorização abaixo é uma recomendação de sequência, não uma alteração automática no roadmap:

| Ordem | Épicos | Motivo |
|---:|---|---|
| 1 | HU-02, HU-03, HU-04, HU-06 | Sessão, autorização, privilégios administrativos e privacidade são controles fundamentais. |
| 2 | HU-01, HU-05, HU-08 | Garantem entrada do cidadão, registro e acompanhamento do caminho principal. |
| 3 | HU-14 | Reduz divergências entre Mobile, Web e API que provocam falhas cruzadas. |
| 4 | HU-10, HU-09, HU-11 | Sustentam o trabalho operacional do gestor. |
| 5 | HU-07, HU-12, HU-13 | Melhoram evidências, qualidade territorial e resiliência do Mobile. |
| 6 | HU-15, HU-16 | Devem ser transversais e contínuos; a prioridade da segurança é alta e a automação deve acompanhar cada entrega. |

**Nota:** HU-15 e HU-16 não devem ficar para o final como se fossem opcionais. Segurança e testes devem acompanhar todas as etapas; a tabela apenas organiza a implantação das melhorias estruturais.

---

# 7. Instruções específicas para o GitHub Copilot

Ao utilizar este documento como contexto:

1. Leia primeiro o épico relacionado e identifique os critérios de aceite relevantes.
2. Inspecione os arquivos atuais antes de propor ou realizar mudanças.
3. Confirme se a funcionalidade já existe, está parcial, está divergente ou está ausente.
4. Não deduza que uma funcionalidade não existe apenas porque não encontrou um teste.
5. Não considere E2E Web/Chromium como teste de aplicativo Android/iOS.
6. Derive tarefas pequenas com SMART e INVEST usando o modelo deste documento.
7. Associe cada tarefa a um ou mais critérios de aceite e a cenários de teste.
8. Preserve `GESTOR` e `DENUNCIANTE` literalmente e mantenha suas regras de negócio.
9. Não faça refatoração ampla quando uma correção localizada for suficiente.
10. Não remova testes, não use `skip`/`only` para mascarar falhas e não reduza asserções para fazer a suíte passar.
11. Execute os testes pertinentes e informe os comandos e resultados reais.
12. Quando não for possível executar um teste, informe a razão e deixe-o explicitamente pendente.
13. Atualize este backlog somente quando houver decisão de produto aprovada; não redefina requisitos por conveniência técnica.
14. Registre a rastreabilidade: `HU → tarefa → arquivo/endpoint → teste → resultado`.

## Formato esperado de saída do Copilot ao iniciar uma HU

```md
# Plano de execução — HU-XX

## 1. Diagnóstico do estado atual
- Implementado:
- Parcial:
- Ausente:
- Divergente:
- Evidências (arquivos e símbolos):

## 2. Tarefas derivadas
| ID | Tarefa | Critério de aceite | SMART | INVEST | Dependência |
|---|---|---|---|---|---|

## 3. Plano de testes
| ID do teste | Camada | Cenário | Resultado esperado |
|---|---|---|---|

## 4. Riscos e compatibilidade
- Impacto em Mobile:
- Impacto em Frontend:
- Impacto em Backend:
- Impacto em banco/migrações:
- Compatibilidade com dados antigos:
- Confirmação dos papéis `GESTOR` e `DENUNCIANTE`:

## 5. Execução
- Arquivos alterados:
- Comandos executados:
- Testes aprovados:
- Testes falhos:
- Testes não executados e motivo:
- Pendências:
```

---

# 8. Definição de pronto (Definition of Done)

Uma tarefa derivada de qualquer épico só está concluída quando:

- [ ] O comportamento atende aos critérios de aceite.
- [ ] O código segue a arquitetura existente e não duplica regras de negócio.
- [ ] Os papéis `GESTOR` e `DENUNCIANTE` permanecem inalterados.
- [ ] A autorização é aplicada no Backend quando a operação exige proteção.
- [ ] Há testes para o comportamento novo ou corrigido.
- [ ] Os testes relevantes foram executados e os resultados foram registrados.
- [ ] Não há regressão conhecida em Mobile, Frontend ou Backend.
- [ ] Contratos e documentação foram atualizados quando necessário.
- [ ] Dados pessoais, tokens e informações sensíveis não foram expostos.
- [ ] O PR descreve o que mudou, por que mudou e como validar.

---

## 9. Limites e pontos que exigem decisão humana

Este backlog não decide sozinho:
- Prazo de retenção diferente do já documentado.
- Novas categorias de denúncia ou remoção de categorias antigas.
- Novos papéis ou mudanças de permissão.
- Novos dados pessoais ou coleta adicional de localização.
- Adoção de uma ferramenta E2E nativa específica.
- Meta percentual de cobertura global.
- Prazos, estimativas, responsáveis ou release dates.

Esses pontos devem ser definidos pela equipe/produto. O Copilot pode apresentar opções e impactos, mas não deve inventar decisões de negócio.

---

**Fim do backlog — 16 histórias épicas do S.O.S. Cidade.**
