import { LogBox } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '../constants/supabase';
import { Session } from '@supabase/supabase-js';
import { Colors, Radius, Spacing } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';


LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

<StatusBar style="light" backgroundColor="#0A0B0D" />
export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

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

  // Prevent flashing the login screen before checking the session
  if (!isReady) return <View style={styles.container} />;

 // --- LOGIN SCREEN ---
 if (!session) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <View style={{ padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#1C1C1E', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
          
          <Text style={{ fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 5, letterSpacing: 1, color: '#E0E0E0' }}>АРСЕНАЛ БГ</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 30, fontWeight: '600', color: '#6B7280' }}>Система за мениджиране на лични оръжия</Text>

          <TextInput
            style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#151515', color: '#B71C1C', marginBottom: 15, fontSize: 16, fontWeight: '600' }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Имейл адрес"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
          />
          
          <TextInput
            style={{ borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#151515', color: '#B71C1C', marginBottom: 15, fontSize: 16, fontWeight: '600' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholder="Парола"
            placeholderTextColor="#6B7280"
            secureTextEntry
          />
          
          {/* MAKE SURE THESE BUTTON PRESS FUNCTIONS MATCH YOUR ORIGINAL CODE (signInWithEmail / signUpWithEmail) */}
          <TouchableOpacity style={{ padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, backgroundColor: '#B71C1C' }} onPress={() => signInWithEmail()}>
            <Text style={{ color: 'white', fontWeight: '900', letterSpacing: 2, fontSize: 14 }}>ВХОД</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center', padding: 10 }} onPress={() => signUpWithEmail()}>
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: '#6B7280' }}>СЪЗДАЙ АКАУНТ</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </SafeAreaView>
  );
}
  // ─── MAIN APP (If Logged In) ───
  return (
    <ThemeProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="gun/[id]" options={{ presentation: 'modal' }} />
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
  authBox: {
    backgroundColor: Colors.bg.card,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  btnPrimary: {
    backgroundColor: Colors.accent.steelDim,
    borderColor: Colors.accent.steel,
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnTextPrimary: {
    color: Colors.accent.steelLight,
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnSecondary: {
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnTextSecondary: {
    color: Colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});