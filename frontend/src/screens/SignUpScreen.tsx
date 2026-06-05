import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';
import { BackButton, Field } from '../components/forms';
import { Button } from '../components/ui';
import { TRAVELER_TYPES } from '../data/mock';
import { TravelerType } from '../data/types';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../state/AppState';
import { colors, radius, shadow, spacing, type } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAppState();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weight, setWeight] = useState('');
  const [traveler, setTraveler] = useState<TravelerType | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    firstName.trim() && lastName.trim() && email.trim() && password.trim() && weight.trim() && traveler;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await apiClient.register({
        email: email.trim(),
        password,
        persona: traveler!,
        weight_kg: parseFloat(weight) || 70,
      });
      updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        weightKg: parseFloat(weight) || 70,
        travelerType: traveler!,
      });
      Alert.alert('Account created', 'Please check your email to verify your account.');
      navigation.navigate('LogIn');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton onPress={() => navigation.goBack()} />

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Tell us a little about how you climb.</Text>

        <View style={{ marginTop: spacing.xl }}>
          <Field
            label="First name"
            icon="person-outline"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Mila"
            autoCapitalize="words"
          />
          <Field
            label="Last name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Danailova"
            autoCapitalize="words"
          />
          <Field
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Field
            label="Weight"
            icon="barbell-outline"
            value={weight}
            onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
            placeholder="64"
            keyboardType="numeric"
            suffix="kg"
          />
        </View>

        <Text style={styles.travelerLabel}>What type of traveler are you?</Text>
        <View style={{ gap: spacing.md }}>
          {TRAVELER_TYPES.map((t) => {
            const active = traveler === t.type;
            return (
              <Pressable
                key={t.type}
                onPress={() => setTraveler(t.type)}
                style={[
                  styles.travelerCard,
                  active ? styles.travelerActive : shadow('sm'),
                ]}
              >
                <View
                  style={[
                    styles.travelerIcon,
                    { backgroundColor: active ? colors.green : colors.greenTint },
                  ]}
                >
                  <Ionicons
                    name={t.icon}
                    size={24}
                    color={active ? '#fff' : colors.green}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.travelerTitle}>{t.title}</Text>
                  <Text style={styles.travelerTagline}>{t.tagline}</Text>
                </View>
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={active ? colors.green : colors.borderStrong}
                />
              </Pressable>
            );
          })}
        </View>

        <Button
          title="Create account"
          icon="arrow-forward"
          onPress={submit}
          disabled={!canSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.xxl }}
        />
        <Pressable onPress={() => navigation.navigate('LogIn')} style={{ marginTop: spacing.lg }}>
          <Text style={styles.footer}>
            Already have an account? <Text style={styles.footerLink}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  title: { ...type.h1, color: colors.brownDark, marginTop: spacing.xl },
  subtitle: { ...type.body, color: colors.textMuted, marginTop: spacing.xs },
  travelerLabel: {
    ...type.h3,
    color: colors.brownDark,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  travelerActive: { borderColor: colors.green, backgroundColor: colors.greenTint },
  travelerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerTitle: { ...type.h3, color: colors.brownDark },
  travelerTagline: { ...type.body, color: colors.textMuted, marginTop: 2 },
  footer: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  footerLink: { color: colors.green, fontWeight: '700' },
});

export default SignUpScreen;
