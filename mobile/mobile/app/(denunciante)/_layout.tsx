import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DenuncianteLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user?.role === 'GESTOR') return <Redirect href="/denuncias" />;

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
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nova-denuncia"
        options={{
          title: 'Denunciar',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="minhas-denuncias"
        options={{
          title: 'Minhas',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
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
