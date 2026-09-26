import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDenunciasStore } from '@/store/useDenunciasStore';

const { width } = Dimensions.get('window');

const SITUACAO_COLORS: Record<string, string> = {
  EM_ANDAMENTO: '#3B82F6',
  RESOLVIDO: '#10B981',
};

const TIPO_ICONS: Record<string, string> = {
  'Foco de Dengue': '🦟',
  'Iluminação Pública': '💡',
  "Falta D'água": '💧',
  'Alagamento': '🌊',
  'Descarte Irregular de Lixo': '🗑️',
  'Buraco na Via': '⚠️',
  'Outro': '📋',
};

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.barChart}>
      {data.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(item.value / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View style={styles.donut}>
      <View style={styles.donutCircle}>
        <Text style={styles.donutTotal}>{total}</Text>
        <Text style={styles.donutLabel}>Total</Text>
      </View>
      <View style={styles.donutLegend}>
        {data.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{item.value} ({Math.round((item.value / total) * 100)}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { denuncias, loading, fetchDenuncias } = useDenunciasStore();

  useEffect(() => { fetchDenuncias(); }, []);

  const stats = useMemo(() => {
    const total = denuncias.length;
    const emAndamento = denuncias.filter((d) => {
      const s = d.situacao?.toLowerCase();
      return s === 'em andamento' || s === 'em_andamento';
    }).length;
    const resolvidos = denuncias.filter((d) => {
      const s = d.situacao?.toLowerCase();
      return s === 'resolvido';
    }).length;

    const porTipo = denuncias.reduce<Record<string, number>>((acc, d) => {
      acc[d.tipoDenuncia] = (acc[d.tipoDenuncia] || 0) + 1;
      return acc;
    }, {});

    const tipoData = Object.entries(porTipo)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([label, value], i) => ({
        label,
        value,
        color: ['#6498c9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i],
      }));

    const situacaoData = [
      { label: 'Em Andamento', value: emAndamento, color: SITUACAO_COLORS.EM_ANDAMENTO },
      { label: 'Resolvido', value: resolvidos, color: SITUACAO_COLORS.RESOLVIDO },
    ];

    return { total, emAndamento, resolvidos, tipoData, situacaoData };
  }, [denuncias]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Visão geral das ocorrências</Text>
        </View>


        <View style={styles.statsGrid}>
          <StatCard title="Total" value={stats.total} icon="document-text-outline" color="#6498c9" />
          <StatCard title="Em Andamento" value={stats.emAndamento} icon="refresh-outline" color="#3B82F6" />
          <StatCard title="Resolvidos" value={stats.resolvidos} icon="checkmark-circle-outline" color="#10B981" />
        </View>


        {stats.total > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Taxa de Resolução</Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, {
                  width: `${Math.round((stats.resolvidos / stats.total) * 100)}%`,
                  backgroundColor: '#10B981',
                }]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {Math.round((stats.resolvidos / stats.total) * 100)}% das denúncias resolvidas
            </Text>
          </View>
        )}


        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Situação</Text>
          <DonutChart data={stats.situacaoData} />
        </View>


        <View style={styles.card}>
          <Text style={styles.cardTitle}>Por Tipo de Ocorrência</Text>
          <BarChart data={stats.tipoData} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  statsGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    width: (width - 44) / 2, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1e3a5f' },
  statTitle: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a5f', marginBottom: 16 },

  progressTrack: { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 13, color: '#6b7280' },


  donut: { gap: 16 },
  donutCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 12, borderColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  donutTotal: { fontSize: 24, fontWeight: '800', color: '#1e3a5f' },
  donutLabel: { fontSize: 11, color: '#9ca3af' },
  donutLegend: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '600' },
  legendValue: { fontSize: 13, color: '#6b7280' },


  barChart: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 90, fontSize: 11, color: '#4b5563', fontWeight: '600' },
  barTrack: { flex: 1, height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  barValue: { width: 28, fontSize: 12, fontWeight: '700', color: '#1e3a5f', textAlign: 'right' },
});
