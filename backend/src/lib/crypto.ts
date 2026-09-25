import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const encryptionKeyHex = process.env.DATA_ENCRYPTION_KEY;

if (!encryptionKeyHex) {
  throw new Error('DATA_ENCRYPTION_KEY environment variable is required.');
}

if (!/^[\da-f]{64}$/i.test(encryptionKeyHex)) {
  throw new Error('DATA_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes).');
}

const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encryptedText = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encryptedText]).toString('base64');
}

export function decrypt(payload: string): string {
  const encryptedPayload = Buffer.from(payload, 'base64');

  if (encryptedPayload.length < 28) {
    throw new Error('Invalid encrypted payload.');
  }

  const iv = encryptedPayload.subarray(0, 12);
  const authTag = encryptedPayload.subarray(12, 28);
  const encryptedText = encryptedPayload.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString('utf8');
}