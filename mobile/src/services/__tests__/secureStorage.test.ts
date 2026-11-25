import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { deleteItemAsync, getItemAsync, setItemAsync } from '../secureStorage';

const platformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');

function setPlatform(os: string) {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

afterEach(() => {
  if (platformDescriptor) Object.defineProperty(Platform, 'OS', platformDescriptor);
});

describe('secureStorage', () => {
  it('usa SecureStore em dispositivo mobile', async () => {
    setPlatform('android');
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('token-seguro');

    await expect(getItemAsync('token')).resolves.toBe('token-seguro');
    await setItemAsync('token', 'novo-token');
    await deleteItemAsync('token');

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'novo-token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  it('usa AsyncStorage quando Platform.OS é web', async () => {
    setPlatform('web');
    await AsyncStorage.setItem('token', 'token-web');

    await expect(getItemAsync('token')).resolves.toBe('token-web');
    await setItemAsync('token', 'novo-token-web');
    await deleteItemAsync('token');

    expect(await AsyncStorage.getItem('token')).toBeNull();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});
