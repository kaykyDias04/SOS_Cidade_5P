import { Stack, Redirect } from 'expo-router';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuthHydrated } from '@/hooks/useSessao';
import LoadingState from '@/components/feedback/LoadingState';

export default function PublicLayout() {
  const hydrated = useAuthHydrated();
  const redirect = useRoleGuard(null);
  if (!hydrated) return <LoadingState message="Carregando..." />;
  if (redirect) return <Redirect href={redirect} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
