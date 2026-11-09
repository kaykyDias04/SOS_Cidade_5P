import { z } from 'zod';
import { normalizarSituacao } from '../constants/situacao';

const PREFIXOS_IMAGEM = ['data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,'];
const MAX_IMAGEM = 3 * 1024 * 1024; // 3 MB (tamanho da string data URL)

function diaExiste(ano: number, mes: number, dia: number) {
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

// Aceita ISO (AAAA-MM-DD, com hora opcional) e DD/MM/AAAA, que é o que o frontend web envia.
function dataValida(valor: string): boolean {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(valor);
  if (iso) return diaExiste(+iso[1], +iso[2], +iso[3]) && Number.isFinite(Date.parse(valor));
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (br) return diaExiste(+br[3], +br[2], +br[1]);
  return false;
}

const textoObrigatorio = (max: number, min = 1) =>
  z
    .string({ required_error: 'Campo obrigatório' })
    .trim()
    .min(min, min === 1 ? 'Campo obrigatório' : `Mínimo de ${min} caracteres`)
    .max(max, `Máximo de ${max} caracteres`);

// Campos desconhecidos (protocolo, situacao, createdAt, userId...) são descartados pelo
// z.object, que remove chaves fora do schema.
export const createDenunciaSchema = z.object({
  tipoDenuncia: textoObrigatorio(100),
  bairroOcorrencia: textoObrigatorio(100),
  descricaoOcorrencia: textoObrigatorio(2000, 10),
  identificacao: z.boolean({ required_error: 'Campo obrigatório', invalid_type_error: 'Deve ser verdadeiro ou falso' }),
  nomeDenunciante: z.string().trim().max(120, 'Máximo de 120 caracteres').nullish(),
  dataOcorrencia: z
    .string({ required_error: 'Campo obrigatório' })
    .trim()
    .max(40, 'Data inválida')
    .refine(dataValida, 'Data inválida'),
  imagens: z
    .array(
      z
        .string()
        .refine((s) => PREFIXOS_IMAGEM.some((p) => s.startsWith(p)), 'Formato de imagem não permitido')
        .refine((s) => s.length <= MAX_IMAGEM, 'Imagem maior que 3 MB'),
    )
    .max(4, 'Máximo de 4 imagens')
    .nullish(),
});

export const updateDenunciaSchema = z.object({
  situacao: z
    .string({ required_error: 'Campo obrigatório' })
    .refine((v) => normalizarSituacao(v) !== null, 'Situação inválida')
    .transform((v) => normalizarSituacao(v) as string),
});
