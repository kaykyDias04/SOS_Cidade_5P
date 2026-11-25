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
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { normalizeSituacao, SITUACAO_CONFIG, SITUACOES, type Situacao } from '@/constants';
import DenunciaCard from '@/components/denuncia/DenunciaCard';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import OfflineBanner from '@/components/feedback/OfflineBanner';
import LoadingState from '@/components/feedback/LoadingState';
import { colors } from '@/constants/theme';

export default function MinhasDenunciasScreen() {
  const router = useRouter();
  const { denuncias, loading, error, offline, cachedAt, fetchDenuncias } = useDenunciasStore();
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<Situacao | null>(null);

  useEffect(() => {
    fetchDenuncias();
  }, []);

  const minhas = denuncias;

  const filtered = minhas.filter((d) => {
    const matchSearch =
      !search ||
      d.tipoDenuncia.toLowerCase().includes(search.toLowerCase()) ||
      d.bairroOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.protocolo.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = !filtroSituacao || normalizeSituacao(d.situacao) === filtroSituacao;
    return matchSearch && matchFiltro;
  });

  const getSituacao = (situacao: string) => SITUACAO_CONFIG[normalizeSituacao(situacao)];

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Denúncias</Text>
        <Text style={styles.headerSub}>{minhas.length} no total</Text>
      </View>


      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por tipo, bairro ou protocolo..."
          placeholderTextColor={colors.gray}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar denúncias"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
        style={{ flexGrow: 0, flexShrink: 0, height: 40, marginBottom: 8 }}
      >
        {([null, ...SITUACOES] as (Situacao | null)[]).map((s) => {
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


      {offline && cachedAt ? <OfflineBanner cachedAt={cachedAt} /> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <DenunciaCard
            denuncia={item}
            variant="list"
            onPress={() => router.push(`/detalhe-denuncia?id=${item.id}`)}
          />
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        ListEmptyComponent={() => {
          if (error) {
            return (
              <ErrorState
                title="Erro ao carregar denúncias"
                message={error}
                onRetry={fetchDenuncias}
              />
            );
          }
          if (loading) return <LoadingState message="Carregando denúncias..." />;
          return (
            <EmptyState
              title="Nenhuma denúncia encontrada"
              message={search ? 'Tente outros termos de busca' : 'Suas denúncias aparecerão aqui'}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.surface, padding: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.gray, marginTop: 2 },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginBottom: 8, backgroundColor: colors.surface,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.inputText },

  filtros: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8,
    flexWrap: 'nowrap', alignItems: 'center',
  },
  filtroChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  filtroChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroText: { fontSize: 12, fontWeight: '700', color: colors.grayDark },
  filtroTextActive: { color: colors.surface },
});
