import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Logo, Wordmark } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const { height: SCREEN_H } = Dimensions.get('window');

const PHOTOS = [
  {
    uri: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=70',
    name: 'Alpine Ridgelines',
    detail: 'Panoramas above the clouds',
  },
  {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=70',
    name: 'Glacial Basins',
    detail: 'Still water, total silence',
  },
  {
    uri: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=70',
    name: 'Forest Approaches',
    detail: 'Pine trails to the treeline',
  },
];

const HERO_IMG =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=75';

const FEATURES = [
  { icon: 'map-outline', title: 'Tailored routes', text: 'Quests matched to how you love to roam.' },
  { icon: 'partly-sunny-outline', title: 'Live conditions', text: 'Weather and what to wear, hour by hour.' },
  { icon: 'ribbon-outline', title: 'Earn it', text: 'Verify summits and collect badges.' },
] as const;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
    >
      {/* Hero */}
      <View style={[styles.hero, { height: SCREEN_H * 0.82 }]}>
        <Image source={{ uri: HERO_IMG }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(35,30,26,0.15)', 'rgba(35,30,26,0.35)', 'rgba(35,79,59,0.92)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.heroTop, { paddingTop: insets.top + spacing.md }]}>
          <Logo size={38} />
          <Text style={styles.heroWordmark}>
            Summit<Text style={{ color: '#CFE6D8' }}>Quest</Text>
          </Text>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.kicker}>
            <Ionicons name="trail-sign-outline" size={14} color="#fff" />
            <Text style={styles.kickerText}>YOUR NEXT ASCENT</Text>
          </View>
          <Text style={styles.heroTitle}>Every mountain is a quest worth climbing.</Text>
          <Text style={styles.heroMotto}>
            Discover routes made for the way you explore — then go earn the summit.
          </Text>

          <View style={styles.heroButtons}>
            <Button
              title="Sign up"
              variant="light"
              icon="person-add-outline"
              onPress={() => navigation.navigate('SignUp')}
              fullWidth
            />
            <Button
              title="Log in"
              variant="secondary"
              onPress={() => navigation.navigate('LogIn')}
              fullWidth
              style={styles.loginBtn}
            />
          </View>

          <View style={styles.scrollHint}>
            <Ionicons name="chevron-down" size={18} color="#EBF2EC" />
            <Text style={styles.scrollHintText}>Scroll to explore</Text>
          </View>
        </View>
      </View>

      {/* Photo showcase */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>WHERE QUESTS LIVE</Text>
        <Text style={styles.sectionTitle}>Mountains, your way</Text>
        <Text style={styles.sectionSub}>
          From cloud-piercing ridges to mirror-still lakes — there's a summit for every kind
          of explorer.
        </Text>

        <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
          {PHOTOS.map((p) => (
            <View key={p.name} style={[styles.photoCard, shadow('md')]}>
              <Image source={{ uri: p.uri }} style={styles.photo} />
              <LinearGradient
                colors={['transparent', 'rgba(35,30,26,0.78)']}
                style={styles.photoOverlay}
              />
              <View style={styles.photoText}>
                <Text style={styles.photoName}>{p.name}</Text>
                <Text style={styles.photoDetail}>{p.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionKicker}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>Built for the journey</Text>
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          {FEATURES.map((f) => (
            <View key={f.title} style={[styles.featureRow, shadow('sm')]}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Final CTA */}
      <View style={[styles.cta, shadow('lg')]}>
        <Logo size={44} />
        <Text style={styles.ctaTitle}>Ready for your first summit?</Text>
        <Text style={styles.ctaSub}>Create an account and get matched to a quest today.</Text>
        <Button
          title="Sign up"
          variant="light"
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
        />
        <Button
          title="I already have an account"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('LogIn')}
          style={{ marginTop: spacing.xs }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  hero: { justifyContent: 'space-between' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  heroWordmark: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  kickerText: { color: '#fff', ...type.caption },
  heroTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  heroMotto: {
    color: '#E7F0E9',
    ...type.bodyLg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  heroButtons: { gap: spacing.md },
  loginBtn: { borderColor: 'rgba(255,255,255,0.6)' },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
  },
  scrollHintText: { color: '#EBF2EC', ...type.caption },

  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  sectionKicker: { ...type.caption, color: colors.greenSoft, marginBottom: 6 },
  sectionTitle: { ...type.h1, color: colors.brownDark },
  sectionSub: {
    ...type.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  photoCard: { height: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  photoOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  photoText: { position: 'absolute', left: spacing.xl, bottom: spacing.xl },
  photoName: { color: '#fff', ...type.h2 },
  photoDetail: { color: '#E7F0E9', ...type.body, marginTop: 2 },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { ...type.h3, color: colors.brownDark },
  featureText: { ...type.body, color: colors.textMuted, marginTop: 2 },

  cta: {
    margin: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.green,
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaTitle: { ...type.h2, color: '#fff', textAlign: 'center', marginTop: spacing.sm },
  ctaSub: {
    ...type.body,
    color: '#D8E8DD',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
