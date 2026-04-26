import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer'; // THIS FIXED THE ERROR SCREEN!
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabase';
import { useTheme } from '../../context/ThemeContext';
import { scheduleKosRenewalNotification } from '../../constants/notifications';

// ─── MASSIVE DATABASES ────────────────────────────────────────────────────────

const TYPE_DATA = [ 
  { label: 'Пистолет', value: 'Пистолет' }, 
  { label: 'Картечен пистолет (SMG)', value: 'SMG' }, 
  { label: 'Карабина (Полуавтомат)', value: 'Карабина' }, 
  { label: 'Ловна пушка (Гладкоцевна)', value: 'Гладкоцевна' },
  { label: 'Болтова карабина', value: 'Болтова' },
  { label: 'Револвер', value: 'Револвер' }
];

// Replace CALIBER_DATA with this:
const CALIBERS_BY_TYPE: Record<string, { label: string, value: string }[]> = {
  'Пистолет': [
    { label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.45 ACP', value: '.45 ACP' }, 
    { label: '.22 LR', value: '.22 LR' }, { label: '.380 ACP', value: '.380 ACP' }
  ],
  'Карабина': [
    { label: '5.56x45mm NATO', value: '5.56x45mm' }, { label: '7.62x39mm (AK)', value: '7.62x39mm' },
    { label: '7.62x51mm NATO', value: '7.62x51mm' }, { label: '.300 Blackout', value: '.300 Blackout' }
  ],
  'Ловна пушка (Гладкоцевна)': [
    { label: '12 Gauge', value: '12 Gauge' }, { label: '20 Gauge', value: '20 Gauge' }
  ],
  'Болтова карабина': [
    { label: '.308 Win', value: '.308 Win' }, { label: '6.5mm Creedmoor', value: '6.5mm Creedmoor' },
    { label: '.338 Lapua', value: '.338 Lapua' }
  ],
  'Револвер': [
    { label: '.357 Magnum', value: '.357 Magnum' }, { label: '.38 Special', value: '.38 Special' },
    { label: '.44 Magnum', value: '.44 Magnum' }
  ],
  'Картечен пистолет (SMG)': [
    { label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.45 ACP', value: '.45 ACP' },
    { label: '5.7x28mm (FN)', value: '5.7x28mm' }
  ]
};

// Massive Smart Manufacturer Map (20+ each)
const MFR_MAP: Record<string, { label: string, value: string }[]> = {
  'Пистолет': [
    { label: 'Glock', value: 'Glock' }, { label: 'Sig Sauer', value: 'Sig Sauer' }, 
    { label: 'CZ', value: 'CZ' }, { label: 'Heckler & Koch (H&K)', value: 'H&K' }, 
    { label: 'Beretta', value: 'Beretta' }, { label: 'Smith & Wesson', value: 'Smith & Wesson' }, 
    { label: 'Walther', value: 'Walther' }, { label: 'FN Herstal', value: 'FN Herstal' }, 
    { label: 'Springfield Armory', value: 'Springfield Armory' }, { label: 'Ruger', value: 'Ruger' }, 
    { label: 'Canik', value: 'Canik' }, { label: 'Taurus', value: 'Taurus' }, 
    { label: 'Arex', value: 'Arex' }, { label: 'HS Produkt', value: 'HS Produkt' }, 
    { label: 'Steyr Arms', value: 'Steyr Arms' }, { label: 'IWI', value: 'IWI' }, 
    { label: 'Grand Power', value: 'Grand Power' }, { label: 'Kel-Tec', value: 'Kel-Tec' }, 
    { label: 'Makarov / Arsenal', value: 'Arsenal' }, { label: 'Zastava Arms', value: 'Zastava Arms' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'Револвер': [
    { label: 'Smith & Wesson', value: 'Smith & Wesson' }, { label: 'Colt', value: 'Colt' }, 
    { label: 'Ruger', value: 'Ruger' }, { label: 'Taurus', value: 'Taurus' }, 
    { label: 'Kimber', value: 'Kimber' }, { label: 'Korth', value: 'Korth' }, 
    { label: 'Manurhin', value: 'Manurhin' }, { label: 'Charter Arms', value: 'Charter Arms' }, 
    { label: 'Chiappa Firearms', value: 'Chiappa' }, { label: 'North American Arms (NAA)', value: 'NAA' }, 
    { label: 'Uberti', value: 'Uberti' }, { label: 'Pietta', value: 'Pietta' }, 
    { label: 'Dan Wesson', value: 'Dan Wesson' }, { label: 'Spohr', value: 'Spohr' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'SMG': [ 
    { label: 'Heckler & Koch (H&K)', value: 'H&K' }, { label: 'CZ (Scorpion)', value: 'CZ' }, 
    { label: 'Sig Sauer (MPX)', value: 'Sig Sauer' }, { label: 'B&T (APC)', value: 'B&T' }, 
    { label: 'FN Herstal (P90)', value: 'FN Herstal' }, { label: 'Arsenal', value: 'Arsenal' }, 
    { label: 'IWI (Uzi)', value: 'IWI' }, { label: 'Grand Power (Stribog)', value: 'Grand Power' }, 
    { label: 'Kel-Tec', value: 'Kel-Tec' }, { label: 'Sten', value: 'Sten' },
    { label: 'Друго', value: 'Друго' } 
  ],
  'Карабина': [
    { label: 'Arsenal (AK-47 BG)', value: 'Arsenal' }, { label: 'Colt', value: 'Colt' }, 
    { label: 'Daniel Defense', value: 'Daniel Defense' }, { label: 'Sig Sauer', value: 'Sig Sauer' }, 
    { label: 'Heckler & Koch (H&K)', value: 'H&K' }, { label: 'FN Herstal', value: 'FN Herstal' }, 
    { label: 'Ruger', value: 'Ruger' }, { label: 'Smith & Wesson', value: 'Smith & Wesson' }, 
    { label: 'Springfield Armory', value: 'Springfield Armory' }, { label: 'IWI', value: 'IWI' }, 
    { label: 'CZ', value: 'CZ' }, { label: 'Steyr Arms (AUG)', value: 'Steyr Arms' }, 
    { label: 'BCM', value: 'BCM' }, { label: 'Aero Precision', value: 'Aero Precision' }, 
    { label: "Knight's Armament (KAC)", value: 'KAC' }, { label: 'Zastava Arms', value: 'Zastava Arms' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'Болтова': [
    { label: 'Tikka', value: 'Tikka' }, { label: 'Sako', value: 'Sako' }, 
    { label: 'Remington', value: 'Remington' }, { label: 'Ruger', value: 'Ruger' }, 
    { label: 'Browning', value: 'Browning' }, { label: 'Blaser', value: 'Blaser' }, 
    { label: 'Bergara', value: 'Bergara' }, { label: 'CZ', value: 'CZ' }, 
    { label: 'Savage Arms', value: 'Savage Arms' }, { label: 'Steyr Mannlicher', value: 'Steyr Mannlicher' }, 
    { label: 'Mauser', value: 'Mauser' }, { label: 'Winchester', value: 'Winchester' }, 
    { label: 'Sauer', value: 'Sauer' }, { label: 'Howa', value: 'Howa' }, 
    { label: 'Haenel', value: 'Haenel' }, { label: 'Barrett', value: 'Barrett' }, 
    { label: 'Accuracy International', value: 'Accuracy International' }, { label: 'Merkel', value: 'Merkel' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'Гладкоцевна': [
    { label: 'Benelli', value: 'Benelli' }, { label: 'Beretta', value: 'Beretta' }, 
    { label: 'Mossberg', value: 'Mossberg' }, { label: 'Remington', value: 'Remington' }, 
    { label: 'Browning', value: 'Browning' }, { label: 'Franchi', value: 'Franchi' }, 
    { label: 'Winchester', value: 'Winchester' }, { label: 'Stoeger', value: 'Stoeger' }, 
    { label: 'ATA Arms', value: 'ATA Arms' }, { label: 'Huglu', value: 'Huglu' }, 
    { label: 'CZ', value: 'CZ' }, { label: 'Fabarm', value: 'Fabarm' }, 
    { label: 'Hatsan', value: 'Hatsan' }, { label: 'Akkar', value: 'Akkar' }, 
    { label: 'Kel-Tec (KSG)', value: 'Kel-Tec' }, { label: 'Baikal (IZH)', value: 'Baikal' }, 
    { label: 'Perazzi', value: 'Perazzi' }, { label: 'Krieghoff', value: 'Krieghoff' }, 
    { label: 'Derya Arms', value: 'Derya Arms' }, { label: 'Blaser', value: 'Blaser' }, 
    { label: 'Друго', value: 'Друго' }
  ]
};
export default function AddGunScreen() {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [type, setType] = useState('Пистолет');
  const [manufacturer, setManufacturer] = useState('Glock');
  const [caliber, setCaliber] = useState('9x19mm');
  const [weight, setWeight] = useState('');
  const [barrelLength, setBarrelLength] = useState('');
  const [capacity, setCapacity] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [imageObject, setImageObject] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) setImageObject(result.assets[0]);
  };

  const handleSave = async () => {
    if (!name || !serial) return Alert.alert("Внимание", "Име и сериен номер са задължителни.");
    
    // --- WEIGHT VALIDATION ---
    const weightNum = parseInt(weight);
    if (weight && (isNaN(weightNum) || weightNum <= 0)) {
      return Alert.alert("Внимание", "Теглото трябва да бъде положително число.");
    }
    if (type === 'Пистолет' && weightNum > 3000) return Alert.alert("Внимание", "Пистолет не може да тежи над 3 кг.");
    if (type === 'Револвер' && weightNum > 3000) return Alert.alert("Внимание", "Револвер не може да тежи над 3 кг.");
    if (weightNum > 15000) return Alert.alert("Внимание", "Въведеното тегло е нереалистично (над 15 кг).");

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let finalImageUrl = null;

    if (imageObject && imageObject.uri) {
      try {
        const fileExt = imageObject.uri.substring(imageObject.uri.lastIndexOf('.') + 1);
        const fileName = `gun_${Date.now()}.${fileExt}`;
        const formData = new FormData();
        formData.append('file', { uri: imageObject.uri, name: fileName, type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` } as any);
        const { error: uploadError } = await supabase.storage.from('gun-images').upload(fileName, formData);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('gun-images').getPublicUrl(fileName);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (err) { console.error(err); }
    }

    const registrationDateIso = date.toISOString().split('T')[0];

    const { error } = await supabase.from('firearms').insert([{
      user_id: user?.id, name, serial_number: serial, manufacturer, type, caliber,
      weight_grams: weightNum || null, barrel_length_mm: parseInt(barrelLength) || null,
      capacity: parseInt(capacity) || null, kos_registration_date: registrationDateIso, image_url: finalImageUrl
    }]);

    if (error) {
      Alert.alert("Грешка при запис", error.message);
    } else {
      // --- SCHEDULE REAL KOS NOTIFICATION ---
      // Calculate expiry date (+5 years)
      const expiryDate = new Date(date);
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
      await scheduleKosRenewalNotification(name, expiryDate.toISOString().split('T')[0]);

      Alert.alert("Успешно!", "Оръжието е добавено в арсенала.");
      
      setName(''); setSerial(''); setWeight(''); setBarrelLength(''); setCapacity(''); 
      setImageObject(null); setDate(new Date()); setType('Пистолет'); setManufacturer('Glock'); setCaliber('9x19mm');
      
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  // This turns the text RED if Industrial is active, otherwise normal text color
  const activeTextColor = themeName === 'industrial' ? theme.accent : theme.text;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Добави в арсенала</Text>

      <Text style={[styles.label, { color: theme.accent }]}>Модел & Сериен номер</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: activeTextColor }]} value={name} onChangeText={setName} placeholder="Модел..." placeholderTextColor={theme.muted} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: activeTextColor }]} value={serial} onChangeText={setSerial} placeholder="S/N..." placeholderTextColor={theme.muted} />

      <Text style={[styles.label, { color: theme.accent }]}>Спецификации</Text>
      <Dropdown style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} selectedTextStyle={{ color: activeTextColor }} placeholderStyle={{ color: theme.muted }} containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} itemTextStyle={{ color: activeTextColor }} activeColor={theme.border} data={TYPE_DATA} labelField="label" valueField="value" value={type} onChange={i => { setType(i.value); setManufacturer(MFR_MAP[i.value][0].value); }} />
      <Dropdown style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} selectedTextStyle={{ color: activeTextColor }} placeholderStyle={{ color: theme.muted }} containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} itemTextStyle={{ color: activeTextColor }} activeColor={theme.border} data={MFR_MAP[type] || MFR_MAP['Пистолет']} labelField="label" valueField="value" value={manufacturer} onChange={i => setManufacturer(i.value)} />
      <Dropdown style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} selectedTextStyle={{ color: activeTextColor }} placeholderStyle={{ color: theme.muted }} containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} itemTextStyle={{ color: activeTextColor }} activeColor={theme.border} data={CALIBERS_BY_TYPE[type] || CALIBERS_BY_TYPE['Пистолет']} labelField="label" valueField="value" value={caliber} onChange={i => setCaliber(i.value)} />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
        <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.input, borderColor: theme.border, color: activeTextColor }]} value={weight} onChangeText={setWeight} placeholder="Тегло (гр)" keyboardType="numeric" placeholderTextColor={theme.muted} />
        <TextInput style={[styles.input, { flex: 1, backgroundColor: theme.input, borderColor: theme.border, color: activeTextColor }]} value={capacity} onChangeText={setCapacity} placeholder="Капацитет" keyboardType="numeric" placeholderTextColor={theme.muted} />
      </View>

      <Text style={[styles.label, { color: theme.accent }]}>КОС & Снимка</Text>
      <TouchableOpacity style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={() => setShowPicker(true)}>
        <Text style={{ color: activeTextColor }}>Дата на КОС: {date.toLocaleDateString('bg-BG')}</Text>
      </TouchableOpacity>
      {showPicker && <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />}
      
      <TouchableOpacity style={[styles.imagePickerBox, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={pickImage}>
        {imageObject ? <Image source={{ uri: imageObject.uri }} style={styles.imagePreview} /> : <View style={styles.imagePickerPlaceholder}><Ionicons name="camera" size={32} color={theme.muted} /><Text style={{ color: theme.muted, marginTop: 8, fontWeight: '600' }}>Избери снимка</Text></View>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ЗАПИШИ</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 20, paddingBottom: 60 }, title: { fontSize: 26, fontWeight: '900', marginTop: 20 },
  label: { fontSize: 13, fontWeight: '800', marginTop: 15, marginBottom: 8, letterSpacing: 1.2 }, input: { borderRadius: 10, padding: 16, borderWidth: 1, marginBottom: 12 },
  dropdown: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 12 }, imagePickerBox: { height: 160, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', overflow: 'hidden', marginTop: 5 },
  imagePickerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' }, imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 10 }, btnText: { color: 'white', fontWeight: '900', letterSpacing: 1.5 }
});