import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
import Logo from '@/components/Logo';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido';
    if (!password.trim()) newErrors.password = 'Senha obrigatória';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await login(email.trim(), password);

    if (result.success) {
      Toast.show({ type: 'success', text1: 'Login realizado!', text2: `Bem-vindo de volta` });
      if (result.role === 'GESTOR') {
        router.replace('/denuncias');
      } else {
        router.replace('/home');
      }
    } else {
      Toast.show({ type: 'error', text1: 'Erro ao entrar', text2: 'Verifique suas credenciais' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">


          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={22} color="#6498c9" />
          </TouchableOpacity>


          <View style={styles.logoArea}>
            <Logo size={80} />
            <Text style={[styles.logoTitle, { marginTop: 14 }]}>S.O.S Cidade</Text>
            <Text style={styles.logoSubtitle}>Entre na sua conta</Text>
          </View>


          <View style={styles.card}>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                  accessibilityLabel="Campo de e-mail"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>


            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  accessibilityLabel="Campo de senha"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>


            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityLabel="Entrar"
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>ENTRAR</Text>
              }
            </TouchableOpacity>
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

  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 24,
  },

  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoTitle: { fontSize: 28, fontWeight: '800', color: '#1e3a5f', marginBottom: 4 },
  logoSubtitle: { fontSize: 15, color: '#6b7280' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
    gap: 16,
  },

  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    backgroundColor: '#f9fafb', paddingHorizontal: 12, height: 52,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 2 },

  submitBtn: {
    backgroundColor: '#6498c9', height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: '#6498c9', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#6b7280', fontSize: 14 },
  registerLink: { color: '#6498c9', fontWeight: '700', fontSize: 14 },
});
