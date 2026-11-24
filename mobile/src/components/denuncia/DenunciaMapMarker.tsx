import { Text, View, StyleSheet } from 'react-native';
import type { Denuncia } from '@/types';
import { getCoords, getTipoColor } from '@/constants';

type MapModule = typeof import('react-native-maps');

interface DenunciaMapMarkerProps {
  denuncia: Denuncia;
  Marker: MapModule['Marker'];
  Callout: MapModule['Callout'];
  onSelect: (denuncia: Denuncia) => void;
}

export default function DenunciaMapMarker({
  denuncia,
  Marker,
  Callout,
  onSelect,
}: DenunciaMapMarkerProps) {
  const MapMarker = Marker;
  const MapCallout = Callout;

  return (
    <MapMarker
      coordinate={getCoords(denuncia.bairroOcorrencia)}
      pinColor={getTipoColor(denuncia.tipoDenuncia)}
      onPress={() => onSelect(denuncia)}
    >
      <MapCallout>
        <View style={styles.callout}>
          <Text style={styles.title}>{denuncia.tipoDenuncia}</Text>
          <Text style={styles.bairro}>{denuncia.bairroOcorrencia}</Text>
          <Text style={styles.protocol}>#{denuncia.protocolo}</Text>
        </View>
      </MapCallout>
    </MapMarker>
  );
}

const styles = StyleSheet.create({
  callout: { width: 160, padding: 8 },
  title: { fontSize: 13, fontWeight: '700', color: '#1e3a5f', marginBottom: 2 },
  bairro: { fontSize: 12, color: '#6b7280' },
  protocol: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginTop: 2 },
});
