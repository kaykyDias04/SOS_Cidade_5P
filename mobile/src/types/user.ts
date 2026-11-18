export type UserRole = 'DENUNCIANTE' | 'GESTOR';

export type AuthUser = {
  name: string;
  role: UserRole;
  email?: string;
  id?: number;
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type AuthLoginResponse = {
  user: User;
  token: string;
};

export type AuthLogoutResponse = {
  success: boolean;
};
