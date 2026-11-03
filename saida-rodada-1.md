Gerado pelo ChatGPT em 30/09/2026 (reexecução).
---

Abaixo está uma suíte de casos de teste funcional e de negócio para o **SOS Cidade**, cobrindo os perfis Denunciante e Gestor, denúncias, filtros, fluxo de status, dashboard e mapa.

 ## Casos de teste — Denunciante

 | ID | Cenário | Pré-condição | Passos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CT-01 | Registrar denúncia válida | Denunciante autenticado | Informar categoria, bairro e demais campos obrigatórios; enviar | Denúncia é criada com sucesso e recebe status inicial |
| CT-02 | Categoria obrigatória | Formulário aberto | Não selecionar categoria; enviar | Sistema impede o envio e informa que a categoria é obrigatória |
| CT-03 | Bairro obrigatório | Formulário aberto | Não selecionar bairro; enviar | Sistema impede o envio e informa que o bairro é obrigatório |
| CT-04 | Registrar denúncia anônima | Denunciante autenticado | Preencher dados, ativar anonimato e enviar | Denúncia é criada e a identidade do denunciante não fica exposta ao Gestor |
| CT-05 | Registrar denúncia identificada | Denunciante autenticado | Desativar anonimato e enviar | Denúncia é criada vinculada ao denunciante |
| CT-06 | Alterar opção de anonimato antes do envio | Formulário preenchido | Alternar anonimato entre ativado/desativado | Sistema mantém corretamente a última opção selecionada |
| CT-07 | Enviar formulário sem dados obrigatórios | Formulário aberto | Clicar em enviar sem preencher os campos obrigatórios | Sistema não cria denúncia e apresenta as validações |
| CT-08 | Criar duas denúncias | Denunciante autenticado | Registrar duas denúncias distintas | As duas denúncias são criadas com identificadores distintos |
| CT-09 | Acesso do Denunciante a funcionalidades de Gestor | Denunciante autenticado | Tentar acessar listagem, alteração de status ou dashboard administrativo | Acesso é negado conforme as regras de autorização |

## Casos de teste — Gestor

 | ID | Cenário | Pré-condição | Passos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CT-10 | Listar denúncias | Gestor autenticado e existem denúncias | Acessar a tela de denúncias | Sistema apresenta as denúncias disponíveis ao Gestor |
| CT-11 | Filtrar por categoria | Existem denúncias de categorias diferentes | Selecionar uma categoria | Apenas denúncias da categoria escolhida são exibidas |
| CT-12 | Filtrar por bairro | Existem denúncias em bairros diferentes | Selecionar um bairro | Apenas denúncias do bairro escolhido são exibidas |
| CT-13 | Filtrar por status | Existem denúncias com status diferentes | Selecionar um status | Apenas denúncias com o status selecionado são exibidas |
| CT-14 | Combinar filtros | Existem dados compatíveis | Selecionar categoria + bairro + status | Sistema retorna somente registros que atendem a todos os filtros |
| CT-15 | Filtro sem resultados | Nenhuma denúncia atende ao filtro | Aplicar filtro inexistente | Sistema informa que não existem denúncias para os critérios selecionados |
| CT-16 | Limpar filtros | Existem filtros aplicados | Clicar em limpar filtros | Todos os filtros são removidos e a listagem volta ao estado padrão |
| CT-17 | Alterar status para Em Andamento | Denúncia em status inicial | Gestor altera para "Em Andamento" | Status é atualizado e aparece corretamente na listagem |
| CT-18 | Alterar status para Finalizada | Denúncia em andamento | Gestor altera para "Finalizada" | Status é atualizado para "Finalizada" |
| CT-19 | Fluxo inválido de status | Denúncia já finalizada | Tentar retornar para status anterior, se a regra não permitir | Sistema bloqueia a alteração e mantém a denúncia finalizada |
| CT-20 | Gestor tenta alterar denúncia inexistente | ID inválido | Solicitar alteração | Sistema informa que a denúncia não foi encontrada |
| CT-21 | Alteração de status persistente | Denúncia existente | Alterar status e recarregar a página | Novo status permanece salvo |
| CT-22 | Denúncia anônima na visão do Gestor | Existe denúncia anônima | Gestor visualiza a denúncia | Informações de identidade não são apresentadas |

## Dashboard

 | ID | Cenário | Pré-condição | Passos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CT-23 | Visualizar dashboard | Gestor autenticado | Acessar dashboard | Dashboard é carregado corretamente |
| CT-24 | Quantidade total de denúncias | Existem denúncias cadastradas | Consultar dashboard | Total apresentado corresponde aos registros existentes |
| CT-25 | Quantidade por status | Existem denúncias em diferentes status | Consultar indicadores/gráficos | Quantidades por status correspondem aos dados reais |
| CT-26 | Quantidade por categoria | Existem categorias diferentes | Consultar dashboard | Distribuição por categoria está correta |
| CT-27 | Dashboard sem denúncias | Banco sem denúncias | Acessar dashboard | Sistema apresenta valores zerados/estado vazio sem erro |
| CT-28 | Atualização do dashboard | Criar ou alterar uma denúncia | Reabrir/atualizar dashboard | Indicadores refletem os dados atualizados |

## Mapa por bairro

 | ID | Cenário | Pré-condição | Passos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CT-29 | Visualizar mapa | Gestor autenticado e existem denúncias | Abrir mapa | Mapa é carregado e apresenta os bairros com denúncias |
| CT-30 | Denúncias agrupadas por bairro | Existem várias denúncias no mesmo bairro | Consultar mapa | Bairro apresenta a quantidade correspondente de denúncias |
| CT-31 | Bairros sem denúncias | Existem bairros sem registros | Consultar mapa | Bairros sem denúncias não apresentam quantidade indevida |
| CT-32 | Atualização do mapa | Criar nova denúncia | Atualizar mapa | Novo registro é refletido no bairro correspondente |
| CT-33 | Consistência mapa × listagem | Existem denúncias cadastradas | Comparar quantidade por bairro na listagem e no mapa | Os dados apresentados são consistentes |

## Segurança e autorização

 | ID | Cenário | Passos | Resultado esperado |
| --- | --- | --- | --- |
| CT-34 | Usuário não autenticado acessa área restrita | Tentar acessar área de Gestor diretamente pela URL | Acesso é bloqueado/redirecionado para autenticação |
| CT-35 | Denunciante tenta alterar status | Acessar endpoint/tela de alteração de status | Operação é recusada |
| CT-36 | Denunciante tenta acessar dashboard | Acessar dashboard administrativo | Acesso é recusado |
| CT-37 | Gestor acessa funcionalidades administrativas | Autenticar como Gestor | Funcionalidades autorizadas ficam disponíveis |
| CT-38 | Proteção de denúncia anônima | Criar denúncia anônima e consultá-la como Gestor | Identidade não é revelada |
| CT-39 | Sessão expirada | Expirar sessão e tentar alterar uma denúncia | Sistema exige nova autenticação e não executa a alteração |

## Testes de integração e consistência

 - **CT-40 — Criação → listagem:** registrar uma denúncia e verificar se ela aparece na listagem do Gestor.
- **CT-41 — Criação → dashboard:** registrar uma denúncia e verificar a atualização dos indicadores.
- **CT-42 — Criação → mapa:** registrar denúncia em determinado bairro e verificar sua representação no mapa.
- **CT-43 — Status → dashboard:** alterar uma denúncia de status e verificar se os totais do dashboard são atualizados.
- **CT-44 — Filtros → dados exibidos:** aplicar filtros combinados e verificar se nenhum registro fora dos critérios aparece.
- **CT-45 — Anonimato ponta a ponta:** registrar denúncia anônima e verificar que a informação permanece protegida na listagem, detalhes, dashboard e demais telas administrativas.

 ### Critérios importantes de aceite

 1. **Anonimato:** ativar o anonimato deve impedir a exposição da identidade do denunciante para usuários que não tenham autorização para vê-la.
2. **Status:** o fluxo deve respeitar as transições de status definidas pelo negócio, especialmente a passagem de **Em Andamento → Finalizada**.
3. **Filtros:** filtros combinados devem funcionar como uma interseção dos critérios selecionados.
4. **Dashboard e mapa:** ambos devem refletir os mesmos dados persistidos pelas denúncias.
5. **Autorização:** permissões devem ser verificadas no backend, não apenas ocultando botões na interface.
