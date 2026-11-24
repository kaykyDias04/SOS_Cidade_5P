import { Request, Response } from 'express';
import { DenunciaService } from '../services/denuncia.service';

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export class DenunciaController {
  private denunciaService = new DenunciaService();

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 50;
      const filtros = {
        tipoDenuncia: queryString(req.query.tipoDenuncia),
        bairroOcorrencia: queryString(req.query.bairroOcorrencia),
        situacao: queryString(req.query.situacao),
      };
      const result = await this.denunciaService.getDenuncias(page, limit, undefined, filtros);
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
      const user = (req as any).user;
      const denuncia = await this.denunciaService.getDenunciaById(id, user);
      if (!denuncia) return res.status(404).json({ success: false, error: 'Not found' });
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const data = {
        ...req.body,
        userId: user.id,
        userEmail: user.email,
        nomeDenunciante: user.name || user.email,
      };
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
