import { Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; 
import { supabase } from '../../constants/supabase';
import { GunStatus, getStatusLabel, getDaysUntilExpiry } from '../../constants/kosLogic';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { scheduleCleaningReminders, cancelCleaningReminders } from '../../constants/notifications';

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
  { id: 'form', label: 'Заявление по образец', info: 'Взема се на място от гише КОС или се изтегля от сайта на МВР.', checked: false },
  { id: 'idCard', label: 'Лична карта (копие)', info: 'Копие от двете страни. Носете и оригинала за сверка.', checked: false },
  { id: 'criminalRecord', label: 'Свидетелство за съдимост', info: 'Важи 6 месеца. Изважда се от Районния съд.', checked: false },
  { id: 'medical', label: 'Медицинско свидетелство', info: 'От психодиспансер + печат от личен лекар. Важи 6 месеца.', checked: false },
  { id: 'fee', label: 'Платена държавна такса', info: 'Плаща се на гише или по банков път към МВР.', checked: false },
  { id: 'technical', label: 'Удостоверение за годност', info: 'Издава се от лицензиран оръжеен майстор след преглед.', checked: false },
];

export default function GunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [gun, setGun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const handleUpdateImage = () => {
    Alert.alert("Смяна на снимка", "Изберете метод:", [
      { 
        text: "Камера", 
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status === 'granted') processImageUpdate(await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5 }));
        }
      },
      { 
        text: "Галерия", 
        onPress: async () => {
          processImageUpdate(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 }));
        }
      },
      { text: "Отказ", style: "cancel" }
    ]);
  };

  const processImageUpdate = async (result: any) => {
    if (result.canceled || !result.assets) return;
    setLoading(true);
    try {
      const uri = result.assets[0].uri;
      const fileExt = uri.substring(uri.lastIndexOf('.') + 1);
      const fileName = `gun_${Date.now()}.${fileExt}`;
      const formData = new FormData();
      formData.append('file', { uri, name: fileName, type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` } as any);
      
      const { error: uploadError } = await supabase.storage.from('gun-images').upload(fileName, formData);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('gun-images').getPublicUrl(fileName);
        await supabase.from('firearms').update({ image_url: publicUrlData.publicUrl }).eq('id', id);
        fetchGunDetails();
      }
    } catch (err) { console.error(err); Alert.alert("Грешка", "Снимката не бе запазена."); }
    setLoading(false);
  };

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
      const activeDateStr = data.last_renewed_date || data.kos_registration_date;
      const activeDate = new Date(activeDateStr);
      const expiryDate = new Date(activeDate.setFullYear(activeDate.getFullYear() + 5));
      const isoExpiry = expiryDate.toISOString().split('T')[0];
      const days = getDaysUntilExpiry(isoExpiry);
      
      let status: GunStatus = 'good';
      if (days <= 0) status = 'danger'; else if (days <= 30) status = 'warning'; 
      
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
    const newList = checklist.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setChecklist(newList);
    await AsyncStorage.setItem(`kos_checklist_${id}`, JSON.stringify(newList));
  };

  const completedDocsCount = checklist.filter(item => item.checked).length;
  const allDocsCollected = completedDocsCount === checklist.length;
  const isWithinRenewalWindow = gun?.daysUntilExpiry <= 30;
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
            
            const { error } = await supabase.from('firearms').update({ last_renewed_date: today }).eq('id', id);
            
            if (error) {
              Alert.alert("Грешка", error.message);
            } else {
              const resetList = checklist.map(item => ({ ...item, checked: false }));
              setChecklist(resetList);
              await AsyncStorage.setItem(`kos_checklist_${id}`, JSON.stringify(resetList));
              
              Alert.alert("Успешно!", "Разрешителното е подновено за нови 5 години!");
              fetchGunDetails();
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleTraining = async () => {
    Alert.alert("Тренировка", "Стрелбата е отчетена. Ще получавате известия за почистване през следващите 5 часа.");
    
    const newCount = (gun.training_count || 0) + 1;
    
    // 1. OPTIMISTIC UPDATE
    setGun((prev: any) => ({ ...prev, training_count: newCount }));

    // 2. Database Update
    const { error } = await supabase.from('firearms').update({ 
      needs_cleaning: true, 
      last_range_day: new Date().toISOString(), 
      training_count: newCount 
    }).eq('id', id);

    // 3. ERROR CATCHER (If you forgot to add the column in Supabase!)
    if (error) {
      Alert.alert("Грешка в Базата Данни", "Броячът не се запази! Уверете се че сте добавили колона 'training_count' (int4) в Supabase таблицата 'firearms'.\n\nДетайли: " + error.message);
      setGun((prev: any) => ({ ...prev, training_count: newCount - 1 })); // Reverts the fake visual update
      return;
    }
    
    // 4. Setup cleaning notification loop
    await scheduleCleaningReminders(gun.name);
    fetchGunDetails();
  };

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
          try {
            await Notifications.cancelScheduledNotificationAsync(`clean_${id}`);
            await Notifications.cancelScheduledNotificationAsync(`kos_${id}`);
          } catch(e) {} // Ignores Expo Go error
            await AsyncStorage.removeItem(`kos_checklist_${id}`);
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

  const handleClean = async () => { 
    Alert.alert("Готово", "Оръжието е почистено!");
    
    // 👇 FIXED: Changed 'last_cleaned' to 'last_cleaned_date' to match your database!
    await supabase.from('firearms').update({ needs_cleaning: false, last_cleaned_date: new Date().toISOString() }).eq('id', id);
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync(); 
  } catch(e) {} // Ignores Expo Go error

    fetchGunDetails();
  };

  if (loading) return <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}><ActivityIndicator color={theme.accent} /></View>;
  if (!gun) return <View style={[styles.container, { backgroundColor: theme.bg }]}><Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>Оръжието не е намерено.</Text></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ title: gun.name, headerStyle: { backgroundColor: theme.bg }, headerTintColor: theme.text }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border, borderTopColor: Colors.status[gun.kosStatus as GunStatus].dot }]}>
          <TouchableOpacity style={styles.heroImageArea} onPress={handleUpdateImage} activeOpacity={0.8}>
            {gun.image_url ? <Image source={{ uri: gun.image_url }} style={styles.heroImage} /> : <Text style={{ color: theme.muted }}>[ДОБАВИ СНИМКА]</Text>}
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 }}>
              <Ionicons name="camera-reverse" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.heroInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              
              {/* LEFT SIDE: Name & Serial */}
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.heroTypeText, { color: theme.accent }]}>{gun.type?.toUpperCase()}</Text>
                <Text style={[styles.heroName, { color: theme.text }]}>{gun.name}</Text>
                <Text style={[styles.heroSerial, { color: theme.muted }]}>S/N: {gun.serial_number}</Text>
              </View>

              {/* RIGHT SIDE: Counter & Cleaning Badge */}
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={[styles.counterBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Text style={[styles.counterNumber, { color: theme.text }]}>{gun.training_count || 0}</Text>
                  <Text style={[styles.counterLabel, { color: theme.muted }]}>ТРЕНИРОВКИ</Text>
                </View>
                
                {/* 👈 THE NEW CLEANING BADGE */}
                {gun.needs_cleaning && (
                  <View style={styles.cleaningBadge}>
                    <Text style={styles.cleaningBadgeText}>⚠ ЗА ПОЧИСТВАНЕ</Text>
                  </View>
                )}
              </View>

            </View>

            <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
              <StatusPill status={gun.kosStatus} expiryDate={gun.kosExpiryDate} />
            </View>
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

          {checklist.map((item, index) => (
            <View key={item.id} style={[styles.checklistRow, { alignItems: 'flex-start' }]}>
              <TouchableOpacity style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 12 }} onPress={() => toggleChecklistItem(index)} activeOpacity={0.7}>
                <Ionicons name={item.checked ? "checkbox" : "square-outline"} size={24} color={item.checked ? theme.accent : theme.muted} />
                <Text style={[styles.checklistItemText, { color: item.checked ? theme.muted : theme.text, textDecorationLine: item.checked ? 'line-through' : 'none' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => Linking.openURL('https://mvr.bg/services/administrative-services/weapons')} style={{ padding: 4 }}>
                <Ionicons name="information-circle-outline" size={22} color={theme.accent} />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.renewBtn, { backgroundColor: canRenew ? theme.accent : theme.input, borderColor: theme.border, opacity: canRenew ? 1 : 0.6 }]} 
            disabled={!canRenew}
            onPress={handleRenewKOS}
          >
            <Text style={[styles.renewBtnText, { color: canRenew ? 'white' : theme.muted }]}>
              {canRenew ? "ПОДНОВИ КОС" : "ЗАКЛЮЧЕНО"}
            </Text>
          </TouchableOpacity>
          
          {!isWithinRenewalWindow && <Text style={[styles.helperText, { color: theme.muted }]}>* Опцията се отключва 30 дни преди изтичане</Text>}
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
  heroImageArea: { height: 220, width: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }, heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroInfo: { padding: Spacing.md, gap: 4 }, heroTypeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 }, heroName: { fontSize: 32, fontWeight: '900', lineHeight: 36 }, heroSerial: { fontSize: 12, fontFamily: 'Courier New', marginTop: 4 },
  
  // NEW COUNTER STYLES
  counterBox: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', minWidth: 90 },
  counterNumber: { fontSize: 26, fontWeight: '900' },
  counterLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  cleaningBadge: { backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, alignItems: 'center' },
  cleaningBadgeText: { fontSize: 9, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.5 },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' }, statusDot: { width: 6, height: 6, borderRadius: 3 }, statusPillText: { fontSize: 10, fontWeight: '800' }, statusDaysText: { fontSize: 10, opacity: 0.8 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 15 }, actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, borderRadius: 12, borderWidth: 1 }, actionLabel: { fontWeight: '700', fontSize: 13 },
  section: { marginBottom: Spacing.lg }, checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, marginBottom: 12, fontWeight: '800', marginLeft: 5 }, specsCard: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' }, specRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1 }, specLabel: { fontSize: 13, fontWeight: '600' }, specValue: { fontSize: 13, fontWeight: '700' },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }, checklistItemText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },
  renewBtn: { marginTop: 15, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' }, renewBtnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 14 }, helperText: { fontSize: 10, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  deleteBtn: { marginTop: 10, padding: 20, alignItems: 'center', borderTopWidth: 1 }, deleteText: { color: '#FF3B30', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 }
});