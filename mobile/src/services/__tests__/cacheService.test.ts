import AsyncStorage from '@react-native-async-storage/async-storage';
import { limparCache, lerCache, salvarCache } from '../cacheService';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('cacheService', () => {
  it('salva e lê os dados com o timestamp', async () => {
    await salvarCache('denuncias', [{ id: 1 }]);

    const cache = await lerCache<Array<{ id: number }>>('denuncias');
    expect(cache).toMatchObject({ dados: [{ id: 1 }] });
    expect(cache?.salvoEm).toEqual(expect.any(Number));
  });

  it('limpa apenas as chaves com prefixo cache:', async () => {
    await AsyncStorage.setItem('cache:denuncias', 'cache');
    await AsyncStorage.setItem('auth-storage', 'auth');

    await limparCache();

    expect(await AsyncStorage.getItem('cache:denuncias')).toBeNull();
    expect(await AsyncStorage.getItem('auth-storage')).toBe('auth');
  });
});
