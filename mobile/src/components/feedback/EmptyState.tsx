import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  iconSize?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

export default function EmptyState({
  title,
  message,
  icon = 'document-text-outline',
  iconSize = 56,
  iconColor = colors.grayLight,
  style,
  titleStyle,
  messageStyle,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {message && <Text style={[styles.message, messageStyle]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  title: { fontSize: 17, fontWeight: '700', color: colors.grayDark },
  message: { fontSize: 13, color: colors.gray, textAlign: 'center' },
});
