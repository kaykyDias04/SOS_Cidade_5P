import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

export interface TokenPayload {
  id: number;
  email: string;
  role: 'DENUNCIANTE' | 'GESTOR';
  name?: string;
}

export const defaultDenunciante: TokenPayload = {
  id: 1,
  email: 'denunciante@sos.com',
  name: 'Cidadão Denunciante',
  role: 'DENUNCIANTE',
};

export const defaultGestor: TokenPayload = {
  id: 2,
  email: 'gestor@sos.com',
  name: 'Gestor Municipal',
  role: 'GESTOR',
};

export function generateDenuncianteToken(customPayload?: Partial<TokenPayload>): string {
  const payload = { ...defaultDenunciante, ...customPayload };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function generateGestorToken(customPayload?: Partial<TokenPayload>): string {
  const payload = { ...defaultGestor, ...customPayload };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function generateInvalidToken(): string {
  return jwt.sign({ id: 999, email: 'hacker@malicious.com', role: 'GESTOR' }, 'WRONG_SECRET_KEY', { expiresIn: '1h' });
}

export function getAuthCookie(token: string): string {
  return `authToken=${token}`;
}

export function getBearerHeader(token: string): string {
  return `Bearer ${token}`;
}
