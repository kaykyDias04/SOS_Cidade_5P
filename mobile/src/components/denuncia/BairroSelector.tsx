import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BAIRROS_RECIFE } from '@/constants';
import { colors } from '@/constants/theme';
import LocalizacaoButton from '@/components/denuncia/LocalizacaoButton';

interface BairroSelectorProps {
  value: string;
  error?: string;
  onChange: (bairro: string) => void;
}

export default function BairroSelector({ value, error, onChange }: BairroSelectorProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Bairro da Ocorrência *</Text>
        <View style={[styles.select, error && styles.inputError]}>
          <View style={styles.valueRow}>
            <LocalizacaoButton onSelect={onChange} />
            <TouchableOpacity
              style={styles.valueButton}
              onPress={() => setVisible(true)}
              accessibilityLabel="Selecionar bairro da ocorrência"
            >
              <Text style={value ? styles.selectText : styles.placeholder}>
                {value || 'Selecione o bairro...'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setVisible(true)} accessibilityLabel="Selecionar bairro da ocorrência">
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </TouchableOpacity>
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecione o Bairro</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator>
              {BAIRROS_RECIFE.map((bairro) => (
                <TouchableOpacity
                  key={bairro}
                  style={[styles.modalOption, bairro === value && styles.modalOptionSelected]}
                  onPress={() => { onChange(bairro); setVisible(false); }}
                  accessibilityLabel={bairro}
                >
                  <Text style={[styles.modalOptionText, bairro === value && styles.modalOptionTextSelected]}>
                    {bairro}
                  </Text>
                  {bairro === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.inputBackground, paddingHorizontal: 14, paddingVertical: 14,
  },
  inputError: { borderColor: colors.error },
  valueRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueButton: { flex: 1 },
  selectText: { fontSize: 15, color: colors.inputText },
  placeholder: { fontSize: 15, color: colors.gray },
  errorText: { fontSize: 12, color: colors.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 16 },
  modalOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  modalOptionSelected: { backgroundColor: colors.surfaceTint, marginHorizontal: -24, paddingHorizontal: 24 },
  modalOptionText: { fontSize: 15, color: colors.text },
  modalOptionTextSelected: { color: colors.primary, fontWeight: '700' },
});
