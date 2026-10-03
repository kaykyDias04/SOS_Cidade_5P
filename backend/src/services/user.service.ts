import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      email: data.email,
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
