import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { getTipoColor, getTipoIcon } from '@/constants';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface TipoIconProps {
  tipo: string;
  icon?: IconName;
  size?: number;
  color?: string;
}

export default function TipoIcon({ tipo, icon, size = 18, color }: TipoIconProps) {
  return (
    <Ionicons
      name={icon ?? getTipoIcon(tipo)}
      size={size}
      color={color ?? getTipoColor(tipo)}
    />
  );
}
