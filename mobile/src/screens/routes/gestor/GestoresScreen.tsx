import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useGestores } from '@/hooks/useGestores';
import type { User } from '@/types';
import { colors } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import LoadingState from '@/components/feedback/LoadingState';
import GestorFormFields from '@/components/gestor/GestorFormFields';
import { hasErrors, validarGestor, type GestorErrors } from '@/utils/validation';

export default function GestoresScreen() {
  const { gestores, loading, error, listar, criar, excluir } = useGestores();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<GestorErrors>({});

  const validate = () => {
    const e = validarGestor({ nome, email, senha });
    setErrors(e);
    return !hasErrors(e);
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const res = await criar({ name: nome.trim(), email: email.trim(), password: senha, role: 'GESTOR' });
    setSubmitting(false);
    if (res.success && res.data) {
      Toast.show({ type: 'success', text1: 'Gestor criado!', text2: `${nome} foi adicionado com sucesso.` });
      setShowModal(false);
      setNome(''); setEmail(''); setSenha('');
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: res.error || 'Falha ao criar gestor' });
    }
  };

  const handleDelete = (gestor: User) => {
    Alert.alert(
      'Remover Gestor',
      `Tem certeza que deseja remover ${gestor.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive',
          onPress: async () => {
            const res = await excluir(gestor.id);
            if (res.success) {
              Toast.show({ type: 'success', text1: 'Gestor removido' });
            } else {
              Toast.show({ type: 'error', text1: 'Erro', text2: res.error });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>GESTOR</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteBtn}
        accessibilityLabel={`Remover ${item.name}`}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <ScreenHeader
        variant="simple"
        title="Gestores"
        subtitle={`${gestores.length} gestores ativos`}
        style={styles.header}
        titleStyle={styles.headerTitle}
        subtitleStyle={styles.headerSub}
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
            accessibilityLabel="Adicionar gestor"
          >
            <Ionicons name="add" size={24} color={colors.surface} />
          </TouchableOpacity>
        }
      />


      <FlatList
        data={gestores}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshing={loading}
        onRefresh={listar}
        ListEmptyComponent={loading
          ? <LoadingState message="Carregando gestores..." style={styles.emptyState} />
          : error
            ? <ErrorState title="Erro ao carregar gestores" message={error} onRetry={listar} />
            : <EmptyState title="Nenhum gestor cadastrado" message="Toque no + para adicionar um gestor" icon="people-outline" />}
        showsVerticalScrollIndicator={false}
      />


      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
          <ScreenHeader
            variant="simple"
            title="Novo Gestor"
            style={styles.modalHeader}
            titleStyle={styles.modalTitle}
            leftElement={
              <TouchableOpacity onPress={() => setShowModal(false)} accessibilityLabel="Fechar">
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            }
            rightElement={<View style={styles.headerSpacer} />}
          />

          <View style={styles.modalForm}>
            <GestorFormFields
              nome={nome}
              email={email}
              senha={senha}
              showSenha={showSenha}
              errors={errors}
              onNomeChange={(value) => { setNome(value); setErrors((current) => ({ ...current, nome: '' })); }}
              onEmailChange={(value) => { setEmail(value); setErrors((current) => ({ ...current, email: '' })); }}
              onSenhaChange={(value) => { setSenha(value); setErrors((current) => ({ ...current, senha: '' })); }}
              onToggleSenha={() => setShowSenha(!showSenha)}
            />

            <Button
              title="CRIAR GESTOR"
              onPress={handleCreate}
              loading={submitting}
              accessibilityLabel="Criar gestor"
              style={styles.submitBtn}
              textStyle={styles.submitText}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { paddingBottom: 14 },
  headerTitle: { fontSize: 20 },
  headerSub: { color: colors.gray },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6498c9', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  name: { fontSize: 15, fontWeight: '700', color: '#1e3a5f' },
  email: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  roleBadge: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { fontSize: 10, fontWeight: '800', color: '#6498c9' },
  deleteBtn: { padding: 6 },

  emptyState: { paddingVertical: 60 },
  modalHeader: { paddingBottom: 20 },
  modalTitle: { fontSize: 17, textAlign: 'center' },
  headerSpacer: { width: 24 },
  modalForm: { padding: 20, gap: 16 },
  submitBtn: { height: 54, borderRadius: 14, marginTop: 8 },
  submitText: { color: colors.surface, fontWeight: '800', fontSize: 15, letterSpacing: 0 },
});
