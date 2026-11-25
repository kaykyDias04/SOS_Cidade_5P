import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Denuncia } from '@/types';
import { getTipoColor, normalizeSituacao, SITUACAO_CONFIG } from '@/constants';
import { colors } from '@/constants/theme';
import StatusBadge from '@/components/denuncia/StatusBadge';

interface WebMapFallbackProps {
  denuncias: Denuncia[];
  onSelect: (denuncia: Denuncia) => void;
}

export default function WebMapFallback({ denuncias, onSelect }: WebMapFallbackProps) {
  const byBairro = denuncias.reduce<Record<string, Denuncia[]>>((groups, denuncia) => {
    const bairro = denuncia.bairroOcorrencia || 'Sem bairro';
    (groups[bairro] ??= []).push(denuncia);
    return groups;
  }, {});

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.noticeText}>lista de ocorrências por bairro.</Text>
      </View>

      {Object.entries(byBairro).map(([bairro, items]) => (
        <View key={bairro} style={styles.bairroBlock}>
          <View style={styles.bairroHeader}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.bairroTitle}>{bairro}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          </View>
          {items.map((denuncia) => {
            const color = getTipoColor(denuncia.tipoDenuncia);
            const statusColor = SITUACAO_CONFIG[normalizeSituacao(denuncia.situacao)].color;
            return (
              <TouchableOpacity
                key={denuncia.id}
                style={styles.card}
                onPress={() => onSelect(denuncia)}
                accessibilityLabel={`Ver denúncia ${denuncia.tipoDenuncia}`}
              >
                <View style={[styles.colorBar, { backgroundColor: color }]} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTipo}>{denuncia.tipoDenuncia}</Text>
                  <Text style={styles.cardDescription} numberOfLines={1}>{denuncia.descricaoOcorrencia}</Text>
                  <View style={styles.cardMeta}>
                    <StatusBadge
                      situacao={denuncia.situacao}
                      showIcon={false}
                      style={{ backgroundColor: `${statusColor}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}
                      textStyle={{ fontSize: 11, color: statusColor }}
                    />
                    <Text style={styles.protocol}>#{denuncia.protocolo}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.surfaceTint, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  noticeText: { flex: 1, fontSize: 13, color: colors.primaryDark, lineHeight: 19 },
  bairroBlock: {
    backgroundColor: colors.surface, borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  bairroHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc', padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  bairroTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  countBadge: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: colors.background, overflow: 'hidden' },
  colorBar: { width: 4 },
  cardBody: { flex: 1 },
  cardTipo: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, padding: 12, paddingBottom: 2 },
  cardDescription: { fontSize: 13, color: colors.grayDark, paddingHorizontal: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingTop: 6 },
  protocol: { fontSize: 11, color: colors.primary, fontWeight: '700', marginLeft: 'auto' },
});
