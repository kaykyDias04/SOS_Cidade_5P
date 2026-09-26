import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { User } from './src/models/User';

export default function App() {
  function handleLoginSuccess(user: User) {
    // Ponto de partida simples. Conforme o app crescer, isso deve virar
    // um estado global de sessão (Context ou uma lib de estado),
    // mas para o escopo inicial isso já mostra o fluxo funcionando.
    console.log('Usuário logado:', user);
  }

  return <AppNavigator onLoginSuccess={handleLoginSuccess} />;
}
