import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../constants/supabase';
import { GunStatus, getStatusLabel, getDaysUntilExpiry } from '../../constants/mockData';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

function StatusPill({ status, expiryDate }: { status: GunStatus; expiryDate: string }) {
  const s = Colors.status[status] || Colors.status.good;
  const days = getDaysUntilExpiry(expiryDate);
  return (
    <View style={[styles.statusPill, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.statusPillText, { color: s.text }]}>{getStatusLabel(status)}</Text>
      {status !== 'good' && <Text style={[styles.statusDaysText, { color: s.text }]}>{days < 0 ? `${Math.abs(days)} дни просрочен` : `${days} дни остават`}</Text>}
    </View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.specLabel, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.specValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const INITIAL_CHECKLIST = [
  { id: 'form', label: 'Заявление по образец', checked: false },
  { id: 'idCard', label: 'Лична карта (копие)', checked: false },
  { id: 'criminalRecord', label: 'Свидетелство за съдимост', checked: false },
  { id: 'medical', label: 'Медицинско свидетелство от психодиспансер', checked: false },
  { id: 'fee', label: 'Документ за платена държавна такса', checked: false },
  { id: 'technical', label: 'Удостоверение за годност (Технически преглед)', checked: false },
];

export default function GunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [gun, setGun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  useEffect(() => { 
    fetchGunDetails(); 
    requestPermissions(); 
    loadChecklist(); 
  }, [id]);

  async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') Alert.alert('Внимание', 'Моля разрешете известията.');
  }

  async function fetchGunDetails() {
    const { data, error } = await supabase.from('firearms').select('*').eq('id', id).single();
    if (data) {
      // SMART DATE LOGIC: Calculate based on last renewal, or fallback to first registration
      const activeDateStr = data.last_renewed_date || data.kos_registration_date;
      const activeDate = new Date(activeDateStr);
      const expiryDate = new Date(activeDate.setFullYear(activeDate.getFullYear() + 5));
      const isoExpiry = expiryDate.toISOString().split('T')[0];
      const days = getDaysUntilExpiry(isoExpiry);
      
      let status: GunStatus = 'good';
      if (days <= 0) status = 'danger'; else if (days <= 35) status = 'warning';
      
      setGun({ ...data, kosExpiryDate: isoExpiry, kosStatus: status, daysUntilExpiry: days });
    }
    setLoading(false);
  }

  const loadChecklist = async () => {
    try {
      const savedList = await AsyncStorage.getItem(`kos_checklist_${id}`);
      if (savedList) setChecklist(JSON.parse(savedList));
    } catch (e) { console.error(e); }
  };

  const toggleChecklistItem = async (index: number) => {
    const newList = [...checklist];
    newList[index].checked = !newList[index].checked;
    setChecklist(newList);
    await AsyncStorage.setItem(`kos_checklist_${id}`, JSON.stringify(newList));
  };

  // CHECK RENEWAL CONDITIONS
  const completedDocsCount = checklist.filter(item => item.checked).length;
  const allDocsCollected = completedDocsCount === checklist.length;
  const isWithinRenewalWindow = gun?.daysUntilExpiry <= 7; // 7 Days before expiry
  const canRenew = allDocsCollected && isWithinRenewalWindow;

  const handleRenewKOS = async () => {
    Alert.alert(
      "Подновяване на КОС",
      "Сигурни ли сте, че сте подали всички документи и искате да подновите разрешителното за нови 5 години?",
      [
        { text: "Отказ", style: "cancel" },
        { 
          text: "ПОДНОВИ", 
          onPress: async () => {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            
            // 1. Update Database with new renewal date
            const { error } = await supabase.from('firearms').update({ last_renewed_date: today }).eq('id', id);
            
            if (error) {
              Alert.alert("Грешка", error.message);
            } else {
              // 2. Wipe the checklist clean for the next 5 years
              const resetList = checklist.map(item => ({ ...item, checked: false }));
              setChecklist(resetList);
              await AsyncStorage.setItem(`kos_checklist_${id}`, JSON.stringify(resetList));
              
              Alert.alert("Успешно!", "Разрешителното е подновено за нови 5 години!");
              // 3. Reload the gun data to update the UI
              fetchGunDetails();
            }
            setLoading(false);
          }
        }
      ]
    );
  };

// --- NOTIFICATION ACTIONS ---
const handleTraining = async () => {
  Alert.alert("Тренировка", "Стрелбата е отчетена. Ще получите известие за почистване след 5 часа.");
  await Notifications.scheduleNotificationAsync({
    identifier: `clean_${id}`,
    content: { 
      title: "Поддръжка на оръжието 🧼", 
      body: `Изминаха 5 часа от стрелбата с ${gun.name}. Време е за почистване!`, 
      sound: true 
    },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, 
      seconds: 5 * 60 * 60 // Real-world: 5 hours
    },
  });
};
const handleTestKOS = async () => {
  Alert.alert("Напомняне за КОС", "Настроено е известие за 30 дни преди изтичане на разрешителното.");
  
  const expiryDate = new Date(gun.kosExpiryDate);
  const reminderDate = new Date(expiryDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  await Notifications.scheduleNotificationAsync({
    identifier: `kos_${id}`,
    content: { 
      title: "⚠ КОС Изтича след месец", 
      body: `Разрешителното за ${gun.name} изтича скоро. Започнете събирането на документи!`, 
      sound: true 
    },
    trigger: { date: reminderDate } as any, 
  });
};
// --- DELETE AND CANCEL NOTIFICATIONS ---
const handleDelete = async () => {
  Alert.alert(
    "Премахване на оръжие",
    "Сигурни ли сте, че искате да премахнете това оръжие от арсенала? Това действие е необратимо.",
    [
      { text: "Отказ", style: "cancel" },
      { 
        text: "ИЗТРИЙ", 
        style: "destructive", 
        onPress: async () => {
          setLoading(true);
          
          // 1. CANCEL THE GHOST NOTIFICATIONS FOR THIS SPECIFIC GUN!
          await Notifications.cancelScheduledNotificationAsync(`clean_${id}`);
          await Notifications.cancelScheduledNotificationAsync(`kos_${id}`);

          // 2. Wipe the checklist memory for this gun
          await AsyncStorage.removeItem(`kos_checklist_${id}`);

          // 3. Delete from Supabase
          const { error } = await supabase.from('firearms').delete().eq('id', id);
          
          if (error) {
            Alert.alert("Грешка", error.message);
            setLoading(false);
          } else {
            Alert.alert("Изтрито", "Оръжието беше премахнато успешно.");
            router.replace('/(tabs)');
          }
        }
      }
    ]
  );
};

  const handleClean = () => { Alert.alert("Готово", "Оръжието е маркирано като почистено."); };

  if (loading) return <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}><ActivityIndicator color={theme.accent} /></View>;
  if (!gun) return <View style={[styles.container, { backgroundColor: theme.bg }]}><Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>Оръжието не е намерено.</Text></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: gun.name, headerStyle: { backgroundColor: theme.bg }, headerTintColor: theme.text }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border, borderTopColor: Colors.status[gun.kosStatus as GunStatus].dot }]}>
          <View style={styles.heroImageArea}>
            {gun.image_url ? <Image source={{ uri: gun.image_url }} style={styles.heroImage} /> : <Text style={{ color: theme.muted }}>[НЯМА СНИМКА]</Text>}
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroTypeText, { color: theme.accent }]}>{gun.type?.toUpperCase()}</Text>
            <Text style={[styles.heroName, { color: theme.text }]}>{gun.name}</Text>
            <Text style={[styles.heroSerial, { color: theme.muted }]}>S/N: {gun.serial_number}</Text>
            <StatusPill status={gun.kosStatus} expiryDate={gun.kosExpiryDate} />
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={handleTraining}>
            <Ionicons name="flame" size={20} color={theme.accent} />
            <Text style={[styles.actionLabel, { color: theme.text }]}>Тренировка</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={handleClean}>
            <Ionicons name="water" size={20} color="#3B82F6" />
            <Text style={[styles.actionLabel, { color: theme.text }]}>Почистване</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.testBtn, { borderColor: theme.accent }]} onPress={handleTestKOS}>
          <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 12 }}>Тест: 30 мин известие за КОС</Text>
        </TouchableOpacity>

        {/* UPDATED SPECS WITH RENEWAL DATES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>ДЕТАЙЛИ</Text>
          <View style={[styles.specsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <SpecRow label="Производител" value={gun.manufacturer || '—'} />
            <SpecRow label="Калибър" value={gun.caliber || '—'} />
            <SpecRow label="Тегло" value={gun.weight_grams ? `${gun.weight_grams} гр.` : '—'} />
            <SpecRow label="Първа регистрация" value={gun.kos_registration_date} />
            <SpecRow label="Последно подновен" value={gun.last_renewed_date || '—'} />
            <SpecRow label="КОС изтича на" value={gun.kosExpiryDate} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.checklistHeader}>
            <Text style={[styles.sectionTitle, { color: theme.muted, marginBottom: 0 }]}>ДОКУМЕНТИ ЗА КОС</Text>
            <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '800' }}>{completedDocsCount} / {checklist.length}</Text>
          </View>

          <View style={[styles.specsCard, { backgroundColor: theme.card, borderColor: theme.border, padding: 15 }]}>
            {checklist.map((item, index) => (
              <TouchableOpacity key={item.id} style={styles.checklistRow} onPress={() => toggleChecklistItem(index)} activeOpacity={0.7}>
                <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color={item.checked ? theme.accent : theme.muted} />
                <Text style={[styles.checklistItemText, { color: item.checked ? theme.muted : theme.text, textDecorationLine: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.6 : 1 }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* THE SMART RENEW BUTTON */}
          <TouchableOpacity 
            style={[styles.renewBtn, { backgroundColor: canRenew ? theme.accent : theme.input, borderColor: theme.border, opacity: canRenew ? 1 : 0.6 }]} 
            disabled={!canRenew}
            onPress={handleRenewKOS}
          >
            <Text style={[styles.renewBtnText, { color: canRenew ? 'white' : theme.muted }]}>
              {canRenew ? "ПОДНОВИ КОС" : "ЗАКЛЮЧЕНО"}
            </Text>
          </TouchableOpacity>
          
          {/* Helper Text to explain why it's locked */}
          {!isWithinRenewalWindow && <Text style={[styles.helperText, { color: theme.muted }]}>* Опцията се отключва 7 дни преди изтичане</Text>}
          {isWithinRenewalWindow && !allDocsCollected && <Text style={[styles.helperText, { color: theme.accent }]}>* Отбележете всички документи за да подновите</Text>}

        </View>

        <TouchableOpacity style={[styles.deleteBtn, { borderTopColor: theme.border }]} onPress={handleDelete}>
          <Text style={styles.deleteText}>ПРЕМАХНИ ОТ АРСЕНАЛА</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: Spacing.md },
  heroCard: { borderRadius: Radius.xl, borderTopWidth: 4, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  heroImageArea: { height: 220, width: '100%', backgroundColor: '#000' }, heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroInfo: { padding: Spacing.md, gap: 4 }, heroTypeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }, heroName: { fontSize: 32, fontWeight: '900' }, heroSerial: { fontSize: 12, fontFamily: 'Courier New', marginBottom: 6 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' }, statusDot: { width: 6, height: 6, borderRadius: 3 }, statusPillText: { fontSize: 10, fontWeight: '800' }, statusDaysText: { fontSize: 10, opacity: 0.8 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 15 }, actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 12, borderWidth: 1 }, actionLabel: { fontWeight: '700', fontSize: 13 },
  testBtn: { padding: 12, borderWidth: 1, borderRadius: 8, borderStyle: 'dashed', alignItems: 'center', marginBottom: 20 },
  section: { marginBottom: Spacing.lg }, checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, marginBottom: 12, fontWeight: '800', marginLeft: 5 }, specsCard: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' }, specRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1 }, specLabel: { fontSize: 13, fontWeight: '600' }, specValue: { fontSize: 13, fontWeight: '700' },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }, checklistItemText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },
  renewBtn: { marginTop: 15, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' }, renewBtnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 14 }, helperText: { fontSize: 10, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  deleteBtn: { marginTop: 10, padding: 20, alignItems: 'center', borderTopWidth: 1 }, deleteText: { color: '#FF3B30', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 }
});