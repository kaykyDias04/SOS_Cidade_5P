import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { normalizeSituacao, SITUACAO_CONFIG } from '@/constants';

interface StatusBadgeProps {
  situacao: string;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function StatusBadge({
  situacao,
  showIcon = true,
  style,
  textStyle,
}: StatusBadgeProps) {
  const config = SITUACAO_CONFIG[normalizeSituacao(situacao)];

  return (
    <View style={[styles.badge, showIcon && styles.badgeWithIcon, { backgroundColor: config.bg }, style]}>
      {showIcon && <Ionicons name={config.icon} size={12} color={config.text} />}
      <Text style={[styles.label, { color: config.text }, textStyle]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeWithIcon: { gap: 4, paddingHorizontal: 9, paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: '700' },
});
