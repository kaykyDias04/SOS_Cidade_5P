# S.O.S Cidade - Recife

Sistema de denuncias urbanas projetado para a cidade do Recife. A plataforma permite que os cidadaos registrem problemas urbanos de diversas naturezas e que gestores publicos acompanhem, filtrem e solucionem as ocorrencias de maneira centralizada e georreferenciada.

---

## Descricao Geral do Projeto

O S.O.S Cidade tem o objetivo de servir como ponte oficial de comunicacao sobre zeladoria urbana entre o recifense e a prefeitura ou orgaos publicos. 

O cidadao acessa o portal, registra uma nova ocorrencia identificando o tipo de problema e o bairro exato. Caso opte, a denuncia pode ser anonima.
Do outro lado, o gestor publico tem acesso a um painel analitico (Dashboard) e um Mapa Interativo atualizado em tempo real, onde as denuncias sao agrupadas por bairro para rapida tomada de decisao e priorizacao de acoes publicas.

---

## Arquitetura e Tecnologias Utilizadas

O sistema possui uma arquitetura moderna dividida entre Frontend, Backend e servicos de Infraestrutura rodando de forma isolada via Docker.

### Frontend
- Framework: Next.js (App Router)
- Linguagem: TypeScript
- Estilizacao: TailwindCSS e Shadcn/ui
- Mapas: Leaflet (React Leaflet)
- Gerenciamento de Estado Global: Zustand

### Backend
- Ambiente: Node.js com Express
- Linguagem: TypeScript
- ORM: Prisma
- Autenticacao: JSON Web Tokens (JWT) trafegados via Cookies (HttpOnly)
- Banco de Dados: PostgreSQL
- Cache: Redis (ioredis)
- Tarefas Agendadas: node-cron

---

## Estrutura de Diretorios

```text
S.O.S-Cidade/
├── backend/                      # API REST em Node.js
│   ├── prisma/                   # Schema do banco de dados relacional
│   └── src/
│       ├── controllers/          # Controladores das rotas
│       ├── jobs/                 # Tarefas agendadas (Cron)
│       ├── lib/                  # Instancias estaticas (Redis, Prisma)
│       ├── middlewares/          # Validacoes e Autenticacao
│       ├── repositories/         # Persistencia de dados
│       ├── routes/               # Declaracao de Endpoints
│       ├── services/             # Regras de Negocio e Cache
│       ├── app.ts                # Inicializacao Express e Swagger
│       └── server.ts             # Entrypoint da aplicacao
│
├── frontend/                     # Aplicacao Web em Next.js
│   ├── src/
│   │   ├── app/                  # Rotas da aplicacao Web
│   │   │   ├── (auth)/           # Contexto de autenticacao e login
│   │   │   ├── (denunciante)/    # Interfaces restritas ao cidadao
│   │   │   └── (gestor)/         # Interfaces restritas ao orgao publico
│   │   ├── components/           # Componentes modulares e UI
│   │   ├── lib/                  # Utilitarios (store, configuracao de api)
│   │   └── middleware.ts         # Protecao de rotas Next.js
│   └── public/
│
└── docker-compose.yml            # Orquestracao dos servicos
```

---

## Perfis de Usuario

O sistema lida primariamente com dois perfis com niveis de permissao e interfaces totalmente distintos:

1. Denunciante (Cidadao)
Pode realizar novas denuncias e visualizar seu proprio historico de ocorrencias (incluindo aquelas registradas sob anonimato em sua conta). Nao tem acesso aos dados gerais da cidade.

2. Gestor (Poder Publico)
Nao pode criar denuncias. Seu foco e a visualizacao. Possui acesso a uma listagem em tabela de todas as denuncias ativas na cidade do Recife, permitindo alterar a situacao de uma ocorrencia (Ex: Em Andamento -> Finalizada) e acompanhar a concentracao espacial dos problemas por bairro via Mapa de Ocorrencias.

---

## Como Executar o Projeto Localmente

Todo o ambiente de desenvolvimento e banco de dados foi integrado utilizando Docker para facilitar a execucao e eliminar problemas de compatibilidade.

### Pre-requisitos
- Docker e Docker Compose instalados na maquina.

### Passos de Inicializacao

1. Clone o repositorio e abra o terminal na raiz do projeto (mesmo local onde esta o arquivo docker-compose.yml).
2. Execute o comando para construir e inicializar as maquinas virtuais:
   ```bash
   docker-compose up --build -d
   ```
3. O Docker iniciara automaticamente quatro servicos:
   - Banco de Dados (PostgreSQL na porta 5432)
   - Cache (Redis na porta 6379)
   - Backend API (Node.js na porta 8000)
   - Frontend Web (Next.js na porta 3000)

4. Apos o terminal concluir a subida dos servicos, aguarde alguns segundos para a geracao das tabelas do banco.
5. Acesse a aplicacao pelo navegador:
   - Web App: http://localhost:3000
   - Documentacao da API (Swagger): http://localhost:8000/api-docs

---

## Integracao de Componentes Chaves

### 1. Sistema de Mapas (Leaflet)
Para a visualizacao do Gestor, o frontend conta com um componente customizado de mapas que agrupa dinamicamente denuncias proximas por bairro utilizando Leaflet. Foi construido um fallback interno de coordenadas aproximadas dos bairros do Recife associado a uma consulta de Geocoding sob demanda.

### 2. Cache e Performance (Redis)
Rotas custosas (como listar denuncias massivamente para os mapas) possuem cache no Redis. Para preservar consistencia, a politica de cache e limpa toda vez que qualquer operacao de escrita, atualizacao ou exclusao de denuncia e realizada. Um Cron job noturno garante que nao havera chaves residuais de longo prazo.

### 3. Protecao e Rotas Seguras
Ao fazer login, o backend injeta as credenciais do usuario em um Cookie seguro e criptografado (HttpOnly). O Frontend Next.js utiliza o seu Middleware de Servidor para validar se o usuario pode acessar determinada URL de acordo com o cargo armazenado na sessao, bloqueando tentativas de burla.

---

## Rotas do Frontend

| Caminho da URL           | Publico-Alvo | Funcionalidade Principal                          |
|--------------------------|--------------|---------------------------------------------------|
| /                        | Todos        | Autenticacao e Direcionamento Inicial             |
| /homepage-denunciante    | Denunciante  | Tela de boas-vindas do cidadao                    |
| /nova-denuncia           | Denunciante  | Formulario guiado de abertura de denuncia         |
| /minhas-denuncias        | Denunciante  | Historico de solicitacoes do usuario atual        |
| /dashboard               | Gestor       | Visão estatística básica das denúncias + filtros  |
| /denuncias-recentes      | Gestor       | Painel de administracao (Tabela de ocorrencias)   |
| /mapa-ocorrencias        | Gestor       | Visao cartografica dos chamados em aberto         |

---

## Endpoints do Backend

Todas as chamadas exigem autenticacao (exceto login/cadastro). Os dados tecnicos estruturados e modelos JSON devem ser acessados e testados nativamente atraves da pagina do Swagger.

| Verbo HTTP | Endpoint            | Contexto                            |
|------------|---------------------|-------------------------------------|
| POST       | /auth/login         | Gera sessao de Cookie HttpOnly      |
| POST       | /auth/logout        | Limpa Cookie da sessao              |
| POST       | /users              | Cadastra novo cidadao               |
| GET        | /denuncias          | Lista ocorrencias (suporta paginacao)|
| POST       | /denuncias          | Registra uma nova ocorrencia        |
| GET        | /denuncias/{id}     | Busca detalhes de uma ocorrencia    |
| PATCH      | /denuncias/{id}     | Altera status da ocorrencia         |
| DELETE     | /denuncias/{id}     | Remove uma ocorrencia do banco      |


---

## Pipeline de Dados (ETL), Orquestração (Prefect) e Dashboard (Streamlit)

O módulo de dados do projeto coleta o histórico meteorológico diário da cidade do **Recife** a partir da API pública **Open-Meteo Archive**, armazena os dados brutos no **MongoDB Atlas** (camada Bronze), realiza o tratamento e validação em Python com orientação a objetos (`Extract`, `Transform`, `Load`) e persiste os dados estruturados no **NeonDB (PostgreSQL em nuvem)**, alimentando um dashboard interativo em **Streamlit**.

### Fluxo da Arquitetura de Dados

```text
API Open-Meteo (JSON Bruto + data_extracao)
        ↓
MongoDB Atlas (Camada Bronze — histórico preservado sem apagar cargas anteriores)
        ↓
Transformação (Lê apenas a carga mais recente por data_extracao, trata nulos e valida volumetria)
        ↓
NeonDB PostgreSQL (Tabela final: clima_historico)
        ↓
Dashboard Streamlit (dashboard/app.py)
```

### Estrutura dos Arquivos de Dados

- `ETL/config.py`: Lê o arquivo `.env` uma única vez (tanto na raiz quanto em `ETL/.env`) e centraliza as variáveis `MONGODB_URI`, `NEON_DATABASE_URL`, `MONGO_DB`, `MONGO_COLLECTION` e `NEON_TABLE`. Nenhum outro arquivo chama `os.getenv`.
- `ETL/extract.py`: Classe `Extract` — extrai os dados climáticos da API Open-Meteo marcando cada carga com `data_extracao` (UTC ISO-8601) e recupera apenas a carga mais recente do MongoDB Atlas (`extract_latest_from_mongo`).
- `ETL/transform.py`: Classe `Transform` — seleciona a carga mais recente por `data_extracao`, transforma todas as listas paralelas de `daily` sem descartar registros, trata valores ausentes como `NULL` e compara a quantidade de registros da camada Bronze com o DataFrame transformado.
- `ETL/load.py`: Classe `Load` — insere o JSON bruto no MongoDB Atlas preservando cargas anteriores e grava o DataFrame transformado no NeonDB (`clima_historico`), conferindo via `SELECT COUNT(*)` se o total gravado coincide com a camada Bronze.
- `ETL/flow_prefect.py`: Orquestração da pipeline com o **Prefect** utilizando `@task` (`extrair_api_open_meteo`, `carregar_mongodb_atlas`, `extrair_mongodb_atlas`, `transformar_clima`, `carregar_neondb`) e `@flow` (`pipeline-clima-recife`), garantindo a ordem de execução e dependências (`wait_for`).
- `dashboard/app.py`: Aplicação **Streamlit** conectada ao NeonDB usando a configuração de `ETL/config.py`, com filtros interativos, indicadores (`st.metric`) e gráficos de séries temporais.

### Melhorias Aplicadas (Boas Práticas da Aula / Exemplo PNADC)

1. **Centralização do `.env` (`ETL/config.py`)**:
   - A leitura de variáveis de ambiente (`load_dotenv` e `os.getenv`) ocorre exclusivamente em `ETL/config.py`. Os módulos `extract.py`, `load.py`, `run_etl.py`, `flow_prefect.py` e `dashboard/app.py` importam `config` diretamente.
2. **Controle de Carga por `data_extracao` sem Apagar Histórico**:
   - Cada extração bruta recebe o carimbo `data_extracao` em formato UTC ISO-8601 antes de ser inserida no MongoDB Atlas.
   - As cargas anteriores **não são apagadas** da coleção `OpenMeteo.ClimaBrasil` no MongoDB Atlas.
   - Na etapa de releitura e transformação (`extract_latest_from_mongo` e `selecionar_carga_mais_recente`), apenas o documento com maior `data_extracao` é processado.
3. **Integridade e Volumetria (Camada Bronze vs. Tabela Final)**:
   - O `Transform` converte integralmente os arrays diários retornados em `daily` (`time`, `temperature_2m_max`, `temperature_2m_min`, `temperature_2m_mean`, `precipitation_sum`, `wind_speed_10m_max`), sem índices fixos como `[0]` que descartem itens.
   - A quantidade de dias presentes no documento bruto do MongoDB (`len(daily["time"])`) é comparada automaticamente com `len(df)` na transformação e com `SELECT COUNT(*) FROM clima_historico` após a gravação no NeonDB. Para o período padrão (`2024-01-01` a `2024-01-31`), os **31 registros** da camada Bronze chegam integralmente aos **31 registros** da tabela final no NeonDB.
4. **Representação e Tratamento de Dados Ausentes (Nulo vs. Zero)**:
   - **Como a fonte Open-Meteo representa dado ausente**: Na API Open-Meteo Archive, quando uma observação diária ainda não foi consolidada ou está indisponível para uma data, o array correspondente dentro de `daily` traz o literal JSON `null` (`None` em Python). Em séries históricas já consolidadas (como janeiro de 2024 em Recife), a API entrega a série completa sem lacunas.
   - **Como o pipeline trata**: O método `Transform.transform_clima` converte tanto `null`/`None` nativos do JSON quanto eventuais marcadores textuais (`""`, `"-"`, `"N/A"`, `"..."`, `"null"`) para `NaN`/`None` via `pd.to_numeric(..., errors="coerce")`, **sem usar `fillna(0)`**. Assim, qualquer valor ausente é gravado como `NULL` no PostgreSQL (NeonDB), evitando distorcer métricas físicas (já que `0 °C` ou `0 mm` de chuva representam medições reais e não ausência de dado).

### Como Executar a Pipeline e o Dashboard

1. Configure o arquivo `.env` na raiz do projeto (ou em `ETL/.env`) com base em `ETL/.env.example`:
   ```env
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   NEON_DATABASE_URL=postgresql://<usuario>:<senha>@<host>.neon.tech/<banco>?sslmode=require
   ```
2. Instale as dependências:
   ```bash
   pip install -r ETL/requirements.txt
   ```
3. Execute a pipeline orquestrada com **Prefect**:
   ```bash
   python ETL/flow_prefect.py
   ```
   *(Opcional: para acompanhar no painel visual do Prefect, execute `prefect server start` em outro terminal).*
4. Inicie o **Dashboard Streamlit** a partir da raiz do projeto:
   ```bash
   python -m streamlit run dashboard/app.py
   ```
