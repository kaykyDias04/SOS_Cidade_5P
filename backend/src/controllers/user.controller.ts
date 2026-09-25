import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  async create(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      console.error('Error creating user:', error?.message || 'Unknown error');
      
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          success: false, 
          error: 'Este email já está cadastrado.' 
        });
      }

      if (error instanceof Error && error.message === 'A senha deve ter no mínimo 6 caracteres.') {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const role = req.query.role as string;
      const users = role ? await this.userService.getUsersByRole(role) : [];
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', (error as { message?: string } | null | undefined)?.message || 'Unknown error');
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID inválido' });
      }
      
      await this.userService.deleteUser(id);
      res.json({ success: true, message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Error deleting user:', (error as { message?: string } | null | undefined)?.message || 'Unknown error');
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }
}
