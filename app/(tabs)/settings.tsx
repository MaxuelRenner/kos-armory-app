import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../constants/supabase';
import { useTheme, ThemeType } from '../../context/ThemeContext';
const MVR_DOCUMENTS = [
  { id: '1', title: 'Заявление по образец', desc: 'Попълва се на място в служба КОС или електронно през e-uslugi.mvr.bg.' },
  { id: '2', title: 'Медицинско свидетелство', desc: 'Взема се от психодиспансер и се заверява от личният ви доктор, удостоверяващо липса на психически разстройства.' },
  { id: '3', title: 'Свидетелство за съдимост', desc: 'Взема се от съдът и задължително, трябва да е издадено преди не повече от 6 месеца.' },
  { id: '4', title: 'Удостоверение от прокуратурата', desc: 'Документ, че срещу вас няма образувани наказателни производства.' },
  { id: '5', title: 'Диплома за завършен курс', desc: 'Удостоверение за безопасно боравене с огнестрелно оръжие.' },
  { id: '6', title: 'Основателна причина', desc: 'Декларация за самоотбрана, ловен билет или удостоверение за спортен клуб.' },
  { id: '7', title: 'Платена държавна такса', desc: 'Квитанция за платена онлайн такса по тарифата на МВР 10,23 € (20 лв.). за изпълнение на услугата.' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeName, changeTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifKos, setNotifKos] = useState(true);
  const [notifCleaning, setNotifCleaning] = useState(true);
  const [mvrExpanded, setMvrExpanded] = useState(false);
  
  useEffect(() => {
    AsyncStorage.getItem('notif_kos').then((v) => { if (v !== null) setNotifKos(v === 'true'); });
    AsyncStorage.getItem('notif_cleaning').then((v) => { if (v !== null) setNotifCleaning(v === 'true'); });
  }, []);

  const toggleKos = async (val: boolean) => {
    setNotifKos(val);
    await AsyncStorage.setItem('notif_kos', String(val));
  };

  const toggleCleaning = async (val: boolean) => {
    setNotifCleaning(val);
    await AsyncStorage.setItem('notif_cleaning', String(val));
  };

  const handleLogout = () => {
    Alert.alert('Изход', 'Сигурни ли сте?', [
      { text: 'ОТКАЗ', style: 'cancel' },
      { text: 'ИЗХОД', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const themes: { key: ThemeType; label: string; icon: string }[] = [
    { key: 'industrial', label: 'Индустриална', icon: '⚫' },
    { key: 'military', label: 'Военна (Камуфлаж)', icon: '🪖' },
    { key: 'girlypop', label: 'Girly Pop (Pink)', icon: '🌸' },
    { key: 'light', label: 'Светла (White)', icon: '⚪' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 20 }]}> 
      <Text style={[styles.title, { color: theme.text, paddingHorizontal: 20 }]}>
        Настройки
      </Text>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>ТЕМА НА ПРИЛОЖЕНИЕТО</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {themes.map((t, i) => (
            <React.Fragment key={t.key}>
              <TouchableOpacity style={styles.row} onPress={() => changeTheme(t.key)}>
                <Text style={[styles.rowText, { color: theme.text }]}>{t.icon} {t.label}</Text>
                {themeName === t.key && <Text style={{ color: theme.accent, fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
              {i < themes.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </React.Fragment>
          ))}
        </View>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>ИЗВЕСТИЯ</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowText, { color: theme.text }]}>🔔 Подновяване на разрешително</Text>
              <Text style={[styles.rowSub, { color: theme.muted }]}>30 дни преди изтичане</Text>
            </View>
            <Switch
              value={notifKos}
              onValueChange={toggleKos}
              trackColor={{ false: theme.border, true: theme.accent + '88' }}
              thumbColor={notifKos ? theme.accent : theme.muted}/>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowText, { color: theme.text }]}>🧹 Почистване</Text>
              <Text style={[styles.rowSub, { color: theme.muted }]}>Почасово (до 5 пъти)</Text>
            </View>
            <Switch
              value={notifCleaning}
              onValueChange={toggleCleaning}
              trackColor={{ false: theme.border, true: theme.accent + '88' }}
              thumbColor={notifCleaning ? theme.accent : theme.muted}/>
          </View>
        </View>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>ИНФОРМАЦИЯ</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/onboarding')}>
            <Text style={[styles.rowText, { color: theme.text }]}>📖 Упътване за употреба</Text>
            <Text style={{ color: theme.muted }}>›</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.row} onPress={() => setMvrExpanded(!mvrExpanded)}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowText, { color: theme.text }]}>🏛 МВР — Важна информация</Text>
              <Text style={[styles.rowSub, { color: theme.muted }]}>Списък с нужни документи за разрешително</Text>
            </View>
            <Text style={{ color: theme.accent, fontSize: 16, fontWeight: 'bold' }}>
              {mvrExpanded ? '↓' : '→'}
            </Text>
          </TouchableOpacity>
          {mvrExpanded && (
            <View style={[styles.dropdownContent, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              {MVR_DOCUMENTS.map((doc, index) => (
                <View key={doc.id} style={[styles.docItem, index !== MVR_DOCUMENTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                  <Text style={[styles.docTitle, { color: theme.text }]}>{index + 1}. {doc.title}</Text>
                  <Text style={[styles.docDesc, { color: theme.muted }]}>{doc.desc}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.accent }]}
          onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: theme.accent }]}>ИЗХОД ОТ ПРОФИЛА</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View> 
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 }, 
  title: { fontSize: 28, fontWeight: '800', marginBottom: 15, letterSpacing: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  rowText: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 11, marginTop: 2 },
  divider: { height: 1, width: '100%' },
  logoutBtn: { padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', marginBottom: 10 },
  logoutText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  dropdownContent: { borderTopWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  docItem: { paddingVertical: 12 },
  docTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  docDesc: { fontSize: 12, lineHeight: 18 },
});