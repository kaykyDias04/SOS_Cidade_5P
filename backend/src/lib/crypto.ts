import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const encryptionKeyHex = process.env.DATA_ENCRYPTION_KEY;

if (!encryptionKeyHex) {
  throw new Error('DATA_ENCRYPTION_KEY não configurada. Defina essa variável de ambiente antes de iniciar o servidor.');
}

if (!/^[0-9a-fA-F]{64}$/.test(encryptionKeyHex)) {
  throw new Error('DATA_ENCRYPTION_KEY deve conter exatamente 32 bytes em hexadecimal.');
}

const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');
const algorithm = 'aes-256-gcm';
const ivLength = 12;
const authTagLength = 16;

export function encrypt(text: string): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(payload: string): string {
  const data = Buffer.from(payload, 'base64');
  const minimumLength = ivLength + authTagLength;

  if (data.length < minimumLength) {
    throw new Error('Payload criptografado inválido.');
  }

  const iv = data.subarray(0, ivLength);
  const authTag = data.subarray(ivLength, minimumLength);
  const encrypted = data.subarray(minimumLength);
  const decipher = createDecipheriv(algorithm, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}