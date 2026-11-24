import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useRegistroNotificacoes } from '@/hooks/useRegistroNotificacoes';
import { useSessaoInicial } from '@/hooks/useSessao';
import { useAtualizacaoOTA } from '@/hooks/useAtualizacaoOTA';
import '../global.css';

export default function RootLayout() {
  useRegistroNotificacoes();
  useSessaoInicial();
  useAtualizacaoOTA();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(denunciante)" />
          <Stack.Screen name="(gestor)" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
