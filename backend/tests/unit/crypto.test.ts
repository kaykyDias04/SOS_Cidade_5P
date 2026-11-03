import { decrypt, encrypt } from '../../src/lib/crypto';

describe('lib/crypto: cifra AES-256-GCM do nome do denunciante e da descrição', () => {
  it('UN-CRIPTO-01: cifrar e decifrar devolve o texto original, com acento', () => {
    const texto = 'Anônimo: descrição com ç, ã e é';

    expect(decrypt(encrypt(texto))).toBe(texto);
  });

  it('UN-CRIPTO-02: o texto cifrado não carrega o texto puro', () => {
    const cifrado = encrypt('denunciante@sos.com');

    expect(cifrado).not.toContain('denunciante');
    expect(Buffer.from(cifrado, 'base64').toString('utf8')).not.toContain('denunciante@sos.com');
  });

  it('UN-CRIPTO-03: o mesmo texto cifrado duas vezes gera saídas diferentes (IV aleatório)', () => {
    expect(encrypt('Anônimo')).not.toBe(encrypt('Anônimo'));
  });

  it('UN-CRIPTO-04: payload adulterado é recusado', () => {
    const bytes = Buffer.from(encrypt('Buraco na Via'), 'base64');
    bytes[bytes.length - 1] ^= 0xff;

    expect(() => decrypt(bytes.toString('base64'))).toThrow();
  });

  it('UN-CRIPTO-05: payload menor que IV + tag é recusado', () => {
    expect(() => decrypt(Buffer.alloc(10).toString('base64'))).toThrow('Payload criptografado inválido.');
  });

  describe('chave de criptografia', () => {
    const chaveOriginal = process.env.DATA_ENCRYPTION_KEY;

    afterEach(() => {
      process.env.DATA_ENCRYPTION_KEY = chaveOriginal;
    });

    it('UN-CRIPTO-06: o módulo não carrega sem DATA_ENCRYPTION_KEY', () => {
      delete process.env.DATA_ENCRYPTION_KEY;

      jest.isolateModules(() => {
        expect(() => require('../../src/lib/crypto')).toThrow('DATA_ENCRYPTION_KEY não configurada');
      });
    });

    it('UN-CRIPTO-07: o módulo não carrega com chave fora de 64 caracteres hexadecimais', () => {
      process.env.DATA_ENCRYPTION_KEY = 'curta-e-fora-do-formato';

      jest.isolateModules(() => {
        expect(() => require('../../src/lib/crypto')).toThrow('exatamente 32 bytes');
      });
    });
  });
});
