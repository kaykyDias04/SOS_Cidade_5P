import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface LoadingStateProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

export default function LoadingState({ message, style }: LoadingStateProps) {
  return (
    <View style={[styles.container, style]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  message: { fontSize: 14, color: colors.grayDark },
});
