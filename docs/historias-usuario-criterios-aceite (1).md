# Histórias de Usuário e Critérios de Aceite
 
## HU-01 — Autocadastro do cidadão
 
> **Como** cidadão, **quero** criar uma conta na plataforma informando nome, e-mail e senha, **para** poder registrar e acompanhar demandas urbanas.
 
**Critérios de aceite**
 
```gherkin
Cenário: Cadastro com dados válidos
  Dado que o e-mail "maria@exemplo.com" não existe na base
  Quando eu submeter nome, e-mail e senha válidos
  Então a conta é criada com papel CITIZEN
  E a resposta é 201 sem qualquer campo de senha no corpo
  E eu sou levado à área autenticada do cidadão
 
Cenário: E-mail já cadastrado
  Dado que já existe conta com o e-mail "maria@exemplo.com"
  Quando eu submeter o mesmo e-mail
  Então a resposta é 409 com code EMAIL_ALREADY_REGISTERED
  E nenhuma segunda conta é criada
 
Cenário: Senha fora da política
  Quando eu submeter a senha "abcdefgh"
  Então a resposta é 400 VALIDATION_ERROR
  E details aponta o campo "password" com a regra não atendida
 
Cenário: Escalada de privilégio na criação da conta
  Quando eu submeter o corpo do cadastro incluindo "role": "MANAGER"
  Então a conta é criada com papel CITIZEN
  E o campo enviado é ignorado sem gerar erro de servidor
```
 
---
 
## HU-02 — Autenticação
 
> **Como** usuário cadastrado (cidadão ou gestor), **quero** autenticar-me com e-mail e senha, **para** acessar minhas funcionalidades com segurança.
 
**Critérios de aceite**
 
```gherkin
Cenário: Login válido de cidadão
  Dado que sou um cidadão ativo
  Quando eu informar e-mail e senha corretos
  Então recebo um accessToken JWT válido por 24 h contendo o papel CITIZEN
  E sou direcionado à área do cidadão
 
Cenário: Login válido de gestor
  Dado que sou um gestor ativo
  Quando eu informar e-mail e senha corretos
  Então o token emitido contém o papel MANAGER
  E sou direcionado ao painel administrativo
 
Cenário: Credenciais incorretas
  Quando eu informar e-mail válido e senha incorreta
  Então a resposta é 401 com code INVALID_CREDENTIALS
  E permaneço na tela de login sem sessão iniciada
  E a mensagem não revela se o e-mail existe na base
 
Cenário: Token expirado em requisição subsequente
  Dado um accessToken emitido há mais de 24 h
  Quando eu chamar qualquer endpoint autenticado
  Então a resposta é 401 UNAUTHENTICATED
 
Cenário: Logout invalida o token apresentado
  Dado que estou autenticado com o token T
  Quando eu efetuar logout
  E reutilizar o token T em GET /auth/me
  Então a resposta é 401 UNAUTHENTICATED
```
 
---
 
## HU-03 — Segregação de acesso por perfil
 
> **Como** gestor da plataforma, **quero** que cada rota e cada endpoint aceitem apenas os perfis autorizados, **para** que dados e operações administrativas não fiquem expostos a usuários comuns.
 
**Critérios de aceite**
 
```gherkin
Cenário: Cidadão tenta operação exclusiva de gestor
  Dado que estou autenticado como CITIZEN
  Quando eu chamar PATCH /demands/{id}/status
  Então a resposta é 403 FORBIDDEN
  E o status da demanda permanece inalterado
 
Cenário: Gestor tenta registrar demanda
  Dado que estou autenticado como MANAGER
  Quando eu chamar POST /demands
  Então a resposta é 403 FORBIDDEN
 
Cenário: Cidadão tenta acessar recurso de terceiro
  Dado que a demanda D pertence a outro cidadão
  Quando eu chamar GET /demands/{D}
  Então a resposta é 404 NOT_FOUND
  E a resposta não permite distinguir "não existe" de "não é sua"
 
Cenário: Rota administrativa acessada pela barra de endereços
  Dado que estou autenticado como CITIZEN
  Quando eu digitar diretamente a URL de uma tela restrita ao gestor
  Então sou redirecionado à área do cidadão
  E nenhum dado da tela restrita é renderizado, nem momentaneamente
 
Cenário: Requisição sem token
  Quando eu chamar qualquer endpoint autenticado sem cabeçalho Authorization
  Então a resposta é 401 UNAUTHENTICATED
```
 
---
 
## HU-04 — Consulta ao próprio perfil
 
> **Como** usuário autenticado, **quero** consultar os dados da minha conta, **para** confirmar com qual identidade e perfil estou operando.
 
**Critérios de aceite**
 
```gherkin
Cenário: Perfil do usuário autenticado
  Dado que estou autenticado
  Quando eu chamar GET /auth/me
  Então recebo 200 com id, name, email, role, createdAt e updatedAt
  E o corpo não contém senha nem hash de senha
 
Cenário: Escopo do próprio usuário
  Dado que sou CITIZEN com id X
  Quando eu chamar GET /users/{Y} para outro usuário
  Então a resposta é 404 NOT_FOUND
```
 
---
 
## HU-05 — Envio da foto da ocorrência
 
> **Como** cidadão, **quero** enviar uma foto do problema encontrado, **para** dar evidência visual da ocorrência ao poder público.
 
**Critérios de aceite**
 
```gherkin
Cenário: Upload de foto válida
  Dado que estou autenticado como cidadão
  Quando eu enviar um JPEG de 1,8 MB em multipart/form-data na parte "file"
  Então a resposta é 201 com id, url, contentType e sizeBytes
  E o id retornado pode ser informado como photoId no registro da demanda
 
Cenário: Arquivo acima do limite
  Quando eu enviar uma imagem de 6 MB
  Então a resposta é 413 PHOTO_TOO_LARGE
  E nenhuma foto é armazenada
 
Cenário: Formato não suportado
  Quando eu enviar um arquivo .pdf ou .heic
  Então a resposta é 415 UNSUPPORTED_MEDIA_TYPE
 
Cenário: Parte "file" ausente
  Quando eu enviar o corpo multipart sem a parte "file"
  Então a resposta é 400 VALIDATION_ERROR
 
Cenário: Reutilização de foto de outro usuário
  Dado um photoId enviado pelo cidadão A
  Quando o cidadão B usar esse photoId em POST /demands
  Então a resposta é 404 NOT_FOUND
```
 
---
 
## HU-06 — Registro da demanda urbana
 
> **Como** cidadão, **quero** registrar uma demanda urbana informando categoria, descrição, localização e, opcionalmente, uma foto, **para** que o problema seja encaminhado aos responsáveis pela resolução.
 
**Critérios de aceite**
 
```gherkin
Cenário: Registro completo bem-sucedido
  Dado que estou autenticado como cidadão
  E que enviei previamente uma foto e obtive o photoId
  Quando eu registrar a demanda com categoria, descrição de 120 caracteres,
       latitude, longitude, região RPA_3 e o photoId
  Então a resposta é 201 com o objeto da demanda
  E o status inicial é RECEIVED
  E resolvedAt é null
  E author corresponde ao usuário autenticado
  E o histórico da demanda registra o evento de criação com fromStatus null
 
Cenário: Registro sem foto
  Quando eu registrar a demanda sem informar photoId
  Então a resposta é 201
  E o campo photo é retornado como null, nunca omitido
 
Cenário: Formulário submetido vazio
  Quando eu submeter o registro sem preencher nenhum campo obrigatório
  Então a resposta é 400 VALIDATION_ERROR
  E details lista um item por campo inválido, cada um com field e issue
  E a demanda não é criada
 
Cenário: Categoria fora da lista fechada
  Quando eu informar category "BURACO"
  Então a resposta é 400 VALIDATION_ERROR
  E details aponta o campo "category"
 
Cenário: Coordenada fora de faixa
  Quando eu informar latitude 91
  Então a resposta é 400 VALIDATION_ERROR
 
Cenário: Foto já vinculada a outra demanda
  Dado um photoId já usado em uma demanda existente
  Quando eu registrar nova demanda com o mesmo photoId
  Então a resposta é 409 PHOTO_ALREADY_LINKED
 
Cenário: Registro em nome de terceiro
  Quando eu incluir no corpo um campo de autoria apontando outro usuário
  Então a demanda é criada com o usuário autenticado como autor
```
 
---
 
## HU-07 — Protocolo e comprovante do registro
 
> **Como** cidadão, **quero** receber um número de protocolo ao concluir o registro, **para** ter comprovante da solicitação e poder consultá-la ou compartilhá-la depois.
 
**Critérios de aceite**
 
```gherkin
Cenário: Protocolo gerado na criação
  Quando a demanda for criada com sucesso
  Então o campo protocol é retornado no padrão DEM-<ano>-<sequencial de 6 dígitos>
  E o protocolo é exibido na tela de confirmação junto com categoria e resumo da descrição
 
Cenário: Unicidade do protocolo
  Quando duas demandas forem criadas no mesmo ano
  Então os protocolos gerados são distintos e sequenciais
 
Cenário: Cancelamento antes da confirmação
  Dado que estou no diálogo de confirmação do envio
  Quando eu cancelar
  Então nenhuma demanda é criada e nenhum protocolo é gerado
  E os dados já preenchidos no formulário são preservados
```
 
---
 
## HU-08 — Lista das minhas demandas
 
> **Como** cidadão, **quero** visualizar a lista das demandas que registrei, com status e protocolo, **para** acompanhar o andamento das minhas solicitações.
 
**Critérios de aceite**
 
```gherkin
Cenário: Listagem restrita ao autor
  Dado que sou o cidadão A e existem demandas de A e de B
  Quando eu chamar GET /demands
  Então recebo 200 apenas com as demandas de A
  E o envelope contém data e pagination
 
Cenário: Impossibilidade de ampliar o escopo por filtro
  Dado que sou CITIZEN
  Quando eu tentar qualquer combinação de parâmetros de query
  Então nenhuma demanda de outro autor é retornada
 
Cenário: Ordenação e paginação padrão
  Quando eu chamar GET /demands sem parâmetros
  Então page é 1, pageSize é 20 e a ordenação é createdAt:desc
 
Cenário: Lista vazia
  Dado que ainda não registrei nenhuma demanda
  Quando eu abrir a lista
  Então a resposta é 200 com data vazio e totalItems 0
  E a interface exibe estado vazio orientando o registro da primeira demanda
 
Cenário: Status apresentado com indicação visual
  Quando a lista for exibida
  Então cada item mostra protocolo, categoria, data e status com rótulo em português
  E o rótulo corresponde biunivocamente ao enum retornado pela API
```
 
---
 
## HU-09 — Detalhe e linha do tempo da demanda
 
> **Como** cidadão, **quero** abrir o detalhe da minha demanda e ver a linha do tempo das mudanças de status com as observações do gestor, **para** ter transparência sobre a resolução do problema.
 
**Critérios de aceite**
 
```gherkin
Cenário: Detalhe da própria demanda
  Quando eu abrir uma demanda de minha autoria
  Então vejo protocolo, categoria, descrição, localização, foto, status atual e datas
 
Cenário: Histórico em ordem cronológica
  Quando eu consultar o histórico da demanda
  Então cada evento traz fromStatus, toStatus, note, changedBy e createdAt
  E o primeiro evento é a criação, com fromStatus null
 
Cenário: Foto com URL expirada
  Dado que a URL de leitura da foto tem validade de 60 minutos
  Quando eu reabrir a demanda após esse período
  Então uma nova URL válida é retornada e a imagem é exibida
 
Cenário: Detalhe de demanda de terceiro
  Quando eu tentar abrir uma demanda que não registrei
  Então a resposta é 404 NOT_FOUND
```
 
---
 
## HU-10 — Notificação de mudança de status
 
> **Como** cidadão, **quero** ser avisado quando o status da minha demanda mudar, **para** acompanhar a resolução sem precisar consultar a plataforma ativamente.
 
**Critérios de aceite**
 
```gherkin
Cenário: Notificação em transição de status
  Dado que tenho uma demanda em UNDER_ANALYSIS
  Quando um gestor alterar o status para IN_PROGRESS
  Então recebo uma notificação contendo protocolo, novo status e data
  E a notificação fica registrada no histórico de avisos da conta
 
Cenário: Nenhuma notificação sem transição efetiva
  Quando uma tentativa de alteração de status falhar
  Então nenhuma notificação é enviada
 
Cenário: Notificação não expõe dados de terceiros
  Quando a notificação for gerada
  Então ela contém apenas dados da minha própria demanda
```
 
---
 
## HU-11 — Painel centralizado de demandas
 
> **Como** gestor público, **quero** ver todas as demandas registradas em um painel único, **para** ter visão consolidada da operação.
 
**Critérios de aceite**
 
```gherkin
Cenário: Visão completa da base
  Dado que estou autenticado como MANAGER
  Quando eu chamar GET /demands
  Então recebo demandas de todos os autores
  E cada item traz o author com id e name
 
Cenário: Paginação em volume alto
  Dado que existem 250 demandas na base
  Quando eu solicitar pageSize 100
  Então recebo 100 itens, totalItems 250 e totalPages 3
 
Cenário: pageSize fora da faixa
  Quando eu solicitar pageSize 0 ou 101
  Então a resposta é 400 VALIDATION_ERROR
```
 
---
 
## HU-12 — Filtros por status, categoria, região e período
 
> **Como** gestor público, **quero** filtrar as demandas por status, categoria, região e intervalo de datas, **para** localizar rapidamente as ocorrências relevantes e priorizar o atendimento.
 
**Critérios de aceite**
 
```gherkin
Cenário: Filtro simples
  Quando eu filtrar por status=RECEIVED
  Então todos os itens retornados têm status RECEIVED
 
Cenário: Filtro com múltiplos valores
  Quando eu filtrar por status=RECEIVED,UNDER_ANALYSIS
  Então apenas itens nesses dois status são retornados
 
Cenário: Filtros combinados
  Quando eu filtrar por category=PUBLIC_LIGHTING e region=RPA_2
  Então apenas demandas de iluminação pública da RPA_2 são retornadas
 
Cenário: Filtro por período
  Quando eu informar createdFrom e createdTo
  Então apenas demandas com createdAt dentro do intervalo, inclusive nos extremos, são retornadas
 
Cenário: Intervalo invertido
  Quando createdTo for anterior a createdFrom
  Então a resposta é 400 VALIDATION_ERROR
  E details aponta o campo "createdTo"
 
Cenário: Valor de enum inválido em filtro
  Quando eu filtrar por status=ABERTO
  Então a resposta é 400 VALIDATION_ERROR
  E a lista não é retornada parcialmente
 
Cenário: Filtro sem resultados
  Quando a combinação de filtros não corresponder a nenhuma demanda
  Então a resposta é 200 com data vazio, não 404
  E a interface exibe mensagem de "nenhum resultado" preservando os filtros aplicados
```
 
---
 
## HU-13 — Atualização de status da demanda
 
> **Como** gestor público, **quero** atualizar o status de uma demanda registrando uma observação, **para** informar ao cidadão e à equipe o andamento da resolução.
 
**Critérios de aceite**
 
```gherkin
Cenário: Transição válida
  Dado uma demanda em UNDER_ANALYSIS
  Quando eu alterar o status para IN_PROGRESS com uma observação de até 500 caracteres
  Então a resposta é 200 com a demanda atualizada
  E updatedAt é atualizado
  E o histórico ganha um evento com fromStatus UNDER_ANALYSIS, toStatus IN_PROGRESS e changedBy igual a mim
  E a alteração aparece imediatamente na tabela do painel, sem recarregar a página
 
Cenário: Conclusão preenche resolvedAt
  Dado uma demanda em IN_PROGRESS
  Quando eu alterar o status para RESOLVED
  Então resolvedAt é preenchido pelo servidor com o instante da transição
 
Cenário: Transição proibida
  Dado uma demanda em RESOLVED
  Quando eu tentar alterar o status para IN_PROGRESS
  Então a resposta é 409 INVALID_STATUS_TRANSITION
  E o status permanece RESOLVED
 
Cenário: Repetição do status atual
  Dado uma demanda em RECEIVED
  Quando eu enviar status RECEIVED
  Então a resposta é 409 INVALID_STATUS_TRANSITION
 
Cenário: Salto de etapa
  Dado uma demanda em RECEIVED
  Quando eu tentar alterar diretamente para RESOLVED
  Então a resposta é 409 INVALID_STATUS_TRANSITION
 
Cenário: Demanda inexistente
  Quando eu informar um demandId válido em formato mas inexistente
  Então a resposta é 404 NOT_FOUND
 
Cenário: Observação acima do limite
  Quando eu enviar uma observação com 501 caracteres
  Então a resposta é 400 VALIDATION_ERROR
```
 
---
 
## HU-14 — Indicadores operacionais
 
> **Como** gestor público, **quero** visualizar indicadores agregados das demandas, **para** analisar o desempenho do atendimento e apoiar decisões.
 
**Critérios de aceite**
 
```gherkin
Cenário: Consistência entre indicadores e base
  Dado um conjunto conhecido de demandas sintéticas
  Quando eu abrir o painel de indicadores
  Então a quantidade total exibida é igual ao totalItems de GET /demands sem filtros
  E a soma das contagens por categoria é igual à quantidade total
 
Cenário: Tempo médio considera apenas demandas resolvidas
  Dado demandas em RECEIVED, IN_PROGRESS e RESOLVED
  Quando o tempo médio de atendimento for calculado
  Então somente as demandas com resolvedAt preenchido entram no cálculo
 
Cenário: Base sem demandas resolvidas
  Dado que nenhuma demanda foi resolvida
  Quando eu abrir o painel
  Então o tempo médio é apresentado como indisponível, não como zero
 
Cenário: Acesso restrito
  Dado que estou autenticado como CITIZEN
  Quando eu chamar GET /metrics/summary
  Então a resposta é 403 FORBIDDEN
```
 
---
 
## HU-15 — Distribuição geográfica das demandas
 
> **Como** gestor público, **quero** ver a concentração de demandas por região, **para** identificar áreas críticas e planejar ações.
 
**Critérios de aceite**
 
```gherkin
Cenário: Agrupamento por região
  Quando eu abrir a visão geográfica
  Então as demandas são agrupadas pelas regiões RPA_1 a RPA_6
  E o total agrupado é igual ao total de demandas no filtro vigente
 
Cenário: Filtro por categoria na visão geográfica
  Dado que existem demandas de ao menos duas categorias
  Quando eu desmarcar uma categoria
  Então os marcadores dessa categoria desaparecem
  E ao limpar os filtros todos os marcadores retornam
 
Cenário: Demanda sem coordenada válida
  Quando uma demanda não puder ser posicionada
  Então ela não é plotada
  E permanece contabilizada na contagem por região
```
 
---
 
## HU-16 — Gestão de contas de gestor
 
> **Como** gestor público, **quero** consultar os usuários cadastrados e administrar contas de gestor, **para** manter o controle de acesso à plataforma.
 
**Critérios de aceite**
 
```gherkin
Cenário: Listagem de usuários pelo gestor
  Dado que estou autenticado como MANAGER
  Quando eu chamar GET /users com filtro por papel
  Então recebo 200 com a coleção paginada
  E nenhum registro contém senha ou hash de senha
 
Cenário: Acesso negado ao cidadão
  Dado que estou autenticado como CITIZEN
  Quando eu chamar GET /users
  Então a resposta é 403 FORBIDDEN
 
Cenário: Tela de administração protegida
  Dado que estou autenticado como CITIZEN
  Quando eu acessar a rota da tela de gestores diretamente pela URL
  Então sou redirecionado e nenhum dado é renderizado
```
 
