import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [canStart, setCanStart] = useState(false);

  const handleStart = async () => {
    if (!canStart) return;
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    if (onFinish) onFinish(); else router.back();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isBottom && !canStart) setCanStart(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={60} color={theme.accent} />
          <Text style={[styles.title, { color: theme.text }]}>АРСЕНАЛ БГ</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Пълно ръководство за управление на лични оръжия.</Text>
        </View>

        <View style={styles.stepContainer}>
          
          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="add-circle" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>1. Създаване на профил</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>В таб "Добави" въвеждате цялата техническа информация за вашето оръжие:</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Спецификации:</Text> Изберете тип, марка и калибър от умните падащи менюта.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Документация:</Text> Въведете датата на регистрация. Системата автоматично изчислява 5-годишния срок на КОС.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Снимки:</Text> Добавете реална снимка от камерата или галерията за по-лесно разпознаване.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="list" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>2. Вашият цифров арсенал</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Главният екран е вашето командно табло:</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Умно сортиране:</Text> Оръжията с изтичащ КОС или нужда от почистване автоматично излизат най-отгоре.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Цветови кодове:</Text> Зелено (Валидно), Оранжево (Под 30 дни), Червено (Изтекло).</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Търсачка и Филтри:</Text> Намерете нужното оръжие по сериен номер, калибър или тип за секунди.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="document-text" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>3. Управление на КОС</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Никога повече глоби за пропуснати срокове!</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Известия:</Text> Получавате напомняне точно 30 дни преди изтичане на разрешителното.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Чеклист с документи:</Text> В профила на оръжието има пълен списък с нужните документи за подновяване.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Подновяване:</Text> Бутонът се отключва автоматично само когато съберете всички документи и влезете в 30-дневния срок.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="flame" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>4. Тренировки и Поддръжка</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Грижата за оръжието е ключова:</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Брояч на тренировки:</Text> Всяко натискане на "Тренировка" се записва в историята на оръжието.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Умни напомняния:</Text> След стрелба, системата ще ви подсеща да почистите оръжието си на всеки час.</Text>
              <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Индикатор:</Text> Оръжието ще свети с маркер "За почистване", докато не отбележите, че е поддържано.</Text>
            </View>
          </View>
          
          <Text style={[styles.scrollHint, { color: theme.accent }]}>↓ Плъзнете до края за да продължите ↓</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: canStart ? theme.accent : theme.border, opacity: canStart ? 1 : 0.5 }]} onPress={handleStart} disabled={!canStart}>
          <Text style={[styles.btnText, { color: canStart ? 'white' : theme.muted }]}>{canStart ? 'РАЗБРАХ, ВХОД В АРСЕНАЛА' : 'ПРОЧЕТЕТЕ ИНСТРУКЦИИТЕ'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scroll: { padding: 20, paddingBottom: 60 }, header: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', marginTop: 15 }, subtitle: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  stepContainer: { gap: 20 }, step: { flexDirection: 'column', padding: 20, borderRadius: 16, borderWidth: 1 },
  iconBox: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  stepText: { flex: 1 }, stepTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 }, 
  stepDesc: { fontSize: 13, lineHeight: 22, marginBottom: 10 },
  bullet: { fontSize: 13, lineHeight: 20, marginBottom: 6, paddingLeft: 5 },
  scrollHint: { textAlign: 'center', fontWeight: '800', fontSize: 12, marginTop: 20, marginBottom: 40 },
  footer: { padding: 20, borderTopWidth: 1 }, btn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' }, btnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 }
});