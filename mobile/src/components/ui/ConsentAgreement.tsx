import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { LEGAL_DOCUMENTS, LEGAL_DOCUMENT_VERSION } from '@/constants/legalDocuments';

type DocumentName = keyof typeof LEGAL_DOCUMENTS;

interface ConsentAgreementProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export default function ConsentAgreement({ checked, onChange, error }: ConsentAgreementProps) {
  const [document, setDocument] = useState<DocumentName | null>(null);
  const content = document ? LEGAL_DOCUMENTS[document] : null;

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel="Li e concordo com os Termos de Uso e a Política de Privacidade"
          onPress={() => onChange(!checked)}
          style={[styles.checkbox, checked && styles.checkboxChecked]}
        >
          {checked && <Ionicons name="checkmark" size={16} color={colors.surface} />}
        </Pressable>
        <Text style={styles.label}>
          Li e concordo com os{' '}
          <Text style={styles.link} onPress={() => setDocument('terms')}>Termos de Uso</Text>
          {' '}e a{' '}
          <Text style={styles.link} onPress={() => setDocument('privacy')}>Política de Privacidade</Text>.
        </Text>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={document !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDocument(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>{content?.title}</Text>
            <Text style={styles.version}>Versão {LEGAL_DOCUMENT_VERSION} · Protótipo acadêmico</Text>
            <ScrollView style={styles.document}>
              {content?.sections.map((section) => (
                <View key={section.heading} style={styles.section}>
                  <Text style={styles.heading}>{section.heading}</Text>
                  <Text style={styles.body}>{section.body}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDocument(null)}
              accessibilityRole="button"
              accessibilityLabel="Fechar documento"
            >
              <Text style={styles.closeText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.gray,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flex: 1, color: colors.grayDark, fontSize: 13, lineHeight: 20 },
  link: { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  error: { marginTop: 6, color: colors.error, fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  title: { color: colors.primaryDark, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  version: { color: colors.gray, fontSize: 12, marginTop: -8, marginBottom: 12 },
  document: { flexGrow: 0 },
  section: { marginBottom: 14 },
  heading: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  body: { color: colors.grayDark, fontSize: 13, lineHeight: 20 },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 14,
    padding: 14,
  },
  closeText: { color: colors.surface, fontWeight: '800' },
});
