import { redis, redisGet, redisSet } from './redis';

const revokedTokens = new Map<string, number>();

export async function revokeToken(jti: string, ttlSeconds: number): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  for (const [revokedJti, expiration] of revokedTokens) {
    if (expiration <= Date.now()) revokedTokens.delete(revokedJti);
  }
  revokedTokens.set(jti, expiresAt);

  if (redis?.status === 'ready') {
    await redisSet(`revoked:${jti}`, '1', ttlSeconds);
  }
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  if (redis?.status === 'ready') {
    const revoked = await redisGet(`revoked:${jti}`);
    if (revoked !== null) return true;
  }

  const expiresAt = revokedTokens.get(jti);
  if (expiresAt === undefined) return false;
  if (expiresAt <= Date.now()) {
    revokedTokens.delete(jti);
    return false;
  }
  return true;
}
