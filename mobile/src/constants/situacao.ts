import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const SITUACAO_INICIAL = 'Em Andamento' as const;
export const SITUACAO_FINALIZADA = 'Finalizada' as const;

export type Situacao = typeof SITUACAO_INICIAL | typeof SITUACAO_FINALIZADA;

export const SITUACOES: Situacao[] = [SITUACAO_INICIAL, SITUACAO_FINALIZADA];

export const SITUACAO_CONFIG: Record<
  Situacao,
  { label: string; bg: string; text: string; color: string; icon: IconName }
> = {
  [SITUACAO_INICIAL]: {
    label: SITUACAO_INICIAL,
    bg: '#DBEAFE',
    text: '#1E40AF',
    color: '#3B82F6',
    icon: 'refresh-outline',
  },
  [SITUACAO_FINALIZADA]: {
    label: SITUACAO_FINALIZADA,
    bg: '#D1FAE5',
    text: '#065F46',
    color: '#10B981',
    icon: 'checkmark-circle-outline',
  },
};

export function normalizeSituacao(raw: string): Situacao {
  const normalized = raw.trim().toLocaleLowerCase().replace(/[\s_-]+/g, '');

  if (['finalizada', 'finalizado', 'resolvida', 'resolvido'].includes(normalized)) {
    return SITUACAO_FINALIZADA;
  }
  if (normalized === 'emandamento') {
    return SITUACAO_INICIAL;
  }

  return SITUACAO_INICIAL;
}
