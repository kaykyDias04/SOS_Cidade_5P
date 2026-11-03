import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';

const SITUACAO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDENTE: { bg: '#FEF3C7', text: '#92400E', label: 'Pendente' },
  EM_ANDAMENTO: { bg: '#DBEAFE', text: '#1E40AF', label: 'Em Andamento' },
  RESOLVIDO: { bg: '#D1FAE5', text: '#065F46', label: 'Resolvido' },
  REJEITADO: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejeitado' },
};

export default function HomeDenuncianteScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { denuncias, loading, fetchDenuncias } = useDenunciasStore();

  useEffect(() => {
    fetchDenuncias();
  }, []);


  const minhasDenuncias = denuncias
    .filter((d) => d.userId === user?.id)
    .slice(0, 3);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getSituacao = (situacao: string) =>
    SITUACAO_COLORS[situacao] || { bg: '#F3F4F6', text: '#374151', label: situacao };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDenuncias} />}
        showsVerticalScrollIndicator={false}
      >


        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.headerSub}>Como podemos ajudar sua cidade hoje?</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} accessibilityLabel="Sair">
            <Ionicons name="log-out-outline" size={22} color="#6498c9" />
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/nova-denuncia')}
          accessibilityLabel="Fazer nova denúncia"
        >
          <View style={styles.ctaIcon}>
            <Ionicons name="megaphone" size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Faça uma Denúncia</Text>
            <Text style={styles.ctaDesc}>Relate um problema na sua cidade rapidamente</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {[
              { label: 'Dengue', icon: 'bug-outline' as const },
              { label: 'Iluminação', icon: 'bulb-outline' as const },
              { label: "Água", icon: 'water-outline' as const },
              { label: 'Alagamento', icon: 'thunderstorm-outline' as const },
              { label: 'Lixo', icon: 'trash-outline' as const },
              { label: 'Buraco', icon: 'warning-outline' as const },
            ].map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={styles.chip}
                onPress={() => router.push('/nova-denuncia')}
                accessibilityLabel={cat.label}
              >
                <Ionicons name={cat.icon} size={18} color="#6498c9" />
                <Text style={styles.chipLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Minhas Denúncias Recentes</Text>
            <TouchableOpacity onPress={() => router.push('/minhas-denuncias')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {minhasDenuncias.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>Nenhuma denúncia ainda</Text>
              <Text style={styles.emptySubText}>Suas denúncias aparecerão aqui</Text>
            </View>
          ) : (
            minhasDenuncias.map((d) => {
              const sit = getSituacao(d.situacao);
              return (
                <TouchableOpacity
                  key={d.id}
                  style={styles.denunciaCard}
                  onPress={() => router.push(`/detalhe-denuncia?id=${d.id}`)}
                  accessibilityLabel={`Ver detalhes de ${d.tipoDenuncia}`}
                  activeOpacity={0.75}
                >
                  <View style={styles.denunciaHeader}>
                    <Text style={styles.denunciaTipo}>{d.tipoDenuncia}</Text>
                    <View style={[styles.badge, { backgroundColor: sit.bg }]}>
                      <Text style={[styles.badgeText, { color: sit.text }]}>{sit.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.denunciaDesc} numberOfLines={2}>{d.descricaoOcorrencia}</Text>
                  <View style={styles.denunciaFooter}>
                    <Ionicons name="location-outline" size={13} color="#9ca3af" />
                    <Text style={styles.denunciaInfo}>{d.bairroOcorrencia}</Text>
                    <Text style={styles.denunciaProtocolo}>#{d.protocolo}</Text>
                  </View>
                  <View style={styles.verMaisRow}>
                    <Text style={styles.verMaisText}>Ver detalhes</Text>
                    <Ionicons name="chevron-forward" size={13} color="#6498c9" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 12, backgroundColor: '#fff',
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },

  ctaCard: {
    margin: 20, backgroundColor: '#6498c9', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#6498c9', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  ctaIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 3 },
  ctaDesc: { color: '#dbeafe', fontSize: 13 },

  section: { paddingHorizontal: 20, paddingBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a5f', marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#6498c9', fontWeight: '700' },

  chipRow: { gap: 10, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  chipLabel: { fontSize: 13, fontWeight: '700', color: '#1e3a5f' },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#9ca3af' },
  emptySubText: { fontSize: 13, color: '#d1d5db' },

  denunciaCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#f0f4f8',
  },
  verMaisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 8 },
  verMaisText: { fontSize: 12, color: '#6498c9', fontWeight: '700' },
  denunciaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  denunciaTipo: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', flex: 1, marginRight: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  denunciaDesc: { fontSize: 13, color: '#6b7280', lineHeight: 19, marginBottom: 10 },
  denunciaFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  denunciaInfo: { fontSize: 12, color: '#9ca3af', flex: 1 },
  denunciaProtocolo: { fontSize: 11, color: '#9ca3af', fontWeight: '700' },
});
