import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache local simples (AsyncStorage) para o modo offline básico.
 * Guarda o último resultado bom de cada consulta e a hora em que foi salvo.
 *
 * Atenção: o AsyncStorage não é criptografado. O cache contém dados de denúncias, por isso
 * é apagado no logout e quando a sessão expira (ver useAuthStore).
 */
const PREFIXO = 'cache:';

export type CacheEntrada<T> = { dados: T; salvoEm: number };

export async function salvarCache<T>(chave: string, dados: T): Promise<void> {
  try {
    const entrada: CacheEntrada<T> = { dados, salvoEm: Date.now() };
    await AsyncStorage.setItem(PREFIXO + chave, JSON.stringify(entrada));
  } catch (error) {
    console.warn('Não foi possível salvar o cache local:', error);
  }
}

export async function lerCache<T>(chave: string): Promise<CacheEntrada<T> | null> {
  try {
    const bruto = await AsyncStorage.getItem(PREFIXO + chave);
    return bruto ? (JSON.parse(bruto) as CacheEntrada<T>) : null;
  } catch (error) {
    console.warn('Não foi possível ler o cache local:', error);
    return null;
  }
}

export async function limparCache(): Promise<void> {
  try {
    const chaves = await AsyncStorage.getAllKeys();
    const nossas = chaves.filter((chave) => chave.startsWith(PREFIXO));
    if (nossas.length > 0) await AsyncStorage.multiRemove(nossas);
  } catch (error) {
    console.warn('Não foi possível limpar o cache local:', error);
  }
}
