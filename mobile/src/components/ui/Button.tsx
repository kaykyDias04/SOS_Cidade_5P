import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  loadingColor?: ColorValue;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
  loadingColor = colors.surface,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      {loading
        ? <ActivityIndicator color={loadingColor} />
        : <>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabled: { opacity: 0.65 },
  text: { color: colors.surface, fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
