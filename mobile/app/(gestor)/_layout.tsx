import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuthHydrated } from '@/hooks/useSessao';
import LoadingState from '@/components/feedback/LoadingState';

export default function GestorLayout() {
  const hydrated = useAuthHydrated();
  const redirect = useRoleGuard('GESTOR');
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
        name="denuncias"
        options={{
          title: 'Denúncias',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
      <Tabs.Screen
        name="gestores"
        options={{
          title: 'Gestores',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={typeof color === 'string' ? color : '#1669BB'} />,
        }}
      />
    </Tabs>
  );
}
