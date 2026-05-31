import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScreen from '../components/AppScreen';
import LeafletMap from '../components/LeafletMap';
import { Chip, StatTile } from '../components/ui';
import { difficultyColor } from '../data/mock';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FinishedQuestDetail'>;
type R = RouteProp<RootStackParamList, 'FinishedQuestDetail'>;

const FinishedQuestDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { quest } = useRoute<R>().params;

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.green} />
          <Text style={styles.backText}>Finished quests</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{quest.name}</Text>
          <Chip label={quest.difficulty} color="#fff" bg={difficultyColor(quest.difficulty)} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.meta}>{quest.region}</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="checkmark-circle" size={14} color={colors.green} />
          <Text style={styles.meta}>Completed {quest.completedOn}</Text>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <LeafletMap
            height={280}
            interactive
            routes={[{ coords: quest.route, color: colors.green }]}
            markers={[
              { coord: quest.route[0], kind: 'start', label: 'Start' },
              { coord: quest.route[quest.route.length - 1], kind: 'end', label: 'Summit' },
            ]}
          />
        </View>

        <Text style={styles.sectionTitle}>Your performance</Text>
        <View style={styles.grid}>
          <StatTile icon="footsteps" value={`${quest.distanceKm} km`} label="Distance" accent={colors.green} />
          <StatTile icon="flame" value={`${quest.calories}`} label="Calories burned" accent="#C77B43" />
        </View>
        <View style={[styles.grid, { marginTop: spacing.md }]}>
          <StatTile icon="walk" value={quest.steps.toLocaleString()} label="Steps taken" accent="#4F8FB0" />
          <StatTile icon="trending-up" value={`${quest.elevationGainM} m`} label="Elevation gain" accent={colors.brown} />
        </View>

        <View style={[styles.summary, shadow('sm')]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="trophy" size={24} color={colors.green} />
          </View>
          <Text style={styles.summaryText}>
            A {quest.difficulty.toLowerCase()} summit, climbed and verified. Nicely done — it's on
            your map forever.
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: spacing.lg },
  backText: { ...type.label, color: colors.green },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...type.h1, color: colors.brownDark, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
  meta: { ...type.body, color: colors.textMuted },
  dot: { color: colors.textMuted, marginHorizontal: 2 },
  sectionTitle: { ...type.h2, color: colors.brownDark, marginTop: spacing.xxl, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', gap: spacing.md },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.greenTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { ...type.body, color: colors.greenDark, flex: 1, lineHeight: 21 },
});

export default FinishedQuestDetailScreen;
