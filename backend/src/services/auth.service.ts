import { UserRepository } from '../repositories/user.repository';
import { LEGAL_DOCUMENT_VERSION } from '../constants/legal';
import { JWT_SECRET } from '../config/env';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository = new UserRepository();

  async login(email: string, password: string, acceptedTerms: boolean, acceptedPrivacy: boolean) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    if (acceptedTerms !== true || acceptedPrivacy !== true) {
      const error = new Error('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
      Object.assign(error, { code: 'LEGAL_CONSENT_REQUIRED' });
      throw error;
    }

    await this.userRepository.recordLegalAcceptance(user.id, LEGAL_DOCUMENT_VERSION);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }
}
