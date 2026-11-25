import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCadastroUsuario } from '@/hooks/useCadastroUsuario';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ConsentAgreement from '@/components/ui/ConsentAgreement';
import { hasErrors, validarCadastro, type CadastroErrors } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { loading: isLoading, cadastrar } = useCadastroUsuario();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [errors, setErrors] = useState<CadastroErrors>({});

  const validate = () => {
    const newErrors = validarCadastro({ name, email, password, confirmPassword, acceptedLegal });
    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const response = await cadastrar({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'DENUNCIANTE',
        acceptedTerms: acceptedLegal,
        acceptedPrivacy: acceptedLegal,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Cadastro realizado!',
          text2: 'Agora você pode entrar na sua conta 🎉',
        });
        router.replace('/login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao cadastrar',
          text2: response.error || 'Tente novamente mais tarde',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar',
        text2: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <ScreenHeader
            title="S.O.S Cidade"
            subtitle="Crie sua conta de Cidadão"
            onBack={() => router.back()}
          />

          <View style={styles.card}>

            <TextField
              label="Nome Completo"
              leadingIcon={<Ionicons name="person-outline" size={18} color="#9ca3af" />}
              placeholder="Seu nome"
              placeholderTextColor="#9ca3af"
              value={name}
              error={errors.name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              accessibilityLabel="Campo de nome"
            />
            <TextField
              label="E-mail"
              leadingIcon={<Ionicons name="mail-outline" size={18} color="#9ca3af" />}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              error={errors.email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              accessibilityLabel="Campo de e-mail"
            />
            <TextField
              label="Senha"
              leadingIcon={<Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              error={errors.password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              accessibilityLabel="Campo de senha"
              trailingElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              }
            />
            <TextField
              label="Confirmar Senha"
              leadingIcon={<Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />}
              placeholder="Confirme sua senha"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              error={errors.confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); }}
              accessibilityLabel="Confirmar senha"
              trailingElement={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              }
            />
            <ConsentAgreement
              checked={acceptedLegal}
              onChange={(checked) => {
                setAcceptedLegal(checked);
                setErrors((current) => ({ ...current, legal: undefined }));
              }}
              error={errors.legal}
            />
            <Button title="CADASTRAR" onPress={handleRegister} loading={isLoading} accessibilityLabel="Cadastrar" />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} accessibilityLabel="Entrar">
              <Text style={styles.registerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { flexGrow: 1, padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
    gap: 16,
  },

  eyeBtn: { padding: 4 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#6b7280', fontSize: 14 },
  registerLink: { color: '#6498c9', fontWeight: '700', fontSize: 14 },
});
