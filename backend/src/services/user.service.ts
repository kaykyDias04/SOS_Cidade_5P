import { UserRepository } from '../repositories/user.repository';
import { LEGAL_DOCUMENT_VERSION } from '../constants/legal';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository = new UserRepository();

  private validationError(message: string) {
    return Object.assign(new Error(message), { code: 'VALIDATION_ERROR' });
  }

  async createUser(data: any) {
    if (data.acceptedTerms !== true || data.acceptedPrivacy !== true) {
      const error = new Error('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
      Object.assign(error, { code: 'LEGAL_CONSENT_REQUIRED' });
      throw error;
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const acceptedAt = new Date();
    return this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: 'DENUNCIANTE',
      termsAcceptedAt: acceptedAt,
      privacyAcceptedAt: acceptedAt,
      termsVersion: LEGAL_DOCUMENT_VERSION,
      privacyVersion: LEGAL_DOCUMENT_VERSION,
    });
  }

  async createGestor(data: any) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    const password = typeof data.password === 'string' ? data.password : '';

    if (name.length < 2) {
      throw this.validationError('O nome deve ter no mínimo 2 caracteres.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw this.validationError('Informe um e-mail válido.');
    }
    if (password.length < 6) {
      throw this.validationError('A senha deve ter no mínimo 6 caracteres.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'GESTOR',
    });
  }

  async getUsersByRole(role: string) {
    return this.userRepository.findByRole(role);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
