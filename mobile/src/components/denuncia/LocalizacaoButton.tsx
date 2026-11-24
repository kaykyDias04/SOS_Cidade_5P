import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { BAIRROS_RECIFE } from '@/constants';
import { colors } from '@/constants/theme';

interface LocalizacaoButtonProps {
  onSelect: (bairro: string) => void;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export default function LocalizacaoButton({ onSelect }: LocalizacaoButtonProps) {
  const [loading, setLoading] = useState(false);

  const locate = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(position.coords);
      const candidates = [address?.district, address?.subregion].filter(
        (value): value is string => Boolean(value)
      );
      const matched = BAIRROS_RECIFE.find((bairro) =>
        candidates.some((candidate) =>
          normalize(candidate) === normalize(bairro) ||
          normalize(candidate).includes(normalize(bairro))
        )
      );
      const bairro = matched ?? address?.district ?? address?.subregion;

      if (!bairro) {
        Alert.alert('Localização não encontrada', 'Selecione o bairro manualmente.');
        return;
      }
      onSelect(bairro);
    } catch (error) {
      Alert.alert(
        'Erro ao obter localização',
        error instanceof Error ? error.message : 'Tente novamente ou selecione o bairro manualmente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={locate}
      disabled={loading}
      accessibilityLabel="Usar localização atual"
      accessibilityRole="button"
    >
      <Ionicons name="location-outline" size={18} color={colors.gray} />
    </TouchableOpacity>
  );
}
