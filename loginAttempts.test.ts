// Redis falso com as operações que o bloqueio usa; `quebrado` simula Redis fora do ar.
const store = new Map<string, { valor: string; expiraEm: number | null }>();
let quebrado = false;

const vivo = (k: string) => {
  const e = store.get(k);
  if (e && e.expiraEm !== null && e.expiraEm <= Date.now()) store.delete(k);
  return store.get(k);
};
const checar = () => {
  if (quebrado) throw new Error('Redis fora do ar');
};

jest.mock('../../src/lib/redis', () => ({
  redis: {
    incr: jest.fn(async (k: string) => {
      checar();
      const n = Number(vivo(k)?.valor ?? 0) + 1;
      store.set(k, { valor: String(n), expiraEm: vivo(k)?.expiraEm ?? null });
      return n;
    }),
    expire: jest.fn(async (k: string, s: number) => {
      checar();
      const e = vivo(k);
      if (e) e.expiraEm = Date.now() + s * 1000;
      return 1;
    }),
    set: jest.fn(async (k: string, v: string, _ex: string, s: number) => {
      checar();
      store.set(k, { valor: v, expiraEm: Date.now() + s * 1000 });
      return 'OK';
    }),
    get: jest.fn(async (k: string) => {
      checar();
      return vivo(k)?.valor ?? null;
    }),
    ttl: jest.fn(async (k: string) => {
      checar();
      const e = vivo(k);
      if (!e) return -2;
      return e.expiraEm === null ? -1 : Math.ceil((e.expiraEm - Date.now()) / 1000);
    }),
    del: jest.fn(async (...ks: string[]) => {
      checar();
      ks.forEach((k) => store.delete(k));
      return ks.length;
    }),
  },
}));

import {
  __resetLoginAttemptsMemoria,
  clearAttempts,
  getLockStatus,
  hashEmail,
  registerFailure,
} from '../../src/lib/loginAttempts';

describe('loginAttempts: bloqueio por conta', () => {
  beforeEach(() => {
    store.clear();
    quebrado = false;
    __resetLoginAttemptsMemoria();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('UN-LOGIN-01: chaves no Redis usam o sha256 do e-mail em minúsculas, nunca o e-mail em claro', async () => {
    await registerFailure('Pessoa@SOS.com', 'DENUNCIANTE');

    const chaves = [...store.keys()];
    expect(chaves).toEqual(['login:fail:' + hashEmail('pessoa@sos.com')]);
    expect(hashEmail('Pessoa@SOS.com')).toBe(hashEmail('pessoa@sos.com'));
    expect(chaves.join()).not.toContain('pessoa');
  });

  it('UN-LOGIN-02: DENUNCIANTE bloqueia na 5ª falha por 15 min; 4 falhas ainda não bloqueiam', async () => {
    for (let i = 0; i < 4; i++) await registerFailure('a@sos.com', 'DENUNCIANTE');
    expect((await getLockStatus('a@sos.com')).locked).toBe(false);

    await registerFailure('a@sos.com', 'DENUNCIANTE');
    const status = await getLockStatus('a@sos.com');

    expect(status.locked).toBe(true);
    expect(status.retryAfterSeconds).toBeGreaterThan(14 * 60);
    expect(status.retryAfterSeconds).toBeLessThanOrEqual(15 * 60);
  });

  it('UN-LOGIN-03: GESTOR bloqueia na 3ª falha por 30 min', async () => {
    for (let i = 0; i < 3; i++) await registerFailure('g@sos.com', 'GESTOR');
    const status = await getLockStatus('g@sos.com');

    expect(status.locked).toBe(true);
    expect(status.role).toBe('GESTOR');
    expect(status.retryAfterSeconds).toBeGreaterThan(29 * 60);
    expect(status.retryAfterSeconds).toBeLessThanOrEqual(30 * 60);
  });

  it('UN-LOGIN-04: clearAttempts zera o contador de falhas', async () => {
    for (let i = 0; i < 4; i++) await registerFailure('a@sos.com', 'DENUNCIANTE');
    await clearAttempts('a@sos.com');
    for (let i = 0; i < 4; i++) await registerFailure('a@sos.com', 'DENUNCIANTE');

    expect((await getLockStatus('a@sos.com')).locked).toBe(false);
  });

  it('UN-LOGIN-05: com o Redis fora do ar o bloqueio continua funcionando em memória', async () => {
    quebrado = true;
    for (let i = 0; i < 3; i++) await registerFailure('g@sos.com', 'GESTOR');

    const status = await getLockStatus('g@sos.com');
    expect(status.locked).toBe(true);
    expect(status.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('UN-LOGIN-06: sem papel conhecido (e-mail inexistente) vale a política de DENUNCIANTE', async () => {
    for (let i = 0; i < 4; i++) await registerFailure('naoexiste@sos.com');
    expect((await getLockStatus('naoexiste@sos.com')).locked).toBe(false);

    await registerFailure('naoexiste@sos.com');
    expect((await getLockStatus('naoexiste@sos.com')).locked).toBe(true);
  });
});
