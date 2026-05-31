import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScreen from '../components/AppScreen';
import LeafletMap, { MapMarker, MapRoute } from '../components/LeafletMap';
import { Chip, SectionLabel } from '../components/ui';
import { difficultyColor } from '../data/mock';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../state/AppState';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FinishedQuests'>;

const ROUTE_COLORS = ['#2F6B4F', '#7A604A', '#4F8FB0', '#C77B43', '#5B9A78'];

const FinishedQuestsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { finishedQuests } = useAppState();

  const routes: MapRoute[] = finishedQuests.map((q, i) => ({
    coords: q.route,
    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
  }));
  const markers: MapMarker[] = finishedQuests.map((q) => ({
    coord: q.route[q.route.length - 1],
    kind: 'flag',
    label: q.name,
  }));

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>FINISHED QUESTS</Text>
        <Text style={styles.h1}>Everywhere you've summited</Text>
        <Text style={styles.lead}>
          {finishedQuests.length} quests conquered. Pan and zoom the map, or tap a quest for the
          full story.
        </Text>

        <View style={{ marginTop: spacing.xl }}>
          <LeafletMap height={340} interactive routes={routes} markers={markers} />
        </View>

        <SectionLabel style={{ marginTop: spacing.xxl }}>YOUR QUEST LOG</SectionLabel>
        <View style={{ gap: spacing.lg }}>
          {finishedQuests.map((q, i) => (
            <Pressable
              key={q.id}
              onPress={() => navigation.navigate('FinishedQuestDetail', { quest: q })}
              style={({ pressed }) => [styles.card, shadow('sm'), pressed && { opacity: 0.92 }]}
            >
              <LeafletMap
                height={150}
                routes={[{ coords: q.route, color: ROUTE_COLORS[i % ROUTE_COLORS.length] }]}
                markers={[{ coord: q.route[q.route.length - 1], kind: 'flag' }]}
                style={styles.cardMap}
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{q.name}</Text>
                    <View style={styles.cardRegionRow}>
                      <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                      <Text style={styles.cardRegion}>{q.region}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.cardRegion}>{q.completedOn}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.borderStrong} />
                </View>
                <View style={styles.cardChips}>
                  <Chip
                    label={q.difficulty}
                    color="#fff"
                    bg={difficultyColor(q.difficulty)}
                  />
                  <Chip label={`${q.distanceKm} km`} icon="footsteps-outline" />
                  <Chip
                    label={`${q.elevationGainM} m`}
                    icon="trending-up-outline"
                    color={colors.brown}
                    bg={colors.brownTint}
                  />
                </View>
              </View>
            </Pressable>
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  cardMap: { borderRadius: 0 },
  cardBody: { padding: spacing.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardName: { ...type.h3, color: colors.brownDark },
  cardRegionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardRegion: { ...type.caption, color: colors.textMuted },
  dot: { color: colors.textMuted, marginHorizontal: 2 },
  cardChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
});

export default FinishedQuestsScreen;
