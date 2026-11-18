import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type TipoDenuncia = {
  label: string;
  icon: IconName;
  emoji: string;
  color: string;
};

export const TIPOS_DENUNCIA: TipoDenuncia[] = [
  { label: 'Foco de Dengue', icon: 'bug-outline', emoji: '🦟', color: '#EF4444' },
  { label: 'Iluminação Pública', icon: 'bulb-outline', emoji: '💡', color: '#F59E0B' },
  { label: "Falta D'água", icon: 'water-outline', emoji: '💧', color: '#3B82F6' },
  { label: 'Alagamento', icon: 'thunderstorm-outline', emoji: '🌊', color: '#6366F1' },
  { label: 'Descarte Irregular de Lixo', icon: 'trash-outline', emoji: '🗑️', color: '#10B981' },
  { label: 'Buraco na Via', icon: 'warning-outline', emoji: '⚠️', color: '#92400E' },
  { label: 'Outro', icon: 'help-circle-outline', emoji: '📋', color: '#6b7280' },
];

export function getTipoColor(label: string): string {
  return TIPOS_DENUNCIA.find((tipo) => tipo.label === label)?.color ?? '#6b7280';
}

export function getTipoIcon(label: string): IconName {
  return TIPOS_DENUNCIA.find((tipo) => tipo.label === label)?.icon ?? 'help-circle-outline';
}
