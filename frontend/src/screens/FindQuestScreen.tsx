import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppScreen from '../components/AppScreen';
import LeafletMap from '../components/LeafletMap';
import { Button, Chip, SectionLabel, StatTile } from '../components/ui';
import { summarizeWeather, weatherIcon } from '../components/weather';
import { difficultyColor } from '../data/mock';
import { Quest, LatLng, TransportMode } from '../data/types';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../state/AppState';
import { apiClient } from '../api/client';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FindQuest'>;

const { width: SCREEN_W } = Dimensions.get('window');
const PAGES = ['Route', 'Get there', 'Weather', 'Fitness'] as const;
const MIN_MIN = 15;
const MAX_MIN = 150;

const FindQuestScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const appState = useAppState();
  const { completeQuest } = appState;

  const [transport, setTransport] = useState<TransportMode>('car');
  const [travelMinutes, setTravelMinutes] = useState(45);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [questIdx, setQuestIdx] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [page, setPage] = useState(0);

  const pagerRef = useRef<ScrollView>(null);

  const generate = async (idx = 0) => {
    setGenerating(true);
    try {
      const persona =
        appState.profile.travelerType === 'zen'
          ? 'zen_explorer'
          : appState.profile.travelerType;
      const res = await apiClient.generateQuest({
        user_id: appState.userId ?? 'guest',
        persona,
        lat: 42.6977,
        lon: 23.3219,
        transport_mode: transport === 'transit' ? 'public_transport' : transport,
      });

      const difficulty =
        res.difficulty >= 8
          ? 'Expert'
          : res.difficulty >= 6
          ? 'Hard'
          : res.difficulty >= 4
          ? 'Moderate'
          : 'Easy';

      const mapped: Quest = {
        id: res.id,
        name: res.trail_name,
        teaser: `${res.trail_name} awaits you`,
        region: 'Bulgaria',
        difficulty,
        ascentMinutes: res.estimated_duration_min,
        distanceKm: res.distance_to_start_km,
        elevationGainM: res.elevation_m,
        calories: Math.round(res.elevation_m * 0.5),
        steps: Math.round(res.distance_to_start_km * 1300),
        route: [[res.trail_lat, res.trail_lon]] as LatLng[],
        userLocation: [42.6977, 23.3219] as LatLng,
        car: {
          route: [[42.6977, 23.3219], [res.trail_lat, res.trail_lon]] as LatLng[],
          driveMinutes: Math.round(res.travel_time_min),
        },
        transit: {
          stopName: 'Nearest bus stop',
          stopLocation: [42.6977, 23.3219] as LatLng,
          walkPath: [[42.6977, 23.3219], [res.trail_lat, res.trail_lon]] as LatLng[],
          walkMinutes: Math.round(res.travel_time_min * 1.3),
        },
        weather: (res.forecast.list ?? []).slice(0, 7).map((item, i) => ({
          time: i === 0 ? 'Now' : `+${i}h`,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].description.includes('rain')
            ? 'rain'
            : item.weather[0].description.includes('cloud')
            ? 'cloudy'
            : 'sunny',
        })) as Quest['weather'],
        outfit: res.clothing_tip
          .split('.')
          .filter((s: string) => s.trim())
          .map((s: string) => s.trim()),
      };

      setQuest(mapped);
      setQuestIdx(idx);
      setAccepted(false);
      setVerified(false);
      setPage(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Quest generation failed', message);
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setQuest(null);
    setAccepted(false);
    setVerified(false);
    setPage(0);
  };

  const goToPage = (i: number) => {
    pagerRef.current?.scrollTo({ x: i * SCREEN_W, animated: true });
    setPage(i);
  };

  const onPagerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== page) setPage(i);
  };

  const runVerify = async () => {
    if (!quest) return;
    setVerifying(true);
    try {
      const res = await apiClient.verifyCheckin({
        quest_id: quest.id,
        user_lat: 42.6977,
        user_lon: 23.3219,
        user_id: appState.userId ?? 'guest',
      });
      setVerifying(false);
      if (res.verified) {
        setVerified(true);
        setTimeout(() => {
          completeQuest(quest);
          navigation.reset({ index: 0, routes: [{ name: 'FinishedQuests' }] });
        }, 1100);
      } else {
        Alert.alert('Not there yet', 'You are not close enough to the summit.');
      }
    } catch (err: unknown) {
      setVerifying(false);
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Verification failed', message);
    }
  };

  return (
    <AppScreen>
      {!quest ? (
        <ConfigView
          transport={transport}
          setTransport={setTransport}
          travelMinutes={travelMinutes}
          setTravelMinutes={setTravelMinutes}
          onFind={() => generate(0)}
          generating={generating}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Quest header */}
          <View style={styles.questHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.questName}>{quest.name}</Text>
              <View style={styles.regionRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={styles.region}>{quest.region}</Text>
              </View>
            </View>
            <Chip
              label={quest.difficulty}
              color="#fff"
              bg={difficultyColor(quest.difficulty)}
              icon="pulse"
            />
          </View>

          {/* Swipeable pages */}
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onPagerScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
          >
            <RoutePage quest={quest} accepted={accepted} />
            <ApproachPage quest={quest} transport={transport} />
            <WeatherPage quest={quest} />
            <FitnessPage quest={quest} />
          </ScrollView>

          {/* Page indicator / quick-switch bar */}
          <View style={styles.pager}>
            {PAGES.map((label, i) => {
              const active = page === i;
              return (
                <Pressable key={label} style={styles.pagerItem} onPress={() => goToPage(i)}>
                  <View style={[styles.dot, active && styles.dotActive]} />
                  <Text style={[styles.pagerLabel, active && styles.pagerLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action bar */}
          <View style={[styles.actionBar, shadow('lg')]}>
            {!accepted ? (
              <View style={styles.actionRow}>
                <Button
                  title="Change"
                  variant="secondary"
                  icon="shuffle"
                  onPress={() => generate(questIdx + 1)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Accept Quest"
                  icon="checkmark"
                  onPress={() => {
                    setAccepted(true);
                    goToPage(0);
                  }}
                  style={{ flex: 1.4 }}
                />
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                <View style={styles.acceptedRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                  <Text style={styles.acceptedText}>Quest accepted — climb it, then verify.</Text>
                  <Pressable onPress={reset} hitSlop={8} style={{ marginLeft: 'auto' }}>
                    <Text style={styles.abandon}>Abandon</Text>
                  </Pressable>
                </View>
                <Button
                  title="Verify I reached the summit"
                  icon="navigate"
                  onPress={runVerify}
                  fullWidth
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Verify overlay */}
      {(verifying || verified) && (
        <View style={styles.verifyOverlay}>
          <View style={[styles.verifyCard, shadow('lg')]}>
            {verified ? (
              <>
                <View style={[styles.verifyIcon, { backgroundColor: colors.greenTint }]}>
                  <Ionicons name="trophy" size={34} color={colors.green} />
                </View>
                <Text style={styles.verifyTitle}>Summit verified!</Text>
                <Text style={styles.verifySub}>
                  You're at the finish point. Adding this to your finished quests…
                </Text>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={colors.green} />
                <Text style={styles.verifyTitle}>Scanning your location…</Text>
                <Text style={styles.verifySub}>
                  Checking how close you are to the route's end point.
                </Text>
              </>
            )}
          </View>
        </View>
      )}
    </AppScreen>
  );
};

/* ------------------------------------------------------------- Config view */

const ConfigView: React.FC<{
  transport: TransportMode;
  setTransport: (t: TransportMode) => void;
  travelMinutes: number;
  setTravelMinutes: (n: number) => void;
  onFind: () => void;
  generating: boolean;
}> = ({ transport, setTransport, travelMinutes, setTravelMinutes, onFind, generating }) => (
  <ScrollView
    contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl }}
    showsVerticalScrollIndicator={false}
  >
    <Text style={styles.kicker}>FIND QUEST</Text>
    <Text style={styles.h1}>Let's plan your ascent</Text>
    <Text style={styles.lead}>
      Two quick questions and we'll generate a summit quest tailored to you.
    </Text>

    {/* Transport */}
    <View style={[styles.card, shadow('sm')]}>
      <SectionLabel>HOW WILL YOU TRAVEL?</SectionLabel>
      <View style={styles.segment}>
        {([
          { key: 'car', label: 'By car', icon: 'car-sport-outline' },
          { key: 'transit', label: 'Public transit', icon: 'bus-outline' },
        ] as const).map((opt) => {
          const active = transport === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setTransport(opt.key)}
              style={[styles.segmentItem, active && styles.segmentActive]}
            >
              <Ionicons
                name={opt.icon}
                size={22}
                color={active ? '#fff' : colors.green}
              />
              <Text style={[styles.segmentText, active && { color: '#fff' }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>

    {/* Travel time */}
    <View style={[styles.card, shadow('sm')]}>
      <SectionLabel>HOW FAR ARE YOU WILLING TO TRAVEL?</SectionLabel>
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => setTravelMinutes(Math.max(MIN_MIN, travelMinutes - 15))}
          style={[styles.stepBtn, travelMinutes <= MIN_MIN && styles.stepDisabled]}
          disabled={travelMinutes <= MIN_MIN}
        >
          <Ionicons name="remove" size={24} color={colors.green} />
        </Pressable>
        <View style={styles.stepValueWrap}>
          <Text style={styles.stepValue}>{travelMinutes}</Text>
          <Text style={styles.stepUnit}>minutes</Text>
        </View>
        <Pressable
          onPress={() => setTravelMinutes(Math.min(MAX_MIN, travelMinutes + 15))}
          style={[styles.stepBtn, travelMinutes >= MAX_MIN && styles.stepDisabled]}
          disabled={travelMinutes >= MAX_MIN}
        >
          <Ionicons name="add" size={24} color={colors.green} />
        </Pressable>
      </View>
      <Text style={styles.stepHint}>Adjust in 15-minute steps.</Text>
    </View>

    <Button
      title="Find Quest"
      icon="compass"
      onPress={onFind}
      loading={generating}
      fullWidth
      style={{ marginTop: spacing.lg }}
    />
  </ScrollView>
);

/* ------------------------------------------------------------------- Pages */

const PageScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ScrollView
    style={{ width: SCREEN_W }}
    contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl }}
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

const RoutePage: React.FC<{ quest: Quest; accepted: boolean }> = ({ quest, accepted }) => {
  const end = quest.route[quest.route.length - 1];
  return (
    <PageScroll>
      <LeafletMap
        height={300}
        interactive
        routes={[{ coords: quest.route, color: colors.green }]}
        markers={[
          { coord: quest.route[0], kind: 'start', label: 'Trailhead' },
          { coord: end, kind: 'end', label: quest.name },
          { coord: quest.userLocation, kind: 'user', label: 'You are here' },
        ]}
        fitTo={[quest.userLocation, ...quest.route]}
      />

      <View style={[styles.infoBlock, shadow('sm')]}>
        <Text style={styles.teaser}>{quest.teaser}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={colors.green} />
            <Text style={styles.infoValue}>~{quest.ascentMinutes} min</Text>
            <Text style={styles.infoLabel}>to the summit</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="pulse-outline" size={18} color={difficultyColor(quest.difficulty)} />
            <Text style={styles.infoValue}>{quest.difficulty}</Text>
            <Text style={styles.infoLabel}>difficulty</Text>
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <Legend color={colors.green} glyph="▲" text="Trailhead" />
        <Legend color="#B4543C" glyph="★" text="Summit / end" />
        <Legend color="#3D7DDA" glyph="●" text="You" />
      </View>

      {accepted && (
        <View style={styles.acceptedBanner}>
          <Ionicons name="information-circle" size={16} color={colors.green} />
          <Text style={styles.acceptedBannerText}>
            All pages stay available while your quest is active.
          </Text>
        </View>
      )}
    </PageScroll>
  );
};

const ApproachPage: React.FC<{ quest: Quest; transport: TransportMode }> = ({
  quest,
  transport,
}) => {
  const trailhead = quest.route[0];
  if (transport === 'car') {
    return (
      <PageScroll>
        <SectionLabel>GETTING THERE · BY CAR</SectionLabel>
        <LeafletMap
          height={300}
          interactive
          routes={[{ coords: quest.car.route, color: colors.brown }]}
          markers={[
            { coord: quest.userLocation, kind: 'user', label: 'You are here' },
            { coord: trailhead, kind: 'flag', label: 'Trailhead' },
          ]}
        />
        <View style={[styles.infoBlock, shadow('sm')]}>
          <View style={styles.approachHeader}>
            <View style={styles.approachIcon}>
              <Ionicons name="car-sport" size={22} color={colors.brown} />
            </View>
            <View>
              <Text style={styles.approachTitle}>Drive to the trailhead</Text>
              <Text style={styles.approachSub}>Route highlighted from your location</Text>
            </View>
          </View>
          <View style={styles.approachStat}>
            <Ionicons name="time-outline" size={18} color={colors.brown} />
            <Text style={styles.approachStatText}>
              About <Text style={styles.bold}>{quest.car.driveMinutes} min</Text> by car
            </Text>
          </View>
        </View>
      </PageScroll>
    );
  }
  return (
    <PageScroll>
      <SectionLabel>GETTING THERE · PUBLIC TRANSIT</SectionLabel>
      <LeafletMap
        height={300}
        interactive
        routes={[{ coords: quest.transit.walkPath, color: colors.brown, dashed: true }]}
        markers={[
          { coord: quest.transit.stopLocation, kind: 'stop', label: quest.transit.stopName },
          { coord: trailhead, kind: 'flag', label: 'Trailhead' },
        ]}
      />
      <View style={[styles.infoBlock, shadow('sm')]}>
        <View style={styles.approachHeader}>
          <View style={styles.approachIcon}>
            <Ionicons name="bus" size={22} color={colors.brown} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.approachTitle}>{quest.transit.stopName}</Text>
            <Text style={styles.approachSub}>Nearest stop to the trailhead</Text>
          </View>
        </View>
        <View style={styles.approachStat}>
          <Ionicons name="walk-outline" size={18} color={colors.brown} />
          <Text style={styles.approachStatText}>
            <Text style={styles.bold}>{quest.transit.walkMinutes} min</Text> walk to the trailhead
            (dashed path)
          </Text>
        </View>
      </View>
    </PageScroll>
  );
};

const WeatherPage: React.FC<{ quest: Quest }> = ({ quest }) => {
  const summary = summarizeWeather(quest.weather);
  const big = weatherIcon(summary);
  return (
    <PageScroll>
      <SectionLabel>NEXT 6 HOURS · {quest.region.toUpperCase()}</SectionLabel>
      <View style={[styles.weatherHero, shadow('sm')]}>
        <Ionicons name={big.name} size={64} color={big.color} />
        <View style={{ marginLeft: spacing.lg, flex: 1 }}>
          <Text style={styles.weatherBigCondition}>{big.label}</Text>
          <Text style={styles.weatherBigSub}>Conditions on the mountain</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.lg }}
        contentContainerStyle={{ gap: spacing.sm }}
      >
        {quest.weather.map((h, i) => {
          const w = weatherIcon(h.condition);
          return (
            <View key={i} style={[styles.hourCard, shadow('sm')]}>
              <Text style={styles.hourTime}>{h.time}</Text>
              <Ionicons name={w.name} size={26} color={w.color} />
              <Text style={styles.hourTemp}>{h.temp}°</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.infoBlock, shadow('sm'), { marginTop: spacing.lg }]}>
        <Text style={styles.outfitTitle}>What to wear</Text>
        {quest.outfit.map((o) => (
          <View key={o} style={styles.outfitRow}>
            <Ionicons name="shirt-outline" size={16} color={colors.green} />
            <Text style={styles.outfitText}>{o}</Text>
          </View>
        ))}
      </View>
    </PageScroll>
  );
};

const FitnessPage: React.FC<{ quest: Quest }> = ({ quest }) => (
  <PageScroll>
    <SectionLabel>EFFORT & STATS</SectionLabel>
    <Text style={styles.h2}>What this quest takes</Text>
    <View style={styles.statGrid}>
      <StatTile
        icon="flame"
        value={`${quest.calories}`}
        label="Calories burned"
        accent="#C77B43"
      />
      <StatTile
        icon="footsteps"
        value={`${quest.distanceKm} km`}
        label="Distance"
        accent={colors.green}
      />
    </View>
    <View style={[styles.statGrid, { marginTop: spacing.md }]}>
      <StatTile
        icon="trending-up"
        value={`${quest.elevationGainM} m`}
        label="Elevation gain"
        accent={colors.brown}
      />
      <StatTile
        icon="walk"
        value={`${(quest.steps / 1000).toFixed(1)}k`}
        label="Steps"
        accent="#4F8FB0"
      />
    </View>

    <View style={[styles.infoBlock, shadow('sm'), { marginTop: spacing.lg }]}>
      <Text style={styles.outfitTitle}>The climb at a glance</Text>
      <Text style={styles.fitnessNarrative}>
        A {quest.difficulty.toLowerCase()} effort gaining {quest.elevationGainM} m over{' '}
        {quest.distanceKm} km. Expect roughly {quest.ascentMinutes} minutes of moving time to the
        summit.
      </Text>
    </View>
  </PageScroll>
);

const Legend: React.FC<{ color: string; glyph: string; text: string }> = ({
  color,
  glyph,
  text,
}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]}>
      <Text style={styles.legendGlyph}>{glyph}</Text>
    </View>
    <Text style={styles.legendText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  kicker: { ...type.caption, color: colors.greenSoft, marginBottom: 4 },
  h1: { ...type.h1, color: colors.brownDark },
  h2: { ...type.h2, color: colors.brownDark, marginBottom: spacing.lg },
  lead: { ...type.body, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 22 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 5,
    gap: 5,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.green },
  segmentText: { ...type.bodyLg, color: colors.green, fontWeight: '700' },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepValueWrap: { alignItems: 'center' },
  stepValue: { fontSize: 44, fontWeight: '800', color: colors.brownDark, letterSpacing: -1 },
  stepUnit: { ...type.label, color: colors.textMuted, marginTop: -4 },
  stepHint: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },

  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  questName: { ...type.h2, color: colors.brownDark },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  region: { ...type.body, color: colors.textMuted },

  infoBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  teaser: { ...type.h2, color: colors.green, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoItem: { flex: 1, alignItems: 'flex-start', gap: 4 },
  infoDivider: { width: 1, height: 44, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  infoValue: { ...type.h3, color: colors.brownDark, marginTop: 2 },
  infoLabel: { ...type.caption, color: colors.textMuted },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  legendGlyph: { color: '#fff', fontSize: 11, fontWeight: '700' },
  legendText: { ...type.caption, color: colors.textMuted },

  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.greenTint,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  acceptedBannerText: { ...type.caption, color: colors.green, flex: 1 },

  approachHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  approachIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brownTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approachTitle: { ...type.h3, color: colors.brownDark },
  approachSub: { ...type.body, color: colors.textMuted, marginTop: 1 },
  approachStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brownTint,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  approachStatText: { ...type.body, color: colors.brownDark, flex: 1 },
  bold: { fontWeight: '800', color: colors.brownDark },

  weatherHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  weatherBigCondition: { ...type.h2, color: colors.brownDark },
  weatherBigSub: { ...type.body, color: colors.textMuted },
  hourCard: {
    width: 70,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourTime: { ...type.caption, color: colors.textMuted },
  hourTemp: { ...type.h3, color: colors.brownDark },
  outfitTitle: { ...type.h3, color: colors.brownDark, marginBottom: spacing.md },
  outfitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  outfitText: { ...type.bodyLg, color: colors.text, flex: 1 },

  statGrid: { flexDirection: 'row', gap: spacing.md },
  fitnessNarrative: { ...type.bodyLg, color: colors.text, lineHeight: 24 },

  pager: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pagerItem: { alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.green, width: 20 },
  pagerLabel: { ...type.caption, color: colors.textMuted },
  pagerLabelActive: { color: colors.green },

  actionBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  acceptedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  acceptedText: { ...type.caption, color: colors.text, flexShrink: 1 },
  abandon: { ...type.caption, color: colors.danger, fontWeight: '700' },

  verifyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  verifyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: spacing.md,
  },
  verifyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyTitle: { ...type.h2, color: colors.brownDark, textAlign: 'center', marginTop: spacing.sm },
  verifySub: { ...type.body, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
});

export default FindQuestScreen;
