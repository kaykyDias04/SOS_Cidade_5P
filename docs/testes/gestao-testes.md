
# Gestão dos Testes — SOS Cidade

Este documento apresenta a estratégia de gestão e manutenção dos testes automatizados do projeto **SOS Cidade**.

O objetivo é garantir a confiabilidade dos testes, identificar possíveis instabilidades, automatizar o tratamento de falhas e estabelecer critérios para revisão e remoção de testes.

A implementação utiliza Jest, Node.js Test Runner, Playwright e GitHub Actions, complementando a [Política de Manutenção](../tas.md) e o [Plano de Testes](../../plano-de-testes-equipe8.md).

---

## 1. Identificação e tratamento de testes instáveis

Testes instáveis, também conhecidos como *flaky tests*, são testes que apresentam resultados diferentes em execuções equivalentes, mesmo sem alterações no código.

Para identificar esses problemas, foi implementado um mecanismo de diagnóstico que registra:

- Identificação e nome do teste.
- Arquivo de origem.
- Resultado de cada execução.
- Mensagens de erro.
- Tempo de execução.
- Número de tentativas.
- Versão do código e ambiente utilizado.

### Como funciona

Quando um teste apresenta falha, o sistema permite repetir sua execução para investigar o comportamento.

Os resultados são classificados em:

| Classificação | Significado |
|---|---|
| Estável | Teste aprovado nas execuções observadas |
| Falha reproduzível | Teste apresenta falhas consistentes |
| Suspeita de instabilidade | Teste apresenta aprovações e falhas no mesmo contexto |
| Investigação de ambiente | Possível problema de infraestrutura ou execução |
| Não executado | Não existe resultado válido da execução |

Uma falha isolada não é suficiente para classificar um teste como instável.

Os resultados também são comparados considerando a versão do código (SHA), os arquivos executados e o ambiente. Isso evita confundir uma falha antiga, posteriormente corrigida, com instabilidade atual.

**Importante:** mesmo que um teste passe depois de falhar, a falha inicial continua registrada. Dessa maneira, o processo não esconde possíveis defeitos reais.

### Execução do diagnóstico

Para repetir os testes da API:

```bash
npm run test:diagnostic -- api diagnostic
```

O diagnóstico executa três rodadas por padrão. Também é possível selecionar as suítes `frontend`, `backend` e `e2e`, respeitando os requisitos de ambiente de cada uma.

Os resultados são armazenados em `resultados/gestao/`, incluindo logs e arquivos JSON.

---

## 2. Quarentena e automação com @flaky

A quarentena é utilizada para isolar temporariamente testes cuja instabilidade foi confirmada, evitando que comprometam a execução dos demais testes.

A identificação é realizada adicionando a marcação `@flaky` ao nome do teste.

### Funcionamento

1. Um teste apresenta resultados inconsistentes.
2. A equipe investiga e confirma a instabilidade.
3. O teste recebe a marcação `@flaky`.
4. Suas informações são registradas em `quarantine.json`.
5. O teste passa a ser executado separadamente.
6. O sistema realiza novas tentativas e registra os resultados.
7. Após corrigir a causa e comprovar estabilidade, a equipe pode autorizar sua retirada da quarentena.

### Retentativas automáticas

O mecanismo permite configurar novas tentativas para os testes em quarentena.

Por padrão, são realizadas até duas novas tentativas, além da execução inicial.

| Tipo de teste | Comportamento |
|---|---|
| Testes normais | Falhas continuam bloqueando a pipeline |
| Testes em quarentena | Executados separadamente, com retentativas e relatórios |
| Testes críticos | Protegidos contra quarentena indevida |

A tolerância a falhas é aplicada somente à etapa separada de quarentena no GitHub Actions.

Todas as tentativas são registradas, inclusive quando um teste falha inicialmente e passa em uma tentativa posterior.

O sistema também verifica se cada teste esperado realmente foi executado. Caso um teste esteja ausente, seja ignorado ou não produza resultado válido, o mecanismo registra um erro.

### Registro da quarentena

Arquivo responsável:

`scripts/test-management/quarantine.json`

Cada registro deve conter:

- ID e nome do teste.
- Arquivo de origem.
- Motivo da instabilidade.
- Responsável.
- Data de inclusão.
- Evidência da falha.
- Aprovação.
- Condição para retirada.

### Saída da quarentena

Para retirar um teste da quarentena, é necessário corrigir a causa da instabilidade e comprovar pelo menos dez execuções independentes consecutivas sem falhas, considerando a mesma versão corrigida e um ambiente equivalente.

A retirada exige aprovação humana. O sistema não remove automaticamente a marcação `@flaky`.

### Comando de execução

```bash
npm run test:quarantine -- frontend backend api e2e
```

Os relatórios são gerados separadamente em `relatorios/quarentena/`.

**Situação atual:** nenhum teste real foi classificado como flaky. O mecanismo foi validado com testes sintéticos, verificando seleção, retentativas, preservação de falhas e comportamento da pipeline.

---

## 3. Revisão periódica dos testes

Foi implementado um processo de revisão periódica para acompanhar a qualidade, a estabilidade e a manutenção dos testes automatizados.

A revisão pode ser realizada de duas maneiras:

- **Semanal:** configurada no GitHub Actions para segunda-feira às 9h, horário de Brasília.
- **Por sprint:** iniciada manualmente para uma avaliação mais completa dos testes e seus requisitos.

### Critérios de revisão

| Critério | O que é analisado |
|---|---|
| Instabilidade | Testes com resultados inconsistentes |
| Frequência de falhas | Percentual de falhas nas execuções disponíveis |
| Tempo de execução | Testes que apresentam duração elevada |
| Código duplicado | Trechos repetidos que podem ser reorganizados |
| Rastreabilidade | Relação entre testes, requisitos e critérios de aceite |
| Manutenção | Testes antigos que precisam ser revisados |
| Quarentena | Testes isolados por períodos prolongados |
| Cobertura crítica | Verificação dos testes de funcionalidades essenciais |

### Critérios configurados

A implementação utiliza limites definidos em:

`scripts/test-management/policy.json`

Entre os critérios estão:

- Frequência de falhas igual ou superior a 5%, com pelo menos três observações.
- Tempo médio superior a 1.000 ms ou máximo superior a 10.000 ms.
- Trechos duplicados com oito ou mais linhas normalizadas.
- Testes sem manutenção recente há mais de 90 dias.
- Testes em quarentena há 14 dias ou mais.
- Ausência de evidência recente de testes críticos.

Esses critérios geram alertas para investigação. Um alerta não significa necessariamente que existe um defeito comprovado.

### Automação no GitHub Actions

O workflow responsável está em:

[revisao-testes.yml](../../.github/workflows/revisao-testes.yml)

Ele permite:

1. Executar a revisão semanal automaticamente após sua integração à branch padrão.
2. Iniciar uma revisão manual por sprint.
3. Consultar o histórico disponível das execuções.
4. Analisar métricas e possíveis problemas.
5. Gerar relatórios para acompanhamento da equipe.

### Gerar relatório local

```bash
npm run test:review
```

Arquivos gerados:

- `relatorios/gestao/review.md`
- `relatorios/gestao/review.json`

Os relatórios apresentam métricas, classificações, possíveis duplicações, rastreabilidade e recomendações de manutenção.

A análise diferencia testes efetivamente reprovados daqueles que apenas não possuem evidências recentes.

---

## 4. Política de remoção de testes

A remoção de testes deve seguir critérios definidos para evitar a perda de cobertura de funcionalidades importantes.

Um teste não pode ser removido simplesmente porque está falhando, apresenta instabilidade ou possui execução demorada.

### Quando um teste pode ser removido?

A remoção pode ser considerada quando:

- O requisito correspondente deixou de existir.
- A funcionalidade testada foi descontinuada.
- O teste se tornou redundante e existe cobertura equivalente.
- A equipe comprovou que sua remoção não compromete a qualidade do sistema.

### Testes críticos

Testes relacionados a funcionalidades essenciais possuem proteção adicional, incluindo:

- Autenticação e gerenciamento de sessões.
- Autorização e controle de acesso.
- Cadastro de usuários.
- Privacidade e criptografia.
- Registro e acompanhamento de denúncias.
- Fluxos críticos do cidadão e do gestor.

A implementação mantém um inventário dos testes protegidos em `policy.json`.

A exclusão ou desativação de testes críticos é identificada pelo mecanismo de validação, exigindo revisão antes de qualquer alteração na política de proteção.

### Quem decide pela remoção?

A decisão exige:

1. Solicitação com justificativa técnica.
2. Identificação do teste e requisito associado.
3. Comprovação de obsolescência ou cobertura equivalente.
4. Análise dos riscos.
5. Revisão por outro integrante.
6. Aprovação do responsável pelo requisito.
7. Atualização da documentação e das evidências.

### Checklist de remoção

- [ ] O motivo da remoção foi documentado.
- [ ] O teste e o requisito foram identificados.
- [ ] A cobertura equivalente foi verificada.
- [ ] Os riscos foram analisados.
- [ ] Um integrante revisou a solicitação.
- [ ] A remoção recebeu aprovação.
- [ ] A rastreabilidade foi atualizada.
- [ ] Os testes aplicáveis foram executados após a alteração.
- [ ] Existe um procedimento de restauração, caso necessário.

Nenhum teste é removido automaticamente.

---

## 5. Integração com GitHub Actions

A gestão dos testes foi integrada aos workflows existentes do projeto.

| Workflow | Finalidade |
|---|---|
| `unit-api.yml` | Executar testes unitários, API e validações de gestão |
| `e2e-smoke.yml` | Executar os cenários principais de ponta a ponta |
| `regressao-completa.yml` | Executar uma verificação mais abrangente |
| `revisao-testes.yml` | Realizar revisões periódicas e gerar relatórios |

A implementação preserva as verificações obrigatórias e mantém a execução da quarentena separada.

O GitHub Actions também armazena os relatórios e evidências geradas pelas execuções, quando os respectivos jobs são executados.

---

## 6. Validação da implementação

Durante o desenvolvimento da gestão dos testes, foram realizadas as seguintes verificações locais:

| Validação | Resultado |
|---|---|
| Testes unitários do frontend | 8 aprovados |
| Testes unitários do backend | 26 aprovados |
| Testes de API | 54 aprovados |
| Autotestes do mecanismo de gestão | 6 aprovados |
| Validação do inventário de testes | 95 testes identificados |
| Verificação de sintaxe JavaScript e YAML | Aprovada |

**Total: 88 testes unitários/API aprovados e seis verificações específicas de gestão aprovadas.**

O mecanismo de quarentena foi validado por testes sintéticos que verificam o isolamento, o tratamento de falhas e o registro das tentativas.

No GitHub Actions, os três cenários E2E smoke também foram aprovados em execução remota. Essa validação não representa a execução completa dos sete cenários E2E.

Os relatórios de revisão identificaram pontos para acompanhamento, como possíveis duplicações, rastreabilidade incompleta e ausência de evidências em determinados testes. Esses achados não devem ser interpretados automaticamente como testes reprovados.

---

## 7. Comandos principais

Os comandos devem ser executados na raiz do repositório, com as dependências correspondentes instaladas.

```bash
# Validar a política de gestão
npm run test:management:validate

# Validar o mecanismo de gestão
npm run test:management:selftest

# Executar testes unitários
npm run test:unit

# Executar testes da API
npm run test:api

# Diagnosticar possíveis instabilidades
npm run test:diagnostic -- api diagnostic

# Executar a quarentena
npm run test:quarantine -- frontend backend api e2e

# Gerar relatório de revisão
npm run test:review
```

Os comandos relacionados ao E2E dependem da aplicação e de seus serviços estarem disponíveis. Para a configuração específica do Playwright, consultar o [README dos testes E2E](../../e2e/README.md).

---

## 8. Conclusão

A implementação da Gestão dos Testes do SOS Cidade estabelece um processo para identificar instabilidades, executar testes em quarentena, acompanhar métricas de qualidade e controlar a remoção de testes.

Com a integração ao GitHub Actions, a equipe passa a contar com mecanismos automatizados de validação, registro de tentativas e geração de relatórios.

O processo busca manter os testes confiáveis e organizados, preservando a identificação de defeitos reais e a cobertura das funcionalidades críticas do sistema.
