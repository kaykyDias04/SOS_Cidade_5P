import { Request, Response } from 'express';
import { DenunciaService } from '../services/denuncia.service';
import { normalizarSituacao } from '../constants/situacao';

const ID_INVALIDO = { success: false, error: 'ID inválido' };

// id precisa ser inteiro positivo; parseInt aceitaria "12abc".
function lerId(valor: unknown): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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
      const user = (req as any).user;
      const id = lerId(req.params.id);
      if (id === null) return res.status(400).json(ID_INVALIDO);

      const denuncia = await this.denunciaService.getDenunciaById(id);

      // 404 (e não 403) também quando a denúncia é de outra pessoa: não revela que o ID existe.
      if (!denuncia || (user?.role !== 'GESTOR' && denuncia.userId !== user?.id)) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const body = req.body ?? {};
      // Só estes campos vêm do cliente. protocolo, situacao, createdAt e updatedAt são do servidor;
      // userId e userEmail vêm só do token.
      const data = {
        tipoDenuncia: body.tipoDenuncia,
        bairroOcorrencia: body.bairroOcorrencia,
        descricaoOcorrencia: body.descricaoOcorrencia,
        dataOcorrencia: body.dataOcorrencia,
        identificacao: body.identificacao,
        nomeDenunciante: body.nomeDenunciante,
        imagens: body.imagens,
        userId: user.id,
        userEmail: user.email,
      };
      const denuncia = await this.denunciaService.createDenuncia(data);
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = lerId(req.params.id);
      if (id === null) return res.status(400).json(ID_INVALIDO);

      const situacao = normalizarSituacao(req.body?.situacao);
      if (situacao === null) {
        return res.status(400).json({ success: false, error: 'Situação inválida' });
      }

      const denuncia = await this.denunciaService.updateDenuncia(id, { situacao });
      res.json(denuncia);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = lerId(req.params.id);
      if (id === null) return res.status(400).json(ID_INVALIDO);

      await this.denunciaService.deleteDenuncia(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
