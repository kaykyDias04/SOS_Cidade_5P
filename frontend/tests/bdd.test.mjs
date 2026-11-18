import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateLoginForm, validateDenunciaForm } from '../src/lib/validation.mjs';

// BDD-01: Login com credenciais válidas como Denunciante
describe('Login como Denunciante', () => {
  it('BDD-01: deve retornar sem erros para credenciais válidas', () => {
    // Given
    const credentials = { email: 'levi@sos.com', password: '123456' };
    // When
    const errors = validateLoginForm(credentials);
    // Then
    assert.equal(errors.length, 0);
  });
});

// BDD-02: Envio de formulário com campos obrigatórios vazios
describe('Formulário de nova denúncia com campos vazios', () => {
  it('BDD-02: deve retornar 4 erros ao enviar formulário vazio', () => {
    // Given
    const form = { tipoDenuncia: '', bairro: '', descricao: '', consentimento: false };
    // When
    const errors = validateDenunciaForm(form);
    // Then
    assert.equal(errors.length, 4);
  });
});
