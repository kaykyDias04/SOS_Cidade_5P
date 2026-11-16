import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { User } from '../models/User';

interface Props {
  onLoginSuccess: (user: User) => void;
}

/**
 * View: só lê o que o ViewModel expõe e desenha a tela.
 * Não tem "if" de regra de negócio aqui, não chama o AuthService
 * diretamente — quem faz isso é o useLoginViewModel.
 */
export function LoginScreen({ onLoginSuccess }: Props) {
  const vm = useLoginViewModel(onLoginSuccess);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS-Cidade</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={vm.email}
        onChangeText={vm.setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={vm.password}
        onChangeText={vm.setPassword}
        secureTextEntry
      />

      {vm.errorMessage && <Text style={styles.error}>{vm.errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={vm.handleLogin} disabled={vm.loading}>
        {vm.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#dc2626', marginBottom: 12 },
});
