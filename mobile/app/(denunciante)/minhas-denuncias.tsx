import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { Denuncia } from '@/lib/api';

const SITUACAO_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  'Em Andamento': { bg: '#DBEAFE', text: '#1E40AF', label: 'Em Andamento', icon: 'refresh-outline' },
  'Resolvido':    { bg: '#D1FAE5', text: '#065F46', label: 'Resolvido',    icon: 'checkmark-circle-outline' },
};

export default function MinhasDenunciasScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { denuncias, loading, fetchDenuncias } = useDenunciasStore();
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<string | null>(null);

  useEffect(() => {
    fetchDenuncias();
  }, []);

  const minhas = denuncias.filter((d) => d.userId === user?.id);

  const filtered = minhas.filter((d) => {
    const matchSearch =
      !search ||
      d.tipoDenuncia.toLowerCase().includes(search.toLowerCase()) ||
      d.bairroOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.protocolo.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = !filtroSituacao || d.situacao === filtroSituacao;
    return matchSearch && matchFiltro;
  });

  const getSituacao = (situacao: string) =>
    SITUACAO_CONFIG[situacao] || { bg: '#F3F4F6', text: '#374151', label: situacao, icon: 'help-outline' };

  const renderItem = ({ item }: { item: Denuncia }) => {
    const sit = getSituacao(item.situacao);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/detalhe-denuncia?id=${item.id}`)}
        accessibilityLabel={`Ver detalhes de ${item.tipoDenuncia}`}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={styles.tipoRow}>
            <View style={styles.tipoDot} />
            <Text style={styles.tipoText}>{item.tipoDenuncia}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sit.bg }]}>
            <Ionicons name={sit.icon as any} size={12} color={sit.text} />
            <Text style={[styles.badgeText, { color: sit.text }]}>{sit.label}</Text>
          </View>
        </View>

        <Text style={styles.descText} numberOfLines={3}>{item.descricaoOcorrencia}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={13} color="#9ca3af" />
            <Text style={styles.infoText}>{item.bairroOcorrencia}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
            <Text style={styles.infoText}>{new Date(item.dataOcorrencia).toLocaleDateString('pt-BR')}</Text>
          </View>
          <Text style={styles.protocoloText}>#{item.protocolo}</Text>
        </View>
        <View style={styles.verMaisRow}>
          <Text style={styles.verMaisText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={14} color="#6498c9" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Denúncias</Text>
        <Text style={styles.headerSub}>{minhas.length} no total</Text>
      </View>


      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por tipo, bairro ou protocolo..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar denúncias"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
        style={{ flexGrow: 0, flexShrink: 0, height: 40, marginBottom: 8 }}
      >
        {([null, 'Em Andamento', 'Resolvido'] as (string | null)[]).map((s) => {
          const active = filtroSituacao === s;
          const label = s ? getSituacao(s).label : 'Todas';
          return (
            <TouchableOpacity
              key={String(s)}
              style={[styles.filtroChip, active && styles.filtroChipActive]}
              onPress={() => setFiltroSituacao(s)}
              accessibilityLabel={`Filtrar ${label}`}
            >
              <Text style={[styles.filtroText, active && styles.filtroTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>


      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Nenhuma denúncia encontrada</Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Tente outros termos de busca' : 'Suas denúncias aparecerão aqui'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    backgroundColor: '#fff', padding: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginBottom: 8, backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  filtros: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8,
    flexWrap: 'nowrap', alignItems: 'center',
  },
  filtroChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  filtroChipActive: { backgroundColor: '#6498c9', borderColor: '#6498c9' },
  filtroText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  filtroTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#f0f4f8',
  },
  verMaisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 10 },
  verMaisText: { fontSize: 12, color: '#6498c9', fontWeight: '700' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tipoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  tipoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6498c9' },
  tipoText: { fontSize: 14, fontWeight: '800', color: '#1e3a5f', flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  descText: { fontSize: 13, color: '#4b5563', lineHeight: 19, marginBottom: 12 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  infoText: { fontSize: 12, color: '#9ca3af' },
  protocoloText: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginLeft: 'auto' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#6b7280' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },
});
