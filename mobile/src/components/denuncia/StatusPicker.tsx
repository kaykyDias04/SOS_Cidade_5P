import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { normalizeSituacao, SITUACAO_CONFIG, SITUACOES } from '@/constants';
import type { Situacao } from '@/constants';
import { colors } from '@/constants/theme';

interface StatusPickerProps {
  situacao: string;
  updating: boolean;
  onChange: (situacao: Situacao) => void;
}

export default function StatusPicker({ situacao, updating, onChange }: StatusPickerProps) {
  return (
    <>
      <Text style={styles.title}>Alterar Status</Text>
      <View style={styles.options}>
        {SITUACOES.map((status) => {
          const config = SITUACAO_CONFIG[normalizeSituacao(status)];
          const current = normalizeSituacao(situacao) === status;

          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.option,
                current && styles.optionActive,
                { borderColor: config.text },
              ]}
              onPress={() => onChange(status)}
              disabled={current || updating}
              accessibilityLabel={`Marcar como ${config.label}`}
            >
              {updating && current
                ? <ActivityIndicator size="small" color={config.text} />
                : <Text style={[styles.optionText, { color: current ? colors.surface : config.text }]}>
                    {config.label} {current ? '✓' : ''}
                  </Text>
              }
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: '700', color: colors.gray, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  options: { gap: 8 },
  option: {
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 2, alignItems: 'center', backgroundColor: colors.surface,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 14, fontWeight: '700' },
});
