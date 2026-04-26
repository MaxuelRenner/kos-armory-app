import { LogBox } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../constants/supabase';
import { Session } from '@supabase/supabase-js';
import { Colors, Radius, Spacing } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { requestNotificationPermissions } from '../constants/notifications';

// WE IMPORT THE ONBOARDING SCREEN DIRECTLY TO AVOID ROUTER CRASHES
import OnboardingScreen from './onboarding';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    requestNotificationPermissions();

    const checkAppReady = async () => {
      // Check onboarding
      const hasSeen = await AsyncStorage.getItem('has_seen_onboarding');
      if (hasSeen !== 'true') setNeedsOnboarding(true);

      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsReady(true);
    };

    checkAppReady();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Грешка при вход', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Грешка при регистрация', error.message);
    else Alert.alert('Успешно!', 'Акаунтът е създаден. Моля, влезте.');
    setLoading(false);
  }

  // ─── SAFE RENDERING LOGIC ──────────────────────────────────────────────────

  // 1. App is loading
  if (!isReady) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#0A0B0D" />
        <View style={styles.container} />
      </>
    );
  }

  // 2. SHOW ONBOARDING (Bypasses the router entirely, fixing the flicker loop)
  if (needsOnboarding) {
    return <OnboardingScreen onFinish={() => setNeedsOnboarding(false)} />;
  }

  // 3. SHOW LOGIN
  if (!session) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#121212" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
          <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <View style={{ padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#1C1C1E', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>

              <Text style={{ fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 5, letterSpacing: 1, color: '#E0E0E0' }}>АРСЕНАЛ БГ</Text>
              <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 30, fontWeight: '600', color: '#6B7280' }}>Система за мениджиране на лични оръжия</Text>

              <TextInput
                style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#151515', color: '#E0E0E0', marginBottom: 15, fontSize: 16, fontWeight: '600' }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="Имейл адрес"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#151515', color: '#E0E0E0', marginBottom: 15, fontSize: 16, fontWeight: '600' }}
                onChangeText={(text) => setPassword(text)}
                value={password}
                placeholder="Парола"
                placeholderTextColor="#6B7280"
                secureTextEntry
              />

              <TouchableOpacity
                style={{ padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: loading ? '#7f1010' : '#B71C1C', opacity: loading ? 0.7 : 1 }}
                onPress={signInWithEmail}
                disabled={loading}
              >
                <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 2, fontSize: 14 }}>
                  {loading ? 'ИЗЧАКАЙТЕ...' : 'ВХОД'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center', padding: 10 }} onPress={signUpWithEmail} disabled={loading}>
                <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: '#6B7280' }}>СЪЗДАЙ АКАУНТ</Text>
              </TouchableOpacity>

            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // 4. MAIN APP
  return (
    <ThemeProvider>
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gun/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.deep,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});