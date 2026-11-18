import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { NovaDenunciaScreen } from '../screens/NovaDenunciaScreen';
import { User } from '../models/User';

export type RootStackParamList = {
  Login: undefined;
  NovaDenuncia: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  onLoginSuccess: (user: User) => void;
}

export function AppNavigator({ onLoginSuccess }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => <LoginScreen onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
        <Stack.Screen name="NovaDenuncia" options={{ title: 'Nova Denúncia' }}>
          {() => <NovaDenunciaScreen onSucesso={() => {}} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
