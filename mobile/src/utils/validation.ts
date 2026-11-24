/**
 * Validação de formulários em um único lugar. Cada função devolve um objeto de erros
 * (vazio quando está tudo certo). As telas só chamam estas funções, sem repetir regra.
 */

export type FormErrors<K extends string> = Partial<Record<K, string>>;

const EMAIL_REGEX = /\S+@\S+\.\S+/;

export const SENHA_MIN = 6;
export const DESCRICAO_MIN = 10;
export const MSG_ACEITE_LEGAL = 'Confirme a leitura e aceite os documentos para continuar.';

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}

export function validarEmail(email: string): string | undefined {
  if (!email.trim()) return 'E-mail obrigatório';
  if (!EMAIL_REGEX.test(email)) return 'E-mail inválido';
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  if (!senha.trim()) return 'Senha obrigatória';
  if (senha.length < SENHA_MIN) return `Mínimo ${SENHA_MIN} caracteres`;
  return undefined;
}

function validarNome(nome: string, mensagem: string): string | undefined {
  return nome.trim() ? undefined : mensagem;
}

function semUndefined<K extends string>(errors: FormErrors<K>): FormErrors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as FormErrors<K>;
}

export type LoginErrors = FormErrors<'email' | 'password' | 'legal'>;

export function validarLogin(input: {
  email: string;
  password: string;
  acceptedLegal: boolean;
}): LoginErrors {
  return semUndefined<'email' | 'password' | 'legal'>({
    email: validarEmail(input.email),
    password: validarSenha(input.password),
    legal: input.acceptedLegal ? undefined : MSG_ACEITE_LEGAL,
  });
}

export type CadastroErrors = FormErrors<'name' | 'email' | 'password' | 'confirmPassword' | 'legal'>;

export function validarCadastro(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedLegal: boolean;
}): CadastroErrors {
  return semUndefined<'name' | 'email' | 'password' | 'confirmPassword' | 'legal'>({
    name: validarNome(input.name, 'Nome completo é obrigatório'),
    email: validarEmail(input.email),
    password: validarSenha(input.password),
    confirmPassword: input.password !== input.confirmPassword ? 'As senhas não coincidem' : undefined,
    legal: input.acceptedLegal ? undefined : MSG_ACEITE_LEGAL,
  });
}

export type GestorErrors = FormErrors<'nome' | 'email' | 'senha'>;

export function validarGestor(input: { nome: string; email: string; senha: string }): GestorErrors {
  return semUndefined<'nome' | 'email' | 'senha'>({
    nome: validarNome(input.nome, 'Nome obrigatório'),
    email: validarEmail(input.email),
    senha: validarSenha(input.senha),
  });
}

export type DenunciaErrors = FormErrors<'tipo' | 'bairro' | 'descricao'>;

export function validarDenuncia(input: {
  tipoDenuncia: string;
  bairro: string;
  descricao: string;
}): DenunciaErrors {
  return semUndefined<'tipo' | 'bairro' | 'descricao'>({
    tipo: input.tipoDenuncia ? undefined : 'Selecione um tipo',
    bairro: input.bairro.trim() ? undefined : 'Selecione o bairro',
    descricao:
      input.descricao.trim().length >= DESCRICAO_MIN
        ? undefined
        : `Descreva com ao menos ${DESCRICAO_MIN} caracteres`,
  });
}
