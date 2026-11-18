/**
 * Model: User
 * Espelha o formato de usuário retornado pelo backend (auth.service.ts / user.repository.ts).
 * Não tem nenhuma lógica aqui — só a forma do dado.
 */
export type UserRole = 'DENUNCIANTE' | 'GESTOR';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  user: User;
  token: string;
}
