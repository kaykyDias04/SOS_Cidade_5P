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
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ConsentAgreement from '@/components/ui/ConsentAgreement';
import { hasErrors, validarLogin, type LoginErrors } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = () => {
    const newErrors = validarLogin({ email, password, acceptedLegal });
    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await login(email.trim(), password, acceptedLegal);

    if (result.success) {
      Toast.show({ type: 'success', text1: 'Login realizado!', text2: `Bem-vindo de volta` });
      if (result.role === 'GESTOR') {
        router.replace('/denuncias');
      } else {
        router.replace('/home');
      }
    } else {
      Toast.show({ type: 'error', text1: 'Erro ao entrar', text2: result.error || 'Verifique suas credenciais' });
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
            subtitle="Entre na sua conta"
            onBack={() => router.canGoBack() ? router.back() : router.replace('/')}
          />


          <View style={styles.card}>

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
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoComplete="password"
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
            <ConsentAgreement
              checked={acceptedLegal}
              onChange={(checked) => {
                setAcceptedLegal(checked);
                setErrors((current) => ({ ...current, legal: undefined }));
              }}
              error={errors.legal}
            />
            <Button title="ENTRAR" onPress={handleLogin} loading={isLoading} accessibilityLabel="Entrar" />
          </View>


          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')} accessibilityLabel="Cadastrar-se">
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    ...(Platform.OS === 'web' ? {
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    } : {})
  },
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
