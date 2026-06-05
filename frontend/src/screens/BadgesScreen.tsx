import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScreen from '../components/AppScreen';
import { SectionLabel } from '../components/ui';
import { BADGES } from '../data/mock';
import { colors, radius, shadow, spacing, type } from '../theme';

const BadgesScreen: React.FC = () => {
  const allBadges = BADGES.map(b => ({ ...b, earned: false }));
  const earned = allBadges.filter((b) => b.earned);
  const locked = allBadges.filter((b) => !b.earned);

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>BADGES & AWARDS</Text>
        <Text style={styles.h1}>Your trophy cabinet</Text>
        <Text style={styles.lead}>
          {earned.length} of {allBadges.length} badges earned. Keep climbing to unlock the rest.
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${(earned.length / allBadges.length) * 100}%` }]}
          />
        </View>

        <SectionLabel style={{ marginTop: spacing.xxl }}>EARNED</SectionLabel>
        <View style={styles.grid}>
          {earned.map((b) => (
            <View key={b.id} style={[styles.badge, shadow('sm')]}>
              <View style={[styles.badgeIcon, { backgroundColor: b.accent }]}>
                <Ionicons name={b.icon as any} size={30} color="#fff" />
              </View>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.description}</Text>
              <View style={styles.earnedTag}>
                <Ionicons name="checkmark-circle" size={13} color={colors.green} />
                <Text style={styles.earnedText}>Earned</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionLabel style={{ marginTop: spacing.xxl }}>LOCKED</SectionLabel>
        <View style={styles.grid}>
          {locked.map((b) => (
            <View key={b.id} style={[styles.badge, styles.badgeLocked]}>
              <View style={[styles.badgeIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name={b.icon as any} size={30} color={colors.borderStrong} />
                <View style={styles.lockDot}>
                  <Ionicons name="lock-closed" size={11} color={colors.textMuted} />
                </View>
              </View>
              <Text style={[styles.badgeTitle, { color: colors.textMuted }]}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  kicker: { ...type.caption, color: colors.greenSoft, marginBottom: 4 },
  h1: { ...type.h1, color: colors.brownDark },
  lead: { ...type.body, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 22 },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.green },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badge: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  badgeLocked: { backgroundColor: colors.surfaceAlt, opacity: 0.92 },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  lockDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeTitle: { ...type.h3, color: colors.brownDark, textAlign: 'center' },
  badgeDesc: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  earnedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  earnedText: { ...type.caption, color: colors.green },
});

export default BadgesScreen;
