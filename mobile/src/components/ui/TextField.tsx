import { Text, TextInput, View, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function TextField({
  label,
  error,
  leadingIcon,
  trailingElement,
  containerStyle,
  inputWrapperStyle,
  labelStyle,
  style: inputStyle,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError, inputWrapperStyle]}>
        {leadingIcon && <View style={styles.leadingIcon}>{leadingIcon}</View>}
        <TextInput {...inputProps} style={[styles.input, inputStyle]} />
        {trailingElement}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    height: 52,
  },
  inputError: { borderColor: colors.error },
  leadingIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.inputText },
  errorText: { fontSize: 12, color: colors.error, marginTop: 2 },
});
