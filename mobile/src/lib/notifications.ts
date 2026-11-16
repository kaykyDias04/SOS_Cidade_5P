import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Pede permissão e cria o canal Android. Retorna true se as notificações estão liberadas. */
export async function registrarNotificacoes(): Promise<boolean> {
  if (isWeb) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Atualizações de denúncias',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const atual = await Notifications.getPermissionsAsync();
    if (atual.status === 'granted') return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.status === 'granted';
  } catch (e) {
    console.warn('Falha ao registrar notificações:', e);
    return false;
  }
}

/** Dispara uma notificação local avisando que a situação da denúncia mudou. */
export async function notificarMudancaStatus(protocolo: string, tipo: string, situacao: string) {
  if (isWeb) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Denúncia atualizada',
        body: `${tipo} (#${protocolo}) agora está: ${situacao}`,
      },
      trigger: null,
    });
  } catch (e) {
    console.warn('Falha ao notificar:', e);
  }
}
