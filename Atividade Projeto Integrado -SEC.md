**CESAR SCHOOL \- ADS**

Equipe 8

**Alunos**:


     

# **DOCUMENTAÇÃO DE SEGURANÇA DA INFORMAÇÃO**

## **Projeto Integrado SOS-Cidade**

     

Documento técnico referente aos requisitos de segurança da informação avaliados no Projeto Integrado, contemplando levantamento de requisitos, análise de riscos, modelo de autenticação, análise de conformidade com a Lei Geral de Proteção de Dados (LGPD) e registro de implementação.

     

Recife 2026

---

## **SUMÁRIO**

1. INTRODUÇÃO  
2. REQUISITO 1 — GESTÃO DE AUTENTICAÇÃO DE USUÁRIOS E GESTÃO DE SENHAS  
3. REQUISITO 2 — GERENCIAMENTO DE DADOS EM REPOUSO E ANONIMIZAÇÃO  
4. PRIORIZAÇÃO DOS REQUISITOS (MOSCOW)  
5. ANÁLISE DE RISCOS DE SEGURANÇA  
6. MODELO DE AUTENTICAÇÃO  
7. ANÁLISE DE CONFORMIDADE COM A LGPD  
8. IMPLEMENTAÇÃO — BRANCH DE SEGURANÇA  
9. REVISÃO DE CÓDIGO E AJUSTES COMPLEMENTARES  
10. CONSIDERAÇÕES FINAIS E PRÓXIMOS PASSOS

REFERÊNCIAS

---

## **1 INTRODUÇÃO**

Este documento consolida o trabalho de segurança da informação desenvolvido para o projeto SOS-Cidade, sistema de denúncia de problemas urbanos (buraco na via, iluminação pública, poda de árvore, entre outros) desenvolvido como Projeto Integrado da Equipe 8\.

O documento está organizado em três grandes blocos, refletindo as etapas do trabalho:

a) **levantamento de requisitos** (seções 2 a 4), onde o sistema já existente foi auditado para identificar o que já atendia aos requisitos de segurança solicitados pelo corpo docente e o que ainda precisava ser implementado;

b) **análise técnica** (seções 5 a 7), onde os achados do levantamento foram formalizados como riscos de segurança, um modelo de autenticação alvo foi definido, e a conformidade com a LGPD foi avaliada especificamente;

c) **implementação e verificação** (seções 8 e 9), onde são registradas as correções efetivamente aplicadas no código-fonte, o estado de cada item antes e depois da correção, e os ajustes adicionais identificados por revisão de código automatizada.

A metodologia adotada em todas as etapas seguiu o mesmo princípio: partir da investigação direta do código-fonte do repositório do projeto (não de suposições genéricas), documentar evidência concreta (arquivo e comportamento) para cada achado, e derivar o requisito ou a correção diretamente do problema identificado.

---

## **2 REQUISITO 1 — GESTÃO DE AUTENTICAÇÃO DE USUÁRIOS E GESTÃO DE SENHAS**

Este requisito trata de como o sistema garante que a pessoa é quem diz ser, e que sua senha está devidamente protegida.

### **2.1 O que já estava implementado**

* A senha nunca é armazenada em texto legível: no cadastro, ela é transformada em *hash* (processo irreversível), de modo que, mesmo com acesso direto ao banco de dados, não seria possível recuperar a senha original.  
* No login, o sistema compara as versões em hash das senhas, não os valores originais.  
* Após o login, é emitido um token de sessão com expiração automática em 24 horas.  
* O token era armazenado, do lado do servidor, em cookie `HttpOnly` (não acessível via JavaScript do navegador) — mitigação padrão contra roubo de sessão via XSS.  
* A senha (mesmo em hash) nunca era incluída nas respostas da API, inclusive na listagem de usuários.

### **2.2 O que ainda faltava**

* Ausência de autenticação nas rotas de gerenciamento de usuário (criação, listagem e exclusão de contas).  
* Ausência de verificação de perfil (gestor *versus* denunciante) no processamento das requisições — a distinção existia apenas na interface.  
* Ausência de proteção contra tentativas repetidas de login (força bruta).  
* Ausência de validação de robustez de senha no backend (existia apenas na camada de interface).  
* Uso de uma chave de assinatura de token (JWT) com valor padrão fraco e previsível, utilizada caso a variável de ambiente correspondente não fosse configurada.  
* Duplicidade do token de sessão: além do cookie `HttpOnly` do servidor, o frontend mantinha uma segunda cópia acessível via JavaScript, o que anulava parcialmente a proteção contra XSS.

---

## **3 REQUISITO 2 — GERENCIAMENTO DE DADOS EM REPOUSO E ANONIMIZAÇÃO**

Este requisito trata de quais dados o sistema armazena, como estão protegidos enquanto armazenados, e se a opção de anonimato, quando exercida pelo usuário, é efetivamente respeitada.

### **3.1 Inventário de dados**

| Dado | Tipo | Sensível? | Proteção (estado inicial) |
| ----- | ----- | ----- | ----- |
| Senha do usuário | Credencial de acesso | Sim | Protegida (hash) |
| E-mail do usuário | Identificação | Sim | Texto legível |
| Nome do usuário (conta) | Identificação | Sim | Texto legível |
| Perfil (gestor/denunciante) | Configuração | Não | Texto legível |
| Nome do denunciante | Identificação em contexto sensível | Sim, altamente | Não protegida de forma garantida |
| Descrição da ocorrência | Conteúdo textual sensível | Sim | Texto legível |
| Bairro da ocorrência | Localização | Moderadamente | Texto legível |
| Fotos/evidências | Conteúdo sensível | Sim | Sem proteção adicional |
| Situação da denúncia | Operacional | Não | Texto legível |

### **3.2 O que já estava implementado**

* O modelo de dados já previa, desde a concepção, um campo booleano (`identificacao`) para distinguir denúncia identificada de denúncia anônima.  
* A senha, única credencial crítica do sistema, já estava protegida por hash.  
* A string de conexão com o banco de dados era mantida em variável de ambiente, não em código-fonte.

### **3.3 O que ainda faltava**

* A anonimização não era garantida pelo backend: a lógica de definição do nome do denunciante priorizava o valor recebido na requisição, só atribuindo `"Anônimo"` quando esse campo vinha vazio — o que permitia que uma requisição construída fora da interface padrão mantivesse a identificação mesmo com `identificacao: false`.  
* Qualquer usuário autenticado conseguia visualizar todas as denúncias do sistema, inclusive as identificadas de outras pessoas, sem qualquer filtro por perfil ou por autoria.  
* Nenhum dado sensível possuía proteção adicional em repouso (criptografia).  
* Inexistência de política de retenção — denúncias permaneciam armazenadas indefinidamente, sem rotina de expurgo ou anonimização automática.

---

## **4 PRIORIZAÇÃO DOS REQUISITOS (MOSCOW)**

| Prioridade | Requisito |
| ----- | ----- |
| **Must have** | Exigir autenticação para o gerenciamento de usuários |
| **Must have** | Verificar perfil (gestor *versus* denunciante) antes de liberar ações administrativas |
| **Must have** | Garantir a anonimização pelo próprio backend, não pela interface |
| **Must have** | Restringir a visualização de denúncias conforme o perfil do solicitante |
| **Should have** | Exigir chave de segurança própria para o sistema, sem valor padrão |
| **Should have** | Eliminar a duplicidade do token de sessão exposta no frontend |
| **Should have** | Bloquear tentativas repetidas de login |
| **Should have** | Exigir senha forte no cadastro, garantida pelo backend |
| **Could have** | Criptografia adicional para os dados mais sensíveis das denúncias |
| **Could have** | Armazenamento segregado de fotos/evidências |
| **Could have** | Definição de prazo de retenção com anonimização automática |
| **Won't have** (por ora) | Autenticação de dois fatores (MFA) e recuperação de senha por e-mail |

---

## **5 ANÁLISE DE RISCOS DE SEGURANÇA**

### **5.1 Metodologia**

Cada risco identificado foi classificado em duas dimensões, numa escala de 1 (baixo) a 3 (alto): **probabilidade** de exploração e **impacto** caso ocorra. O nível de risco resulta do cruzamento das duas dimensões, conforme a matriz a seguir.

|  | Impacto Baixo (1) | Impacto Médio (2) | Impacto Alto (3) |
| ----- | ----- | ----- | ----- |
| **Probabilidade Alta (3)** | Médio | Alto | Crítico |
| **Probabilidade Média (2)** | Baixo | Médio | Alto |
| **Probabilidade Baixa (1)** | Baixo | Baixo | Médio |

### **5.2 Riscos identificados**

| ID | Risco | Causa | Prob. | Impacto | Nível |
| ----- | ----- | ----- | ----- | ----- | ----- |
| R1 | Acesso não autenticado ao gerenciamento de usuários | Ausência de middleware de autenticação nas rotas correspondentes | 3 | 3 | Crítico |
| R2 | Autopromoção a perfil de gestor | Perfil aceito diretamente da requisição, sem validação | 3 | 3 | Crítico |
| R3 | Visualização indevida de denúncias de terceiros | Ausência de filtro por perfil/autoria na consulta | 3 | 3 | Crítico |
| R4 | Quebra da garantia de anonimato | Lógica de anonimização dependente do cliente | 2 | 3 | Crítico |
| R5 | Falsificação de token de sessão | Chave de assinatura com valor padrão previsível | 2 | 3 | Alto |
| R6 | Roubo de token via XSS | Token duplicado em armazenamento acessível por script | 2 | 2 | Médio |
| R7 | Ataque de força bruta ao login | Ausência de limitação de tentativas | 2 | 2 | Médio |
| R8 | Senhas fracas | Validação de robustez apenas na interface | 2 | 2 | Médio |
| R9 | Exposição de dados em caso de comprometimento do banco | Ausência de criptografia em repouso | 1 | 3 | Médio |
| R10 | Retenção indefinida de dado pessoal | Ausência de política de expurgo | 3 | 2 | Alto |
| R11 | Exposição de dado sensível em log de erro | Registro integral do objeto de erro | 1 | 2 | Baixo |

### **5.3 Priorização**

Os riscos R1, R2, R3 e R4 (classificados como críticos) foram tratados com prioridade máxima, por envolverem acesso não autorizado a dado de terceiro e contradição direta com garantia oferecida ao usuário. Em seguida, R5 e R10 (altos); depois R6, R7, R8 e R9 (médios); por fim R11 (baixo).

---

## **6 MODELO DE AUTENTICAÇÃO**

### **6.1 Visão geral do fluxo**

flowchart TD  
    A\[Cadastro\] \--\> B\[Hash da senha\]  
    B \--\> C\[Armazenamento\]  
    D\[Login\] \--\> E\[Verificacao do hash\]  
    E \--\>\|Valido\| F\[Emissao do token\]  
    F \--\> G\[Armazenamento do token\]  
    G \--\> H\[Requisicao autenticada\]  
    H \--\> I\[Validacao do token\]  
    I \--\>\|Valido\| J\[Processamento\]  
    I \--\>\|Invalido\| K\[Acesso negado\]

A estrutura geral do fluxo estava correta; as inconsistências concentravam-se nos detalhes de cada etapa, especialmente na etapa final — o sistema validava apenas a autenticidade do token, sem verificar se o perfil associado possuía autorização para a ação solicitada.

### **6.2 Comparação: estado inicial *versus* estado alvo**

| Aspecto | Estado inicial | Estado alvo |
| ----- | ----- | ----- |
| Robustez de senha | Validada só na interface | Validada também no backend |
| Promoção a gestor | Aceita qualquer cadastro | Restrita a gestor já autenticado |
| Tentativas de login | Ilimitadas | Limitadas por janela de tempo |
| Armazenamento do token | Duplicado (cookie seguro \+ cópia exposta) | Único, apenas o cookie seguro |
| Chave de assinatura | Valor padrão de contingência | Obrigatória, sem valor padrão |
| Rotas de usuário | Sem autenticação | Autenticadas e restritas a gestor |
| Verificação de perfil | Inexistente no backend | Obrigatória nas ações administrativas |
| Visibilidade de denúncias | Irrestrita a qualquer autenticado | Restrita por perfil/autoria |

---

## **7 ANÁLISE DE CONFORMIDADE COM A LGPD**

A análise de conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) foi realizada a partir da mesma investigação de código, organizada em três blocos de criticidade.

### **7.1 Pontos já conformes**

* Senha nunca armazenada ou retornada em texto legível.  
* Distinção entre denúncia identificada e anônima prevista desde a concepção do modelo de dados.  
* Mecanismo de consentimento explícito no formulário de denúncia.  
* Credenciais de infraestrutura mantidas fora do código-fonte.

### **7.2 Pontos pendentes, sem urgência imediata**

* Ausência de política de privacidade formal dentro da aplicação (o texto da página inicial constitui declaração de marketing, não política de privacidade).  
* Ausência de separação entre o consentimento do cadastro de conta e o consentimento da denúncia.  
* Ausência de canal declarado para exercício de direitos do titular.  
* Ausência de prazo de retenção definido.  
* Ausência de processo formal de resposta a incidente de segurança.

### **7.3 Pontos urgentes**

1. **Garantia de anonimato não imposta pelo backend** — contradição direta com a promessa realizada na interface inicial da aplicação, em potencial violação aos princípios da finalidade e da transparência (art. 6º da LGPD).  
2. **Visualização irrestrita de denúncias por qualquer usuário autenticado** — violação aos princípios da finalidade e da minimização (art. 6º da LGPD).  
3. **Ausência de mecanismo de exclusão de conta pelo próprio titular** — lacuna frente ao direito de eliminação previsto no art. 18 da LGPD.

---

## **8 IMPLEMENTAÇÃO — BRANCH DE SEGURANÇA**

Esta seção registra as correções efetivamente implementadas no código-fonte, organizadas por componente, com o estado anterior e o estado posterior de cada uma.

### **8.1 Backend**

| Item | Estado anterior | Estado posterior | Risco mitigado |
| ----- | ----- | ----- | ----- |
| Rotas de usuário | Sem autenticação em `GET /users` e `DELETE /users/:id` | Autenticação e restrição a perfil gestor aplicadas | R1 |
| Criação de conta | Perfil aceito da requisição (`data.role`) | Perfil sempre forçado para `DENUNCIANTE` no cadastro público | R2 |
| Anonimização | Priorizava valor recebido do cliente | `identificacao` verificado primeiro; nome nunca persistido quando anônimo | R4 |
| Chave do token (JWT) | Valor padrão de contingência (`supersecret123`) | Leitura centralizada, com interrupção da inicialização caso a variável não esteja definida | R5 |
| Token no frontend | Duplicado em cookie acessível via script | Duplicidade removida; mantido apenas o cookie `HttpOnly` | R6 |
| Login | Tentativas ilimitadas | Limitação de 10 tentativas por IP a cada 15 minutos | R7 |
| Robustez de senha | Validada apenas na interface | Backend rejeita senha com menos de 6 caracteres | R8 |
| Dados em repouso | Texto legível | Campos `nomeDenunciante` e `descricaoOcorrencia` criptografados (AES-256-GCM) | R9 |
| Retenção de dados | Indefinida | Rotina semanal de anonimização de denúncias finalizadas com mais de 180 dias | R10 |
| Log de erro | Registro do objeto de erro completo | Registro restrito à mensagem do erro | R11 |
| Autorização em denúncias | Qualquer autenticado podia alterar/excluir qualquer denúncia | Ações de alteração e exclusão restritas a perfil gestor | R3 (parcial) |
| Visualização de denúncias | Listagem geral irrestrita | Listagem geral restrita a gestor; novo endpoint `GET /denuncias/minhas` para o próprio usuário | R3 |
| Campos aceitos na atualização | Corpo da requisição aceito integralmente | Apenas o campo `situacao` é processado | — |

Foram também criados dois perfis de gestor para fins de teste, por meio de rotina de *seed* do Prisma, documentados no arquivo de variáveis de ambiente de exemplo do projeto.

### **8.2 Mobile**

Duas adequações foram necessárias em decorrência direta das alterações do backend, de modo a preservar o funcionamento da aplicação:

| Item | Estado anterior | Estado posterior |
| ----- | ----- | ----- |
| Listagem de denúncias do cidadão | Consumia o endpoint geral (`GET /denuncias`), posteriormente restrito a gestor | Passou a consumir `GET /denuncias/minhas` |
| Captura de localização (GPS) | Coordenadas brutas anexadas ao texto da descrição | Conversão por geocodificação reversa, preenchendo automaticamente o campo de bairro; coordenada bruta não é mais transmitida ao backend |
| Persistência de sessão | Sessão restaurada automaticamente, sem indicação visual durante o carregamento | Inclusão de estado de carregamento, impedindo a renderização da navegação antes da restauração da sessão salva ser concluída |

### **8.3 Rastreabilidade risco → correção**

A tabela a seguir relaciona cada risco identificado na seção 5.2 ao item de implementação correspondente, permitindo verificar que todos os riscos classificados como crítico ou alto foram tratados.

| Risco | Nível | Status |
| ----- | ----- | ----- |
| R1, R2, R3, R4 | Crítico | Tratados |
| R5, R10 | Alto | Tratados |
| R6, R7, R8, R9 | Médio | Tratados |
| R11 | Baixo | Tratado |

### **8.4 Histórico de versões e registro de desvio de branch**

Durante a execução do trabalho, parte das correções foi inicialmente implementada em uma branch secundária, distinta da branch de segurança oficial do repositório, o que postergou sua efetivação na branch de referência. O quadro a seguir registra essa ocorrência, conforme as datas de acompanhamento disponíveis.

| Data | Evento |
| ----- | ----- |
| 21/09/2026 | Elaborada a Análise de Conformidade com a LGPD (seção 7), com base no código-fonte da branch principal (*main*) do repositório, antes de qualquer correção de segurança ter sido integrada. |
| 25/09/2026 | Verificação de status da branch de segurança. Confirmada a implementação correta dos itens referentes às rotas de usuário, à limitação de tentativas de login, à validação de senha forte, à criptografia em repouso, à política de retenção de dados e ao tratamento de log de erro. Confirmada implementação parcial quanto à duplicidade do token de sessão. Identificados como **pendentes na branch de referência** os itens referentes à restrição de criação de conta de gestor, à garantia de anonimização pelo backend e à remoção da chave padrão do JWT — ainda que esses três itens já houvessem sido implementados anteriormente, o haviam sido em uma branch secundária, não refletindo, portanto, o estado da branch de segurança consolidada. |
| Posterior a 25/09/2026 (data exata não registrada) | Os três itens pendentes foram reaplicados diretamente na branch de segurança de referência. Na sequência, o conjunto de alterações foi submetido a revisão de código automatizada (seção 9), cujos apontamentos adicionais foram igualmente corrigidos nessa branch. |

Este registro é mantido para fins de rastreabilidade do processo, evidenciando que o desvio identificado em 25/09/2026 não correspondeu a uma correção não realizada, mas a uma correção realizada em local incorreto do controle de versão — situação sanada antes da consolidação final descrita nas seções 8.1 a 8.3.

---

## **9 REVISÃO DE CÓDIGO E AJUSTES COMPLEMENTARES**

As alterações descritas na seção 8 foram submetidas a revisão de código automatizada (ferramenta Sourcery), que identificou quatro pontos adicionais, tratados conforme segue:

1. **Regressão na validação de robustez de senha** — identificada ausência da validação de tamanho mínimo, previamente implementada e posteriormente perdida em alteração subsequente do mesmo arquivo. Corrigida.  
2. **Carregamento de variáveis de ambiente** — o módulo de configuração não invocava explicitamente o carregamento do arquivo `.env`, dependendo da injeção direta de variáveis pelo ambiente de execução (suprida, no caso deste projeto, pela configuração do orquestrador de contêineres). Adicionada chamada explícita de carregamento, por robustez em execuções fora desse ambiente.  
3. **Escopo da criptografia em repouso** — identificado que apenas o campo `nomeDenunciante` estava protegido; o campo `descricaoOcorrencia`, por também poder conter informação de identificação, foi incluído na mesma proteção.  
4. **Estratégia de rotação de chave de criptografia** — observação referente a ambientes de produção já operantes com dado existente, não aplicável ao estado atual do projeto, sem implantação em produção até o momento. Registrada como consideração para trabalho futuro.

---

## **10 CONSIDERAÇÕES FINAIS E PRÓXIMOS PASSOS**

Todos os riscos classificados como crítico ou alto na análise da seção 5 foram tratados na implementação registrada na seção 8\. Os itens classificados como *could have* na priorização MoSCoW (seção 4\) foram igualmente contemplados, com exceção do armazenamento segregado de evidências fotográficas, mantido como melhoria futura.

Permanecem como trabalho futuro, não contemplados no escopo desta entrega:

* Política de privacidade formal na aplicação;  
* Mecanismo de exclusão de conta pelo próprio titular (LGPD, art. 18);  
* Canal formal para exercício de direitos do titular de dados;  
* Processo documentado de resposta a incidente de segurança;  
* Cabeçalhos de segurança HTTP adicionais (*helmet*), validação de schema de entrada e autenticação multifator — itens mapeados para o Requisito 4 (Disponibilidade e proteção contra ataques digitais) e o Requisito 5 (Backup e continuidade de operação), de entrega subsequente.

---

## **REFERÊNCIAS**

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 14724**: informação e documentação: trabalhos acadêmicos: apresentação. Rio de Janeiro: ABNT, 2011\.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6024**: informação e documentação: numeração progressiva das seções de um documento escrito: apresentação. Rio de Janeiro: ABNT, 2012\.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023**: informação e documentação: referências: elaboração. Rio de Janeiro: ABNT, 2018\.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Diário Oficial da União, Brasília, DF, 15 ago. 2018\.

INTERNATIONAL SOFTWARE TESTING QUALIFICATIONS BOARD. **Certified Tester Foundation Level (CTFL) Syllabus**, versão 4.0. ISTQB, 2023\.

OWASP FOUNDATION. **OWASP Top Ten**. Disponível em: https\://owasp.org/www-project-top-ten/. Acesso em: 2026\.

