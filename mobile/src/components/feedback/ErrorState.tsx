import { Text, View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ErrorState({ title, message, onRetry, style }: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      <Button
        title="Tentar novamente"
        onPress={onRetry}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, gap: 10 },
  title: { fontSize: 17, fontWeight: '700', color: colors.error, textAlign: 'center' },
  message: { fontSize: 13, color: colors.grayDark, textAlign: 'center' },
  button: { minWidth: 180 },
  buttonText: {},
});
