import { normalizeSituacao, SITUACAO_FINALIZADA, SITUACAO_INICIAL } from '@/constants';
import type { Situacao } from '@/constants';
import type { Denuncia } from '@/types';

export interface ContagemTipo {
  label: string;
  value: number;
}

export function contarDenuncias(denuncias: Denuncia[]): number {
  return denuncias.length;
}

export function contarPorSituacao(denuncias: Denuncia[]): Record<Situacao, number> {
  const contagem: Record<Situacao, number> = {
    [SITUACAO_INICIAL]: 0,
    [SITUACAO_FINALIZADA]: 0,
  };

  denuncias.forEach((denuncia) => {
    contagem[normalizeSituacao(denuncia.situacao)] += 1;
  });

  return contagem;
}

export function contarPorTipo(denuncias: Denuncia[]): ContagemTipo[] {
  const contagem = denuncias.reduce<Record<string, number>>((acc, denuncia) => {
    acc[denuncia.tipoDenuncia] = (acc[denuncia.tipoDenuncia] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function calcularTempoMedioAtendimentoHoras(denuncias: Denuncia[]): number | null {
  const duracoes = denuncias
    .filter((denuncia) =>
      normalizeSituacao(denuncia.situacao) === SITUACAO_FINALIZADA &&
      denuncia.createdAt &&
      denuncia.updatedAt
    )
    .map((denuncia) => new Date(denuncia.updatedAt).getTime() - new Date(denuncia.createdAt).getTime())
    .filter((duracao) => duracao >= 0);

  if (duracoes.length === 0) return null;
  return duracoes.reduce((total, duracao) => total + duracao, 0) / duracoes.length / 3600000;
}
