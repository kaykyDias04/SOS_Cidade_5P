import { Dimensions, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
const cardWidth = (Dimensions.get('window').width - 44) / 2;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: IconName;
  color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: cardWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  title: { fontSize: 12, color: colors.grayDark, fontWeight: '600' },
});
