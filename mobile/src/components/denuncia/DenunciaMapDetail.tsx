import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Denuncia } from '@/types';
import { getTipoColor, normalizeSituacao, SITUACAO_CONFIG, TIPOS_DENUNCIA } from '@/constants';
import { colors } from '@/constants/theme';
import { formatDate } from '@/utils/formatDate';
import StatusBadge from '@/components/denuncia/StatusBadge';

interface DenunciaMapDetailProps {
  denuncia: Denuncia;
}

export default function DenunciaMapDetail({ denuncia }: DenunciaMapDetailProps) {
  const situacao = SITUACAO_CONFIG[normalizeSituacao(denuncia.situacao)];
  const emoji = TIPOS_DENUNCIA.find((tipo) => tipo.label === denuncia.tipoDenuncia)?.emoji ?? '📍';

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <View style={[styles.tipoIndicator, { backgroundColor: `${getTipoColor(denuncia.tipoDenuncia)}22` }]}>
          <Text style={styles.tipoEmoji}>{emoji}</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.tipo}>{denuncia.tipoDenuncia}</Text>
          <Text style={styles.bairro}>{denuncia.bairroOcorrencia}</Text>
        </View>
        <StatusBadge
          situacao={denuncia.situacao}
          showIcon={false}
          style={{ backgroundColor: `${situacao.color}22`, paddingHorizontal: 10, paddingVertical: 4 }}
          textStyle={{ color: situacao.color }}
        />
      </View>

      <Text style={styles.description}>{denuncia.descricaoOcorrencia}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.gray} />
          <Text style={styles.metaText}>{denuncia.identificacao ? denuncia.nomeDenunciante : 'Anônimo'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.gray} />
          <Text style={styles.metaText}>{formatDate(denuncia.dataOcorrencia)}</Text>
        </View>
      </View>

      <Text style={styles.protocol}>Protocolo: #{denuncia.protocolo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipoIndicator: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tipoEmoji: { fontSize: 24 },
  titleGroup: { flex: 1 },
  tipo: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  bairro: { fontSize: 13, color: colors.grayDark },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  meta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: colors.gray },
  protocol: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
