import { useEffect } from 'react';
import { registrarNotificacoes } from '@/services/notifications';

export function useRegistroNotificacoes() {
  useEffect(() => {
    void registrarNotificacoes();
  }, []);
}
