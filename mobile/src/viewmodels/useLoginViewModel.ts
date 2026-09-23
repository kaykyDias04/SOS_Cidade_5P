import { useState } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../models/User';

/**
 * ViewModel: guarda o ESTADO da tela de login (o que está nos campos,
 * se está carregando, se deu erro) e a LÓGICA do que fazer quando o
 * usuário aperta "Entrar". A tela (View) só lê esses valores e chama
 * essa função — ela não decide nada sozinha.
 */
export function useLoginViewModel(onLoginSuccess: (user: User) => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const session = await AuthService.login(email, password);
      onLoginSuccess(session.user);
    } catch (error: any) {
      setErrorMessage(error.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    errorMessage,
    handleLogin,
  };
}
