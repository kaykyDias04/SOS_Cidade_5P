# TAS do app mobile (S.O.S Cidade)

Complemento do `docs/tas.md` para o app mobile (`mobile/`, Expo + React Native). O que vale para toda a equipe (as 4 classificações, as prioridades, os prazos, as labels e o formulário de manutenção) continua em `docs/tas.md`. Aqui está só o que muda no mobile. A lista de testes está em `docs/backlog-testes-mobile.md`.

## 0. Estado e ferramenta

- **Estado verificado em 25/11/2026:** existem testes Jest do Mobile para serviços, stores e validações, além de uma suíte separada que integra os serviços Mobile com um Backend real em banco descartável. Ainda não existem `mobile/.maestro/`, fluxos de interface nativa ou workflow `mobile-e2e`. Os testes Playwright continuam cobrindo somente o Frontend Web.
- **Proposta de ferramenta: Maestro.** Cada fluxo pode ser um YAML legível, com seletores de acessibilidade. A escolha ainda não foi implementada nem validada. Detox e Appium são alternativas a reavaliar caso a equipe adote automação mobile.
- **Onde deverá rodar:** os testes de integração HTTP rodam localmente ou em `mobile-backend-integration`; Maestro segue proposto para emulador Android contra o backend local.
- **Critério para obrigatório:** não se aplica até existir workflow. Se implementado, exigir execuções verdes consecutivas depois da calibração, conforme M-04 no backlog.

## 1. Política de manutenção (mobile)

### 1.1 Tratamento de falhas

Quando a automação mobile for criada, aplicar o processo da seção 1.2 do `tas.md`: ler a evidência, repetir uma vez, reproduzir, comparar com a última execução verde e classificar. Artefatos de Maestro e o comando `npm run test:mobile:smoke` ainda não existem.

### 1.2 Classificação: como reconhecer cada tipo no mobile

| Tipo | Sinais no mobile | Exemplo |
|---|---|---|
| `falha:sut` | O app ou a API se comporta errado testando à mão | Registrar denúncia válida não mostra o protocolo; denunciante vê aba do gestor |
| `falha:tas` | O app funciona à mão, mas o fluxo não acha o elemento ou o texto | O fluxo procura "Enviar denúncia" e o rótulo mudou; esperar curto demais |
| `falha:ambiente` | Falha antes do teste: emulador não sobe, APK não compila, Metro não responde, backend fora do ar | "adb: device offline"; estouro de tempo ao subir o emulador |
| `falha:esperada` | A tela mudou de propósito e o fluxo ainda cobre a versão antiga | Botão renomeado por decisão de design |

**Regra da dúvida:** a mesma do `tas.md`. Em dúvida entre app e fluxo, trata como `falha:sut`.

**Atenção especial no mobile:** emulador lento causa falha de tempo parecida com defeito. Por isso a primeira resposta a uma falha de "elemento não encontrado" é rodar de novo uma vez e olhar a captura de tela do Maestro antes de classificar.

### 1.3 Prioridades, prazos e responsáveis

Valem as regras do `tas.md` (seções 1.4 e 1.5). Aplicação ao mobile:

- **Alta (1 dia útil):** `falha:sut` reproduzida no fluxo crítico de login ou registro de denúncia. Não há smoke mobile nem workflow para bloquear PRs atualmente.
- **Média (3 dias úteis):** falha só no E2E completo noturno, fora dos fluxos críticos.
- **Baixa:** lentidão, fluxo duplicado, fluxo sem rastreabilidade (revisão periódica).
- **Responsáveis:** os mesmos da seção 1.5 do `tas.md`. A pessoa responsável pelos testes de cada suíte deve ser definida pela equipe de mobile (campo a preencher no formulário).

## 2. Gestão dos testes (mobile)

### 2.1 Testes instáveis

Valem os princípios da seção 2.1 do `tas.md`: uma única nova tentativa, o resultado verde da nova tentativa é sempre registrado, quarentena é provisória (no máximo 10 dias úteis) e defeito real nunca vai para quarentena.

**Causas prováveis no mobile** (para investigar antes de pôr em quarentena): animação ou tela ainda carregando, backend lento (o `render.yaml` indica hospedagem gratuita, que "dorme"), permissões do sistema (câmera, localização), mapa, notificações e teclado na frente do botão.

### 2.2 Automação

| Peça | Onde | Como funciona |
|---|---|---|
| Tags | Cabeçalho do fluxo: `tags: [smoke]`, `[e2e]`, `[integracao]` ou `[flaky]` | Proposta; depende da criação dos fluxos |
| Quarentena | Script futuro `rodar-maestro.sh quarentena` | Proposta; script e CI não existem |
| Nova tentativa | Script futuro `rodar-maestro.sh` | Proposta; executar uma repetição controlada |
| Registro do instável | Artefato e action a definir | Proposta; nenhum artefato ou action mobile existe |

Quando os fluxos existirem, um instável poderá ser marcado como `flaky` e documentado numa issue. Para removê-lo, corrigir a causa e confirmar com 5 execuções verdes seguidas.

O Maestro não tem nova tentativa nativa. Se adotado, essa lógica deverá ficar num script próprio, com evidência por fluxo.

### 2.3 Revisão periódica

Depois que a automação for implantada, revisar junto com a seção 2.3 do `tas.md`, a cada 2 semanas. Critérios:

| Critério | Sinal de alerta |
|---|---|
| Instabilidade | 2 ou mais registros `flaky` do mesmo fluxo em 14 dias, ou mais de 10 dias úteis em quarentena |
| Tempo | Fluxo acima de 90 s, ou smoke inteiro acima de 8 minutos (sem contar o build) |
| Duplicação | Mesmos passos de login ou cadastro repetidos em fluxos em vez de usar subflows (a criar) |
| Rastreabilidade | Fluxo sem item correspondente no `docs/backlog-testes-mobile.md` |

Os limites de tempo são **estimativas**: devem ser reajustados depois da primeira medição real.

### 2.4 Remoção de fluxos

Mesmos critérios, decisão e registro de riscos da seção 2.4 do `tas.md`. No mobile, a remoção de fluxo de segurança (MX-*) exige que a pessoa da equipe de segurança do projeto participe da decisão.

## 3. GitHub e CI (proposta)

### 3.1 Labels e formulário

- Verificar/criar a label `mobile`, o campo **Suíte afetada** e a action `rotular-manutencao` antes de depender desse fluxo; a automação mobile não foi verificada ou configurada nesta entrega.
- `falha:*`, `prioridade:*` e `flaky` podem seguir as convenções gerais da equipe.
- Verificar se o workflow geral cria a label `mobile`; não existe workflow de CI mobile neste repositório.

### 3.2 Workflow de integracao HTTP existente e `mobile-e2e` futuro

| Gatilho | Suíte | Observação |
|---|---|---|
| Pull request que altera `mobile/` ou `backend/` | integracao dos servicos Mobile com API real | Implementado em `.github/workflows/mobile-backend-integration.yml` |
| Manual ("Run workflow") | integracao dos servicos Mobile com API real | Implementado; banco Postgres efemero, Redis e Backend |
| Agendamento ou PR com emulador | E2E nativo | Pendente; depende do Maestro, build, emulador e Metro |

O workflow HTTP nao substitui a automacao de telas Android/iOS e nao e check obrigatorio de interface nativa.

**Passos propostos para o job:** subir backend e seed descartáveis, gerar o app de desenvolvimento, iniciar emulador Android e Metro, e executar a suíte Maestro calibrada.

### 3.3 Issue automática de falha (a implementar)

Não há actions de CI mobile para abrir issues ou registrar testes instáveis; decidir se devem ser criadas quando o workflow existir.

### 3.4 Integração app + backend

Os testes de integracao HTTP chamam a API atraves dos servicos do Mobile para confirmar operacoes e preparar dados. Eles cobrem regras de papel, cadastro administrativo, filtros e anonimato. Quando falharem, classificar **de que lado** esta o problema:

- o app mostra algo errado, mas a resposta da API está certa: `falha:sut` (app);
- a resposta da API está errada: `falha:sut` (backend), e vale abrir também o bug para o backend;
- o fluxo montou a chamada errada (caminho, corpo, token): `falha:tas`.

O acesso indevido por ID (MI-06) foi corrigido e é coberto pela suíte API; falta o E2E mobile. A criação de gestor pela tela (MI-07) continua incompatível com o cadastro público do backend e precisa de uma decisão/fluxo administrativo adequado.

## 4. Roteiro da demonstração (mobile)

**Caso proposto (a equipe confirma antes do ensaio):** alterar o rótulo do botão de envio da denúncia, implementar um smoke correspondente e mostrar a classificação correta da falha.

| Etapa | O que mostrar |
|---|---|
| 1. Identificação | Execução do workflow a criar fica vermelha; abrir os artefatos configurados |
| 2. Investigação | Reproduzir uma vez e comparar o app com a alteração intencional |
| 3. Issue | Formulário de manutenção: Suíte = Mobile, tipo `esperada`, prioridade alta, responsável e prazo |
| 4. Labels | Mostrar `falha:esperada`, `prioridade:alta` e `mobile` aplicadas sozinhas |
| 5. Correção | Pull request atualiza o teste mobile que for criado |
| 6. Fechamento | Validar teste e fechar issue com o link do pull request |

**Alternativa com `falha:sut` real:** usar um defeito reproduzível num fluxo já implementado, após haver testes e CI mobile.

**Extra (quarentena):** demonstrar somente depois de implementar o mecanismo proposto.

## 5. Limites desta entrega

- Os fluxos Maestro e o workflow de E2E nativo nao existem.
- Só Android. iOS fica fora do CI.
- Os testes Jest e o workflow de integracao HTTP existem; nenhum deles renderiza telas no emulador.
- Não há varredura automática de dependências ou análise estática de segurança no mobile.
