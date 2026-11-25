import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import type { GestorErrors } from '@/utils/validation';

interface GestorFormFieldsProps {
  nome: string;
  email: string;
  senha: string;
  showSenha: boolean;
  errors: GestorErrors;
  onNomeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSenhaChange: (value: string) => void;
  onToggleSenha: () => void;
}

export default function GestorFormFields({
  nome,
  email,
  senha,
  showSenha,
  errors,
  onNomeChange,
  onEmailChange,
  onSenhaChange,
  onToggleSenha,
}: GestorFormFieldsProps) {
  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Nome completo *</Text>
        <View style={[styles.inputWrapper, errors.nome ? styles.inputError : null]}>
          <Ionicons name="person-outline" size={18} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Ex: João Silva"
            placeholderTextColor={colors.gray}
            value={nome}
            onChangeText={onNomeChange}
            accessibilityLabel="Campo nome"
          />
        </View>
        {!!errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>E-mail *</Text>
        <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
          <Ionicons name="mail-outline" size={18} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="gestor@prefeitura.gov.br"
            placeholderTextColor={colors.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={onEmailChange}
            accessibilityLabel="Campo email"
          />
        </View>
        {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha *</Text>
        <View style={[styles.inputWrapper, errors.senha ? styles.inputError : null]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.gray}
            secureTextEntry={!showSenha}
            value={senha}
            onChangeText={onSenhaChange}
            accessibilityLabel="Campo senha"
          />
          <TouchableOpacity onPress={onToggleSenha}>
            <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} />
          </TouchableOpacity>
        </View>
        {!!errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.inputBackground,
    paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, fontSize: 15, color: colors.inputText },
  errorText: { fontSize: 12, color: colors.error },
});
