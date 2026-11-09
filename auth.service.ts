import { UserRepository } from '../repositories/user.repository';
import { JWT_SECRET } from '../config/env';
import { clearAttempts, getLockStatus, registerFailure } from '../lib/loginAttempts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const MENSAGEM_CREDENCIAIS_INVALIDAS = 'Credenciais inválidas';

// Hash fixo (custo 10, o mesmo dos usuários reais) usado quando o e-mail não existe:
// o bcrypt.compare roda do mesmo jeito e o tempo de resposta não revela quais contas existem.
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-igualar-o-tempo-de-resposta', 10);

export class LoginLockedError extends Error {
  readonly code = 'LOGIN_LOCKED';

  constructor(public readonly retryAfterSeconds: number) {
    super('LOGIN_LOCKED');
    this.name = 'LoginLockedError';
  }
}

export class AuthService {
  private userRepository = new UserRepository();

  async login(emailBruto: string, senha: string) {
    const email = String(emailBruto ?? '').trim().toLowerCase();
    const password = typeof senha === 'string' ? senha : '';

    // Antes de qualquer bcrypt: conta bloqueada não gasta CPU nem testa senha.
    const bloqueio = await getLockStatus(email);
    if (bloqueio.locked) {
      throw new LoginLockedError(bloqueio.retryAfterSeconds);
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await bcrypt.compare(password, HASH_FALSO);
      await registerFailure(email, 'DENUNCIANTE');
      throw new Error(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await registerFailure(email, user.role);
      throw new Error(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    await clearAttempts(email);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }
}
