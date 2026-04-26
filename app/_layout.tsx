import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, LogBox } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../constants/supabase';
import { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { requestNotificationPermissions } from '../constants/notifications';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import OnboardingScreen from './onboarding';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

// --- INNER APP NAVIGATOR (CAN USE THEME) ---
function AppNavigator() {
  const { theme, themeName } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    requestNotificationPermissions();
    const checkAppReady = async () => {
      const hasSeen = await AsyncStorage.getItem('has_seen_onboarding');
      if (hasSeen !== 'true') setNeedsOnboarding(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsReady(true);
    };
    checkAppReady();
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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

  const activeTextColor = themeName === 'industrial' ? theme.accent : theme.text;

  if (!isReady) return <><StatusBar style="light" /><View style={{ flex: 1, backgroundColor: theme.bg }} /></>;

  if (needsOnboarding) return <OnboardingScreen onFinish={() => setNeedsOnboarding(false)} />;

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <View style={{ padding: 30, borderRadius: 20, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, elevation: 10 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 5, letterSpacing: 1, color: theme.text }}>АРСЕНАЛ БГ</Text>
            <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 30, fontWeight: '600', color: theme.muted }}>Система за мениджиране на лични оръжия</Text>
            
            <TextInput
              style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.input, color: activeTextColor, marginBottom: 15, fontSize: 16 }}
              onChangeText={setEmail} value={email} placeholder="Имейл адрес" placeholderTextColor={theme.muted} autoCapitalize="none" keyboardType="email-address"
            />
            <TextInput
              style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.input, color: activeTextColor, marginBottom: 15, fontSize: 16 }}
              onChangeText={setPassword} value={password} placeholder="Парола" placeholderTextColor={theme.muted} secureTextEntry
            />
            
            <TouchableOpacity style={{ padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: theme.accent, opacity: loading ? 0.7 : 1 }} onPress={signInWithEmail} disabled={loading}>
              <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 2, fontSize: 14 }}>{loading ? 'ИЗЧАКАЙТЕ...' : 'ВХОД'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center', padding: 10 }} onPress={signUpWithEmail} disabled={loading}>
              <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: theme.muted }}>СЪЗДАЙ АКАУНТ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="gun/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </>
  );
}

// --- ROOT WRAPPER ---
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}