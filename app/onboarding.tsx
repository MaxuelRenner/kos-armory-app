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
    // Unlocks when user is within 50 pixels of the bottom
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isBottom && !canStart) setCanStart(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16} // smooth scrolling detection
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
              <Text style={[styles.stepTitle, { color: theme.text }]}>1. Таб "Добави"</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Тук въвеждате ново оръжие. Попълнете марка, модел, калибър и точната дата на регистрация. Можете да добавите снимка от камерата или галерията. Системата автоматично изчислява кога изтича 5-годишният ви КОС.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="notifications" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>2. Таб "Арсенал"</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Главният екран показва вашите оръжия, сортирани по спешност. Изтичащите разрешителни светят в червено и оранжево. Можете да филтрирате оръжията си по тип и калибър чрез менютата.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="document-text" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>3. Документи и КОС</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>Точно 30 дни преди да изтече срокът, ще получите известие. В профила на оръжието има списък с нужните документи. Бутонът за подновяване се отключва едва когато съберете всички документи и сте в 30-дневния срок.</Text>
            </View>
          </View>

          <View style={[styles.step, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}><Ionicons name="flame" size={28} color={theme.accent} /></View>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>4. Поддръжка</Text>
              <Text style={[styles.stepDesc, { color: theme.muted }]}>След стрелба натиснете "Тренировка". Ще получавате известия за почистване в продължение на 5 часа, за да не забравите да поддържате оръжието си.</Text>
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
  container: { flex: 1 }, scroll: { padding: 24, paddingBottom: 60 }, header: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', marginTop: 15 }, subtitle: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  stepContainer: { gap: 20 }, step: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 20, borderRadius: 16, borderWidth: 1 },
  iconBox: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  stepText: { flex: 1 }, stepTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 }, stepDesc: { fontSize: 13, lineHeight: 22 },
  scrollHint: { textAlign: 'center', fontWeight: '800', fontSize: 12, marginTop: 20, marginBottom: 40 },
  footer: { padding: 20, borderTopWidth: 1 }, btn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' }, btnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 }
});