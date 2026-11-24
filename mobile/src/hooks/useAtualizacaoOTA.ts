import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import Toast from 'react-native-toast-message';

/**
 * Atualização remota (OTA) com expo-updates.
 * Ao abrir o app, procura uma atualização publicada no canal do build (eas update).
 * Se houver, baixa e avisa o usuário, que escolhe reiniciar na hora ou usar na próxima abertura.
 * Em desenvolvimento e no Expo Go o expo-updates fica desligado e este hook não faz nada.
 */
export function useAtualizacaoOTA(): void {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelado = false;

    const verificar = async () => {
      try {
        const resultado = await Updates.checkForUpdateAsync();
        if (!resultado.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (cancelado) return;

        Toast.show({
          type: 'info',
          text1: 'Atualização disponível',
          text2: 'Toque aqui para reiniciar o app e aplicar.',
          autoHide: false,
          onPress: () => {
            void Updates.reloadAsync();
          },
        });
      } catch (error) {
        // Falha de rede ao procurar atualização não pode atrapalhar o uso do app.
        console.warn('Falha ao verificar atualização OTA:', error);
      }
    };

    void verificar();
    return () => {
      cancelado = true;
    };
  }, []);
}
