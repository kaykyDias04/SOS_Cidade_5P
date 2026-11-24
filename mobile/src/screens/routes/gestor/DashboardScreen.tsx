import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import {
  SITUACAO_CONFIG,
  SITUACAO_FINALIZADA,
  SITUACAO_INICIAL,
} from '@/constants';
import { colors } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StatCard from '@/components/ui/StatCard';
import DistribuicaoPorTipo from '@/components/denuncia/DistribuicaoPorTipo';
import {
  calcularTempoMedioAtendimentoHoras,
  contarDenuncias,
  contarPorSituacao,
  contarPorTipo,
} from '@/utils/metricas';

const TIPO_COLORS = ['#6498c9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <View style={styles.donut}>
      <View style={styles.donutCircle}>
        <Text style={styles.donutTotal}>{total}</Text>
        <Text style={styles.donutLabel}>Total</Text>
      </View>
      <View style={styles.donutLegend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { denuncias, loading, fetchDenuncias, limparFiltros } = useDenunciasStore();

  useEffect(() => { limparFiltros(); }, []);

  const stats = useMemo(() => {
    const situacoes = contarPorSituacao(denuncias);
    const horas = calcularTempoMedioAtendimentoHoras(denuncias);
    const tempoMedio = horas === null ? '—' : horas >= 24 ? `${(horas / 24).toFixed(1)} d` : `${horas.toFixed(1)} h`;
    return {
      total: contarDenuncias(denuncias),
      emAndamento: situacoes[SITUACAO_INICIAL],
      resolvidos: situacoes[SITUACAO_FINALIZADA],
      tempoMedio,
      tipoData: contarPorTipo(denuncias)
        .slice(0, 6)
        .map((item, index) => ({ ...item, color: TIPO_COLORS[index] })),
      situacaoData: [
        {
          label: SITUACAO_CONFIG[SITUACAO_INICIAL].label,
          value: situacoes[SITUACAO_INICIAL],
          color: SITUACAO_CONFIG[SITUACAO_INICIAL].color,
        },
        {
          label: SITUACAO_CONFIG[SITUACAO_FINALIZADA].label,
          value: situacoes[SITUACAO_FINALIZADA],
          color: SITUACAO_CONFIG[SITUACAO_FINALIZADA].color,
        },
      ],
    };
  }, [denuncias]);

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolvidos / stats.total) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader variant="simple" title="Dashboard" subtitle="Visão geral das ocorrências" />

        <View style={styles.statsGrid}>
          <StatCard title="Total" value={stats.total} icon="document-text-outline" color="#6498c9" />
          <StatCard title="Em Andamento" value={stats.emAndamento} icon="refresh-outline" color={SITUACAO_CONFIG[SITUACAO_INICIAL].color} />
          <StatCard title="Resolvidos" value={stats.resolvidos} icon="checkmark-circle-outline" color={SITUACAO_CONFIG[SITUACAO_FINALIZADA].color} />
          <StatCard title="Tempo médio" value={stats.tempoMedio} icon="time-outline" color="#F59E0B" />
        </View>

        {stats.total > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Taxa de Resolução</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${resolutionRate}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{resolutionRate}% das denúncias resolvidas</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Situação</Text>
          <DonutChart data={stats.situacaoData} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Tipo de Ocorrência</Text>
          <DistribuicaoPorTipo data={stats.tipoData} />
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statsGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 16 },
  progressTrack: { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#10B981' },
  progressLabel: { fontSize: 13, color: colors.grayDark },
  donut: { gap: 16 },
  donutCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 12, borderColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  donutTotal: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  donutLabel: { fontSize: 11, color: colors.grayLight },
  donutLegend: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  legendValue: { fontSize: 13, color: colors.grayDark },
  bottomSpace: { height: 20 },
});
