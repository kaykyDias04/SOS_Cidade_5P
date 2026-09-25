import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    if (typeof data.password !== 'string' || data.password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'DENUNCIANTE'
    });
  }

  async getUsersByRole(role: string) {
    return this.userRepository.findByRole(role);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
