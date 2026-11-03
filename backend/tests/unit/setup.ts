import { randomBytes } from 'crypto';

// Chaves só de teste, geradas a cada execução: nada fixo no repositório.
process.env.JWT_SECRET ??= randomBytes(32).toString('hex');
process.env.DATA_ENCRYPTION_KEY ??= randomBytes(32).toString('hex');
