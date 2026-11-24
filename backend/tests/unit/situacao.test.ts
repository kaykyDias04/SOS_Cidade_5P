import { transicaoPermitida, validarTransicao, TransicaoInvalidaError } from '../../src/services/situacao';

// TAS, backlog item 4 (R2-CT-53 a R2-CT-55): máquina de estados da situação da denúncia.
describe('Máquina de estados da situação da denúncia', () => {
  it('UN-SITUACAO-01: permite Em Andamento para Finalizada (web) e para Resolvido (mobile)', () => {
    expect(transicaoPermitida('Em Andamento', 'Finalizada')).toBe(true);
    expect(transicaoPermitida('Em andamento', 'Resolvido')).toBe(true);
  });

  it('UN-SITUACAO-02: recusa retroceder de estado final para Em Andamento', () => {
    expect(transicaoPermitida('Finalizada', 'Em Andamento')).toBe(false);
    expect(transicaoPermitida('Resolvido', 'Em andamento')).toBe(false);
    expect(transicaoPermitida('Finalizada', 'Resolvido')).toBe(false);
  });

  it('UN-SITUACAO-03: recusa repetir a situação atual, sem diferenciar maiúsculas', () => {
    expect(transicaoPermitida('Em Andamento', 'em andamento')).toBe(false);
    expect(transicaoPermitida('Finalizada', 'Finalizada')).toBe(false);
  });

  it('UN-SITUACAO-04: recusa situação fora do fluxo e lança 409 INVALID_STATUS_TRANSITION', () => {
    expect(transicaoPermitida('Em Andamento', 'Cancelada')).toBe(false);
    expect(transicaoPermitida('Em Andamento', '')).toBe(false);
    expect(transicaoPermitida('Em Andamento', 42)).toBe(false);

    try {
      validarTransicao('Finalizada', 'Em Andamento');
      throw new Error('deveria ter lançado');
    } catch (e) {
      expect(e).toBeInstanceOf(TransicaoInvalidaError);
      expect((e as TransicaoInvalidaError).status).toBe(409);
      expect((e as TransicaoInvalidaError).code).toBe('INVALID_STATUS_TRANSITION');
    }
  });
});
