import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Denuncia } from '@/types';
import { colors } from '@/constants/theme';
import { formatDate } from '@/utils/formatDate';
import StatusBadge from '@/components/denuncia/StatusBadge';

interface DenunciaCardProps {
  denuncia: Denuncia;
  variant: 'home' | 'list' | 'manager';
  onPress: () => void;
}

export default function DenunciaCard({ denuncia, variant, onPress }: DenunciaCardProps) {
  const isList = variant === 'list';
  const isManager = variant === 'manager';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isList ? styles.listCard : isManager ? styles.managerCard : styles.homeCard,
      ]}
      onPress={onPress}
      accessibilityLabel={`Ver detalhes de ${denuncia.tipoDenuncia}`}
      activeOpacity={0.75}
    >
      <View style={[styles.header, isList && styles.listHeader]}>
        {isList && <View style={styles.tipoDot} />}
        <Text style={[
          styles.tipo,
          isList ? styles.listTipo : isManager ? styles.managerTipo : styles.homeTipo,
        ]}>
          {denuncia.tipoDenuncia}
        </Text>
        <StatusBadge
          situacao={denuncia.situacao}
          showIcon={isList}
          style={isList ? styles.listBadge : isManager ? styles.managerBadge : styles.homeBadge}
        />
      </View>

      <Text
        style={[styles.description, isList ? styles.listDescription : isManager ? styles.managerDescription : styles.homeDescription]}
        numberOfLines={isList ? 3 : 2}
      >
        {denuncia.descricaoOcorrencia}
      </Text>

      <View style={[
        styles.footer,
        isList ? styles.listFooter : isManager ? styles.managerFooter : styles.homeFooter,
      ]}>
        {isManager && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={13} color={colors.gray} />
            <Text style={styles.info}>{denuncia.identificacao ? denuncia.nomeDenunciante : 'Anônimo'}</Text>
          </View>
        )}
        <View style={[styles.infoRow, isList ? styles.listInfoRow : styles.homeInfoRow]}>
          <Ionicons name="location-outline" size={13} color={colors.gray} />
          <Text style={[styles.info, !isList && styles.homeInfo]}>{denuncia.bairroOcorrencia}</Text>
        </View>
        {isList && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.gray} />
            <Text style={styles.info}>{formatDate(denuncia.dataOcorrencia)}</Text>
          </View>
        )}
        <Text style={[styles.protocol, (isList || isManager) && styles.listProtocol]}>
          #{denuncia.protocolo}
        </Text>
      </View>

      {!isManager && (
        <View style={[styles.more, isList ? styles.listMore : styles.homeMore]}>
          <Text style={styles.moreText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={isList ? 14 : 13} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  homeCard: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.background,
  },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.background,
  },
  managerCard: { borderRadius: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listHeader: { marginBottom: 10 },
  tipoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 8 },
  tipo: { flex: 1 },
  homeTipo: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginRight: 8 },
  listTipo: { fontSize: 14, fontWeight: '800', color: colors.primaryDark },
  managerTipo: { fontSize: 14, fontWeight: '800', color: colors.primaryDark, marginRight: 8 },
  homeBadge: { paddingHorizontal: 10, paddingVertical: 3 },
  listBadge: { paddingHorizontal: 9, paddingVertical: 4 },
  managerBadge: { paddingHorizontal: 9, paddingVertical: 3 },
  description: { lineHeight: 19 },
  homeDescription: { fontSize: 13, color: colors.grayDark, marginBottom: 10 },
  listDescription: { fontSize: 13, color: '#4b5563', marginBottom: 12 },
  managerDescription: { fontSize: 13, color: '#4b5563', marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  homeFooter: { gap: 4 },
  listFooter: { gap: 10, flexWrap: 'wrap' },
  managerFooter: { gap: 10, flexWrap: 'wrap' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  homeInfoRow: { gap: 4, flex: 1 },
  listInfoRow: { gap: 3 },
  info: { fontSize: 12, color: colors.gray },
  homeInfo: { flex: 1 },
  protocol: { fontSize: 11, color: colors.gray, fontWeight: '700' },
  listProtocol: { color: colors.primary, marginLeft: 'auto' },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  homeMore: { marginTop: 8 },
  listMore: { marginTop: 10 },
  moreText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
});
