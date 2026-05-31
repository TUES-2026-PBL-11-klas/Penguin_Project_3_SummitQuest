import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing, type } from '../theme';

/* ------------------------------------------------------------------ Logo */

export const Logo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <View
    style={[
      logoStyles.badge,
      { width: size, height: size, borderRadius: size * 0.32 },
      shadow('sm'),
    ]}
  >
    <MaterialCommunityIcons
      name="image-filter-hdr"
      size={size * 0.62}
      color={colors.surface}
    />
  </View>
);

export const Wordmark: React.FC<{ size?: number; tight?: boolean }> = ({
  size = 22,
  tight,
}) => (
  <Text style={[logoStyles.word, { fontSize: size }]}>
    Summit
    <Text style={{ color: colors.green }}>Quest</Text>
    {tight ? null : ''}
  </Text>
);

const logoStyles = StyleSheet.create({
  badge: {
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: { fontWeight: '800', color: colors.brownDark, letterSpacing: -0.4 },
});

/* ---------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'secondary' | 'light' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  fullWidth,
  loading,
  disabled,
  style,
  size = 'lg',
}) => {
  const v = btnVariants[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        btnStyles.base,
        size === 'lg' ? btnStyles.lg : btnStyles.md,
        { backgroundColor: v.bg, borderColor: v.border },
        v.elevated && !isDisabled ? shadow('md') : null,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && { opacity: 0.9, transform: [{ scale: 0.985 }] },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={btnStyles.row}>
          {icon && (
            <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: 8 }} />
          )}
          <Text style={[btnStyles.label, { color: v.fg }]}>{title}</Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={18}
              color={v.fg}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const btnVariants: Record<
  ButtonVariant,
  { bg: string; fg: string; border: string; elevated?: boolean }
> = {
  primary: { bg: colors.green, fg: colors.textInverse, border: colors.green, elevated: true },
  danger: { bg: colors.danger, fg: colors.textInverse, border: colors.danger, elevated: true },
  light: { bg: colors.surface, fg: colors.green, border: colors.surface, elevated: true },
  secondary: { bg: 'transparent', fg: colors.green, border: colors.borderStrong },
  ghost: { bg: 'transparent', fg: colors.textMuted, border: 'transparent' },
};

const btnStyles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
  md: { paddingVertical: 11, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { ...type.bodyLg, fontWeight: '700' },
});

/* ------------------------------------------------------------------ Chip */

export const Chip: React.FC<{
  label: string;
  color?: string;
  bg?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}> = ({ label, color = colors.green, bg = colors.greenTint, icon, style }) => (
  <View style={[chipStyles.chip, { backgroundColor: bg }, style]}>
    {icon && <Ionicons name={icon} size={13} color={color} style={{ marginRight: 5 }} />}
    <Text style={[chipStyles.text, { color }]}>{label}</Text>
  </View>
);

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  text: { ...type.caption },
});

/* ----------------------------------------------------------- IconCircleBtn */

export const IconCircleButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
  bg?: string;
  size?: number;
}> = ({ icon, onPress, color = colors.brownDark, bg = colors.surface, size = 44 }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      shadow('sm'),
      pressed && { opacity: 0.85 },
    ]}
  >
    <Ionicons name={icon} size={size * 0.46} color={color} />
  </Pressable>
);

/* ------------------------------------------------------------- StatTile */

export const StatTile: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  accent?: string;
  style?: ViewStyle;
}> = ({ icon, value, label, accent = colors.green, style }) => (
  <View style={[statStyles.tile, shadow('sm'), style]}>
    <View style={[statStyles.iconWrap, { backgroundColor: accent + '1A' }]}>
      <Ionicons name={icon} size={18} color={accent} />
    </View>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    minWidth: 96,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: { ...type.h3, color: colors.text },
  label: { ...type.caption, color: colors.textMuted, marginTop: 2 },
});

/* ---------------------------------------------------------- SectionLabel */

export const SectionLabel: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style,
}) => <Text style={[sectionStyles.label, style]}>{children}</Text>;

const sectionStyles = StyleSheet.create({
  label: {
    ...type.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});

/* ---------------------------------------------------------------- Card */

export const Card: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  level?: 'sm' | 'md' | 'lg';
}> = ({ children, style, level = 'md' }) => (
  <View style={[cardStyles.card, shadow(level), style]}>{children}</View>
);

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
});
