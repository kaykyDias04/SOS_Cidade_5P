import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';

const TIPOS_DENUNCIA = [
  'Foco de Dengue',
  'Iluminação Pública',
  "Falta D'água",
  'Alagamento',
  'Descarte Irregular de Lixo',
  'Buraco na Via',
  'Outro',
];

const BAIRROS_RECIFE = [
  'Afogados',
  'Água Fria',
  'Arruda',
  'Beberibe',
  'Boa Viagem',
  'Boa Vista',
  'Brasília Teimosa',
  'Campo Grande',
  'Casa Amarela',
  'Caxangá',
  'Coelhos',
  'Cordeiro',
  'Derby',
  'Dois Irmãos',
  'Encruzilhada',
  'Espinheiro',
  'Graças',
  'Ibura',
  'Imbiribeira',
  'IPSEP',
  'Iputinga',
  'Jaqueira',
  'Jardim São Paulo',
  'Madalena',
  'Mustardinha',
  'Parnamirim',
  'Pina',
  'Prado',
  'Recife (Centro)',
  'Rosarinho',
  'San Martin',
  'Santo Amaro',
  'São José',
  'Tamarineira',
  'Tejipió',
  'Torre',
  'Torreão',
  'Várzea',
];

const SITUACAO_INICIAL = 'Em Andamento';

export default function NovaDenunciaScreen() {
  const { user } = useAuthStore();
  const { createDenuncia } = useDenunciasStore();

  const [tipoDenuncia, setTipoDenuncia] = useState('');
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [bairro, setBairro] = useState('');
  const [showBairroModal, setShowBairroModal] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [identificacao, setIdentificacao] = useState(true);
  const [imagens, setImagens] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!tipoDenuncia) e.tipo = 'Selecione um tipo';
    if (!bairro.trim()) e.bairro = 'Selecione o bairro';
    if (!descricao.trim() || descricao.length < 10) e.descricao = 'Descreva com ao menos 10 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickImage = async () => {
    if (imagens.length >= 4) {
      Toast.show({ type: 'info', text1: 'Limite atingido', text2: 'Máximo de 4 imagens por denúncia.' });
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0].base64) {
      setImagens((prev) => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removeImage = (idx: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await createDenuncia({
        tipoDenuncia,
        identificacao,
        nomeDenunciante: identificacao ? (user?.name || 'Anônimo') : 'Anônimo',
        userId: user?.id,
        bairroOcorrencia: bairro.trim(),
        descricaoOcorrencia: descricao.trim(),
        dataOcorrencia: data,
        protocolo: '',
        situacao: SITUACAO_INICIAL,
        imagens: imagens.length > 0 ? imagens : null,
      });

      if (result) {
        setProtocolo(result.protocolo);
        setShowSuccessModal(true);

        setTipoDenuncia('');
        setBairro('');
        setDescricao('');
        setImagens([]);
        setIdentificacao(true);
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível registrar a denúncia.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>


        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nova Denúncia</Text>
          <Text style={styles.headerSub}>Relate um problema na sua cidade</Text>
        </View>

        <View style={styles.form}>


          <View style={styles.field}>
            <Text style={styles.label}>Tipo de Ocorrência *</Text>
            <TouchableOpacity
              style={[styles.select, errors.tipo ? styles.inputError : null]}
              onPress={() => setShowTipoModal(true)}
              accessibilityLabel="Selecionar tipo de denúncia"
            >
              <Text style={tipoDenuncia ? styles.selectText : styles.placeholder}>
                {tipoDenuncia || 'Selecione o tipo...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
            {!!errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}
          </View>


          <View style={styles.field}>
            <Text style={styles.label}>Bairro da Ocorrência *</Text>
            <TouchableOpacity
              style={[styles.select, errors.bairro ? styles.inputError : null]}
              onPress={() => setShowBairroModal(true)}
              accessibilityLabel="Selecionar bairro da ocorrência"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="location-outline" size={18} color="#9ca3af" />
                <Text style={bairro ? styles.selectText : styles.placeholder}>
                  {bairro || 'Selecione o bairro...'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
            {!!errors.bairro && <Text style={styles.errorText}>{errors.bairro}</Text>}
          </View>


          <View style={styles.field}>
            <Text style={styles.label}>Descrição da Ocorrência *</Text>
            <TextInput
              style={[styles.textarea, errors.descricao ? styles.inputError : null]}
              placeholder="Descreva a ocorrência com o máximo de detalhes possível..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={descricao}
              onChangeText={(v) => { setDescricao(v); setErrors((e) => ({ ...e, descricao: '' })); }}
              accessibilityLabel="Campo descrição"
            />
            <Text style={styles.charCount}>{descricao.length} caracteres</Text>
            {!!errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
          </View>


          <View style={styles.field}>
            <Text style={styles.label}>Data da Ocorrência</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={data}
                onChangeText={setData}
                accessibilityLabel="Campo data"
              />
            </View>
          </View>


          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Identificar-me</Text>
              <Text style={styles.switchDesc}>Seu nome será associado à denúncia</Text>
            </View>
            <Switch
              value={identificacao}
              onValueChange={setIdentificacao}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={identificacao ? '#6498c9' : '#d1d5db'}
            />
          </View>


          <View style={styles.field}>
            <Text style={styles.label}>Imagens (máx. 4)</Text>
            <View style={styles.imageRow}>
              {imagens.map((uri, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.imageRemove}
                    onPress={() => removeImage(idx)}
                    accessibilityLabel={`Remover imagem ${idx + 1}`}
                  >
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {imagens.length < 4 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} accessibilityLabel="Adicionar imagem">
                  <Ionicons name="camera-outline" size={28} color="#6498c9" />
                  <Text style={styles.addImageText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>


          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityLabel="Enviar denúncia"
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitText}>ENVIAR DENÚNCIA</Text>
                </>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>


      <Modal visible={showTipoModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTipoModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecione o Tipo</Text>
            {TIPOS_DENUNCIA.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.modalOption, tipo === tipoDenuncia && styles.modalOptionSelected]}
                onPress={() => { setTipoDenuncia(tipo); setShowTipoModal(false); setErrors((e) => ({ ...e, tipo: '' })); }}
                accessibilityLabel={tipo}
              >
                <Text style={[styles.modalOptionText, tipo === tipoDenuncia && styles.modalOptionTextSelected]}>
                  {tipo}
                </Text>
                {tipo === tipoDenuncia && <Ionicons name="checkmark" size={18} color="#6498c9" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>


      <Modal visible={showBairroModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBairroModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecione o Bairro</Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true}>
              {BAIRROS_RECIFE.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.modalOption, b === bairro && styles.modalOptionSelected]}
                  onPress={() => { setBairro(b); setShowBairroModal(false); setErrors((e) => ({ ...e, bairro: '' })); }}
                  accessibilityLabel={b}
                >
                  <Text style={[styles.modalOptionText, b === bairro && styles.modalOptionTextSelected]}>
                    {b}
                  </Text>
                  {b === bairro && <Ionicons name="checkmark" size={18} color="#6498c9" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>


      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Denúncia Registrada!</Text>
            <Text style={styles.successDesc}>Seu protocolo de acompanhamento é:</Text>
            <View style={styles.protocoloBadge}>
              <Text style={styles.protocoloText}>#{protocolo}</Text>
            </View>
            <Text style={styles.successNote}>
              Guarde este número para acompanhar o status da sua denúncia.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => setShowSuccessModal(false)}
              accessibilityLabel="Fechar"
            >
              <Text style={styles.successBtnText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1e3a5f' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  form: { padding: 20, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },

  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  selectText: { fontSize: 15, color: '#111827' },
  placeholder: { fontSize: 15, color: '#9ca3af' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
    paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  inputError: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, color: '#ef4444' },

  textarea: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
    minHeight: 120,
  },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right' },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  switchDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageWrapper: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 12 },
  imageRemove: { position: 'absolute', top: -8, right: -8 },
  addImageBtn: {
    width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: '#bfdbfe',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EFF6FF', gap: 4,
  },
  addImageText: { fontSize: 11, color: '#6498c9', fontWeight: '700' },

  submitBtn: {
    backgroundColor: '#6498c9', height: 54, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#6498c9', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },


  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#e5e7eb',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1e3a5f', marginBottom: 16 },
  modalOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  modalOptionSelected: { backgroundColor: '#EFF6FF', marginHorizontal: -24, paddingHorizontal: 24 },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextSelected: { color: '#6498c9', fontWeight: '700' },


  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 32,
    alignItems: 'center', width: '100%', maxWidth: 360,
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#1e3a5f', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  protocoloBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    marginBottom: 16,
  },
  protocoloText: { fontSize: 20, fontWeight: '800', color: '#6498c9', letterSpacing: 1 },
  successNote: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  successBtn: {
    backgroundColor: '#6498c9', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, width: '100%',
    alignItems: 'center',
  },
  successBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
