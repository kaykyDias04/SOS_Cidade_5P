# Sugestão de commits para integrar as mudanças no SOS_Cidade_5P

Este guia propõe como Elly pode enviar mudanças do fork `SOS_Escola_5P.-copy` para `kaykyDias04/SOS_Cidade_5P` sem misturar tudo em um único merge. A recomendação é abrir pull requests pequenos, cada um com commits que expliquem uma mudança coerente.

## Referências consultadas

Estado consultado em 24/11/2026:

- Destino: [`kaykyDias04/SOS_Cidade_5P`, `main`](https://github.com/kaykyDias04/SOS_Cidade_5P/tree/main), commit `57e7de0`.
- Origem das mudanças de produto: [`refatoracao-07-labels-relatorios`](https://github.com/EllySantiago/SOS_Escola_5P.-copy/tree/refatoracao-07-labels-relatorios), commit `e15af38`.
- Origem dos testes e ajustes de pipeline mobile: [`suite-de-testes-mobile`](https://github.com/EllySantiago/SOS_Escola_5P.-copy/tree/suite-de-testes-mobile), commit `1232f27`.

Os hashes abaixo identificam commits que já existem no fork. Eles são pontos de partida para revisão, não uma ordem para aplicar tudo. A `main` de Kayky contém trabalho que não deve ser perdido, e parte da manutenção e dos relatórios já existe no destino.

## Proposta de pull requests e commits

### 1. Consentimento e registro no backend

Possível commit de origem: [`c5a57c1` — adiciona consentimento e ajustes de API](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/c5a57c14c9aa0e426c4a4e50def42989dee3fe7b).

Este é um bom candidato para um PR de backend. Ele reúne alterações no modelo de usuário, migration, seed e fluxos da API. Antes de enviar, conferir a migration contra as migrations que Kayky já tem e validar cadastro, autenticação e testes de API no destino.

Sugestão de título do PR: `feat: registra aceite dos documentos legais`.

### 2. Consentimento e textos no frontend web

Possível commit de origem: [`e74c4e6` — atualiza fluxos e consentimento web](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/e74c4e63d0c4769356f42e0ac6795b1f2ea03004).

Este trabalho depende do contrato de API e dos campos de consentimento do PR anterior. Pode ser enviado como um segundo PR depois que o backend for integrado, ou no mesmo PR com um commit separado se a revisão conjunta for preferível.

**Revisão necessária:** esse commit também altera a tela de denúncias do usuário e remove um filtro que existia no frontend. Antes de aceitar essa parte, confirmar que a API sempre limita os resultados ao usuário autenticado. A proteção não deve depender apenas da interface.

Sugestão de título do commit: `feat(web): inclui aceite dos documentos no cadastro`.

### 3. Reorganização e atualização do mobile

Os seguintes commits aparecem em sequência na branch de origem:

1. [`9bd061c` — remove cópia duplicada do app mobile](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/9bd061c3db1d60218316f2f391d11c81d998487a)
2. [`e3bf641` — atualiza base e serviços do app mobile](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/e3bf641a94be7390e02b142daee1ace7f0ddfc34)
3. [`7d388c9` — atualiza telas e componentes mobile](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/7d388c9cbabe14c5697e0f9b9711434254ffe0fd)

Esses commits são dependentes e alteram muitos arquivos. A sugestão é preservar essa separação dentro de **um PR mobile**, aplicando-os na ordem acima depois de comparar o diff com a versão atual de Kayky. Isso deixa a revisão e a identificação de conflitos mais fáceis, sem fingir que cada etapa funciona isoladamente.

**Não aceitar a remoção de arquivos em bloco.** O primeiro commit remove milhares de linhas da cópia duplicada; conferir arquivo por arquivo se o destino já tem conteúdo equivalente e preservar as telas, navegação e regras mais recentes de Kayky. No segundo e no terceiro commits, revisar especialmente configuração de API, autenticação, cache offline e envio de denúncias.

Sugestão de título do PR: `refactor(mobile): integra estrutura e telas atualizadas`.

### 4. Testes mobile e pipeline

Há trabalho de testes nas duas branches de origem. Por exemplo:

- [`01e1cc3` — adiciona testes mobile e registro de E2E instáveis](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/01e1cc3bfd8264ad1adfa839f12eb49b6e730638), na sequência da refatoração.
- [`4f8f74c` — adiciona suíte unitária do mobile](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/4f8f74cfedee5361ff29c8024e1838c59585806d), na branch de testes mobile.
- [`4dff25f` — integra labels e métricas mobile aos relatórios](https://github.com/EllySantiago/SOS_Escola_5P.-copy/commit/4dff25f112fbe6162156b8e3937410d4cc68cbe0), na sequência da refatoração.

Não recomendo aplicar esses commits inteiros sem uma comparação arquivo a arquivo: eles também tocam workflows, relatórios, formulário de manutenção e rastreamento de testes instáveis, áreas que já têm implementação na `main` de Kayky. O melhor é criar um PR focado que leve apenas os testes unitários mobile e as mudanças mínimas necessárias para executá-los e publicar seus resultados. Manter o workflow, a abertura automática de issues, os relatórios e as labels existentes no destino.

Sugestões de commits no PR:

- `test(mobile): adiciona testes unitários do app`
- `ci(mobile): executa testes mobile e publica resultados`

Separar os testes da configuração de CI facilita revisar e reverter uma parte sem remover a outra. A suíte é unitária; não deve ser apresentada como teste E2E em Android ou iOS.

### 5. Documentação

Depois que os PRs forem aprovados, revisar e enviar documentação atualizada em um commit próprio, por exemplo `docs: atualiza instruções e cobertura mobile`. A documentação deve refletir apenas o que realmente entrou na `main`, não tudo que está no fork.

## Como enviar commits separados do fork

O caminho mais seguro é trabalhar em um clone do repositório de Kayky, criar uma branch nova para cada PR, buscar os commits do fork e aplicar somente o conjunto revisado. Exemplo para o backend:

```powershell
git clone https://github.com/kaykyDias04/SOS_Cidade_5P.git
Set-Location SOS_Cidade_5P
git switch main
git pull --ff-only origin main
git remote add elly https://github.com/EllySantiago/SOS_Escola_5P.-copy.git
git fetch elly
git switch -c feat/consentimento-backend origin/main
git show --stat c5a57c14c9aa0e426c4a4e50def42989dee3fe7b
git cherry-pick -x c5a57c14c9aa0e426c4a4e50def42989dee3fe7b
git diff --check
git push -u elly feat/consentimento-backend
```

`git cherry-pick -x` reaplica o conteúdo daquele commit como um novo commit na branch de Kayky e registra no texto o hash de origem. Assim, os commits podem ser enviados separadamente sem fazer merge de toda a branch do fork. Para o PR mobile, criar outra branch a partir da `main` atualizada e aplicar, em ordem, apenas os commits mobile que forem aprovados na revisão.

Antes de cada cherry-pick, conferir o commit com `git show --stat <hash>` e garantir que ele ainda não foi integrado nem substituído por uma mudança equivalente no destino. Não aplicar commits de merge que tragam a branch inteira do fork.

Depois de cada PR:

1. Enviar a branch para o fork da Elly, não diretamente para a `main` de Kayky.
2. Abrir um pull request de `EllySantiago/SOS_Escola_5P.-copy:<branch>` para `kaykyDias04/SOS_Cidade_5P:main`.
3. Aguardar a revisão e a integração; só então atualizar a base do próximo PR com a `main` mais recente.
4. Anexar os testes executados e listar conflitos ou mudanças descartadas com justificativa.

Se um commit misturar mudanças que não devem ser levadas, não tentar esconder o restante no PR: reconstruir um commit pequeno com apenas os arquivos e trechos aprovados e explicar essa decisão na descrição. Se houver conflito, parar e resolver preservando as regras, migrations, testes e workflows atuais do destino. Não fazer push direto na `main`, não usar force push e não substituir pastas completas do projeto.

## Recomendação final

Uma sequência razoável é: **backend de consentimento → frontend web → mobile → testes/CI mobile → documentação**. Cada etapa deve ser comparada e validada sobre a `main` atual de Kayky. Os commits existentes podem ser reaplicados um a um, mas as mudanças grandes ou misturadas precisam ser reduzidas a commits novos e revisáveis.
