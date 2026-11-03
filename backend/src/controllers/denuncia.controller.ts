import { Request, Response } from 'express';
import { DenunciaService } from '../services/denuncia.service';

export class DenunciaController {
  private denunciaService = new DenunciaService();

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 50;
      const result = await this.denunciaService.getDenuncias(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getMinhasDenuncias(req: Request, res: Response) {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 50;
      const userId = (req as any).user.id;
      const result = await this.denunciaService.getDenuncias(page, limit, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const denuncia = await this.denunciaService.getDenunciaById(id);
      if (!denuncia) return res.status(404).json({ success: false, error: 'Not found' });
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = { ...req.body, userId: user.id, userEmail: user.email };
      const denuncia = await this.denunciaService.createDenuncia(data);
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { situacao } = req.body;
      const denuncia = await this.denunciaService.updateDenuncia(id, { situacao });
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await this.denunciaService.deleteDenuncia(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
