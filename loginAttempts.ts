import { createHash } from 'crypto';
import { redis } from './redis';

// Política de bloqueio por conta (o limite por IP fica em auth.routes.ts).
// Falhas são contadas numa janela de 15 minutos; ao atingir o limite a conta fica bloqueada.
const JANELA_SEGUNDOS = 15 * 60;
const POLITICAS = {
  DENUNCIANTE: { maxFalhas: 5, bloqueioSegundos: 15 * 60 },
  GESTOR: { maxFalhas: 3, bloqueioSegundos: 30 * 60 },
} as const;

type Role = keyof typeof POLITICAS;

export interface LockStatus {
  locked: boolean;
  retryAfterSeconds: number;
  role?: string;
}

const PREFIXO_FALHAS = 'login:fail:';
const PREFIXO_BLOQUEIO = 'login:lock:';

// Fallback em memória: o bloqueio nunca deixa de funcionar se o Redis estiver ausente ou falhar.
const falhasMem = new Map<string, { count: number; expiraEm: number }>();
const bloqueiosMem = new Map<string, { ate: number; role: string }>();
const LIMITE_MAPAS = 10_000;

export function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

function politicaDe(role?: string) {
  return POLITICAS[(role === 'GESTOR' ? 'GESTOR' : 'DENUNCIANTE') as Role];
}

function limparExpirados(agora: number) {
  if (falhasMem.size + bloqueiosMem.size < LIMITE_MAPAS) return;
  for (const [k, v] of falhasMem) if (v.expiraEm <= agora) falhasMem.delete(k);
  for (const [k, v] of bloqueiosMem) if (v.ate <= agora) bloqueiosMem.delete(k);
}

async function bloqueioNoRedis(hash: string): Promise<LockStatus | null> {
  if (!redis) return null;
  try {
    const chave = PREFIXO_BLOQUEIO + hash;
    const ttl = await redis.ttl(chave);
    if (typeof ttl !== 'number' || ttl <= 0) return { locked: false, retryAfterSeconds: 0 };
    const role = (await redis.get(chave)) ?? undefined;
    return { locked: true, retryAfterSeconds: ttl, role };
  } catch {
    return null; // Redis indisponível: quem decide é a memória
  }
}

export async function getLockStatus(email: string): Promise<LockStatus> {
  const hash = hashEmail(email);
  const agora = Date.now();

  let resultado: LockStatus = { locked: false, retryAfterSeconds: 0 };

  const mem = bloqueiosMem.get(PREFIXO_BLOQUEIO + hash);
  if (mem) {
    if (mem.ate > agora) {
      resultado = { locked: true, retryAfterSeconds: Math.ceil((mem.ate - agora) / 1000), role: mem.role };
    } else {
      bloqueiosMem.delete(PREFIXO_BLOQUEIO + hash);
    }
  }

  const doRedis = await bloqueioNoRedis(hash);
  if (doRedis?.locked && doRedis.retryAfterSeconds > resultado.retryAfterSeconds) {
    resultado = doRedis;
  }
  return resultado;
}

async function contarFalhaNoRedis(hash: string): Promise<number | null> {
  if (!redis) return null;
  try {
    const chave = PREFIXO_FALHAS + hash;
    const total = await redis.incr(chave);
    if (typeof total !== 'number') return null;
    if (total === 1) await redis.expire(chave, JANELA_SEGUNDOS);
    return total;
  } catch {
    return null;
  }
}

function contarFalhaNaMemoria(hash: string): number {
  const agora = Date.now();
  limparExpirados(agora);
  const chave = PREFIXO_FALHAS + hash;
  const atual = falhasMem.get(chave);
  if (!atual || atual.expiraEm <= agora) {
    falhasMem.set(chave, { count: 1, expiraEm: agora + JANELA_SEGUNDOS * 1000 });
    return 1;
  }
  atual.count += 1;
  return atual.count;
}

async function bloquear(hash: string, role: string, segundos: number) {
  bloqueiosMem.set(PREFIXO_BLOQUEIO + hash, { ate: Date.now() + segundos * 1000, role });
  falhasMem.delete(PREFIXO_FALHAS + hash);
  if (!redis) return;
  try {
    await redis.set(PREFIXO_BLOQUEIO + hash, role, 'EX', segundos);
    await redis.del(PREFIXO_FALHAS + hash);
  } catch {
    // a cópia em memória já garante o bloqueio
  }
}

// Registra uma falha de login. Chamar também para e-mails inexistentes (role omitido ou
// 'DENUNCIANTE'), para não revelar quais contas existem.
export async function registerFailure(email: string, role?: string): Promise<void> {
  const hash = hashEmail(email);
  const politica = politicaDe(role);
  const papel = role === 'GESTOR' ? 'GESTOR' : 'DENUNCIANTE';

  const total = (await contarFalhaNoRedis(hash)) ?? contarFalhaNaMemoria(hash);

  if (total >= politica.maxFalhas) {
    await bloquear(hash, papel, politica.bloqueioSegundos);
    console.warn('[SECURITY] login bloqueado', { emailHash: hash, role: papel });
  }
}

export async function clearAttempts(email: string): Promise<void> {
  const hash = hashEmail(email);
  falhasMem.delete(PREFIXO_FALHAS + hash);
  if (!redis) return;
  try {
    await redis.del(PREFIXO_FALHAS + hash);
  } catch {
    // sem impacto: a janela expira sozinha
  }
}

// Só para testes: zera o estado em memória.
export function __resetLoginAttemptsMemoria() {
  falhasMem.clear();
  bloqueiosMem.clear();
}
