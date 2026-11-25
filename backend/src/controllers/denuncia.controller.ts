import { Request, Response } from 'express';
import { DenunciaService } from '../services/denuncia.service';

function queryFilter(value: unknown): string | string[] | undefined {
  const values = (Array.isArray(value) ? value : [value])
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (values.length === 0) return undefined;
  return values.length === 1 ? values[0] : values;
}

export class DenunciaController {
  private denunciaService = new DenunciaService();

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query._page as string) || 1;
      const limit = parseInt(req.query._limit as string) || 50;
      const filtros = {
        tipoDenuncia: queryFilter(req.query.tipoDenuncia),
        bairroOcorrencia: queryFilter(req.query.bairroOcorrencia),
        situacao: queryFilter(req.query.situacao),
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
      const filtros = {
        tipoDenuncia: queryFilter(req.query.tipoDenuncia),
        bairroOcorrencia: queryFilter(req.query.bairroOcorrencia),
        situacao: queryFilter(req.query.situacao),
      };
      const result = await this.denunciaService.getDenuncias(page, limit, userId, filtros);
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
