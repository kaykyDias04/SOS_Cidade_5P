import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { normalizeSituacao } from '@/constants';
import DenunciaCard from '@/components/denuncia/DenunciaCard';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import OfflineBanner from '@/components/feedback/OfflineBanner';
import LoadingState from '@/components/feedback/LoadingState';
import FiltroBar from '@/components/denuncia/FiltroBar';
import { colors } from '@/constants/theme';

export default function MinhasDenunciasScreen() {
  const router = useRouter();
  const {
    denuncias,
    loading,
    error,
    offline,
    cachedAt,
    fetchDenuncias,
    filtros,
    setFiltros,
    opcoes,
  } = useDenunciasStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDenuncias();
  }, []);

  const minhas = denuncias;

  const filtered = minhas.filter((d) => {
    const matchSearch =
      !search ||
      d.tipoDenuncia.toLowerCase().includes(search.toLowerCase()) ||
      d.bairroOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.protocolo.toLowerCase().includes(search.toLowerCase()) ||
      d.descricaoOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.dataOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.situacao.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = !filtros.situacao ||
      normalizeSituacao(d.situacao) === normalizeSituacao(filtros.situacao);
    return matchSearch && matchFiltro;
  });

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


      <FiltroBar filtros={filtros} opcoes={opcoes} onChange={setFiltros} />


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

});
