import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import type { Denuncia } from '@/types';
import { useRouter } from 'expo-router';
import { SITUACAO_CONFIG, type Situacao } from '@/constants';
import { colors } from '@/constants/theme';
import { parseImagens } from '@/utils/parseImagens';
import ScreenHeader from '@/components/ui/ScreenHeader';
import FiltroBar from '@/components/denuncia/FiltroBar';
import DenunciaCard from '@/components/denuncia/DenunciaCard';
import StatusPicker from '@/components/denuncia/StatusPicker';
import LoadingState from '@/components/feedback/LoadingState';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import OfflineBanner from '@/components/feedback/OfflineBanner';

export default function DenunciasGestorScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const {
    denuncias,
    loading,
    error,
    offline,
    cachedAt,
    fetchDenuncias,
    updateDenuncia,
    filtros,
    setFiltros,
    opcoes,
  } = useDenunciasStore();
  const [search, setSearch] = useState('');
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchDenuncias(); }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const filtered = denuncias.filter((denuncia) => {
    const query = search.toLowerCase();
    return !query ||
      denuncia.tipoDenuncia.toLowerCase().includes(query) ||
      denuncia.bairroOcorrencia.toLowerCase().includes(query) ||
      denuncia.protocolo.toLowerCase().includes(query) ||
      denuncia.nomeDenunciante.toLowerCase().includes(query);
  });

  const handleUpdateStatus = async (novaSituacao: Situacao) => {
    if (!selectedDenuncia) return;
    setUpdatingStatus(true);
    try {
      const response = await updateDenuncia(selectedDenuncia.id, { situacao: novaSituacao });
      if (response.success) {
        setSelectedDenuncia((denuncia) => denuncia ? { ...denuncia, situacao: novaSituacao } : denuncia);
        Toast.show({
          type: 'success',
          text1: 'Status atualizado!',
          text2: `Denúncia marcada como ${SITUACAO_CONFIG[novaSituacao].label}`,
        });
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao atualizar status' });
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderItem = ({ item }: { item: Denuncia }) => (
    <DenunciaCard
      denuncia={item}
      variant="manager"
      onPress={() => {
        setSelectedDenuncia(item);
        setShowDetail(true);
      }}
    />
  );

  const selectedImages = selectedDenuncia ? parseImagens(selectedDenuncia.imagens) : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        variant="simple"
        title="Denúncias Recentes"
        subtitle={`${filtered.length} de ${denuncias.length} denúncias`}
        style={styles.header}
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSubtitle}
        rightElement={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} accessibilityLabel="Sair">
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar denúncias..."
          placeholderTextColor={colors.gray}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <FiltroBar filtros={filtros} opcoes={opcoes} onChange={setFiltros} />

      {offline && cachedAt ? <OfflineBanner cachedAt={cachedAt} /> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        ListEmptyComponent={
          loading
            ? <LoadingState message="Carregando denúncias..." style={styles.emptyState} />
            : error
              ? <ErrorState title="Erro ao carregar denúncias" message={error} onRetry={fetchDenuncias} />
              : <EmptyState title="Nenhuma denúncia encontrada" style={styles.emptyState} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedDenuncia && (
          <SafeAreaView style={styles.detailContainer}>
            <ScreenHeader
              variant="simple"
              title="Detalhes da Denúncia"
              style={styles.detailHeader}
              titleStyle={styles.detailTitle}
              leftElement={
                <TouchableOpacity onPress={() => setShowDetail(false)} accessibilityLabel="Fechar">
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              }
              rightElement={<View style={styles.headerSpacer} />}
            />
            <ScrollView contentContainerStyle={styles.detailContent}>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Protocolo</Text>
                <Text style={styles.detailProtocol}>#{selectedDenuncia.protocolo}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Tipo</Text>
                <Text style={styles.detailValue}>{selectedDenuncia.tipoDenuncia}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Denunciante</Text>
                <Text style={styles.detailValue}>
                  {selectedDenuncia.identificacao ? selectedDenuncia.nomeDenunciante : 'Anônimo'}
                </Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Bairro</Text>
                <Text style={styles.detailValue}>{selectedDenuncia.bairroOcorrencia}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Descrição</Text>
                <Text style={styles.detailValue}>{selectedDenuncia.descricaoOcorrencia}</Text>
              </View>
              {selectedImages.length > 0 && (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Imagens</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    <View style={styles.imageList}>
                      {selectedImages.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.detailImage} resizeMode="cover" />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              <StatusPicker
                situacao={selectedDenuncia.situacao}
                updating={updatingStatus}
                onChange={handleUpdateStatus}
              />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingBottom: 14 },
  headerTitle: { fontSize: 20 },
  headerSubtitle: { color: colors.gray },
  logoutButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTint, alignItems: 'center', justifyContent: 'center' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginBottom: 8, backgroundColor: colors.surface,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.inputText },
  listContent: { padding: 16, gap: 12 },
  emptyState: { paddingVertical: 60 },
  detailContainer: { flex: 1, backgroundColor: colors.background },
  detailHeader: { paddingBottom: 20 },
  detailTitle: { fontSize: 17, textAlign: 'center' },
  headerSpacer: { width: 24 },
  detailContent: { padding: 20, gap: 16 },
  detailCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  detailLabel: { fontSize: 12, fontWeight: '700', color: colors.gray, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: colors.primaryDark },
  detailProtocol: { fontSize: 20, fontWeight: '800', color: colors.primary },
  imageScroll: { marginTop: 10 },
  imageList: { flexDirection: 'row', gap: 10 },
  detailImage: { width: 140, height: 140, borderRadius: 12 },
});
