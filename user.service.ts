import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { MIN_PASSWORD_LENGTH } from '../schemas/common';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    if (!data.password || data.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      // minúsculas: o login também normaliza o e-mail, e a busca no banco diferencia maiúsculas
      email: String(data.email ?? '').trim().toLowerCase(),
      name: data.name,
      password: hashedPassword,
      role: 'DENUNCIANTE'
    });
  }

  async getUsersByRole(role: string) {
    return this.userRepository.findByRole(role);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
