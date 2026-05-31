import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing, type } from '../theme';

export const BackButton: React.FC<{ onPress: () => void; light?: boolean }> = ({
  onPress,
  light,
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={10}
    style={({ pressed }) => [
      styles.back,
      { backgroundColor: light ? 'rgba(255,255,255,0.9)' : colors.surface },
      shadow('sm'),
      pressed && { opacity: 0.85 },
    ]}
  >
    <Ionicons name="chevron-back" size={22} color={colors.brownDark} />
  </Pressable>
);

interface FieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export const Field: React.FC<FieldProps> = ({
  label,
  icon,
  suffix,
  containerStyle,
  ...input
}) => (
  <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.fieldRow}>
      {icon && (
        <Ionicons name={icon} size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
      )}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...input}
      />
      {suffix && <Text style={styles.suffix}>{suffix}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...type.label, color: colors.brownDark, marginBottom: spacing.sm },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 54,
  },
  input: { flex: 1, ...type.bodyLg, color: colors.text, paddingVertical: 0 },
  suffix: { ...type.body, color: colors.textMuted, marginLeft: 6 },
});
