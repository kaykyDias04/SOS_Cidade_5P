import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuthHydrated } from '@/hooks/useSessao';
import LoadingState from '@/components/feedback/LoadingState';

export default function DenuncianteLayout() {
  const hydrated = useAuthHydrated();
  const redirect = useRoleGuard('DENUNCIANTE');
  const insets = useSafeAreaInsets();
  if (!hydrated) return <LoadingState message="Carregando..." />;
  if (redirect) return <Redirect href={redirect} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6498c9',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f4f8',
          paddingBottom: insets.bottom || 6,
          height: 62 + (insets.bottom || 0),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="nova-denuncia"
        options={{
          title: 'Denunciar',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="minhas-denuncias"
        options={{
          title: 'Minhas',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="detalhe-denuncia"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
