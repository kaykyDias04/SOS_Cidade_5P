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

export const API_URL = process.env.API_URL ?? 'http://localhost:8000';

// GESTOR criado pelo seed do backend (backend/prisma/seed.ts), que roda antes da suíte.
// O cadastro público só cria DENUNCIANTE, por design.
export const gestorSeed = {
  email: 'gestor1.teste@soscidade.com',
  password: 'Teste@123',
};

export const denunciaValida = {
  tipoCategoria: 'Buraco na Via', // label exibido no Select
  bairro: 'Boa Viagem', // label exibido no Select
  descricao: 'Buraco grande e profundo na via, próximo ao ponto de ônibus, oferecendo risco a pedestres e veículos.',
};
