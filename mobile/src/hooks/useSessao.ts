import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/** true quando o estado de login salvo no AsyncStorage já foi lido. Antes disso, não redirecionar. */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const cancelar = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthStore.persist.hasHydrated());
    return cancelar;
  }, []);

  return hydrated;
}

/** Ao abrir o app, confere se a sessão salva ainda vale (token existe e não venceu). */
export function useSessaoInicial(): void {
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (hydrated) void useAuthStore.getState().checkSession();
  }, [hydrated]);
}
