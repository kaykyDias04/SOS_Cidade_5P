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
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { denunciasAPI, Denuncia } from '@/lib/api';
import { useRouter } from 'expo-router';


const SITUACOES = ['Em Andamento', 'Resolvido'];

const SITUACAO_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  'Em Andamento': { bg: '#DBEAFE', text: '#1E40AF', label: 'Em Andamento' },
  'Resolvido':    { bg: '#D1FAE5', text: '#065F46', label: 'Resolvido' },
};

function getSit(s: string) {
  return SITUACAO_CONFIG[s] || { bg: '#F3F4F6', text: '#374151', label: s };
}

function parseImagens(imagens: any): string[] {
  if (!imagens) return [];
  if (Array.isArray(imagens)) return imagens;
  try { return JSON.parse(imagens); } catch { return []; }
}

export default function DenunciasGestorScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { denuncias, loading, fetchDenuncias, updateDenunciaLocalmente } = useDenunciasStore();

  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<string | null>(null);
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchDenuncias(); }, []);

  const handleLogout = async () => { await logout(); router.replace('/'); };

  const filtered = denuncias.filter((d) => {
    const matchSearch =
      !search ||
      d.tipoDenuncia.toLowerCase().includes(search.toLowerCase()) ||
      d.bairroOcorrencia.toLowerCase().includes(search.toLowerCase()) ||
      d.protocolo.toLowerCase().includes(search.toLowerCase()) ||
      d.nomeDenunciante.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = !filtroSituacao || d.situacao === filtroSituacao;
    return matchSearch && matchFiltro;
  });

  const handleUpdateStatus = async (novaSituacao: string) => {
    if (!selectedDenuncia) return;
    setUpdatingStatus(true);
    try {
      const res = await denunciasAPI.update(selectedDenuncia.id, { situacao: novaSituacao });
      if (res.success) {
        updateDenunciaLocalmente(selectedDenuncia.protocolo, novaSituacao);
        setSelectedDenuncia((d) => d ? { ...d, situacao: novaSituacao } : d);
        Toast.show({ type: 'success', text1: 'Status atualizado!', text2: `Denúncia marcada como ${SITUACAO_CONFIG[novaSituacao]?.label ?? novaSituacao}` });
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao atualizar status' });
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderItem = ({ item }: { item: Denuncia }) => {
    const sit = getSit(item.situacao);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => { setSelectedDenuncia(item); setShowDetail(true); }}
        accessibilityLabel={`Ver denúncia ${item.tipoDenuncia}`}
      >
        <View style={styles.cardTop}>
          <Text style={styles.tipoText}>{item.tipoDenuncia}</Text>
          <View style={[styles.badge, { backgroundColor: sit.bg }]}>
            <Text style={[styles.badgeText, { color: sit.text }]}>{sit.label}</Text>
          </View>
        </View>
        <Text style={styles.descText} numberOfLines={2}>{item.descricaoOcorrencia}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{item.identificacao ? item.nomeDenunciante : 'Anônimo'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="#9ca3af" />
            <Text style={styles.metaText}>{item.bairroOcorrencia}</Text>
          </View>
          <Text style={styles.protocoloText}>#{item.protocolo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Denúncias Recentes</Text>
          <Text style={styles.headerSub}>{filtered.length} de {denuncias.length} denúncias</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} accessibilityLabel="Sair">
          <Ionicons name="log-out-outline" size={22} color="#6498c9" />
        </TouchableOpacity>
      </View>


      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar denúncias..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Buscar"
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
        {[null, ...SITUACOES].map((s) => {
          const active = filtroSituacao === s;
          const label = s ? getSit(s).label : 'Todas';
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
          </View>
        }
        showsVerticalScrollIndicator={false}
      />


      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        {selectedDenuncia && (() => {
          const imgs = parseImagens(selectedDenuncia.imagens);
          return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
              <View style={styles.detailHeader}>
                <TouchableOpacity onPress={() => setShowDetail(false)} accessibilityLabel="Fechar">
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.detailTitle}>Detalhes da Denúncia</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Protocolo</Text>
                  <Text style={styles.detailProtocolo}>#{selectedDenuncia.protocolo}</Text>
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


                {imgs.length > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Imagens</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        {imgs.map((uri, idx) => (
                          <Image
                            key={idx}
                            source={{ uri }}
                            style={styles.detailImage}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}


                <Text style={styles.detailLabel}>Alterar Status</Text>
                <View style={{ gap: 8 }}>
                  {SITUACOES.map((s) => {
                    const cfg = getSit(s);
                    const current = selectedDenuncia.situacao === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusBtn, current && styles.statusBtnActive, { borderColor: cfg.text }]}
                        onPress={() => handleUpdateStatus(s)}
                        disabled={current || updatingStatus}
                        accessibilityLabel={`Marcar como ${cfg.label}`}
                      >
                        {updatingStatus && current
                          ? <ActivityIndicator size="small" color={cfg.text} />
                          : <Text style={[styles.statusBtnText, { color: current ? '#fff' : cfg.text }]}>
                              {cfg.label} {current ? '✓' : ''}
                            </Text>
                        }
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </SafeAreaView>
          );
        })()}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, marginBottom: 8, backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  filtros: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  filtroChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  filtroChipActive: { backgroundColor: '#6498c9', borderColor: '#6498c9' },
  filtroText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  filtroTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tipoText: { fontSize: 14, fontWeight: '800', color: '#1e3a5f', flex: 1, marginRight: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  descText: { fontSize: 13, color: '#4b5563', lineHeight: 19, marginBottom: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#9ca3af' },
  protocoloText: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginLeft: 'auto' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#6b7280' },

  detailHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  detailTitle: { fontSize: 17, fontWeight: '800', color: '#1e3a5f' },
  detailCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: '#1e3a5f' },
  detailProtocolo: { fontSize: 20, fontWeight: '800', color: '#6498c9' },
  detailImage: { width: 140, height: 140, borderRadius: 12 },

  statusBtn: {
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 2, alignItems: 'center', backgroundColor: '#fff',
  },
  statusBtnActive: { backgroundColor: '#6498c9', borderColor: '#6498c9' },
  statusBtnText: { fontSize: 14, fontWeight: '700' },
});
