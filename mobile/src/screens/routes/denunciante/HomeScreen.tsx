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
import DenunciaCard from '@/components/denuncia/DenunciaCard';
import TipoIcon from '@/components/denuncia/TipoIcon';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import OfflineBanner from '@/components/feedback/OfflineBanner';
import LoadingState from '@/components/feedback/LoadingState';
import { colors } from '@/constants/theme';

export default function HomeDenuncianteScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { denuncias, loading, error, offline, cachedAt, fetchDenuncias } = useDenunciasStore();

  useEffect(() => {
    fetchDenuncias();
  }, []);


  const minhasDenuncias = denuncias.slice(0, 3);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

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
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/nova-denuncia')}
          accessibilityLabel="Fazer nova denúncia"
        >
          <View style={styles.ctaIcon}>
            <Ionicons name="megaphone" size={36} color={colors.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Faça uma Denúncia</Text>
            <Text style={styles.ctaDesc}>Relate um problema na sua cidade rapidamente</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.surface} />
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
                <TipoIcon tipo={cat.label} icon={cat.icon} size={18} color={colors.primary} />
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

          {offline && cachedAt ? <OfflineBanner cachedAt={cachedAt} style={{ marginHorizontal: 0 }} /> : null}
          {error ? (
            <ErrorState
              title="Erro ao carregar denúncias"
              message={error}
              onRetry={fetchDenuncias}
              style={styles.feedbackState}
            />
          ) : loading && minhasDenuncias.length === 0 ? (
            <LoadingState message="Carregando denúncias..." style={styles.loadingState} />
          ) : minhasDenuncias.length === 0 ? (
            <EmptyState
              title="Nenhuma denúncia ainda"
              message="Suas denúncias aparecerão aqui"
              iconSize={48}
              iconColor={colors.grayLight}
              style={styles.emptyState}
              titleStyle={styles.emptyText}
              messageStyle={styles.emptySubText}
            />
          ) : (
            minhasDenuncias.map((denuncia) => (
              <DenunciaCard
                key={denuncia.id}
                denuncia={denuncia}
                variant="home"
                onPress={() => router.push(`/detalhe-denuncia?id=${denuncia.id}`)}
              />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 12, backgroundColor: colors.surface,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTint,
    alignItems: 'center', justifyContent: 'center',
  },

  ctaCard: {
    margin: 20, backgroundColor: colors.primary, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  ctaIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: colors.surface, fontSize: 17, fontWeight: '800', marginBottom: 3 },
  ctaDesc: { color: '#dbeafe', fontSize: 13 },

  section: { paddingHorizontal: 20, paddingBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 12 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  chipRow: { gap: 10, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.surfaceTint, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  chipLabel: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },

  loadingState: { flex: 0, paddingVertical: 32 },
  feedbackState: { paddingVertical: 32 },
  emptyState: { paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: colors.gray },
  emptySubText: { fontSize: 13, color: colors.grayLight },
});
