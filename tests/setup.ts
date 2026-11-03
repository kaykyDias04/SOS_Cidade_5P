import { randomBytes } from 'crypto';

// Chaves só de teste, geradas a cada execução: nada fixo no repositório.
// Rodam antes dos imports do app, que recusa subir sem elas.
process.env.JWT_SECRET ??= randomBytes(32).toString('hex');
process.env.DATA_ENCRYPTION_KEY ??= randomBytes(32).toString('hex');

try {
  const mime = require('mime');
  if (mime && !mime.getType && typeof mime.lookup === 'function') {
    mime.getType = mime.lookup.bind(mime);
  }
} catch {
}
