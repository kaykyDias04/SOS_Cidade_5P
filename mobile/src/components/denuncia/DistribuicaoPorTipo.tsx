import { Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

export interface TipoDistribuicao {
  label: string;
  value: number;
  color: string;
}

interface DistribuicaoPorTipoProps {
  data: TipoDistribuicao[];
}

export default function DistribuicaoPorTipo({ data }: DistribuicaoPorTipoProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.chart}>
      {data.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(item.value / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 90, fontSize: 11, color: '#4b5563', fontWeight: '600' },
  track: { flex: 1, height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  value: { width: 28, fontSize: 12, fontWeight: '700', color: colors.primaryDark, textAlign: 'right' },
});
