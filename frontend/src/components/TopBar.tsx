import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, type } from '../theme';
import { Logo, Wordmark } from './ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MENU: {
  label: string;
  route: keyof RootStackParamList;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: 'Profile', route: 'Profile', icon: 'person-outline' },
  { label: 'Find Quest', route: 'FindQuest', icon: 'compass-outline' },
  { label: 'Finished Quests', route: 'FinishedQuests', icon: 'flag-outline' },
  { label: 'Badges & Awards', route: 'Badges', icon: 'ribbon-outline' },
];

const TopBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [open, setOpen] = useState(false);
  const currentRoute = useNavigationState(
    (s) => s.routes[s.index]?.name as keyof RootStackParamList,
  );

  const go = (route: keyof RootStackParamList) => {
    setOpen(false);
    if (route !== currentRoute) navigation.navigate(route as any);
  };

  return (
    <>
      <View style={[styles.bar, { paddingTop: insets.top + 8 }, shadow('sm')]}>
        <Pressable style={styles.brand} onPress={() => go('FindQuest')}>
          <Logo size={34} />
          <Wordmark size={18} />
        </Pressable>

        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85 }]}
          hitSlop={8}
        >
          <Ionicons name="person" size={20} color={colors.green} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 56 }, shadow('lg')]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Ionicons name="person" size={22} color={colors.green} />
              </View>
              <Text style={styles.menuHeaderText}>Your menu</Text>
            </View>
            {MENU.map((item) => {
              const active = item.route === currentRoute;
              return (
                <Pressable
                  key={item.route}
                  onPress={() => go(item.route)}
                  style={({ pressed }) => [
                    styles.item,
                    active && styles.itemActive,
                    pressed && { backgroundColor: colors.surfaceAlt },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={active ? colors.green : colors.brownDark}
                  />
                  <Text style={[styles.itemText, active && { color: colors.green }]}>
                    {item.label}
                  </Text>
                  {active && (
                    <Ionicons
                      name="ellipse"
                      size={8}
                      color={colors.green}
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    zIndex: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  menu: {
    position: 'absolute',
    right: spacing.lg,
    width: 248,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  menuAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuHeaderText: { ...type.label, color: colors.textMuted },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemActive: { backgroundColor: colors.greenTint },
  itemText: { ...type.bodyLg, color: colors.brownDark, fontWeight: '600' },
});

export default TopBar;
