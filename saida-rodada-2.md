Gerado pelo ChatGPT em 30/09/2026 (reexecução).

---

Abaixo está a derivação baseada **somente** no arquivo fornecido. Não incluí comportamento que não esteja sustentado pelos critérios de aceite; as lacunas ficam explicitadas ao final. 

# A. Matriz de alocação

| Condição de teste                     | Nível responsável                      | Justificativa                                                                |
| ------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| Validação dos dados de cadastro       | Componente                             | Pode ser verificada isoladamente na regra de validação.                      |
| E-mail duplicado e unicidade da conta | Integração de componentes              | Envolve validação e persistência da conta.                                   |
| Papel atribuído no cadastro           | Componente                             | Regra de autorização/normalização do papel pode ser verificada isoladamente. |
| Criação da conta e redirecionamento   | Sistema                                | Valida o fluxo completo de cadastro até a área autenticada.                  |
| Autenticação e emissão de JWT         | Integração de componentes              | Envolve credenciais, autenticação e geração do token.                        |
| Expiração e invalidação do token      | Integração de componentes              | Envolve autenticação, sessão/token e endpoint protegido.                     |
| Redirecionamento de telas por perfil  | Sistema                                | Depende da navegação e da aplicação integrada.                               |
| Autorização de endpoints por perfil   | Integração de componentes              | Envolve autenticação, autorização e endpoint protegido.                      |
| Consulta do próprio usuário           | Integração de componentes              | Envolve token, identificação do usuário e persistência.                      |
| Upload e validação de arquivo         | Componente                             | Limite, tipo e presença da parte podem ser validados isoladamente.           |
| Associação de foto à demanda          | Integração de componentes              | Envolve foto persistida, usuário e demanda.                                  |
| Registro da demanda                   | Integração de componentes              | Envolve validação, autenticação, persistência e histórico.                   |
| Protocolo                             | Integração de componentes              | Envolve criação persistente e geração do identificador.                      |
| Cancelamento antes da confirmação     | Sistema                                | Valida o fluxo completo da interface de confirmação.                         |
| Listagem do cidadão                   | Integração de componentes              | Envolve autenticação, escopo por autor, consulta e paginação.                |
| Detalhe e histórico da demanda        | Integração de componentes              | Envolve autorização, demanda, histórico e foto.                              |
| Notificação de mudança de status      | Integração de componentes              | Envolve alteração de status, histórico e registro de aviso.                  |
| Painel do gestor                      | Integração de componentes              | Envolve autorização, consulta global e paginação.                            |
| Filtros                               | Componente + Integração de componentes | Regras de validação podem ser isoladas; resultado exige consulta integrada.  |
| Transições de status                  | Componente                             | A máquina/regra de estados pode ser verificada isoladamente.                 |
| Persistência da alteração de status   | Integração de componentes              | Envolve demanda, histórico e timestamps.                                     |
| Indicadores                           | Integração de componentes              | Depende dos dados persistidos e dos cálculos agregados.                      |
| Mapa por região                       | Integração de componentes              | Depende da base de demandas, filtros e agrupamento geográfico.               |
| Administração de usuários             | Integração de componentes              | Envolve autorização, consulta e paginação de usuários.                       |

---

# B. Tabela intermediária de derivação

| Regra                                                           | Técnica aplicável                       | Condições derivadas                                                   | Casos resultantes |
| --------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- | ----------------- |
| Cadastro aceita dados válidos e rejeita e-mail duplicado        | Partição de equivalência                | E-mail inexistente; e-mail existente                                  | CT-01, CT-02      |
| Senha deve atender à política                                   | Partição de equivalência                | Senha não conforme                                                    | CT-03             |
| Papel informado pelo cliente não pode elevar privilégio         | Tabela de decisão                       | Cadastro sem papel privilegiado; cadastro com `MANAGER`               | CT-04             |
| Credenciais determinam autenticação                             | Partição de equivalência                | Credencial válida; senha incorreta                                    | CT-05, CT-06      |
| Token possui ciclo de vida                                      | Transição de estados                    | Autenticado; expirado; logout                                         | CT-07, CT-08      |
| Acesso depende do perfil                                        | Tabela de decisão                       | CITIZEN/MANAGER × recurso permitido/proibido                          | CT-09 a CT-13     |
| Perfil próprio não permite consultar terceiro                   | Partição de equivalência                | Próprio usuário; outro usuário                                        | CT-14             |
| Upload possui classes de tamanho, tipo e presença               | Partição de equivalência / Valor-limite | JPEG válido; arquivo acima do limite; formato inválido; parte ausente | CT-15 a CT-18     |
| Foto pertence ao usuário que a utiliza                          | Partição de equivalência                | Foto própria; `photoId` de terceiro                                   | CT-19             |
| Demanda pode ter foto ou não                                    | Partição de equivalência                | Com foto; sem foto                                                    | CT-20, CT-21      |
| Campos obrigatórios e enumeração devem ser válidos              | Partição de equivalência                | Formulário vazio; categoria válida; categoria inválida                | CT-22, CT-23      |
| Coordenada possui faixa válida                                  | Valor-limite                            | Latitude fora da faixa explicitamente exemplificada                   | CT-24             |
| Foto não pode ser vinculada novamente                           | Partição de equivalência                | Foto livre; foto já vinculada                                         | CT-25             |
| Autor da demanda é o usuário autenticado                        | Tabela de decisão                       | Corpo sem autoria; corpo apontando terceiro                           | CT-26             |
| Protocolo segue formato e unicidade                             | Valor-limite / Partição de equivalência | Criação; duas criações no mesmo ano                                   | CT-27, CT-28      |
| Cancelamento impede criação                                     | Transição de estados                    | Confirmação → cancelamento                                            | CT-29             |
| Lista do cidadão é limitada ao próprio autor                    | Tabela de decisão                       | Demandas próprias; demandas de terceiros                              | CT-30, CT-31      |
| Paginação e ordenação possuem valores padrão                    | Partição de equivalência                | Consulta sem parâmetros                                               | CT-32             |
| Lista vazia possui comportamento definido                       | Partição de equivalência                | Zero demandas                                                         | CT-33             |
| Status exibido deve corresponder ao enum                        | Partição de equivalência                | Item com status retornado                                             | CT-34             |
| Detalhe contém dados e histórico                                | Partição de equivalência                | Demanda própria; histórico                                            | CT-35, CT-36      |
| URL da foto possui validade de 60 minutos                       | Valor-limite                            | Reabertura após expiração                                             | CT-37             |
| Mudança efetiva de status gera notificação                      | Transição de estados                    | UNDER_ANALYSIS → IN_PROGRESS                                          | CT-38             |
| Falha de alteração não gera notificação                         | Transição de estados                    | Tentativa sem transição efetiva                                       | CT-39             |
| Notificação deve ficar limitada à demanda do cidadão            | Partição de equivalência                | Notificação da própria demanda                                        | CT-40             |
| Gestor visualiza a base completa                                | Tabela de decisão                       | MANAGER consultando demandas                                          | CT-41             |
| `pageSize` possui limites 0 e 101                               | Valor-limite                            | 0; 101                                                                | CT-42, CT-43      |
| Filtros podem ser simples ou múltiplos                          | Tabela de decisão                       | Um valor; dois valores; combinação                                    | CT-44 a CT-46     |
| Intervalo de datas inclui extremos                              | Valor-limite                            | createdAt no início/fim do intervalo                                  | CT-47             |
| Intervalo invertido é inválido                                  | Valor-limite                            | createdTo < createdFrom                                               | CT-48             |
| Enum inválido não produz resultado parcial                      | Partição de equivalência                | Valor inválido                                                        | CT-49             |
| Ausência de resultado não é erro                                | Partição de equivalência                | Combinação sem correspondências                                       | CT-50             |
| Status segue transições permitidas                              | Transição de estados                    | UNDER_ANALYSIS → IN_PROGRESS; IN_PROGRESS → RESOLVED                  | CT-51, CT-52      |
| Estados proibidos são recusados                                 | Transição de estados                    | RESOLVED → IN_PROGRESS; RECEIVED → RECEIVED; RECEIVED → RESOLVED      | CT-53 a CT-55     |
| Demanda inexistente é rejeitada                                 | Partição de equivalência                | ID sintaticamente válido, registro inexistente                        | CT-56             |
| Observação possui limite de 500 caracteres                      | Valor-limite                            | 501 caracteres                                                        | CT-57             |
| Indicadores devem ser consistentes com a base                   | Partição de equivalência                | Base sintética conhecida                                              | CT-58             |
| Tempo médio considera somente resolvidas                        | Partição de equivalência                | Resolvidas e não resolvidas                                           | CT-59             |
| Ausência de resolvidas não equivale a zero                      | Partição de equivalência                | Nenhuma resolvida                                                     | CT-60             |
| Visão geográfica agrupa RPA_1–RPA_6                             | Partição de equivalência                | Demandas nas regiões                                                  | CT-61             |
| Filtro geográfico altera marcadores                             | Tabela de decisão                       | Categoria selecionada/desmarcada/limpa                                | CT-62             |
| Demanda sem coordenada não é plotada mas continua contabilizada | Tabela de decisão                       | Posicionável/não posicionável                                         | CT-63             |
| Gestor pode listar usuários                                     | Partição de equivalência                | MANAGER                                                               | CT-64             |
| Cidadão não pode listar usuários                                | Tabela de decisão                       | CITIZEN × `/users`                                                    | CT-65             |
| Tela administrativa é protegida                                 | Sistema                                 | CITIZEN acessando rota restrita                                       | CT-66             |

---

# C. Matriz de rastreabilidade de evidências

| Caso  | HU    | CA    | Trecho citado literalmente                                                                                      | Suposição? |
| ----- | ----- | ----- | --------------------------------------------------------------------------------------------------------------- | ---------- |
| CT-01 | HU-01 | CA-01 | “Então a conta é criada com papel CITIZEN”                                                                      | N          |
| CT-02 | HU-01 | CA-02 | “Então a resposta é 409 com code EMAIL_ALREADY_REGISTERED”                                                      | N          |
| CT-03 | HU-01 | CA-03 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-04 | HU-01 | CA-04 | “Então a conta é criada com papel CITIZEN”                                                                      | N          |
| CT-05 | HU-02 | CA-01 | “Então recebo um accessToken JWT válido por 24 h contendo o papel CITIZEN”                                      | N          |
| CT-06 | HU-02 | CA-03 | “Então a resposta é 401 com code INVALID_CREDENTIALS”                                                           | N          |
| CT-07 | HU-02 | CA-04 | “Então a resposta é 401 UNAUTHENTICATED”                                                                        | N          |
| CT-08 | HU-02 | CA-05 | “Então a resposta é 401 UNAUTHENTICATED”                                                                        | N          |
| CT-09 | HU-03 | CA-01 | “Então a resposta é 403 FORBIDDEN”                                                                              | N          |
| CT-10 | HU-03 | CA-02 | “Então a resposta é 403 FORBIDDEN”                                                                              | N          |
| CT-11 | HU-03 | CA-03 | “Então a resposta é 404 NOT_FOUND”                                                                              | N          |
| CT-12 | HU-03 | CA-04 | “E nenhum dado da tela restrita é renderizado, nem momentaneamente”                                             | N          |
| CT-13 | HU-03 | CA-05 | “Então a resposta é 401 UNAUTHENTICATED”                                                                        | N          |
| CT-14 | HU-04 | CA-02 | “Então a resposta é 404 NOT_FOUND”                                                                              | N          |
| CT-15 | HU-05 | CA-01 | “Então a resposta é 201 com id, url, contentType e sizeBytes”                                                   | N          |
| CT-16 | HU-05 | CA-02 | “Então a resposta é 413 PHOTO_TOO_LARGE”                                                                        | N          |
| CT-17 | HU-05 | CA-03 | “Então a resposta é 415 UNSUPPORTED_MEDIA_TYPE”                                                                 | N          |
| CT-18 | HU-05 | CA-04 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-19 | HU-05 | CA-05 | “Então a resposta é 404 NOT_FOUND”                                                                              | N          |
| CT-20 | HU-06 | CA-01 | “E o status inicial é RECEIVED”                                                                                 | N          |
| CT-21 | HU-06 | CA-02 | “E o campo photo é retornado como null, nunca omitido”                                                          | N          |
| CT-22 | HU-06 | CA-03 | “E a demanda não é criada”                                                                                      | N          |
| CT-23 | HU-06 | CA-04 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-24 | HU-06 | CA-05 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-25 | HU-06 | CA-07 | “Então a resposta é 409 PHOTO_ALREADY_LINKED”                                                                   | N          |
| CT-26 | HU-06 | CA-08 | “Então a demanda é criada com o usuário autenticado como autor”                                                 | N          |
| CT-27 | HU-07 | CA-01 | “Então o campo protocol é retornado no padrão DEM-<ano>-<sequencial de 6 dígitos>”                              | N          |
| CT-28 | HU-07 | CA-02 | “Então os protocolos gerados são distintos e sequenciais”                                                       | N          |
| CT-29 | HU-07 | CA-03 | “Então nenhuma demanda é criada e nenhum protocolo é gerado”                                                    | N          |
| CT-30 | HU-08 | CA-01 | “Então recebo 200 apenas com as demandas de A”                                                                  | N          |
| CT-31 | HU-08 | CA-02 | “Então nenhuma demanda de outro autor é retornada”                                                              | N          |
| CT-32 | HU-08 | CA-03 | “Então page é 1, pageSize é 20 e a ordenação é createdAt:desc”                                                  | N          |
| CT-33 | HU-08 | CA-04 | “Então a resposta é 200 com data vazio e totalItems 0”                                                          | N          |
| CT-34 | HU-08 | CA-05 | “E o rótulo corresponde biunivocamente ao enum retornado pela API”                                              | N          |
| CT-35 | HU-09 | CA-01 | “Então vejo protocolo, categoria, descrição, localização, foto, status atual e datas”                           | N          |
| CT-36 | HU-09 | CA-02 | “E o primeiro evento é a criação, com fromStatus null”                                                          | N          |
| CT-37 | HU-09 | CA-03 | “Então uma nova URL válida é retornada e a imagem é exibida”                                                    | N          |
| CT-38 | HU-10 | CA-01 | “Então recebo uma notificação contendo protocolo, novo status e data”                                           | N          |
| CT-39 | HU-10 | CA-02 | “Então nenhuma notificação é enviada”                                                                           | N          |
| CT-40 | HU-10 | CA-03 | “Então ela contém apenas dados da minha própria demanda”                                                        | N          |
| CT-41 | HU-11 | CA-01 | “Então recebo demandas de todos os autores”                                                                     | N          |
| CT-42 | HU-11 | CA-03 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-43 | HU-11 | CA-03 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-44 | HU-12 | CA-01 | “Então todos os itens retornados têm status RECEIVED”                                                           | N          |
| CT-45 | HU-12 | CA-02 | “Então apenas itens nesses dois status são retornados”                                                          | N          |
| CT-46 | HU-12 | CA-03 | “Então apenas demandas de iluminação pública da RPA_2 são retornadas”                                           | N          |
| CT-47 | HU-12 | CA-04 | “Então apenas demandas com createdAt dentro do intervalo, inclusive nos extremos, são retornadas”               | N          |
| CT-48 | HU-12 | CA-05 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-49 | HU-12 | CA-06 | “E a lista não é retornada parcialmente”                                                                        | N          |
| CT-50 | HU-12 | CA-07 | “Então a resposta é 200 com data vazio, não 404”                                                                | N          |
| CT-51 | HU-13 | CA-01 | “Então o histórico ganha um evento com fromStatus UNDER_ANALYSIS, toStatus IN_PROGRESS e changedBy igual a mim” | N          |
| CT-52 | HU-13 | CA-02 | “Então resolvedAt é preenchido pelo servidor com o instante da transição”                                       | N          |
| CT-53 | HU-13 | CA-03 | “Então a resposta é 409 INVALID_STATUS_TRANSITION”                                                              | N          |
| CT-54 | HU-13 | CA-04 | “Então a resposta é 409 INVALID_STATUS_TRANSITION”                                                              | N          |
| CT-55 | HU-13 | CA-05 | “Então a resposta é 409 INVALID_STATUS_TRANSITION”                                                              | N          |
| CT-56 | HU-13 | CA-06 | “Então a resposta é 404 NOT_FOUND”                                                                              | N          |
| CT-57 | HU-13 | CA-07 | “Então a resposta é 400 VALIDATION_ERROR”                                                                       | N          |
| CT-58 | HU-14 | CA-01 | “Então a quantidade total exibida é igual ao totalItems de GET /demands sem filtros”                            | N          |
| CT-59 | HU-14 | CA-02 | “Então somente as demandas com resolvedAt preenchido entram no cálculo”                                         | N          |
| CT-60 | HU-14 | CA-03 | “Então o tempo médio é apresentado como indisponível, não como zero”                                            | N          |
| CT-61 | HU-15 | CA-01 | “Então as demandas são agrupadas pelas regiões RPA_1 a RPA_6”                                                   | N          |
| CT-62 | HU-15 | CA-02 | “Então os marcadores dessa categoria desaparecem”                                                               | N          |
| CT-63 | HU-15 | CA-03 | “Então ela não é plotada”                                                                                       | N          |
| CT-64 | HU-16 | CA-01 | “Então recebo 200 com a coleção paginada”                                                                       | N          |
| CT-65 | HU-16 | CA-02 | “Então a resposta é 403 FORBIDDEN”                                                                              | N          |
| CT-66 | HU-16 | CA-03 | “Então sou redirecionado e nenhum dado é renderizado”                                                           | N          |

Os critérios de acesso, upload, registro e protocolo utilizados nessa matriz estão explicitados nas respectivas HUs do documento.    

---

# Casos de teste

## HU-01 — Autocadastro do cidadão

### CT-01

* **id:** CT-01
* **HU:** HU-01
* **CA:** CA-01 — Cadastro com dados válidos
* **título:** Criar conta com dados válidos — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** O e-mail `maria@exemplo.com` não existe na base.
* **passos:**

  1. Submeter nome válido.
  2. Submeter o e-mail `maria@exemplo.com`.
  3. Submeter senha válida.
  4. Enviar o cadastro.
* **resultado esperado:** A conta é criada com papel `CITIZEN`, a resposta é 201 sem campo de senha no corpo e o usuário é levado à área autenticada do cidadão.
* **pós-condições:** Existe uma conta `CITIZEN` para o e-mail informado e há uma sessão autenticada do cidadão.

### CT-02

* **id:** CT-02
* **HU:** HU-01
* **CA:** CA-02 — E-mail já cadastrado
* **título:** Rejeitar cadastro com e-mail já cadastrado — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Já existe uma conta com o e-mail `maria@exemplo.com`.
* **passos:**

  1. Submeter um cadastro usando `maria@exemplo.com`.
* **resultado esperado:** A resposta é 409 com `code` `EMAIL_ALREADY_REGISTERED`.
* **pós-condições:** Nenhuma segunda conta é criada.

### CT-03

* **id:** CT-03
* **HU:** HU-01
* **CA:** CA-03 — Senha fora da política
* **título:** Rejeitar senha fora da política — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Nenhuma.
* **passos:**

  1. Submeter a senha `abcdefgh`.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR` e `details` aponta o campo `password` com a regra não atendida.
* **pós-condições:** O cadastro não é concluído.

### CT-04

* **id:** CT-04
* **HU:** HU-01
* **CA:** CA-04 — Escalada de privilégio na criação da conta
* **título:** Ignorar papel privilegiado enviado no cadastro — Nível: Componente | Técnica: Tabela de decisão
* **pré-condições:** Nenhuma.
* **passos:**

  1. Submeter o corpo do cadastro incluindo `"role": "MANAGER"`.
* **resultado esperado:** A conta é criada com papel `CITIZEN` e o campo enviado é ignorado sem erro de servidor.
* **pós-condições:** A conta criada possui papel `CITIZEN`.

---

## HU-02 — Autenticação

### CT-05

* **id:** CT-05
* **HU:** HU-02
* **CA:** CA-01 — Login válido de cidadão
* **título:** Autenticar cidadão com credenciais corretas — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe cidadão ativo com e-mail e senha conhecidos.
* **passos:**

  1. Informar o e-mail do cidadão.
  2. Informar a senha correta.
  3. Efetuar login.
* **resultado esperado:** É recebido um `accessToken` JWT válido por 24 horas contendo o papel `CITIZEN` e o usuário é direcionado à área do cidadão.
* **pós-condições:** Existe uma sessão autenticada do cidadão.

### CT-06

* **id:** CT-06
* **HU:** HU-02
* **CA:** CA-03 — Credenciais incorretas
* **título:** Rejeitar login com senha incorreta — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe e-mail válido na base.
* **passos:**

  1. Informar o e-mail válido.
  2. Informar senha incorreta.
  3. Efetuar login.
* **resultado esperado:** A resposta é 401 com `code` `INVALID_CREDENTIALS`.
* **pós-condições:** Nenhuma sessão é iniciada e o usuário permanece na tela de login.

### CT-07

* **id:** CT-07
* **HU:** HU-02
* **CA:** CA-04 — Token expirado em requisição subsequente
* **título:** Rejeitar requisição com token expirado — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** Existe `accessToken` emitido há mais de 24 horas.
* **passos:**

  1. Enviar o `accessToken` expirado para um endpoint autenticado.
* **resultado esperado:** A resposta é 401 `UNAUTHENTICATED`.
* **pós-condições:** A requisição autenticada não é executada.

### CT-08

* **id:** CT-08
* **HU:** HU-02
* **CA:** CA-05 — Logout invalida o token apresentado
* **título:** Invalidar token após logout — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** O usuário está autenticado com o token `T`.
* **passos:**

  1. Efetuar logout.
  2. Enviar o token `T` para `GET /auth/me`.
* **resultado esperado:** A resposta de `GET /auth/me` é 401 `UNAUTHENTICATED`.
* **pós-condições:** O token `T` não pode ser reutilizado para autenticação em `GET /auth/me`.

---

## HU-03 — Segregação de acesso

### CT-09

* **id:** CT-09
* **HU:** HU-03
* **CA:** CA-01 — Cidadão tenta operação exclusiva de gestor
* **título:** Bloquear alteração de status por cidadão — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `CITIZEN`; existe uma demanda.
* **passos:**

  1. Enviar `PATCH /demands/{id}/status` autenticado como `CITIZEN`.
* **resultado esperado:** A resposta é 403 `FORBIDDEN`.
* **pós-condições:** O status da demanda permanece inalterado.

### CT-10

* **id:** CT-10
* **HU:** HU-03
* **CA:** CA-02 — Gestor tenta registrar demanda
* **título:** Bloquear registro de demanda por gestor — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `MANAGER`.
* **passos:**

  1. Enviar `POST /demands`.
* **resultado esperado:** A resposta é 403 `FORBIDDEN`.
* **pós-condições:** Nenhuma demanda é criada.

### CT-11

* **id:** CT-11
* **HU:** HU-03
* **CA:** CA-03 — Cidadão acessa demanda de terceiro
* **título:** Ocultar demanda pertencente a outro cidadão — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** O cidadão autenticado é A; a demanda D pertence ao cidadão B.
* **passos:**

  1. Enviar `GET /demands/{D}` autenticado como A.
* **resultado esperado:** A resposta é 404 `NOT_FOUND`.
* **pós-condições:** A resposta não permite distinguir demanda inexistente de demanda pertencente a outro cidadão.

### CT-12

* **id:** CT-12
* **HU:** HU-03
* **CA:** CA-04 — Rota administrativa acessada pela barra de endereços
* **título:** Redirecionar cidadão ao acessar tela restrita — Nível: Sistema | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `CITIZEN`; existe uma tela restrita ao gestor.
* **passos:**

  1. Digitar diretamente a URL da tela restrita ao gestor.
* **resultado esperado:** O usuário é redirecionado à área do cidadão e nenhum dado da tela restrita é renderizado.
* **pós-condições:** A tela restrita ao gestor permanece sem dados renderizados para o cidadão.

### CT-13

* **id:** CT-13
* **HU:** HU-03
* **CA:** CA-05 — Requisição sem token
* **título:** Rejeitar requisição autenticada sem token — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Nenhuma.
* **passos:**

  1. Chamar um endpoint autenticado sem o cabeçalho `Authorization`.
* **resultado esperado:** A resposta é 401 `UNAUTHENTICATED`.
* **pós-condições:** O endpoint não executa a operação autenticada.

---

## HU-04 — Consulta ao próprio perfil

### CT-14

* **id:** CT-14
* **HU:** HU-04
* **CA:** CA-02 — Escopo do próprio usuário
* **título:** Impedir cidadão de consultar outro usuário — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como `CITIZEN` com id X; existe usuário Y.
* **passos:**

  1. Enviar `GET /users/{Y}`.
* **resultado esperado:** A resposta é 404 `NOT_FOUND`.
* **pós-condições:** Os dados do usuário Y não são retornados.

---

## HU-05 — Envio da foto

### CT-15

* **id:** CT-15
* **HU:** HU-05
* **CA:** CA-01 — Upload de foto válida
* **título:** Enviar foto JPEG válida — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Enviar um JPEG de 1,8 MB em `multipart/form-data` na parte `file`.
* **resultado esperado:** A resposta é 201 e contém `id`, `url`, `contentType` e `sizeBytes`.
* **pós-condições:** O `id` retornado pode ser informado como `photoId` no registro da demanda.

### CT-16

* **id:** CT-16
* **HU:** HU-05
* **CA:** CA-02 — Arquivo acima do limite
* **título:** Rejeitar imagem acima do limite — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Enviar uma imagem de 6 MB.
* **resultado esperado:** A resposta é 413 `PHOTO_TOO_LARGE`.
* **pós-condições:** Nenhuma foto é armazenada.

### CT-17

* **id:** CT-17
* **HU:** HU-05
* **CA:** CA-03 — Formato não suportado
* **título:** Rejeitar arquivo em formato não suportado — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Enviar um arquivo `.pdf`.
  2. Enviar um arquivo `.heic`.
* **resultado esperado:** Cada envio recebe resposta 415 `UNSUPPORTED_MEDIA_TYPE`.
* **pós-condições:** Os arquivos não são aceitos como fotos válidas.

### CT-18

* **id:** CT-18
* **HU:** HU-05
* **CA:** CA-04 — Parte `file` ausente
* **título:** Rejeitar multipart sem a parte file — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Enviar o corpo `multipart` sem a parte `file`.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR`.
* **pós-condições:** Nenhuma foto é criada pelo envio inválido.

### CT-19

* **id:** CT-19
* **HU:** HU-05
* **CA:** CA-05 — Reutilização de foto de outro usuário
* **título:** Rejeitar photoId pertencente a outro usuário — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe `photoId` enviado pelo cidadão A; o cidadão autenticado é B.
* **passos:**

  1. Usar o `photoId` de A em `POST /demands` autenticado como B.
* **resultado esperado:** A resposta é 404 `NOT_FOUND`.
* **pós-condições:** Nenhuma demanda é criada com a foto pertencente a A.

---

## HU-06 — Registro da demanda

### CT-20

* **id:** CT-20
* **HU:** HU-06
* **CA:** CA-01 — Registro completo bem-sucedido
* **título:** Registrar demanda com foto — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão; existe `photoId` obtido previamente.
* **passos:**

  1. Informar categoria.
  2. Informar descrição de 120 caracteres.
  3. Informar latitude.
  4. Informar longitude.
  5. Informar região `RPA_3`.
  6. Informar o `photoId`.
  7. Registrar a demanda.
* **resultado esperado:** A resposta é 201; o status inicial é `RECEIVED`; `resolvedAt` é `null`; `author` corresponde ao usuário autenticado; o histórico contém o evento de criação com `fromStatus` `null`.
* **pós-condições:** A demanda criada permanece associada ao usuário autenticado e possui o evento de criação no histórico.

### CT-21

* **id:** CT-21
* **HU:** HU-06
* **CA:** CA-02 — Registro sem foto
* **título:** Registrar demanda sem foto — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Registrar uma demanda sem informar `photoId`.
* **resultado esperado:** A resposta é 201 e o campo `photo` é retornado como `null`.
* **pós-condições:** A demanda existe e o campo `photo` permanece presente com valor `null`.

### CT-22

* **id:** CT-22
* **HU:** HU-06
* **CA:** CA-03 — Formulário submetido vazio
* **título:** Rejeitar registro sem campos obrigatórios — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Submeter o registro sem preencher nenhum campo obrigatório.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR` e `details` lista um item por campo inválido, cada um com `field` e `issue`.
* **pós-condições:** A demanda não é criada.

### CT-23

* **id:** CT-23
* **HU:** HU-06
* **CA:** CA-04 — Categoria fora da lista fechada
* **título:** Rejeitar categoria fora da lista fechada — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Informar `category` como `BURACO`.
  2. Submeter o registro.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR` e `details` aponta o campo `category`.
* **pós-condições:** A demanda não é criada.

### CT-24

* **id:** CT-24
* **HU:** HU-06
* **CA:** CA-05 — Coordenada fora de faixa
* **título:** Rejeitar latitude fora da faixa — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Informar latitude `91`.
  2. Submeter o registro.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR`.
* **pós-condições:** A demanda não é criada.

### CT-25

* **id:** CT-25
* **HU:** HU-06
* **CA:** CA-07 — Foto já vinculada
* **título:** Rejeitar foto já vinculada a outra demanda — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe `photoId` já usado em uma demanda existente.
* **passos:**

  1. Registrar uma nova demanda usando o mesmo `photoId`.
* **resultado esperado:** A resposta é 409 `PHOTO_ALREADY_LINKED`.
* **pós-condições:** A nova demanda não é criada com o `photoId` já utilizado.

### CT-26

* **id:** CT-26
* **HU:** HU-06
* **CA:** CA-08 — Registro em nome de terceiro
* **título:** Associar demanda ao usuário autenticado — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como A; existe usuário B.
* **passos:**

  1. Incluir no corpo um campo de autoria apontando B.
  2. Submeter a demanda.
* **resultado esperado:** A demanda é criada com A como autor.
* **pós-condições:** A demanda permanece associada ao usuário autenticado A.

---

## HU-07 — Protocolo

### CT-27

* **id:** CT-27
* **HU:** HU-07
* **CA:** CA-01 — Protocolo gerado na criação
* **título:** Gerar protocolo no padrão definido — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Os dados da demanda são válidos.
* **passos:**

  1. Criar a demanda.
  2. Observar o campo `protocol`.
  3. Observar a tela de confirmação.
* **resultado esperado:** O protocolo segue `DEM-<ano>-<sequencial de 6 dígitos>`.
* **pós-condições:** O protocolo é exibido na confirmação junto com categoria e resumo da descrição.

### CT-28

* **id:** CT-28
* **HU:** HU-07
* **CA:** CA-02 — Unicidade do protocolo
* **título:** Gerar protocolos distintos e sequenciais no mesmo ano — Nível: Integração de componentes | Técnica: Valor-limite
* **pré-condições:** É possível criar duas demandas no mesmo ano.
* **passos:**

  1. Criar a primeira demanda.
  2. Criar a segunda demanda.
  3. Comparar os protocolos gerados.
* **resultado esperado:** Os dois protocolos são distintos e sequenciais.
* **pós-condições:** As duas demandas permanecem criadas com protocolos diferentes.

### CT-29

* **id:** CT-29
* **HU:** HU-07
* **CA:** CA-03 — Cancelamento antes da confirmação
* **título:** Cancelar envio antes da confirmação — Nível: Sistema | Técnica: Transição de estados
* **pré-condições:** O usuário está no diálogo de confirmação do envio.
* **passos:**

  1. Cancelar o envio.
* **resultado esperado:** Nenhuma demanda é criada e nenhum protocolo é gerado.
* **pós-condições:** Os dados já preenchidos no formulário são preservados.

---

## HU-08 — Lista das minhas demandas

### CT-30

* **id:** CT-30
* **HU:** HU-08
* **CA:** CA-01 — Listagem restrita ao autor
* **título:** Listar somente demandas do autor — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** O cidadão A possui demandas; o cidadão B também possui demandas.
* **passos:**

  1. Autenticar como A.
  2. Chamar `GET /demands`.
* **resultado esperado:** A resposta é 200 e contém somente as demandas de A.
* **pós-condições:** Demandas de B não são retornadas para A.

### CT-31

* **id:** CT-31
* **HU:** HU-08
* **CA:** CA-02 — Impossibilidade de ampliar o escopo por filtro
* **título:** Impedir ampliação da lista por parâmetros de consulta — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `CITIZEN`; existem demandas de outro autor.
* **passos:**

  1. Enviar uma combinação de parâmetros de query para `GET /demands`.
* **resultado esperado:** Nenhuma demanda de outro autor é retornada.
* **pós-condições:** O escopo da consulta permanece limitado ao cidadão autenticado.

### CT-32

* **id:** CT-32
* **HU:** HU-08
* **CA:** CA-03 — Ordenação e paginação padrão
* **título:** Aplicar paginação e ordenação padrão — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como cidadão.
* **passos:**

  1. Chamar `GET /demands` sem parâmetros.
* **resultado esperado:** `page` é 1, `pageSize` é 20 e a ordenação é `createdAt:desc`.
* **pós-condições:** A resposta permanece limitada aos valores padrão definidos.

### CT-33

* **id:** CT-33
* **HU:** HU-08
* **CA:** CA-04 — Lista vazia
* **título:** Exibir lista vazia para cidadão sem demandas — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** O cidadão ainda não registrou nenhuma demanda.
* **passos:**

  1. Abrir a lista de demandas.
* **resultado esperado:** A resposta é 200 com `data` vazio e `totalItems` 0.
* **pós-condições:** A interface exibe o estado vazio orientando o registro da primeira demanda.

### CT-34

* **id:** CT-34
* **HU:** HU-08
* **CA:** CA-05 — Status apresentado com indicação visual
* **título:** Exibir status com rótulo correspondente — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** A lista contém pelo menos uma demanda.
* **passos:**

  1. Abrir a lista.
  2. Observar um item.
* **resultado esperado:** O item mostra protocolo, categoria, data e status com rótulo em português correspondente biunivocamente ao enum retornado pela API.
* **pós-condições:** O status permanece apresentado conforme o enum retornado.

---

## HU-09 — Detalhe e linha do tempo

### CT-35

* **id:** CT-35
* **HU:** HU-09
* **CA:** CA-01 — Detalhe da própria demanda
* **título:** Exibir detalhe da própria demanda — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** O cidadão possui uma demanda.
* **passos:**

  1. Abrir a demanda de autoria própria.
* **resultado esperado:** São exibidos protocolo, categoria, descrição, localização, foto, status atual e datas.
* **pós-condições:** O detalhe permanece acessível ao autor.

### CT-36

* **id:** CT-36
* **HU:** HU-09
* **CA:** CA-02 — Histórico em ordem cronológica
* **título:** Exibir histórico em ordem cronológica — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** A demanda possui histórico.
* **passos:**

  1. Consultar o histórico da demanda.
* **resultado esperado:** Cada evento contém `fromStatus`, `toStatus`, `note`, `changedBy` e `createdAt`, e o primeiro evento é a criação com `fromStatus` `null`.
* **pós-condições:** O histórico permanece registrado em ordem cronológica.

### CT-37

* **id:** CT-37
* **HU:** HU-09
* **CA:** CA-03 — Foto com URL expirada
* **título:** Renovar URL de foto expirada — Nível: Integração de componentes | Técnica: Valor-limite
* **pré-condições:** A URL de leitura da foto possui validade de 60 minutos.
* **passos:**

  1. Aguardar período superior à validade da URL.
  2. Reabrir a demanda.
* **resultado esperado:** Uma nova URL válida é retornada e a imagem é exibida.
* **pós-condições:** A demanda permanece acessível e a foto é exibida pela nova URL.

---

## HU-10 — Notificação

### CT-38

* **id:** CT-38
* **HU:** HU-10
* **CA:** CA-01 — Notificação em transição de status
* **título:** Registrar notificação após mudança de status — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** O cidadão possui demanda em `UNDER_ANALYSIS`; um gestor pode alterar o status.
* **passos:**

  1. Alterar o status para `IN_PROGRESS`.
  2. Consultar os avisos da conta do cidadão.
* **resultado esperado:** Existe uma notificação contendo protocolo, novo status e data.
* **pós-condições:** A notificação fica registrada no histórico de avisos da conta.

### CT-39

* **id:** CT-39
* **HU:** HU-10
* **CA:** CA-02 — Nenhuma notificação sem transição efetiva
* **título:** Impedir notificação após alteração de status malsucedida — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** Existe uma tentativa de alteração de status que falhará.
* **passos:**

  1. Tentar alterar o status.
  2. Consultar o histórico de avisos.
* **resultado esperado:** Nenhuma notificação é enviada.
* **pós-condições:** Não existe notificação correspondente à tentativa malsucedida.

### CT-40

* **id:** CT-40
* **HU:** HU-10
* **CA:** CA-03 — Notificação não expõe dados de terceiros
* **título:** Limitar notificação aos dados da própria demanda — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe uma demanda própria com mudança de status.
* **passos:**

  1. Gerar a notificação da mudança de status.
  2. Consultar o conteúdo da notificação.
* **resultado esperado:** A notificação contém somente dados da própria demanda.
* **pós-condições:** Nenhum dado de demanda de terceiro é incluído na notificação.

---

## HU-11 — Painel centralizado

### CT-41

* **id:** CT-41
* **HU:** HU-11
* **CA:** CA-01 — Visão completa da base
* **título:** Listar demandas de todos os autores para gestor — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `MANAGER`; existem demandas de diferentes autores.
* **passos:**

  1. Chamar `GET /demands`.
* **resultado esperado:** A resposta contém demandas de todos os autores e cada item contém `author` com `id` e `name`.
* **pós-condições:** O gestor mantém acesso à visão consolidada da base.

### CT-42

* **id:** CT-42
* **HU:** HU-11
* **CA:** CA-03 — pageSize fora da faixa
* **título:** Rejeitar pageSize igual a zero — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Usuário autenticado como gestor.
* **passos:**

  1. Solicitar `pageSize=0`.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR`.
* **pós-condições:** A consulta paginada não é executada com `pageSize=0`.

### CT-43

* **id:** CT-43
* **HU:** HU-11
* **CA:** CA-03 — pageSize fora da faixa
* **título:** Rejeitar pageSize igual a 101 — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Usuário autenticado como gestor.
* **passos:**

  1. Solicitar `pageSize=101`.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR`.
* **pós-condições:** A consulta paginada não é executada com `pageSize=101`.

---

## HU-12 — Filtros

### CT-44

* **id:** CT-44
* **HU:** HU-12
* **CA:** CA-01 — Filtro simples
* **título:** Filtrar demandas por status — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existem demandas com diferentes status.
* **passos:**

  1. Filtrar por `status=RECEIVED`.
* **resultado esperado:** Todos os itens retornados possuem status `RECEIVED`.
* **pós-condições:** O resultado permanece restrito ao status solicitado.

### CT-45

* **id:** CT-45
* **HU:** HU-12
* **CA:** CA-02 — Filtro com múltiplos valores
* **título:** Filtrar demandas por múltiplos status — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Existem demandas com diferentes status.
* **passos:**

  1. Filtrar por `status=RECEIVED,UNDER_ANALYSIS`.
* **resultado esperado:** Somente itens `RECEIVED` ou `UNDER_ANALYSIS` são retornados.
* **pós-condições:** Itens com outros status não aparecem no resultado.

### CT-46

* **id:** CT-46
* **HU:** HU-12
* **CA:** CA-03 — Filtros combinados
* **título:** Filtrar demandas por categoria e região — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Existem demandas de diferentes categorias e regiões.
* **passos:**

  1. Filtrar por `category=PUBLIC_LIGHTING`.
  2. Filtrar por `region=RPA_2`.
* **resultado esperado:** Somente demandas de iluminação pública da `RPA_2` são retornadas.
* **pós-condições:** Demandas que não atendem à combinação não são retornadas.

### CT-47

* **id:** CT-47
* **HU:** HU-12
* **CA:** CA-04 — Filtro por período
* **título:** Incluir extremos no filtro de período — Nível: Integração de componentes | Técnica: Valor-limite
* **pré-condições:** Existem demandas com `createdAt` no início, dentro e no fim do intervalo.
* **passos:**

  1. Informar `createdFrom`.
  2. Informar `createdTo`.
  3. Executar o filtro.
* **resultado esperado:** São retornadas somente demandas cujo `createdAt` está dentro do intervalo, incluindo os dois extremos.
* **pós-condições:** O conjunto retornado respeita o intervalo inclusivo.

### CT-48

* **id:** CT-48
* **HU:** HU-12
* **CA:** CA-05 — Intervalo invertido
* **título:** Rejeitar intervalo de datas invertido — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Nenhuma.
* **passos:**

  1. Informar `createdTo` anterior a `createdFrom`.
  2. Executar o filtro.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR` e `details` aponta o campo `createdTo`.
* **pós-condições:** O filtro não produz uma lista de resultados.

### CT-49

* **id:** CT-49
* **HU:** HU-12
* **CA:** CA-06 — Valor de enum inválido
* **título:** Rejeitar enum inválido no filtro — Nível: Componente | Técnica: Partição de equivalência
* **pré-condições:** Existem demandas.
* **passos:**

  1. Filtrar por `status=ABERTO`.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR` e a lista não é retornada parcialmente.
* **pós-condições:** Nenhum resultado parcial é apresentado.

### CT-50

* **id:** CT-50
* **HU:** HU-12
* **CA:** CA-07 — Filtro sem resultados
* **título:** Exibir resultado vazio para combinação sem correspondências — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** Existe uma combinação de filtros sem nenhuma demanda correspondente.
* **passos:**

  1. Aplicar a combinação de filtros.
* **resultado esperado:** A resposta é 200 com `data` vazio e a interface exibe mensagem de nenhum resultado.
* **pós-condições:** Os filtros aplicados permanecem preservados na interface.

---

## HU-13 — Atualização de status

### CT-51

* **id:** CT-51
* **HU:** HU-13
* **CA:** CA-01 — Transição válida
* **título:** Alterar status de UNDER_ANALYSIS para IN_PROGRESS — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** Existe demanda em `UNDER_ANALYSIS`; usuário autenticado como gestor.
* **passos:**

  1. Informar status `IN_PROGRESS`.
  2. Informar observação com até 500 caracteres.
  3. Enviar a alteração.
* **resultado esperado:** A resposta é 200 com a demanda atualizada; `updatedAt` é atualizado; o histórico contém `UNDER_ANALYSIS` → `IN_PROGRESS` com `changedBy` igual ao gestor.
* **pós-condições:** A alteração aparece imediatamente na tabela do painel sem recarregar a página.

### CT-52

* **id:** CT-52
* **HU:** HU-13
* **CA:** CA-02 — Conclusão preenche resolvedAt
* **título:** Preencher resolvedAt ao concluir demanda — Nível: Integração de componentes | Técnica: Transição de estados
* **pré-condições:** Existe demanda em `IN_PROGRESS`.
* **passos:**

  1. Alterar o status para `RESOLVED`.
* **resultado esperado:** `resolvedAt` é preenchido pelo servidor com o instante da transição.
* **pós-condições:** A demanda possui `resolvedAt` preenchido.

### CT-53

* **id:** CT-53
* **HU:** HU-13
* **CA:** CA-03 — Transição proibida
* **título:** Rejeitar transição de RESOLVED para IN_PROGRESS — Nível: Componente | Técnica: Transição de estados
* **pré-condições:** Existe demanda em `RESOLVED`.
* **passos:**

  1. Tentar alterar o status para `IN_PROGRESS`.
* **resultado esperado:** A resposta é 409 `INVALID_STATUS_TRANSITION`.
* **pós-condições:** O status permanece `RESOLVED`.

### CT-54

* **id:** CT-54
* **HU:** HU-13
* **CA:** CA-04 — Repetição do status atual
* **título:** Rejeitar repetição do status RECEIVED — Nível: Componente | Técnica: Transição de estados
* **pré-condições:** Existe demanda em `RECEIVED`.
* **passos:**

  1. Enviar status `RECEIVED`.
* **resultado esperado:** A resposta é 409 `INVALID_STATUS_TRANSITION`.
* **pós-condições:** A demanda permanece em `RECEIVED`.

### CT-55

* **id:** CT-55
* **HU:** HU-13
* **CA:** CA-05 — Salto de etapa
* **título:** Rejeitar salto de RECEIVED para RESOLVED — Nível: Componente | Técnica: Transição de estados
* **pré-condições:** Existe demanda em `RECEIVED`.
* **passos:**

  1. Tentar alterar diretamente para `RESOLVED`.
* **resultado esperado:** A resposta é 409 `INVALID_STATUS_TRANSITION`.
* **pós-condições:** A demanda não é alterada para `RESOLVED`.

### CT-56

* **id:** CT-56
* **HU:** HU-13
* **CA:** CA-06 — Demanda inexistente
* **título:** Rejeitar atualização de demanda inexistente — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** O `demandId` possui formato válido, mas não existe.
* **passos:**

  1. Enviar alteração de status usando o `demandId`.
* **resultado esperado:** A resposta é 404 `NOT_FOUND`.
* **pós-condições:** Nenhuma demanda é alterada.

### CT-57

* **id:** CT-57
* **HU:** HU-13
* **CA:** CA-07 — Observação acima do limite
* **título:** Rejeitar observação com 501 caracteres — Nível: Componente | Técnica: Valor-limite
* **pré-condições:** Existe demanda atualizável.
* **passos:**

  1. Enviar observação com 501 caracteres.
  2. Enviar a alteração.
* **resultado esperado:** A resposta é 400 `VALIDATION_ERROR`.
* **pós-condições:** A alteração de status não é concluída em decorrência da validação inválida.

---

## HU-14 — Indicadores

### CT-58

* **id:** CT-58
* **HU:** HU-14
* **CA:** CA-01 — Consistência entre indicadores e base
* **título:** Comparar total dos indicadores com total da base — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existe conjunto conhecido de demandas sintéticas.
* **passos:**

  1. Consultar `GET /demands` sem filtros.
  2. Abrir o painel de indicadores.
  3. Comparar a quantidade total.
  4. Somar as contagens por categoria.
* **resultado esperado:** A quantidade total exibida é igual a `totalItems` de `GET /demands` sem filtros e a soma das categorias é igual ao total.
* **pós-condições:** Os indicadores permanecem consistentes com a base consultada.

### CT-59

* **id:** CT-59
* **HU:** HU-14
* **CA:** CA-02 — Tempo médio considera apenas resolvidas
* **título:** Calcular tempo médio somente com demandas resolvidas — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existem demandas em `RECEIVED`, `IN_PROGRESS` e `RESOLVED`.
* **passos:**

  1. Abrir o painel de indicadores.
  2. Consultar o tempo médio de atendimento.
* **resultado esperado:** Somente demandas com `resolvedAt` preenchido entram no cálculo.
* **pós-condições:** O cálculo permanece baseado somente nas demandas resolvidas.

### CT-60

* **id:** CT-60
* **HU:** HU-14
* **CA:** CA-03 — Base sem demandas resolvidas
* **título:** Exibir tempo médio como indisponível sem demandas resolvidas — Nível: Sistema | Técnica: Partição de equivalência
* **pré-condições:** Nenhuma demanda está resolvida.
* **passos:**

  1. Abrir o painel.
* **resultado esperado:** O tempo médio é apresentado como indisponível, e não como zero.
* **pós-condições:** O indicador permanece apresentado como indisponível.

---

## HU-15 — Distribuição geográfica

### CT-61

* **id:** CT-61
* **HU:** HU-15
* **CA:** CA-01 — Agrupamento por região
* **título:** Agrupar demandas pelas regiões RPA — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Existem demandas distribuídas entre as regiões.
* **passos:**

  1. Abrir a visão geográfica.
* **resultado esperado:** As demandas são agrupadas pelas regiões `RPA_1` a `RPA_6` e o total agrupado é igual ao total de demandas do filtro vigente.
* **pós-condições:** A visão geográfica mantém a contagem correspondente ao filtro vigente.

### CT-62

* **id:** CT-62
* **HU:** HU-15
* **CA:** CA-02 — Filtro por categoria na visão geográfica
* **título:** Atualizar marcadores ao desmarcar categoria — Nível: Sistema | Técnica: Tabela de decisão
* **pré-condições:** Existem demandas de pelo menos duas categorias.
* **passos:**

  1. Abrir a visão geográfica.
  2. Desmarcar uma categoria.
  3. Observar os marcadores.
  4. Limpar os filtros.
  5. Observar os marcadores novamente.
* **resultado esperado:** Os marcadores da categoria desmarcada desaparecem e, ao limpar os filtros, todos os marcadores retornam.
* **pós-condições:** A visão retorna à representação sem o filtro aplicado.

### CT-63

* **id:** CT-63
* **HU:** HU-15
* **CA:** CA-03 — Demanda sem coordenada válida
* **título:** Excluir demanda não posicionável do mapa e manter sua contagem — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Existe uma demanda que não pode ser posicionada.
* **passos:**

  1. Abrir a visão geográfica.
  2. Observar a demanda sem coordenada válida.
  3. Consultar a contagem por região.
* **resultado esperado:** A demanda não é plotada e permanece contabilizada na contagem por região.
* **pós-condições:** A demanda permanece contabilizada mesmo sem marcador no mapa.

---

## HU-16 — Gestão de contas de gestor

### CT-64

* **id:** CT-64
* **HU:** HU-16
* **CA:** CA-01 — Listagem de usuários pelo gestor
* **título:** Listar usuários como gestor — Nível: Integração de componentes | Técnica: Partição de equivalência
* **pré-condições:** Usuário autenticado como `MANAGER`.
* **passos:**

  1. Chamar `GET /users` com filtro por papel.
* **resultado esperado:** A resposta é 200 com uma coleção paginada e nenhum registro contém senha ou hash de senha.
* **pós-condições:** Os dados de senha e hash permanecem ausentes da resposta.

### CT-65

* **id:** CT-65
* **HU:** HU-16
* **CA:** CA-02 — Acesso negado ao cidadão
* **título:** Bloquear listagem de usuários para cidadão — Nível: Integração de componentes | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `CITIZEN`.
* **passos:**

  1. Chamar `GET /users`.
* **resultado esperado:** A resposta é 403 `FORBIDDEN`.
* **pós-condições:** Nenhum usuário é retornado.

### CT-66

* **id:** CT-66
* **HU:** HU-16
* **CA:** CA-03 — Tela de administração protegida
* **título:** Redirecionar cidadão da tela de gestores — Nível: Sistema | Técnica: Tabela de decisão
* **pré-condições:** Usuário autenticado como `CITIZEN`.
* **passos:**

  1. Acessar diretamente pela URL a rota da tela de gestores.
* **resultado esperado:** O usuário é redirecionado e nenhum dado é renderizado.
* **pós-condições:** A tela de administração não fica disponível ao cidadão.

---

# Lacunas e ambiguidades identificadas

## 1. Denúncia anônima × identificada — **lacuna de requisito**

O escopo solicitado inclui explicitamente **“denúncia anônima × identificada”**, porém nenhuma das HUs ou CAs define:

* como selecionar denúncia anônima;
* se o cidadão pode escolher entre anônima e identificada;
* se denúncia anônima exige autenticação;
* se o autor fica `null`, oculto ou recebe algum identificador;
* se denúncia anônima aparece no histórico do cidadão;
* se o gestor consegue visualizar a identidade do denunciante;
* quais dados são exibidos no detalhe;
* se notificações são enviadas para denúncias anônimas.

Portanto, **não gerei casos de teste para esse comportamento**. Não há trecho de requisito que permita determinar o resultado esperado. Isso deve ser tratado como requisito ausente, não como comportamento presumido.

## 2. Política de senha — regra não especificada

O requisito fornece o exemplo:

> `abcdefgh` → `400 VALIDATION_ERROR`

Mas não informa qual é a política — tamanho mínimo, caracteres obrigatórios etc. 

Assim, é possível testar a **classe explicitamente fornecida**, mas não é correto derivar limites como “8 caracteres válidos” ou “9 caracteres inválidos”.

## 3. Limite de coordenadas — parcialmente especificado

O requisito determina que latitude `91` é inválida, mas não documenta explicitamente os limites completos. 

Logo, não foram inventados casos para `90`, `-90`, `-91` ou longitude nos limites.

## 4. Máquina completa de estados da demanda — incompleta

Há evidência explícita para:

* `RECEIVED → IN_PROGRESS` como proibido;
* `RECEIVED → RESOLVED` como proibido;
* `RESOLVED → IN_PROGRESS` como proibido;
* `UNDER_ANALYSIS → IN_PROGRESS` como válido;
* `IN_PROGRESS → RESOLVED` como válido.

Mas o documento **não fornece a tabela completa de transições**, portanto não é possível afirmar, sem suposição, todas as transições permitidas ou proibidas. 

## 5. `pageSize=100` não foi transformado em caso adicional

O requisito informa que `pageSize=100` deve retornar 100 itens quando existem 250 demandas, enquanto `0` e `101` são inválidos. 

O caso CT-42/CT-43 cobre os dois limites explicitamente definidos. O valor 100 é um exemplo funcional, mas não constitui uma nova regra de comportamento além do cenário de paginação.

## 6. HU-16 fala em “administrar contas de gestor”, mas os CAs só cobrem consulta

A história diz:

> “consultar os usuários cadastrados e administrar contas de gestor”

Entretanto, os critérios de aceite fornecem apenas:

* listagem de usuários;
* negação ao cidadão;
* proteção da tela.

Não há requisito para **criar, editar, ativar, desativar, excluir ou alterar contas de gestor**. 

Portanto, não foram inventados testes para essas operações.

## 7. “Cada rota e cada endpoint” não possui matriz completa de autorização

HU-03 estabelece a regra geral de segregação:

> “cada rota e cada endpoint aceitem apenas os perfis autorizados”

Mas os critérios fornecem apenas alguns exemplos concretos. 

Assim, os casos cobrem **as combinações explicitamente especificadas**, sem presumir uma matriz completa para todos os endpoints existentes.

## 8. Escopo externo

Não foram criados casos para câmera/galeria, serviços de terceiros, infraestrutura/deploy, desempenho, carga, acessibilidade ampla, integração de sistemas ou aceite, conforme o escopo fornecido.

**Resultado da derivação:** 66 casos rastreáveis diretamente aos critérios de aceite, distribuídos entre Componente, Integração de componentes e Sistema, sem criar comportamento para os pontos em que o requisito é omisso.
