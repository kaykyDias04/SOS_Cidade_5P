import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import type { Denuncia } from '@/types';
import {
  DEFAULT_COORDS,
  getTipoColor,
  TIPOS_DENUNCIA,
} from '@/constants';
import { colors } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import LoadingState from '@/components/feedback/LoadingState';
import ErrorState from '@/components/feedback/ErrorState';
import DenunciaMapMarker from '@/components/denuncia/DenunciaMapMarker';
import DenunciaMapDetail from '@/components/denuncia/DenunciaMapDetail';
import WebMapFallback from '@/components/denuncia/WebMapFallback';

type MapModule = typeof import('react-native-maps');
type MapComponentsType = {
  MapView: MapModule['default'];
  Marker: MapModule['Marker'];
  Callout: MapModule['Callout'];
};

export default function MapaScreen() {
  const { denuncias, loading, error, fetchDenuncias } = useDenunciasStore();
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [mapComponents, setMapComponents] = useState<MapComponentsType | null>(null);
  const [mapReady, setMapReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        const maps = require('react-native-maps') as MapModule;
        setMapComponents({ MapView: maps.default, Marker: maps.Marker, Callout: maps.Callout });
      } catch (cause) {
        console.warn('react-native-maps não disponível:', cause);
      } finally {
        setMapReady(true);
      }
    }
  }, []);

  useEffect(() => { fetchDenuncias(); }, []);

  const filtered = filtroTipo
    ? denuncias.filter((denuncia) => denuncia.tipoDenuncia === filtroTipo)
    : denuncias;
  const tipos = [...new Set(denuncias.map((denuncia) => denuncia.tipoDenuncia))];
  const handleSelect = (denuncia: Denuncia) => {
    setSelectedDenuncia(denuncia);
    setShowDetail(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        variant="simple"
        title="Mapa de Ocorrências"
        subtitle={`${filtered.length} ocorrências`}
        style={styles.header}
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSubtitle}
        rightElement={
          <TouchableOpacity
            style={[styles.filterButton, !!filtroTipo && styles.filterButtonActive]}
            onPress={() => setShowFiltros(true)}
            accessibilityLabel="Filtrar por tipo"
          >
            <Ionicons name="filter-outline" size={20} color={filtroTipo ? colors.surface : colors.primary} />
          </TouchableOpacity>
        }
      />

      {filtroTipo && (
        <View style={styles.activeFilter}>
          <View style={[styles.filterChip, { backgroundColor: `${getTipoColor(filtroTipo)}22`, borderColor: getTipoColor(filtroTipo) }]}>
            <Text style={[styles.filterChipText, { color: getTipoColor(filtroTipo) }]}>{filtroTipo}</Text>
            <TouchableOpacity onPress={() => setFiltroTipo(null)} accessibilityLabel="Remover filtro">
              <Ionicons name="close-circle" size={16} color={getTipoColor(filtroTipo)} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <LoadingState message="Carregando ocorrências..." />
      ) : error && denuncias.length === 0 ? (
        <ErrorState
          title="Erro ao carregar ocorrências"
          message={error}
          onRetry={fetchDenuncias}
          style={styles.errorState}
        />
      ) : !mapReady || !mapComponents ? (
        <LoadingState message="Carregando mapa..." />
      ) : Platform.OS === 'web' ? (
        <WebMapFallback denuncias={filtered} onSelect={handleSelect} />
      ) : (
        <>
          <mapComponents.MapView
            style={styles.map}
            initialRegion={{
              latitude: DEFAULT_COORDS.latitude,
              longitude: DEFAULT_COORDS.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {filtered.map((denuncia) => (
              <DenunciaMapMarker
                key={denuncia.id}
                denuncia={denuncia}
                Marker={mapComponents.Marker}
                Callout={mapComponents.Callout}
                onSelect={handleSelect}
              />
            ))}
          </mapComponents.MapView>

          <View style={styles.legend}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContent}>
              {TIPOS_DENUNCIA.map(({ label: tipo, color }) => (
                <View key={tipo} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{tipo.split(' ').slice(0, 2).join(' ')}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      <Modal visible={showDetail} transparent animationType="slide">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowDetail(false)}
        >
          {selectedDenuncia && <DenunciaMapDetail denuncia={selectedDenuncia} />}
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFiltros} transparent animationType="slide">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowFiltros(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filtrar por Tipo</Text>
            <TouchableOpacity
              style={[styles.filterOption, !filtroTipo && styles.filterOptionActive]}
              onPress={() => { setFiltroTipo(null); setShowFiltros(false); }}
              accessibilityLabel="Ver todas"
            >
              <Text style={[styles.filterOptionText, !filtroTipo && styles.filterOptionTextActive]}>Todos os tipos</Text>
              {!filtroTipo && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
            {tipos.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.filterOption, filtroTipo === tipo && styles.filterOptionActive]}
                onPress={() => { setFiltroTipo(tipo); setShowFiltros(false); }}
                accessibilityLabel={tipo}
              >
                <View style={[styles.typeDot, { backgroundColor: getTipoColor(tipo) }]} />
                <Text style={[styles.filterOptionText, filtroTipo === tipo && styles.filterOptionTextActive]}>{tipo}</Text>
                {filtroTipo === tipo && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingBottom: 14 },
  headerTitle: { fontSize: 20 },
  headerSubtitle: { color: colors.gray },
  filterButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary },
  activeFilter: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.surface },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  filterChipText: { fontSize: 13, fontWeight: '700' },
  errorState: { flex: 1, justifyContent: 'center' },
  map: { flex: 1 },
  legend: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.background },
  legendContent: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#4b5563', fontWeight: '600' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  filterOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  filterOptionActive: {},
  filterOptionText: { flex: 1, fontSize: 15, color: colors.text },
  filterOptionTextActive: { color: colors.primary, fontWeight: '700' },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
});
