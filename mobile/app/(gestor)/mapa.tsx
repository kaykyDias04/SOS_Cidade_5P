import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { Denuncia } from '@/lib/api';

const BAIRRO_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Boa Viagem': { latitude: -8.1192, longitude: -34.9011 },
  'Recife Antigo': { latitude: -8.0628, longitude: -34.8711 },
  'Casa Amarela': { latitude: -8.0242, longitude: -34.9202 },
  'Aflitos': { latitude: -8.0492, longitude: -34.9002 },
  'Graças': { latitude: -8.0532, longitude: -34.9042 },
  'Espinheiro': { latitude: -8.0452, longitude: -34.9022 },
  'Torre': { latitude: -8.0782, longitude: -34.9102 },
  'Boa Vista': { latitude: -8.0648, longitude: -34.8831 },
  'Água Fria': { latitude: -7.9972, longitude: -34.9202 },
  'Várzea': { latitude: -8.0552, longitude: -34.9502 },
};

const DEFAULT_COORDS = { latitude: -8.0578, longitude: -34.9029 };

const TIPO_COLORS: Record<string, string> = {
  'Foco de Dengue': '#EF4444',
  'Iluminação Pública': '#F59E0B',
  "Falta D'água": '#3B82F6',
  'Alagamento': '#6366F1',
  'Descarte Irregular de Lixo': '#10B981',
  'Buraco na Via': '#92400E',
  'Outro': '#6b7280',
};


const SITUACAO_CONFIG: Record<string, { label: string; color: string }> = {
  'Em Andamento': { label: 'Em Andamento', color: '#3B82F6' },
  'Resolvido': { label: 'Resolvido', color: '#10B981' },
};

function getCoords(bairro: string) {
  const key = Object.keys(BAIRRO_COORDS).find((b) =>
    bairro?.toLowerCase().includes(b.toLowerCase())
  );
  if (key) return BAIRRO_COORDS[key];
  return {
    latitude: DEFAULT_COORDS.latitude + (Math.random() - 0.5) * 0.06,
    longitude: DEFAULT_COORDS.longitude + (Math.random() - 0.5) * 0.06,
  };
}


function WebMapFallback({ denuncias, onSelect }: { denuncias: Denuncia[]; onSelect: (d: Denuncia) => void }) {

  const byBairro: Record<string, Denuncia[]> = {};
  denuncias.forEach((d) => {
    const b = d.bairroOcorrencia || 'Sem bairro';
    if (!byBairro[b]) byBairro[b] = [];
    byBairro[b].push(d);
  });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={webStyles.notice}>
        <Ionicons name="information-circle-outline" size={18} color="#6498c9" />
        <Text style={webStyles.noticeText}>lista de ocorrências por bairro.</Text>
      </View>

      {Object.entries(byBairro).map(([bairro, items]) => (
        <View key={bairro} style={webStyles.bairroBlock}>
          <View style={webStyles.bairroHeader}>
            <Ionicons name="location" size={16} color="#6498c9" />
            <Text style={webStyles.bairroTitle}>{bairro}</Text>
            <View style={webStyles.countBadge}>
              <Text style={webStyles.countText}>{items.length}</Text>
            </View>
          </View>
          {items.map((d) => {
            const color = TIPO_COLORS[d.tipoDenuncia] || '#6b7280';
            const sit = SITUACAO_CONFIG[d.situacao] || { label: d.situacao, color: '#6b7280' };
            return (
              <TouchableOpacity
                key={d.id}
                style={webStyles.card}
                onPress={() => onSelect(d)}
                accessibilityLabel={`Ver denúncia ${d.tipoDenuncia}`}
              >
                <View style={[webStyles.colorBar, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={webStyles.cardTipo}>{d.tipoDenuncia}</Text>
                  <Text style={webStyles.cardDesc} numberOfLines={1}>{d.descricaoOcorrencia}</Text>
                  <View style={webStyles.cardMeta}>
                    <View style={[webStyles.sitBadge, { backgroundColor: sit.color + '22' }]}>
                      <Text style={[webStyles.sitText, { color: sit.color }]}>{sit.label}</Text>
                    </View>
                    <Text style={webStyles.protoText}>#{d.protocolo}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}


export default function MapaScreen() {
  const { denuncias, loading, fetchDenuncias } = useDenunciasStore();
  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);


  const [MapComponents, setMapComponents] = useState<{
    MapView: any;
    Marker: any;
    Callout: any;
  } | null>(null);
  const [mapReady, setMapReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        const maps = require('react-native-maps');
        setMapComponents({
          MapView: maps.default,
          Marker: maps.Marker,
          Callout: maps.Callout,
        });
      } catch (e) {
        console.warn('react-native-maps não disponível:', e);
      } finally {
        setMapReady(true);
      }
    }
  }, []);

  useEffect(() => { fetchDenuncias(); }, []);

  const filtered = filtroTipo
    ? denuncias.filter((d) => d.tipoDenuncia === filtroTipo)
    : denuncias;

  const tipos = [...new Set(denuncias.map((d) => d.tipoDenuncia))];

  const handleSelect = (d: Denuncia) => { setSelectedDenuncia(d); setShowDetail(true); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>


      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mapa de Ocorrências</Text>
          <Text style={styles.headerSub}>{filtered.length} ocorrências</Text>
        </View>
        <TouchableOpacity
          style={styles.filtroBtn}
          onPress={() => setShowFiltros(true)}
          accessibilityLabel="Filtrar por tipo"
        >
          <Ionicons name="filter-outline" size={20} color={filtroTipo ? '#fff' : '#6498c9'} />
        </TouchableOpacity>
      </View>


      {filtroTipo && (
        <View style={styles.filtroAtivo}>
          <View style={[styles.filtroChip, { backgroundColor: (TIPO_COLORS[filtroTipo] || '#6498c9') + '22', borderColor: TIPO_COLORS[filtroTipo] || '#6498c9' }]}>
            <Text style={[styles.filtroChipText, { color: TIPO_COLORS[filtroTipo] || '#6498c9' }]}>{filtroTipo}</Text>
            <TouchableOpacity onPress={() => setFiltroTipo(null)} accessibilityLabel="Remover filtro">
              <Ionicons name="close-circle" size={16} color={TIPO_COLORS[filtroTipo] || '#6498c9'} />
            </TouchableOpacity>
          </View>
        </View>
      )}


      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6498c9" />
          <Text style={styles.loadingText}>Carregando ocorrências...</Text>
        </View>
      ) : !mapReady || !MapComponents ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6498c9" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <WebMapFallback denuncias={filtered} onSelect={handleSelect} />
      ) : (
        <>
          <MapComponents.MapView
            style={styles.map}
            initialRegion={{
              latitude: DEFAULT_COORDS.latitude,
              longitude: DEFAULT_COORDS.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {filtered.map((d) => {
              const coords = getCoords(d.bairroOcorrencia);
              const color = TIPO_COLORS[d.tipoDenuncia] || '#6498c9';
              return (
                <MapComponents.Marker
                  key={d.id}
                  coordinate={coords}
                  pinColor={color}
                  onPress={() => handleSelect(d)}
                >
                  <MapComponents.Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{d.tipoDenuncia}</Text>
                      <Text style={styles.calloutBairro}>{d.bairroOcorrencia}</Text>
                      <Text style={styles.calloutProto}>#{d.protocolo}</Text>
                    </View>
                  </MapComponents.Callout>
                </MapComponents.Marker>
              );
            })}
          </MapComponents.MapView>


          <View style={styles.legend}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {Object.entries(TIPO_COLORS).map(([tipo, color]) => (
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
          {selectedDenuncia && (
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <View style={[styles.tipoIndicator, { backgroundColor: (TIPO_COLORS[selectedDenuncia.tipoDenuncia] || '#6498c9') + '22' }]}>
                  <Text style={styles.tipoEmoji}>{selectedDenuncia.tipoDenuncia.includes('Dengue') ? '🦟' : '📍'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTipo}>{selectedDenuncia.tipoDenuncia}</Text>
                  <Text style={styles.sheetBairro}>{selectedDenuncia.bairroOcorrencia}</Text>
                </View>
                <View style={[styles.situacaoBadge, { backgroundColor: (SITUACAO_CONFIG[selectedDenuncia.situacao]?.color || '#6b7280') + '22' }]}>
                  <Text style={[styles.situacaoText, { color: SITUACAO_CONFIG[selectedDenuncia.situacao]?.color || '#6b7280' }]}>
                    {SITUACAO_CONFIG[selectedDenuncia.situacao]?.label || selectedDenuncia.situacao}
                  </Text>
                </View>
              </View>

              <Text style={styles.sheetDesc}>{selectedDenuncia.descricaoOcorrencia}</Text>

              <View style={styles.sheetMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>{selectedDenuncia.identificacao ? selectedDenuncia.nomeDenunciante : 'Anônimo'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                  <Text style={styles.metaText}>{new Date(selectedDenuncia.dataOcorrencia).toLocaleDateString('pt-BR')}</Text>
                </View>
              </View>

              <Text style={styles.sheetProtocolo}>Protocolo: #{selectedDenuncia.protocolo}</Text>
            </View>
          )}
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
            <Text style={styles.sheetTipo}>Filtrar por Tipo</Text>
            <TouchableOpacity
              style={[styles.filtroOption, !filtroTipo && styles.filtroOptionActive]}
              onPress={() => { setFiltroTipo(null); setShowFiltros(false); }}
              accessibilityLabel="Ver todas"
            >
              <Text style={[styles.filtroOptionText, !filtroTipo && styles.filtroOptionTextActive]}>Todos os tipos</Text>
              {!filtroTipo && <Ionicons name="checkmark" size={18} color="#6498c9" />}
            </TouchableOpacity>
            {tipos.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.filtroOption, filtroTipo === tipo && styles.filtroOptionActive]}
                onPress={() => { setFiltroTipo(tipo); setShowFiltros(false); }}
                accessibilityLabel={tipo}
              >
                <View style={[styles.typeDot, { backgroundColor: TIPO_COLORS[tipo] || '#6498c9' }]} />
                <Text style={[styles.filtroOptionText, filtroTipo === tipo && styles.filtroOptionTextActive]}>{tipo}</Text>
                {filtroTipo === tipo && <Ionicons name="checkmark" size={18} color="#6498c9" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  filtroBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center',
  },

  filtroAtivo: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  filtroChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  filtroChipText: { fontSize: 13, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6b7280' },

  map: { flex: 1 },

  callout: { width: 160, padding: 8 },
  calloutTitle: { fontSize: 13, fontWeight: '700', color: '#1e3a5f', marginBottom: 2 },
  calloutBairro: { fontSize: 12, color: '#6b7280' },
  calloutProto: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginTop: 2 },

  legend: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f0f4f8',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#4b5563', fontWeight: '600' },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#e5e7eb',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipoIndicator: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tipoEmoji: { fontSize: 24 },
  sheetTipo: { fontSize: 16, fontWeight: '800', color: '#1e3a5f', marginBottom: 4 },
  sheetBairro: { fontSize: 13, color: '#6b7280' },
  situacaoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  situacaoText: { fontSize: 11, fontWeight: '700' },
  sheetDesc: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 },
  sheetMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: '#9ca3af' },
  sheetProtocolo: { fontSize: 13, fontWeight: '700', color: '#6498c9' },

  filtroOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  filtroOptionActive: {},
  filtroOptionText: { flex: 1, fontSize: 15, color: '#374151' },
  filtroOptionTextActive: { color: '#6498c9', fontWeight: '700' },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
});

const webStyles = StyleSheet.create({
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  noticeText: { flex: 1, fontSize: 13, color: '#1e3a5f', lineHeight: 19 },

  bairroBlock: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  bairroHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  bairroTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1e3a5f' },
  countBadge: {
    backgroundColor: '#6498c9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  card: {
    flexDirection: 'row', alignItems: 'stretch',
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
    overflow: 'hidden',
  },
  colorBar: { width: 4 },
  cardTipo: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', padding: 12, paddingBottom: 2 },
  cardDesc: { fontSize: 13, color: '#6b7280', paddingHorizontal: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingTop: 6 },
  sitBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  sitText: { fontSize: 11, fontWeight: '700' },
  protoText: { fontSize: 11, color: '#6498c9', fontWeight: '700', marginLeft: 'auto' },
});
