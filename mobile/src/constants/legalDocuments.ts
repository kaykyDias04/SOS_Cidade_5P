export const LEGAL_DOCUMENT_VERSION = '1.0';

export const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Termos de Uso',
    sections: [
      {
        heading: 'Sobre o serviço',
        body: 'O SOS-Cidade é um protótipo acadêmico para registrar e acompanhar ocorrências urbanas. Não é um canal de emergência nem substitui os serviços oficiais.',
      },
      {
        heading: 'Uso responsável',
        body: 'Informe ocorrências reais com dados corretos. Não inclua senhas, documentos, dados de saúde ou informações pessoais de terceiros na descrição ou nas fotos.',
      },
      {
        heading: 'Acompanhamento',
        body: 'O protocolo permite acompanhar a ocorrência. O envio não garante prazo de atendimento ou resolução pela prefeitura.',
      },
      {
        heading: 'Denúncia anônima',
        body: 'Quando selecionar a opção anônima, seu nome não será exibido para gestores ou outros usuários. A denúncia continua vinculada internamente à sua conta para permitir o acompanhamento; portanto, isso não representa anonimato absoluto perante quem administra a infraestrutura.',
      },
      {
        heading: 'Ambiente de demonstração',
        body: 'Este protótipo ainda precisa de revisão jurídica, definição do responsável pelo tratamento e publicação de um canal oficial de contato antes de uso em produção.',
      },
    ],
  },
  privacy: {
    title: 'Politica de Privacidade',
    sections: [
      {
        heading: 'Dados tratados',
        body: 'A conta usa nome e e-mail. As ocorrências podem conter categoria, bairro, descrição, data, imagens, protocolo e status. O sistema também mantém um vínculo interno entre a conta e suas ocorrências para exibir o histórico.',
      },
      {
        heading: 'Finalidade e acesso',
        body: 'Os dados são usados para autenticar a conta, registrar ocorrências e permitir seu acompanhamento. Gestores autorizados veem as ocorrências; em uma denúncia anônima, a API oculta o nome e o identificador da conta.',
      },
      {
        heading: 'Limites do anonimato',
        body: 'O vínculo interno com a conta permanece no banco de dados. Administradores com acesso à infraestrutura podem relacionar esse registro à conta, e texto ou imagens enviados podem identificar você. Evite incluir dados pessoais ao denunciar anonimamente.',
      },
      {
        heading: 'Armazenamento e direitos',
        body: 'Descrição e nome de denúncias identificadas são criptografados no banco; fotos não recebem essa criptografia adicional. Este protótipo não tem prazo automático de exclusão nem fluxo de autoatendimento para direitos do titular.',
      },
      {
        heading: 'Contato e revisão',
        body: 'O protótipo ainda não publicou um responsável legal nem canal oficial para solicitações de privacidade. Esta política é informativa para testes e precisa de revisão jurídica e de um canal de contato antes de uso em produção.',
      },
    ],
  },
} as const;
