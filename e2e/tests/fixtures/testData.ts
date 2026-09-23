/**
 * Gera dados únicos a cada execução, para evitar conflito com o e-mail
 * já cadastrado em uma execução anterior (não há reset de banco entre rodadas).
 */
export function generateTestUser() {
  const unique = Date.now();
  return {
    name: 'Usuário Teste E2E',
    email: `teste.e2e.${unique}@sos.com`,
    password: 'senha123',
  };
}

export const denunciaValida = {
  tipoCategoria: 'Buraco na Via', // label exibido no Select
  bairro: 'Boa Viagem', // label exibido no Select
  descricao: 'Buraco grande e profundo na via, próximo ao ponto de ônibus, oferecendo risco a pedestres e veículos.',
};
