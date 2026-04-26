import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: "Добре дошли в Арсенал БГ",
    description: "Вашият дигитален асистент за управление на лични оръжия и документация.",
    icon: "shield-checkmark"
  },
  {
    title: "Край на глобите за КОС",
    description: "Автоматични известия 30 дни преди изтичане на разрешителното ви, плюс списък с нужните документи.",
    icon: "notifications"
  },
  {
    title: "Поддръжка на оръжието",
    description: "Отбелязвайте тренировки и получавайте напомняния за почистване, за да запазите оръжието си в перфектно състояние.",
    icon: "build"
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      router.replace('/');
    }
  };

  const slide = SLIDES[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={slide.icon as any} size={100} color="#B71C1C" style={{ marginBottom: 40 }} />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>{step === SLIDES.length - 1 ? 'ЗАПОЧНИ' : 'НАПРЕД'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#E0E0E0', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  footer: { padding: 40, alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2A2A2A', marginHorizontal: 5 },
  dotActive: { backgroundColor: '#B71C1C', width: 20 },
  btn: { backgroundColor: '#B71C1C', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  btnText: { color: 'white', fontWeight: '900', letterSpacing: 1.5 }
});