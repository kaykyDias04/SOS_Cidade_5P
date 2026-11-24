import {
  MSG_ACEITE_LEGAL,
  validarCadastro,
  validarDenuncia,
  validarGestor,
  validarLogin,
} from '../validation';

describe('validarLogin', () => {
  it('retorna mensagens exatas para e-mail e senha obrigatórios e aceite legal', () => {
    expect(validarLogin({ email: '', password: '', acceptedLegal: false })).toEqual({
      email: 'E-mail obrigatório',
      password: 'Senha obrigatória',
      legal: MSG_ACEITE_LEGAL,
    });
  });

  it('identifica e-mail inválido e senha curta', () => {
    expect(validarLogin({ email: 'email-invalido', password: '12345', acceptedLegal: true })).toEqual({
      email: 'E-mail inválido',
      password: 'Mínimo 6 caracteres',
    });
  });
});

describe('validarCadastro', () => {
  it('exige senha de confirmação igual à senha', () => {
    expect(validarCadastro({
      name: 'Ana Silva',
      email: 'ana@example.com',
      password: 'senha-segura',
      confirmPassword: 'outra-senha',
      acceptedLegal: true,
    })).toEqual({ confirmPassword: 'As senhas não coincidem' });
  });

  it('retorna erros de nome e campos obrigatórios', () => {
    expect(validarCadastro({
      name: ' ',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedLegal: false,
    })).toEqual({
      name: 'Nome completo é obrigatório',
      email: 'E-mail obrigatório',
      password: 'Senha obrigatória',
      legal: MSG_ACEITE_LEGAL,
    });
  });
});

describe('validarGestor', () => {
  it('valida nome, e-mail e senha com as mensagens esperadas', () => {
    expect(validarGestor({ nome: '', email: 'x', senha: '123' })).toEqual({
      nome: 'Nome obrigatório',
      email: 'E-mail inválido',
      senha: 'Mínimo 6 caracteres',
    });
  });
});

describe('validarDenuncia', () => {
  it('exige tipo, bairro e descrição mínima', () => {
    expect(validarDenuncia({ tipoDenuncia: '', bairro: ' ', descricao: 'curta' })).toEqual({
      tipo: 'Selecione um tipo',
      bairro: 'Selecione o bairro',
      descricao: 'Descreva com ao menos 10 caracteres',
    });
  });

  it('aceita uma denúncia completa', () => {
    expect(validarDenuncia({
      tipoDenuncia: 'Buraco',
      bairro: 'Boa Vista',
      descricao: 'Há um buraco grande na rua.',
    })).toEqual({});
  });
});
