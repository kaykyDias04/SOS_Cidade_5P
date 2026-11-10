import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { redisKeys, redisDel } from '../lib/redis';
import { encrypt } from '../lib/crypto';

const SITUACAO_CONCLUIDA = 'Finalizada';

export const startCronJobs = () => {
  
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Cleaning up old redis cache...');
    const keys = await redisKeys('denuncias:*');
    await redisDel(...keys);
  });

  
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Consolidating daily metrics...');
    const count = await prisma.denuncia.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0,0,0,0) - 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`[CRON] Total denuncias created yesterday: ${count}`);
  });

  cron.schedule('0 4 * * 0', async () => {
    try {
      const retentionCutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const result = await prisma.denuncia.updateMany({
        where: {
          situacao: SITUACAO_CONCLUIDA,
          identificacao: true,
          updatedAt: { lt: retentionCutoff },
        },
        data: {
          nomeDenunciante: encrypt('Anônimo (expurgado por retenção)'),
          identificacao: false,
          imagens: null,
        },
      });

      if (result.count > 0) {
        const keys = await redisKeys('denuncias:*');
        if (keys.length > 0) {
          await redisDel(...keys);
        }
      }

      console.log(`[CRON] Denúncias anonimizadas por retenção: ${result.count}`);
    } catch (error) {
      console.error('[CRON] Erro no job semanal de retenção:', error instanceof Error ? error.message : 'Unknown error');
    }
  });
};