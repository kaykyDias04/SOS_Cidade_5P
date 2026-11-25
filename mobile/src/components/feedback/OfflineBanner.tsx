import { Text, View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { formatDateTime } from '@/utils/formatDate';

interface OfflineBannerProps {
  /** Quando os dados mostrados foram salvos (milissegundos). */
  cachedAt: number | null;
  style?: StyleProp<ViewStyle>;
}

export default function OfflineBanner({ cachedAt, style }: OfflineBannerProps) {
  const quando = cachedAt ? ` Dados salvos em ${formatDateTime(new Date(cachedAt).toISOString())}.` : '';
  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={18} color={colors.grayDark} />
      <Text style={styles.text}>{`Sem conexão.${quando}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  text: { flex: 1, fontSize: 12, color: colors.grayDark },
});
