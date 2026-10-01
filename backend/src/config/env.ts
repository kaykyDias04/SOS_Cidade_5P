const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET não configurado. Defina essa variável de ambiente antes de iniciar o servidor.');
}

export const JWT_SECRET = jwtSecret;