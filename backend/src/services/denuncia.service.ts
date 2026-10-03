import { DenunciaRepository } from '../repositories/denuncia.repository';
import { redisGet, redisSet, redisDel, redisKeys } from '../lib/redis';
import { encrypt, decrypt } from '../lib/crypto';

export class DenunciaService {
  private denunciaRepository = new DenunciaRepository();

  // Deserializa o campo imagens de string JSON para array
  private parseImagens(d: any) {
    if (!d) return d;
    let parsed;
    try {
      parsed = { ...d, imagens: d.imagens ? JSON.parse(d.imagens) : null };
    } catch {
      parsed = { ...d, imagens: null };
    }

    if (typeof parsed.nomeDenunciante === 'string') {
      try {
        parsed.nomeDenunciante = decrypt(parsed.nomeDenunciante);
      } catch {
        parsed.nomeDenunciante = d.nomeDenunciante;
      }
    }

    return parsed;
  }

  async getDenuncias(page: number, limit: number, userId?: number) {
    const cacheKey = `denuncias:${userId ?? 'all'}:${page}:${limit}`;
    
    
    const cached = await redisGet(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error('[DenunciaService] Error parsing cache JSON:', err);
      }
    }

    try {
      const skip = (page - 1) * limit;
      const [denuncias, total] = await Promise.all([
        this.denunciaRepository.findAll(skip, limit, userId),
        this.denunciaRepository.count(userId)
      ]);

      const result = {
        data: (denuncias || []).map((d: any) => this.parseImagens(d)),
        meta: { total: total || 0, page, limit }
      };
      
      await redisSet(cacheKey, JSON.stringify(result), 60);
      return result;
    } catch (error) {
      console.error('[DenunciaService] Error fetching denuncias:', error);
      throw error;
    }
  }

  async getDenunciaById(id: number) {
    const d = await this.denunciaRepository.findById(id);
    return this.parseImagens(d);
  }

  async createDenuncia(data: any) {
    const protocolo = data.protocolo || ('SOS-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    const denuncia = await this.denunciaRepository.create({
      tipoDenuncia: data.tipoDenuncia,
      identificacao: data.identificacao,
      nomeDenunciante: encrypt(data.identificacao ? (data.nomeDenunciante || data.userEmail) : 'Anônimo'),
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      bairroOcorrencia: data.bairroOcorrencia,
      descricaoOcorrencia: data.descricaoOcorrencia,
      dataOcorrencia: data.dataOcorrencia,
      protocolo,
      situacao: data.situacao || 'Em Andamento',
      imagens: data.imagens ? JSON.stringify(data.imagens) : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });

    
    await this.clearCache();
    return this.parseImagens(denuncia);
  }

  async updateDenuncia(id: number, data: any) {
    const updateData = { ...data };
    if (updateData.imagens && Array.isArray(updateData.imagens)) {
      updateData.imagens = JSON.stringify(updateData.imagens);
    }
    const denuncia = await this.denunciaRepository.update(id, updateData);
    await this.clearCache();
    return this.parseImagens(denuncia);
  }

  async deleteDenuncia(id: number) {
    await this.denunciaRepository.delete(id);
    await this.clearCache();
  }

  private async clearCache() {
    const keys = await redisKeys('denuncias:*');
    await redisDel(...keys);
  }
}
