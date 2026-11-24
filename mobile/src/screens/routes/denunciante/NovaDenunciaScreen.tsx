import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import BairroSelector from '@/components/denuncia/BairroSelector';
import FotosPicker from '@/components/denuncia/FotosPicker';
import TipoSelector from '@/components/denuncia/TipoSelector';
import { colors } from '@/constants/theme';
import { useDenunciaForm } from '@/hooks/useDenunciaForm';

export default function NovaDenunciaScreen() {
  const form = useDenunciaForm();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nova Denúncia</Text>
          <Text style={styles.headerSub}>Relate um problema na sua cidade</Text>
        </View>

        <View style={styles.form}>
          <TipoSelector value={form.tipoDenuncia} error={form.errors.tipo} onChange={form.changeTipo} />
          <BairroSelector value={form.bairro} error={form.errors.bairro} onChange={form.changeBairro} />

          <View style={styles.field}>
            <Text style={styles.label}>Descrição da Ocorrência *</Text>
            <TextInput
              style={[styles.textarea, form.errors.descricao && styles.inputError]}
              placeholder="Descreva a ocorrência com o máximo de detalhes possível..."
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={form.descricao}
              onChangeText={form.changeDescricao}
              accessibilityLabel="Campo descrição"
            />
            <Text style={styles.charCount}>{form.descricao.length} caracteres</Text>
            {!!form.errors.descricao && <Text style={styles.errorText}>{form.errors.descricao}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data da Ocorrência</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.gray} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.gray}
                value={form.data}
                onChangeText={form.setData}
                accessibilityLabel="Campo data"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Como deseja registrar?</Text>
            <Pressable
              style={[styles.identityOption, !form.identificacao && styles.identityOptionSelected]}
              onPress={() => form.setIdentificacao(false)}
              accessibilityRole="radio"
              accessibilityState={{ selected: !form.identificacao }}
              accessibilityLabel="Denunciar anonimamente"
            >
              <Ionicons
                name={!form.identificacao ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={!form.identificacao ? colors.primary : colors.gray}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.identityTitle}>Denunciar anonimamente</Text>
                <Text style={styles.switchDesc}>
                  Gestores não verão seu nome. A denúncia continua vinculada à sua conta para acompanhamento.
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.identityOption, form.identificacao && styles.identityOptionSelected]}
              onPress={() => form.setIdentificacao(true)}
              accessibilityRole="radio"
              accessibilityState={{ selected: form.identificacao }}
              accessibilityLabel="Identificar-me na denúncia"
            >
              <Ionicons
                name={form.identificacao ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={form.identificacao ? colors.primary : colors.gray}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.identityTitle}>Identificar-me</Text>
                <Text style={styles.switchDesc}>Seu nome será associado à denúncia.</Text>
              </View>
            </Pressable>
          </View>

          <FotosPicker images={form.imagens} onChange={form.setImagens} />

          <Button
            title="ENVIAR DENÚNCIA"
            onPress={form.submit}
            loading={form.submitting}
            accessibilityLabel="Enviar denúncia"
            icon={<Ionicons name="send" size={18} color={colors.surface} />}
            style={styles.submitBtn}
            textStyle={styles.submitText}
          />
        </View>
      </ScrollView>

      <Modal visible={form.showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Denúncia Registrada!</Text>
            <Text style={styles.successDesc}>Seu protocolo de acompanhamento é:</Text>
            <View style={styles.protocoloBadge}>
              <Text style={styles.protocoloText}>#{form.protocolo}</Text>
            </View>
            <Text style={styles.successNote}>
              Guarde este número para acompanhar o status da sua denúncia.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => form.setShowSuccessModal(false)}
              accessibilityLabel="Fechar"
            >
              <Text style={styles.successBtnText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface, padding: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.primaryDark },
  headerSub: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  form: { padding: 20, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.inputBackground, paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: colors.inputText },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 12, color: colors.error },
  textarea: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    backgroundColor: colors.inputBackground, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.inputText, minHeight: 120,
  },
  charCount: { fontSize: 11, color: colors.gray, textAlign: 'right' },
  identityOption: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: colors.border,
  },
  identityOptionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceTint },
  identityTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  switchDesc: { fontSize: 12, color: colors.gray, marginTop: 2 },
  submitBtn: {
    backgroundColor: colors.primary, height: 54, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
    marginTop: 8,
  },
  submitText: { color: colors.surface, fontWeight: '800', fontSize: 15, letterSpacing: 0 },
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%', maxWidth: 360,
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  successDesc: { fontSize: 14, color: colors.grayDark, marginBottom: 16 },
  protocoloBadge: {
    backgroundColor: colors.surfaceTint, borderRadius: 12, paddingHorizontal: 24,
    paddingVertical: 12, marginBottom: 16,
  },
  protocoloText: { fontSize: 20, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  successNote: { fontSize: 13, color: colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  successBtn: {
    backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 40,
    paddingVertical: 14, width: '100%', alignItems: 'center',
  },
  successBtnText: { color: colors.surface, fontWeight: '800', fontSize: 15 },
});
