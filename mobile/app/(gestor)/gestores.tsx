import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { usersAPI, User } from '@/lib/api';

export default function GestoresScreen() {
  const [gestores, setGestores] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchGestores = async () => {
    setLoading(true);
    const res = await usersAPI.list('GESTOR');
    if (res.success && res.data) setGestores(res.data as User[]);
    setLoading(false);
  };

  useEffect(() => { fetchGestores(); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome obrigatório';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!senha.trim() || senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const res = await usersAPI.create({ name: nome.trim(), email: email.trim(), password: senha, role: 'GESTOR' });
    setSubmitting(false);
    if (res.success && res.data) {
      Toast.show({ type: 'success', text1: 'Gestor criado!', text2: `${nome} foi adicionado com sucesso.` });
      setShowModal(false);
      setNome(''); setEmail(''); setSenha('');
      fetchGestores();
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao criar gestor' });
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
            const res = await usersAPI.delete(gestor.id);
            if (res.success) {
              setGestores((g) => g.filter((u) => u.id !== gestor.id));
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

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Gestores</Text>
          <Text style={styles.headerSub}>{gestores.length} gestores ativos</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowModal(true)}
          accessibilityLabel="Adicionar gestor"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>


      <FlatList
        data={gestores}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshing={loading}
        onRefresh={fetchGestores}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={56} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Nenhum gestor cadastrado</Text>
              <Text style={styles.emptyDesc}>Toque no + para adicionar um gestor</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />


      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} accessibilityLabel="Fechar">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Gestor</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalForm}>
            <View style={styles.field}>
              <Text style={styles.label}>Nome completo *</Text>
              <View style={[styles.inputWrapper, errors.nome ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João Silva"
                  placeholderTextColor="#9ca3af"
                  value={nome}
                  onChangeText={(v) => { setNome(v); setErrors((e) => ({ ...e, nome: '' })); }}
                  accessibilityLabel="Campo nome"
                />
              </View>
              {!!errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail *</Text>
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="gestor@prefeitura.gov.br"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }}
                  accessibilityLabel="Campo email"
                />
              </View>
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha *</Text>
              <View style={[styles.inputWrapper, errors.senha ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showSenha}
                  value={senha}
                  onChangeText={(v) => { setSenha(v); setErrors((e) => ({ ...e, senha: '' })); }}
                  accessibilityLabel="Campo senha"
                />
                <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                  <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {!!errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={handleCreate}
              disabled={submitting}
              accessibilityLabel="Criar gestor"
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>CRIAR GESTOR</Text>
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#6b7280' },
  emptyDesc: { fontSize: 13, color: '#9ca3af' },


  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f4f8',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1e3a5f' },
  modalForm: { padding: 20, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb',
    paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#ef4444' },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { fontSize: 12, color: '#ef4444' },
  submitBtn: {
    backgroundColor: '#6498c9', height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: '#6498c9', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  submitDisabled: { opacity: 0.65 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
