import { Stack, Redirect } from 'expo-router';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function PublicLayout() {
  const redirect = useRoleGuard(null);
  if (redirect) return <Redirect href={redirect} />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
