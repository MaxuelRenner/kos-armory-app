import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../../constants/supabase';
import { useTheme, ThemeType } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, themeName, changeTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert("Изход", "Сигурни ли сте?", [
      { text: "Отказ", style: "cancel" },
      { text: "ИЗХОД", style: "destructive", onPress: () => supabase.auth.signOut() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Настройки</Text>

      <Text style={[styles.sectionLabel, { color: theme.muted }]}>ТЕМА НА ПРИЛОЖЕНИЕТО</Text>
      
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.themeRow} onPress={() => changeTheme('industrial')}>
          <Text style={[styles.themeText, { color: theme.text }]}>⚫ Индустриална (Metal/Red)</Text>
          {themeName === 'industrial' && <Text style={{ color: theme.accent }}>✓</Text>}
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <TouchableOpacity style={styles.themeRow} onPress={() => changeTheme('girlypop')}>
          <Text style={[styles.themeText, { color: theme.text }]}>🌸 Girly Pop (Pink)</Text>
          {themeName === 'girlypop' && <Text style={{ color: theme.accent }}>✓</Text>}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <TouchableOpacity style={styles.themeRow} onPress={() => changeTheme('light')}>
          <Text style={[styles.themeText, { color: theme.text }]}>⚪ Светла (White)</Text>
          {themeName === 'light' && <Text style={{ color: theme.accent }}>✓</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.accent }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: theme.accent }]}>ИЗХОД ОТ ПРОФИЛА</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 30, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 40 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
  themeText: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1, width: '100%' },
  logoutBtn: { padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  logoutText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 }
});