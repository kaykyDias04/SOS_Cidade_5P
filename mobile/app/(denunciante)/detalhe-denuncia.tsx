import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDenunciasStore } from '@/store/useDenunciasStore';

const SITUACAO_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  'Em Andamento': { bg: '#DBEAFE', text: '#1E40AF', label: 'Em Andamento', icon: 'refresh-outline' },
  'Resolvido': { bg: '#D1FAE5', text: '#065F46', label: 'Resolvido', icon: 'checkmark-circle-outline' },
};

const TIPO_COLORS: Record<string, string> = {
  'Foco de Dengue': '#EF4444',
  'Iluminação Pública': '#F59E0B',
  "Falta D'água": '#3B82F6',
  'Alagamento': '#6366F1',
  'Descarte Irregular de Lixo': '#10B981',
  'Buraco na Via': '#92400E',
  'Outro': '#6b7280',
};

export default function DetalheDenunciaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { denuncias } = useDenunciasStore();

  const denuncia = denuncias.find((d) => String(d.id) === String(id));

  if (!denuncia) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color="#1e3a5f" />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={56} color="#d1d5db" />
          <Text style={styles.notFoundText}>Denúncia não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sit = SITUACAO_CONFIG[denuncia.situacao] || { bg: '#F3F4F6', text: '#374151', label: denuncia.situacao, icon: 'help-outline' };
  const cor = TIPO_COLORS[denuncia.tipoDenuncia] || '#6498c9';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color="#1e3a5f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Denúncia</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={[styles.heroCard, { borderLeftColor: cor }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTipo}>{denuncia.tipoDenuncia}</Text>
            <View style={[styles.badge, { backgroundColor: sit.bg }]}>
              <Ionicons name={sit.icon as any} size={12} color={sit.text} />
              <Text style={[styles.badgeText, { color: sit.text }]}>{sit.label}</Text>
            </View>
          </View>
        </View>


        <View style={styles.protocoloCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#6498c9" />
          <View style={{ flex: 1 }}>
            <Text style={styles.protocoloLabel}>Número de Protocolo</Text>
            <Text style={styles.protocoloValue}>#{denuncia.protocolo}</Text>
          </View>
        </View>


        <View style={styles.infoGrid}>
          <InfoItem icon="location-outline" label="Bairro" value={denuncia.bairroOcorrencia} />
          <InfoItem icon="calendar-outline" label="Data da Ocorrência"
            value={new Date(denuncia.dataOcorrencia).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} />
          <InfoItem icon="person-outline" label="Identificação"
            value={denuncia.identificacao ? denuncia.nomeDenunciante : 'Anônimo'} />
          <InfoItem icon="time-outline" label="Registrado em"
            value={new Date(denuncia.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} />
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

function InfoItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconCircle}>
        <Ionicons name={icon} size={16} color="#6498c9" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1e3a5f' },

  scroll: { padding: 16, gap: 14 },

  heroCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  emojiCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  heroTipo: { fontSize: 16, fontWeight: '800', color: '#1e3a5f', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },

  protocoloCard: {
    backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  protocoloLabel: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginBottom: 2 },
  protocoloValue: { fontSize: 18, fontWeight: '800', color: '#1e3a5f' },

  infoGrid: {
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  infoIconCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#1e3a5f', fontWeight: '700' },

  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1e3a5f' },
  descCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  descText: { fontSize: 14, color: '#4b5563', lineHeight: 22 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: '#9ca3af', fontWeight: '700' },
});
