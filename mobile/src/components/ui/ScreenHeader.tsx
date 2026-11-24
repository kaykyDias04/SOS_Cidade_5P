import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/components/Logo';
import { colors } from '@/constants/theme';

interface ScreenHeaderBaseProps {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

type ScreenHeaderProps = ScreenHeaderBaseProps & (
  | {
      variant: 'simple';
      onBack?: never;
      leftElement?: ReactNode;
      rightElement?: ReactNode;
    }
  | {
      variant?: 'auth';
      onBack: () => void;
      leftElement?: never;
      rightElement?: never;
    }
);

export default function ScreenHeader(props: ScreenHeaderProps) {
  const { title, subtitle, style, titleStyle, subtitleStyle } = props;

  if (props.variant === 'simple') {
    return (
      <View style={[styles.simpleHeader, style]}>
        {props.leftElement}
        <View style={styles.simpleTitleGroup}>
          <Text style={[styles.simpleTitle, titleStyle]}>{title}</Text>
          {subtitle !== undefined && <Text style={[styles.simpleSubtitle, subtitleStyle]}>{subtitle}</Text>}
        </View>
        {props.rightElement}
      </View>
    );
  }

  const onBack = props.onBack;
  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityLabel="Voltar"
      >
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
      </TouchableOpacity>
      <View style={[styles.logoArea, style]}>
        <Logo size={80} />
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  simpleTitleGroup: { flex: 1 },
  simpleTitle: { fontSize: 22, fontWeight: '800', color: colors.primaryDark },
  simpleSubtitle: { fontSize: 13, color: colors.grayDark, marginTop: 2 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 14,
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: colors.grayDark },
});
