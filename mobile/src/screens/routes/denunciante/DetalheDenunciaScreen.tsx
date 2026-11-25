import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { ComponentProps } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { getTipoColor } from '@/constants';
import StatusBadge from '@/components/denuncia/StatusBadge';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import LoadingState from '@/components/feedback/LoadingState';
import { colors } from '@/constants/theme';
import { formatDate } from '@/utils/formatDate';

type IconName = ComponentProps<typeof Ionicons>['name'];

export default function DetalheDenunciaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { denuncias, loading, error, fetchDenuncias } = useDenunciasStore();

  const denuncia = denuncias.find((d) => String(d.id) === String(id));

  if (!denuncia) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        {error ? (
          <ErrorState
            title="Erro ao carregar denúncia"
            message={error}
            onRetry={fetchDenuncias}
            style={styles.state}
          />
        ) : loading ? (
          <LoadingState message="Carregando denúncia..." style={styles.state} />
        ) : (
          <EmptyState
            title="Denúncia não encontrada"
            icon="alert-circle-outline"
            iconSize={56}
            iconColor={colors.grayLight}
            style={styles.notFound}
            titleStyle={styles.notFoundText}
          />
        )}
      </SafeAreaView>
    );
  }

  const cor = getTipoColor(denuncia.tipoDenuncia);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Denúncia</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.heroCard, { borderLeftColor: cor }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTipo}>{denuncia.tipoDenuncia}</Text>
            <StatusBadge situacao={denuncia.situacao} style={styles.badge} />
          </View>
        </View>


        <View style={styles.protocoloCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.protocoloLabel}>Número de Protocolo</Text>
            <Text style={styles.protocoloValue}>#{denuncia.protocolo}</Text>
          </View>
        </View>


        <View style={styles.infoGrid}>
          <InfoItem icon="location-outline" label="Bairro" value={denuncia.bairroOcorrencia} />
          <InfoItem icon="calendar-outline" label="Data da Ocorrência"
            value={formatDate(denuncia.dataOcorrencia, { day: '2-digit', month: 'long', year: 'numeric' })} />
          <InfoItem icon="person-outline" label="Identificação"
            value={denuncia.identificacao ? denuncia.nomeDenunciante : 'Anônimo'} />
          <InfoItem icon="time-outline" label="Registrado em"
            value={formatDate(denuncia.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })} />
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.descCard}>
            <Text style={styles.descText}>{denuncia.descricaoOcorrencia}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconCircle}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceTint,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.primaryDark },

  scroll: { padding: 16, gap: 14 },

  heroCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  heroTipo: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },

  protocoloCard: {
    backgroundColor: colors.surfaceTint, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  protocoloLabel: { fontSize: 11, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  protocoloValue: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },

  infoGrid: {
    backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  infoIconCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTint,
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: colors.gray, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: colors.primaryDark, fontWeight: '700' },

  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  descCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  descText: { fontSize: 14, color: '#4b5563', lineHeight: 22 },

  state: { flex: 1, justifyContent: 'center' },
  notFound: { flex: 1, justifyContent: 'center', paddingVertical: 0, gap: 12 },
  notFoundText: { fontSize: 16, color: colors.gray, fontWeight: '700' },
});
