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
import { Button, Logo } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { useAppState } from '../state/AppState';
import { colors, spacing, type } from '../theme';
import { TravelerType } from '../data/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LogIn'>;

const LogInScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const appState = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() && password.trim();
  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const { access_token } = await apiClient.login({ email: email.trim(), password });
      const data = await apiClient.getMe(access_token);
      appState.setAuth(access_token, data.id);
      appState.updateProfile({ email: data.email, travelerType: data.persona as TravelerType });
      navigation.reset({ index: 0, routes: [{ name: 'FindQuest' }] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Login failed', message);
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

        <View style={styles.brand}>
          <Logo size={56} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue your quests.</Text>

        <View style={{ marginTop: spacing.xxl }}>
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
        </View>

        <Pressable hitSlop={6} style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>

        <Button
          title="Log in"
          icon="arrow-forward"
          onPress={submit}
          disabled={!canSubmit}
          loading={loading}
          fullWidth
        />

        <Pressable onPress={() => navigation.navigate('SignUp')} style={{ marginTop: spacing.xl }}>
          <Text style={styles.footer}>
            New to SummitQuest? <Text style={styles.footerLink}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: spacing.xxxl },
  title: { ...type.h1, color: colors.brownDark, textAlign: 'center', marginTop: spacing.xl },
  subtitle: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  forgot: { ...type.label, color: colors.green },
  footer: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  footerLink: { color: colors.green, fontWeight: '700' },
});

export default LogInScreen;
