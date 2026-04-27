import React, { useState, useCallback, useRef } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker'; 
import { supabase } from '../../constants/supabase';
import { Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from 'react-native-element-dropdown';

const TYPE_DATA = [
  { label: 'Пистолет', value: 'Пистолет' },
  { label: 'Револвер', value: 'Револвер' },
  { label: 'SMG', value: 'SMG' },
  { label: 'Карабина', value: 'Карабина' },
  { label: 'Болтова карабина', value: 'Болтова' },
  { label: 'Ловна пушка (Гладкоцевна)', value: 'Гладкоцевна' }
];

const MFR_MAP: Record<string, { label: string, value: string }[]> = {
  'Пистолет': [
    { label: 'Glock', value: 'Glock' }, { label: 'Sig Sauer', value: 'Sig Sauer' }, { label: 'CZ', value: 'CZ' }, 
    { label: 'Heckler & Koch (H&K)', value: 'H&K' }, { label: 'Beretta', value: 'Beretta' }, 
    { label: 'Smith & Wesson', value: 'S&W' }, { label: 'Springfield Armory', value: 'Springfield' }, 
    { label: 'Walther', value: 'Walther' }, { label: 'Ruger', value: 'Ruger' }, { label: 'FN Herstal', value: 'FN' }, 
    { label: 'Taurus', value: 'Taurus' }, { label: 'Arsenal', value: 'Arsenal' }, { label: 'Makarov', value: 'Makarov' }, 
    { label: 'Colt', value: 'Colt' }, { label: 'Canik', value: 'Canik' }, { label: 'Steyr', value: 'Steyr' }, 
    { label: 'Zastava', value: 'Zastava' }, { label: 'Tisas', value: 'Tisas' }, { label: 'Grand Power', value: 'Grand Power' }, 
    { label: 'HS Produkt', value: 'HS Produkt' }, { label: 'Друго', value: 'Друго' }
  ],
  'Револвер': [
    { label: 'Smith & Wesson', value: 'S&W' }, { label: 'Colt', value: 'Colt' }, { label: 'Ruger', value: 'Ruger' }, 
    { label: 'Taurus', value: 'Taurus' }, { label: 'Chiappa', value: 'Chiappa' }, { label: 'Charter Arms', value: 'Charter Arms' }, 
    { label: 'Manurhin', value: 'Manurhin' }, { label: 'Uberti', value: 'Uberti' }, { label: 'Alfa Proj', value: 'Alfa Proj' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'SMG': [
    { label: 'Heckler & Koch (H&K)', value: 'H&K' }, { label: 'FN Herstal', value: 'FN' }, { label: 'CZ', value: 'CZ' }, 
    { label: 'B&T', value: 'B&T' }, { label: 'Sig Sauer', value: 'Sig Sauer' }, { label: 'IWI', value: 'IWI' }, 
    { label: 'Arsenal', value: 'Arsenal' }, { label: 'CMMG', value: 'CMMG' }, { label: 'Kel-Tec', value: 'Kel-Tec' }, 
    { label: 'Kriss USA', value: 'Kriss' }, { label: 'Grand Power', value: 'Grand Power' }, { label: 'Друго', value: 'Друго' }
  ],
  'Карабина': [
    { label: 'Arsenal', value: 'Arsenal' }, { label: 'Colt', value: 'Colt' }, { label: 'Daniel Defense', value: 'Daniel Defense' }, 
    { label: 'BCM', value: 'BCM' }, { label: 'Aero Precision', value: 'Aero Precision' }, { label: 'Heckler & Koch (H&K)', value: 'H&K' }, 
    { label: 'FN Herstal', value: 'FN' }, { label: 'Sig Sauer', value: 'Sig Sauer' }, { label: 'IWI', value: 'IWI' }, 
    { label: 'CZ', value: 'CZ' }, { label: 'Ruger', value: 'Ruger' }, { label: 'Smith & Wesson', value: 'S&W' }, 
    { label: 'Steyr', value: 'Steyr' }, { label: 'Zastava', value: 'Zastava' }, { label: 'CMMG', value: 'CMMG' }, 
    { label: 'Radian', value: 'Radian' }, { label: 'KAC', value: 'KAC' }, { label: 'LMT', value: 'LMT' }, 
    { label: 'Noveske', value: 'Noveske' }, { label: 'Друго', value: 'Друго' }
  ],
  'Болтова': [
    { label: 'Remington', value: 'Remington' }, { label: 'Sako', value: 'Sako' }, { label: 'Tikka', value: 'Tikka' }, 
    { label: 'Bergara', value: 'Bergara' }, { label: 'Browning', value: 'Browning' }, { label: 'Winchester', value: 'Winchester' }, 
    { label: 'Ruger', value: 'Ruger' }, { label: 'Savage', value: 'Savage' }, { label: 'CZ', value: 'CZ' }, 
    { label: 'Steyr', value: 'Steyr' }, { label: 'Mauser', value: 'Mauser' }, { label: 'Howa', value: 'Howa' }, 
    { label: 'Weatherby', value: 'Weatherby' }, { label: 'Accuracy International', value: 'Accuracy International' }, 
    { label: 'Blaser', value: 'Blaser' }, { label: 'Друго', value: 'Друго' }
  ],
  'Гладкоцевна': [
    { label: 'Benelli', value: 'Benelli' }, { label: 'Beretta', value: 'Beretta' }, { label: 'Mossberg', value: 'Mossberg' }, 
    { label: 'Remington', value: 'Remington' }, { label: 'Browning', value: 'Browning' }, { label: 'Winchester', value: 'Winchester' }, 
    { label: 'Stoeger', value: 'Stoeger' }, { label: 'Franchi', value: 'Franchi' }, { label: 'Kel-Tec', value: 'Kel-Tec' }, 
    { label: 'Hatsan', value: 'Hatsan' }, { label: 'Baikal', value: 'Baikal' }, { label: 'CZ', value: 'CZ' }, 
    { label: 'Fabarm', value: 'Fabarm' }, { label: 'Друго', value: 'Друго' }
  ]
};

const CALIBERS_BY_TYPE: Record<string, { label: string, value: string }[]> = {
  'Пистолет': [
    { label: '.22 LR', value: '.22 LR' }, { label: '.25 ACP', value: '.25 ACP' }, { label: '.32 ACP', value: '.32 ACP' }, 
    { label: '.380 ACP', value: '.380 ACP' }, { label: '9x18mm Makarov', value: '9x18mm Makarov' }, 
    { label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.357 SIG', value: '.357 SIG' }, { label: '.40 S&W', value: '.40 S&W' }, 
    { label: '10mm Auto', value: '10mm Auto' }, { label: '.45 ACP', value: '.45 ACP' }, { label: '5.7x28mm', value: '5.7x28mm' }, 
    { label: '7.62x25mm Tokarev', value: '7.62x25mm' }, { label: 'Друго', value: 'Друго' }
  ],
  'Револвер': [
    { label: '.22 LR', value: '.22 LR' }, { label: '.22 WMR', value: '.22 WMR' }, { label: '.38 Special', value: '.38 Special' }, 
    { label: '.357 Magnum', value: '.357 Magnum' }, { label: '.44 Special', value: '.44 Special' }, 
    { label: '.44 Magnum', value: '.44 Magnum' }, { label: '.45 Colt', value: '.45 Colt' }, { label: '.454 Casull', value: '.454 Casull' }, 
    { label: '.460 S&W', value: '.460 S&W' }, { label: '.500 S&W', value: '.500 S&W' }, { label: 'Друго', value: 'Друго' }
  ],
  'SMG': [
    { label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.45 ACP', value: '.45 ACP' }, { label: '10mm Auto', value: '10mm Auto' }, 
    { label: '5.7x28mm', value: '5.7x28mm' }, { label: '4.6x30mm', value: '4.6x30mm' }, { label: '9x18mm Makarov', value: '9x18mm Makarov' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'Карабина': [
    { label: '.22 LR', value: '.22 LR' }, { label: '5.56x45mm NATO / .223 Rem', value: '5.56x45mm' }, 
    { label: '7.62x39mm', value: '7.62x39mm' }, { label: '5.45x39mm', value: '5.45x39mm' }, { label: '.300 Blackout', value: '.300 Blackout' }, 
    { label: '7.62x51mm NATO / .308 Win', value: '7.62x51mm' }, { label: '6.5mm Grendel', value: '6.5mm Grendel' }, 
    { label: '6.8 SPC', value: '6.8 SPC' }, { label: '9x19mm (PCC)', value: '9x19mm' }, { label: '.45 ACP (PCC)', value: '.45 ACP' }, 
    { label: '10mm Auto (PCC)', value: '10mm Auto' }, { label: 'Друго', value: 'Друго' }
  ],
  'Болтова': [
    { label: '.22 LR', value: '.22 LR' }, { label: '.223 Rem', value: '.223 Rem' }, { label: '.243 Win', value: '.243 Win' }, 
    { label: '6.5mm Creedmoor', value: '6.5mm Creedmoor' }, { label: '6.5x55mm Swedish', value: '6.5x55mm' }, 
    { label: '.270 Win', value: '.270 Win' }, { label: '7mm-08 Rem', value: '7mm-08' }, { label: '7mm Rem Mag', value: '7mm Rem Mag' }, 
    { label: '.308 Win', value: '.308 Win' }, { label: '.30-06 Springfield', value: '.30-06' }, { label: '.300 Win Mag', value: '.300 Win Mag' }, 
    { label: '.300 PRC', value: '.300 PRC' }, { label: '.338 Lapua Magnum', value: '.338 Lapua' }, { label: '7.62x54mmR', value: '7.62x54mmR' }, 
    { label: 'Друго', value: 'Друго' }
  ],
  'Гладкоцевна': [
    { label: '12 Gauge', value: '12 Gauge' }, { label: '16 Gauge', value: '16 Gauge' }, { label: '20 Gauge', value: '20 Gauge' }, 
    { label: '28 Gauge', value: '28 Gauge' }, { label: '.410 Bore', value: '.410 Bore' }, { label: 'Друго', value: 'Друго' }
  ]
};

// 👈 NEW: Smart Filter Logic
const getAvailableCalibers = (currentType: string, currentMfr: string) => {
  if (currentType === 'Пистолет') {
    if (currentMfr === 'Makarov') return [{ label: '9x18mm Makarov', value: '9x18mm Makarov' }, { label: '.380 ACP', value: '.380 ACP' }, { label: 'Друго', value: 'Друго' }];
    if (currentMfr === 'Arsenal') return [{ label: '9x18mm Makarov', value: '9x18mm Makarov' }, { label: '9x19mm Parabellum', value: '9x19mm' }, { label: 'Друго', value: 'Друго' }];
    if (currentMfr === 'Glock') return [{ label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.40 S&W', value: '.40 S&W' }, { label: '.45 ACP', value: '.45 ACP' }, { label: '10mm Auto', value: '10mm Auto' }, { label: '.380 ACP', value: '.380 ACP' }, { label: '.22 LR', value: '.22 LR' }, { label: 'Друго', value: 'Друго' }];
    if (currentMfr === 'Beretta' || currentMfr === 'CZ' || currentMfr === 'Sig Sauer' || currentMfr === 'Walther') return [{ label: '9x19mm Parabellum', value: '9x19mm' }, { label: '.380 ACP', value: '.380 ACP' }, { label: '.40 S&W', value: '.40 S&W' }, { label: '.45 ACP', value: '.45 ACP' }, { label: '.22 LR', value: '.22 LR' }, { label: 'Друго', value: 'Друго' }];
  }
  if (currentType === 'Карабина') {
    if (currentMfr === 'Arsenal' || currentMfr === 'Zastava') return [{ label: '7.62x39mm', value: '7.62x39mm' }, { label: '5.56x45mm NATO', value: '5.56x45mm' }, { label: '5.45x39mm', value: '5.45x39mm' }, { label: 'Друго', value: 'Друго' }];
    if (currentMfr === 'Colt' || currentMfr === 'Daniel Defense' || currentMfr === 'BCM' || currentMfr === 'Aero Precision') return [{ label: '5.56x45mm NATO / .223 Rem', value: '5.56x45mm' }, { label: '.300 Blackout', value: '.300 Blackout' }, { label: 'Друго', value: 'Друго' }];
  }
  
  // If we don't have a specific rule for the manufacturer, return the full list for that weapon type
  return CALIBERS_BY_TYPE[currentType] || CALIBERS_BY_TYPE['Пистолет'];
};

export default function AddGunScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); 

  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [weight, setWeight] = useState('');
  const [capacity, setCapacity] = useState(''); // 👈 FIXED: Memory added!
  const [loading, setLoading] = useState(false);
  const [imageObject, setImageObject] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageSelectorPressed, setImageSelectorPressed] = useState(false); 

  const [type, setType] = useState('Пистолет');
  const [manufacturer, setManufacturer] = useState('Glock');
  const [caliber, setCaliber] = useState('9x19mm');
  const availableCalibers = getAvailableCalibers(type, manufacturer);

  const isPickingImage = useRef(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!isPickingImage.current) {
          setName(''); setSerial(''); setWeight(''); setCapacity(''); 
          setImageObject(null); setType('Пистолет'); setManufacturer('Glock'); setCaliber('9x19mm');
        }
      };
    }, [])
  );

  const handleImageSelection = () => {
    Alert.alert("Добавяне на снимка", "Изберете източник на снимката:", [
      { text: "Камера", onPress: launchCamera },
      { text: "Галерия", onPress: launchGallery },
      { text: "Отказ", style: "cancel" }
    ]);
  };

  const launchCamera = async () => {
    isPickingImage.current = true; 
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Грешка", "Необходим е достъп до камерата за тази функция.");
      setTimeout(() => { isPickingImage.current = false; }, 500);
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      if (!result.canceled && result.assets && result.assets.length > 0) setImageObject(result.assets[0]);
    } catch (error: any) {
      Alert.alert("Грешка при камерата", error.message || "Неуспешен старт на камерата.");
    } finally {
      setTimeout(() => { isPickingImage.current = false; }, 500);
    }
  };

  const launchGallery = async () => {
    isPickingImage.current = true; 
    try {
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      if (!result.canceled && result.assets && result.assets.length > 0) setImageObject(result.assets[0]);
    } catch (error: any) {
      Alert.alert("Грешка при галерията", error.message || "Неуспешен достъп до галерията.");
    } finally {
      setTimeout(() => { isPickingImage.current = false; }, 500);
    }
  };

  const handleSave = async () => {
    if (!name || !serial) return Alert.alert("Внимание", "Име и сериен номер са задължителни.");
    
    const weightNum = parseInt(weight);
    const capacityNum = parseInt(capacity);

    setLoading(true);
    let publicUrl = null;

    if (imageObject) {
      const { uri } = imageObject;
      const fileExt = uri.substring(uri.lastIndexOf('.') + 1);
      const fileName = `gun_${Date.now()}.${fileExt}`;
      const formData = new FormData();
      formData.append('file', { uri, name: fileName, type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` } as any);
      
      const { error: uploadError } = await supabase.storage.from('gun-images').upload(fileName, formData);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('gun-images').getPublicUrl(fileName);
        publicUrl = publicUrlData.publicUrl;
      } else {
        setLoading(false); return Alert.alert("Грешка при снимката", uploadError.message);
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('firearms').insert([{
      user_id: (await supabase.auth.getUser()).data.user?.id,
      name, serial_number: serial, type, manufacturer, caliber, 
      weight_grams: isNaN(weightNum) ? null : weightNum, 
      capacity: isNaN(capacityNum) ? null : capacityNum,
      image_url: publicUrl,
      kos_registration_date: todayStr, 
      last_cleaned_date: new Date().toISOString() 
    }]);

    if (error) { Alert.alert("Грешка", error.message); } 
    else { Alert.alert("Успешно!", "Оръжието е добавено в Арсенала."); router.replace('/(tabs)'); }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 20 }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>НОВО ОРЪЖИЕ</Text>

        <Text style={[styles.label, { color: theme.accent }]}>Основна Информация</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="Име (напр. Глок 19)" placeholderTextColor={theme.muted} value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text, fontFamily: 'Courier New' }]} placeholder="Сериен Номер (S/N)" placeholderTextColor={theme.muted} value={serial} onChangeText={setSerial} />

        <Text style={[styles.label, { color: theme.accent }]}>Спецификации</Text>
        <Dropdown 
          style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} 
          selectedTextStyle={{ color: theme.accent, fontWeight: 'bold' }} 
          placeholderStyle={{ color: theme.muted }} 
          containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} 
          itemContainerStyle={{ backgroundColor: theme.card }} 
          itemTextStyle={{ color: theme.accent }} 
          activeColor={theme.bg} 
          iconColor={theme.muted} 
          data={TYPE_DATA} 
          labelField="label" 
          valueField="value" 
          value={type} 
          placeholder="Избери тип" 
          onChange={i => { 
            setType(i.value); 
            const newMfr = MFR_MAP[i.value]?.[0]?.value || 'Друго';
            setManufacturer(newMfr);
            const newCalibers = getAvailableCalibers(i.value, newMfr);
            setCaliber(newCalibers[0].value); // Auto-selects the first caliber
          }} 
        />
        
        {/* 2. MANUFACTURER DROPDOWN */}
        <Dropdown 
          style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} 
          selectedTextStyle={{ color: theme.accent, fontWeight: 'bold' }} 
          placeholderStyle={{ color: theme.muted }} 
          containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} 
          itemContainerStyle={{ backgroundColor: theme.card }} 
          itemTextStyle={{ color: theme.accent }} 
          activeColor={theme.bg} 
          iconColor={theme.muted} 
          data={MFR_MAP[type] || MFR_MAP['Пистолет']} 
          labelField="label" 
          valueField="value" 
          value={manufacturer} 
          placeholder="Избери марка" 
          onChange={i => {
            setManufacturer(i.value);
            const newCalibers = getAvailableCalibers(type, i.value);
            setCaliber(newCalibers[0].value); // Instantly swaps to the correct ammo!
          }} 
        />
        
        {/* 3. CALIBER DROPDOWN */}
        <Dropdown 
          style={[styles.dropdown, { backgroundColor: theme.input, borderColor: theme.border }]} 
          selectedTextStyle={{ color: theme.accent, fontWeight: 'bold' }} 
          placeholderStyle={{ color: theme.muted }} 
          containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} 
          itemContainerStyle={{ backgroundColor: theme.card }} 
          itemTextStyle={{ color: theme.accent }} 
          activeColor={theme.bg} 
          iconColor={theme.muted} 
          data={availableCalibers} // 👈 FIX: Uses the dynamically filtered list!
          labelField="label" 
          valueField="value" 
          value={caliber} 
          placeholder="Избери калибър" 
          onChange={i => setCaliber(i.value)} 
        />
        
        <TextInput style={[styles.input, styles.numInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="Тегло (грама)" placeholderTextColor={theme.muted} value={weight} onChangeText={setWeight} keyboardType="numeric" />
        <TextInput style={[styles.input, styles.numInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} placeholder="Капацитет (брой патрони)" placeholderTextColor={theme.muted} value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

        <Text style={[styles.label, { color: theme.accent }]}>Визуална Идентификация</Text>
        <TouchableOpacity style={[styles.imagePickerArea, { backgroundColor: theme.input, borderColor: imageSelectorPressed ? 'transparent' : theme.border }]} onPress={handleImageSelection} activeOpacity={0.7} onPressIn={() => setImageSelectorPressed(true)} onPressOut={() => setImageSelectorPressed(false)}>
          {imageObject ? (
            <Image source={{ uri: imageObject.uri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>[ДОБАВИ СНИМКА]</Text>
              <Text style={{ color: theme.muted, fontSize: 10, marginTop: 4 }}>Камера или Галерия</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent, opacity: loading ? 0.7 : 1 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>ДОБАВИ ОРЪЖИЕ</Text>}
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { paddingHorizontal: 20 }, title: { fontSize: 26, fontWeight: '900'},
  label: { fontSize: 10, letterSpacing: 1.5, fontWeight: '800', marginTop: 15, marginBottom: 10 },
  input: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, marginBottom: 10 }, 
  numInput: { fontSize: 13 },
  saveBtn: { marginTop: 30, padding: 18, borderRadius: Radius.md, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
  imagePickerArea: { height: 180, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { alignItems: 'center' },
  dropdown: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 10 }
});