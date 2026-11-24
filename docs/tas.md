# Solução de automação de testes (TAS) do S.O.S Cidade

O tópico **2. Gestão dos testes** está implementado em [gestão dos testes](testes/gestao-testes.md): identificação de instabilidade, quarentena `@flaky`, revisão semanal/por sprint e política de remoção com aprovação. A seção abaixo continua definindo a triagem de manutenção.

Este documento registra como a equipe mantém os testes automatizados do S.O.S Cidade. As decisões seguem o Capítulo 13 do material de estudo e o contexto do projeto.

## 1. Política de manutenção

### 1.1 Escopo

A política vale para toda falha nas quatro suítes do projeto:

- **Unitários do frontend:** `frontend/tests/`, com `node:test`.
- **Unitários do backend:** `backend/tests/unit/`.
- **API:** `tests/`, com Jest, sobre as rotas do backend.
- **E2E (ponta a ponta):** `e2e/tests/`. Os testes marcados com `@smoke` formam a suíte rápida.

As suítes rodam em três workflows do GitHub Actions:

- **`unit-api`:** unitários e API, em todo push e em pull request para a `main`. É check obrigatório da `main`.
- **`e2e-smoke`:** E2E marcados com `@smoke`, em pull request para a `main`. É check obrigatório da `main`.
- **`regressao-completa`:** todas as suítes, todo dia às 03:00 (horário de Brasília) e sob demanda.

### 1.2 Tratamento de falhas

Uma falha entra no processo por dois caminhos:

- **Automático.** Quando `unit-api` falha na `main` ou `regressao-completa` falha, a pipeline abre uma issue com a label `falha-pipeline`. A issue traz os testes que falharam, o link da execução e o link do artefato `resultados-testes`. Se já existe issue aberta para o mesmo workflow e branch, a pipeline comenta nela.
- **Manual.** Qualquer pessoa da equipe que perceber um problema abre uma issue pelo formulário **Manutenção da automação de testes**.

Falha num pull request causada pela própria mudança do pull request não é demanda de manutenção: o autor corrige antes do merge. Entra no processo a falha que aparece na `main`, na regressão agendada ou num pull request cuja mudança não tem relação com o teste que falhou.

A investigação (triagem) segue estes passos, nesta ordem:

1. **Ler a evidência.** Abrir a execução no Actions e baixar o artefato `resultados-testes`, com os resultados em JUnit XML e os logs. Anotar o teste, a mensagem de erro e o commit.
2. **Rodar de novo uma única vez** os jobs que falharam, sem mudar nada. Se passar, o teste é suspeito de instabilidade e segue as regras de testes instáveis (seção 2). Rodar várias vezes até passar é proibido, porque esconde defeito real.
3. **Reproduzir localmente** no mesmo commit, com o mesmo comando do workflow (por exemplo `npm run test:api`).
4. **Comparar com a última execução verde.** Ver o que mudou entre os dois commits: código do sistema, código do teste, dependências, dados de teste ou o próprio workflow.
5. **Classificar** a falha (seção 1.3) e registrar no formulário de manutenção. Se a falha veio da issue automática, o link dela vai no campo "O que aconteceu".

**Prazo da triagem:** 1 dia útil depois da falha. Até lá, a issue pode ficar como "Ainda em investigação". Passado esse prazo, a issue precisa ter tipo e prioridade.

### 1.3 Classificação dos problemas

Toda falha recebe um de quatro tipos. Cada tipo tem uma label, aplicada sozinha pela action `rotular-manutencao` a partir do formulário.

**Defeito no sistema sob teste (`falha:sut`)**

- **Como reconhecer:** o teste falha sempre, a falha se reproduz testando à mão e o assert verifica um comportamento do produto.
- **Exemplo no projeto:** a rota de denúncias responde 500 ao receber uma denúncia válida.
- **Encaminhamento:** corrigir o código do sistema. O teste não é alterado nem desativado, porque ele está cumprindo seu papel.

**Problema na automação (`falha:tas`)**

- **Como reconhecer:** o produto funciona testando à mão, mas o teste falha. A causa está no próprio teste: seletor, dado de teste, assert errado, helper ou mock.
- **Exemplo no projeto:** um seletor do E2E deixa de achar o botão de enviar denúncia depois de uma troca de texto no frontend.
- **Encaminhamento:** corrigir o teste.

**Falha de ambiente (`falha:ambiente`)**

- **Como reconhecer:** o erro acontece antes ou fora do teste: runner do Actions, Docker, Postgres ou Redis que não sobem, rede, instalação de dependências ou limite da API do GitHub.
- **Exemplo no projeto:** a etapa que sobe os serviços estoura o tempo e nenhum teste E2E chega a rodar.
- **Encaminhamento:** corrigir o workflow ou a infraestrutura e rodar de novo depois da correção.

**Variação esperada (`falha:esperada`)**

- **Como reconhecer:** o sistema mudou de propósito e o teste ainda cobre o comportamento antigo.
- **Exemplo no projeto:** um campo novo passa a ser obrigatório no cadastro de denúncia e o teste de API ainda envia o corpo antigo.
- **Encaminhamento:** atualizar o teste, de preferência no mesmo pull request da mudança. A issue precisa citar a decisão ou a issue que pediu a mudança.

**Regra para a dúvida:** quando não está claro se o problema é do sistema ou do teste, a falha é tratada como `falha:sut` até a investigação provar o contrário. Classificar um defeito real como problema de teste leva a "consertar" o teste e esconder o defeito. O erro contrário só custa um pouco mais de investigação.

### 1.4 Prioridades e prazos

A prioridade depende do impacto da falha no trabalho da equipe e no produto. O prazo conta a partir da classificação.

**Alta (`prioridade:alta`): até 1 dia útil**

- Falha em `unit-api` ou `e2e-smoke` que não vem da mudança do pull request. Os dois são checks obrigatórios da `main`.
- Ou `falha:sut` em fluxo crítico: login, registro de denúncia e painel do gestor.
- **Por quê:** com um check obrigatório vermelho, nenhum pull request da equipe entra na `main`. Um defeito em fluxo crítico atinge o uso principal do sistema.

**Média (`prioridade:media`): até 3 dias úteis**

- Falha só na `regressao-completa`, fora dos fluxos críticos.
- **Por quê:** a regressão roda uma vez por dia e não bloqueia merge. Três dias úteis cabem entre uma aula e a seguinte, e a regressão do dia seguinte já mostra se a correção funcionou.

**Baixa (`prioridade:baixa`): até a próxima revisão periódica**

- Problema que não muda o resultado dos testes: lentidão, aviso no log, código duplicado ou teste sem rastreabilidade.
- **Por quê:** não há risco imediato. Juntar esses itens na revisão periódica (seção 2) evita interromper o trabalho por algo que pode esperar.

**Prazo estourado:** a issue sobe um nível de prioridade e entra na pauta do próximo encontro da equipe. Uma issue de prioridade alta com prazo estourado vira o primeiro assunto do encontro.

### 1.5 Responsáveis

Cada etapa tem um papel com dono definido. O nome do responsável vai no campo "Responsável" do formulário e na atribuição (Assignees) da issue.

- **Triagem:** quem fez o push ou o pull request que falhou. Na `regressao-completa`, que não tem autor, a triagem fica com o **triador da semana**, em rodízio entre os membros da equipe.
- **Correção de `falha:sut`:** quem fez a mudança que introduziu o defeito, identificada pelo commit da execução que falhou.
- **Correção de `falha:tas`:** a pessoa responsável pelos testes da suíte afetada (hoje, Marcos).
- **Correção de `falha:ambiente`:** a pessoa responsável pela pipeline e pelos workflows (hoje, João Pedro).
- **Correção de `falha:esperada`:** quem fez a mudança de requisito, no mesmo pull request.
- **Fechamento:** quem corrigiu fecha a issue com o link do pull request da correção. A issue só fecha depois de uma execução verde do workflow que falhou.

**Por quê:** quem causou a falha tem o contexto mais fresco para entender o problema. O rodízio cobre o único caso sem autor, a execução agendada. Exigir a execução verde para fechar impede que a issue feche só porque alguém acha que corrigiu.

### 1.6 Fluxo resumido

1. A falha aparece, numa issue automática `falha-pipeline` ou numa observação manual.
2. O responsável pela triagem investiga em até 1 dia útil (seção 1.2).
3. Ele abre ou completa a issue pelo formulário de manutenção, com tipo, prioridade, responsável e prazo.
4. A action `rotular-manutencao` aplica as labels de tipo, prioridade e, se for o caso, `flaky`.
5. O responsável pela correção abre um pull request que cita a issue.
6. Depois do merge e de uma execução verde, a issue é fechada com o link da correção.

---

### 1.7 Nota Técnica Arquitetural: Fronteira Web vs. Mobile e Validação E2E de Notificação

Em resposta ao feedback pedagógico sobre o fluxo **Registrar -> Acompanhar -> Notificar**:

1. **Fronteira Arquitetural (Isolamento de Responsabilidade)**:
   - O mecanismo de **notificação ativa / push sonoro** foi projetado exclusivamente para a camada nativa móvel via `expo-notifications` (`mobile/src/lib/notifications.ts`), sendo desligado no runtime web (`Platform.OS === 'web'`).
   - A aplicação Web (Next.js) opera sob o modelo de **zeladoria urbana reativa**, onde o canal de acompanhamento do cidadão é a tela de histórico `/minhas-denuncias`. O backend REST não implementa WebSockets nem SSE para avisos em tempo real no browser.

2. **Garantia E2E Automatizada (`CT-E2E-08`)**:
   - Para assegurar que o valor de negócio do ciclo seja validado de ponta a ponta sem violação de fronteira arquitetural, foi implementado o teste E2E multi-sessão:
     - Arquivo: `e2e/tests/status-denuncia-gestor-denunciante.spec.ts`
     - Cenário: `CT-E2E-08: Denunciante vê "Finalizada" em Minhas Denúncias depois que o Gestor finaliza a denúncia`
     - Funcionamento: Um contexto de browser do cidadão abre a denúncia ("Em andamento"); um segundo contexto isolado do gestor altera a situação para "Finalizada" via diálogo administrativo; o contexto do cidadão atualiza e comprova a transição de estado.
   - Dessa forma, o ciclo "Registrar -> Acompanhar -> Notificar" está formalmente comprovado no escopo Web pelo acompanhamento persistido, enquanto o push ativo fica devidamente circunscrito ao ecossistema Mobile nativo.

## Criação inicial das labels

Depois que `.github/workflows/criar-labels.yml` e `.github/scripts/criar-labels.sh`
estiverem na `main`, abra **Actions → criar-labels → Run workflow**, selecione
`main` e confirme **Run workflow**. O workflow também roda quando o script muda
por push na `main`. O uso de `gh label create --force` permite repetir a execução
com segurança; `falha-pipeline` continua sendo criada pela action de falha.
