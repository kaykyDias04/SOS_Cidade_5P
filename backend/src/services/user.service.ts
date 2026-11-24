import { UserRepository } from '../repositories/user.repository';
import { LEGAL_DOCUMENT_VERSION } from '../constants/legal';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository = new UserRepository();

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

  async getUsersByRole(role: string) {
    return this.userRepository.findByRole(role);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
