import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScreen from '../components/AppScreen';
import { Button, SectionLabel, StatTile } from '../components/ui';
import { TRAVELER_TYPES } from '../data/mock';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../state/AppState';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { profile, setTravelerType, setWeight } = useAppState();

  const logout = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={[styles.identity, shadow('md')]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.firstName[0]}
              {profile.lastName[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text style={styles.email}>{profile.email}</Text>
          </View>
        </View>

        {/* Lifetime totals */}
        <SectionLabel style={{ marginTop: spacing.xxl }}>LIFETIME TOTALS</SectionLabel>
        <View style={styles.grid}>
          <StatTile
            icon="footsteps"
            value={`${profile.totalKm}`}
            label="Total km"
            accent={colors.green}
          />
          <StatTile
            icon="flame"
            value={`${(profile.totalCalories / 1000).toFixed(1)}k`}
            label="Total calories"
            accent="#C77B43"
          />
          <StatTile
            icon="walk"
            value={`${(profile.totalSteps / 1000).toFixed(0)}k`}
            label="Total steps"
            accent="#4F8FB0"
          />
        </View>

        {/* Traveler type (editable) */}
        <SectionLabel style={{ marginTop: spacing.xxl }}>TRAVELER TYPE</SectionLabel>
        <Text style={styles.editHint}>Change it anytime — your future quests adapt.</Text>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {TRAVELER_TYPES.map((t) => {
            const active = profile.travelerType === t.type;
            return (
              <Pressable
                key={t.type}
                onPress={() => setTravelerType(t.type)}
                style={[styles.travelerCard, active ? styles.travelerActive : shadow('sm')]}
              >
                <View
                  style={[
                    styles.travelerIcon,
                    { backgroundColor: active ? colors.green : colors.greenTint },
                  ]}
                >
                  <Ionicons name={t.icon} size={22} color={active ? '#fff' : colors.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.travelerTitle}>{t.title}</Text>
                  <Text style={styles.travelerTagline}>{t.tagline}</Text>
                </View>
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={active ? colors.green : colors.borderStrong}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Weight (editable) */}
        <SectionLabel style={{ marginTop: spacing.xxl }}>BODY WEIGHT</SectionLabel>
        <Text style={styles.editHint}>Used to estimate calories burned.</Text>
        <View style={[styles.weightCard, shadow('sm')]}>
          <Pressable
            onPress={() => setWeight(profile.weightKg - 1)}
            style={styles.weightBtn}
            hitSlop={6}
          >
            <Ionicons name="remove" size={22} color={colors.green} />
          </Pressable>
          <View style={styles.weightValueWrap}>
            <Text style={styles.weightValue}>{profile.weightKg}</Text>
            <Text style={styles.weightUnit}>kg</Text>
          </View>
          <Pressable
            onPress={() => setWeight(profile.weightKg + 1)}
            style={styles.weightBtn}
            hitSlop={6}
          >
            <Ionicons name="add" size={22} color={colors.green} />
          </Pressable>
        </View>

        <Button
          title="Log out"
          variant="secondary"
          icon="log-out-outline"
          onPress={logout}
          fullWidth
          style={{ marginTop: spacing.xxl }}
        />
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  identity: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '800' },
  name: { ...type.h1, color: colors.brownDark },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.xs },
  email: { ...type.body, color: colors.textMuted },

  grid: { flexDirection: 'row', gap: spacing.md },

  editHint: { ...type.body, color: colors.textMuted, marginTop: 2 },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  travelerActive: { borderColor: colors.green, backgroundColor: colors.greenTint },
  travelerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerTitle: { ...type.h3, color: colors.brownDark },
  travelerTagline: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  weightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  weightBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightValueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  weightValue: { fontSize: 40, fontWeight: '800', color: colors.brownDark },
  weightUnit: { ...type.h3, color: colors.textMuted },
});

export default ProfileScreen;
