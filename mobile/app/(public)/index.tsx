import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/Logo';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  { title: 'Foco de Dengue', icon: 'bug-outline' as const },
  { title: 'Iluminação Pública', icon: 'bulb-outline' as const },
  { title: "Falta D'água", icon: 'water-outline' as const },
  { title: 'Alagamento', icon: 'thunderstorm-outline' as const },
  { title: 'Descarte Irregular de Lixo', icon: 'trash-outline' as const },
  { title: 'Buraco na Via', icon: 'warning-outline' as const },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo size={36} />
            <Text style={styles.logoText}>S.O.S Cidade</Text>
          </View>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
            accessibilityLabel="Entrar"
          >
            <Text style={styles.loginBtnText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              Sua voz ajuda a construir uma cidade melhor
            </Text>
            <Text style={styles.heroSubtitle}>
              Relate problemas do cotidiano urbano de forma rápida e segura
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push('/login')}
              accessibilityLabel="Faça sua denúncia agora"
            >
              <Text style={styles.ctaBtnText}>FAÇA SUA DENÚNCIA AGORA</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como Funciona</Text>
          <View style={styles.stepsRow}>
            {[
              { icon: 'camera-outline' as const, label: '1. RELATE', desc: 'Escolha a categoria e descreva o problema' },
              { icon: 'search-outline' as const, label: '2. ACOMPANHE', desc: 'Receba um protocolo e siga o status em tempo real' },
              { icon: 'settings-outline' as const, label: '3. RESOLVA', desc: 'A prefeitura recebe o chamado e toma providências' },
            ].map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={28} color="#6498c9" />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Ionicons name="lock-closed" size={36} color="#6498c9" />
          </View>
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Sua identidade está protegida</Text>
            <Text style={styles.privacyDesc}>
              O sistema garante o anonimato ou o sigilo dos seus dados, em total conformidade com a LGPD.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que você pode denunciar</Text>
          <View style={styles.grid}>
            {CATEGORIAS.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.categoryCard}
                onPress={() => router.push('/login')}
                accessibilityLabel={cat.title}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons name={cat.icon} size={28} color="#6498c9" />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 S.O.S Cidade. Todos os direitos reservados.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    ...(Platform.OS === 'web' ? {
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    } : {})
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#6498c9',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '800', color: '#6498c9', letterSpacing: -0.5 },
  loginBtn: {
    borderWidth: 2, borderColor: '#6498c9', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  loginBtnText: { color: '#6498c9', fontWeight: '700', fontSize: 12 },

  hero: {
    height: 220, backgroundColor: '#6498c9',
    justifyContent: 'center', alignItems: 'center',
  },
  heroOverlay: {
    flex: 1, backgroundColor: 'rgba(20,40,80,0.55)',
    justifyContent: 'center', alignItems: 'center',
    padding: 24, width: '100%',
  },
  heroTitle: {
    color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center',
    marginBottom: 10, lineHeight: 30,
  },
  heroSubtitle: {
    color: '#e0eeff', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: '#3b82f6', paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
  },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: '#6498c9',
    marginBottom: 16, textAlign: 'center',
  },

  stepsRow: { flexDirection: 'column', gap: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepIcon: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepLabel: { fontWeight: '800', color: '#1e3a5f', fontSize: 13, marginBottom: 3 },
  stepDesc: { color: '#4b5563', fontSize: 13, lineHeight: 19, flex: 1 },

  privacyCard: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20,
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: '#e8f1fb',
  },
  privacyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: 15, fontWeight: '800', color: '#6498c9', marginBottom: 6 },
  privacyDesc: { fontSize: 13, color: '#4b5563', lineHeight: 19 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#e8f1fb',
  },
  categoryIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  categoryTitle: { fontSize: 12, fontWeight: '700', color: '#1e3a5f', textAlign: 'center' },

  footer: { padding: 24, alignItems: 'center' },
  footerText: { color: '#9ca3af', fontSize: 12 },
});
