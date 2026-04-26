import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    if (onFinish) {
      onFinish(); // Startup flow
    } else {
      router.back(); // Opened from Settings
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={60} color="#B71C1C" />
          <Text style={styles.title}>Арсенал БГ</Text>
          <Text style={styles.subtitle}>Как работи вашият дигитален асистент?</Text>
        </View>

        <View style={styles.stepContainer}>
          {/* STEP 1 */}
          <View style={styles.step}>
            <View style={styles.iconBox}>
              <Ionicons name="add-circle" size={28} color="#B71C1C" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>1. Добавете оръжие</Text>
              <Text style={styles.stepDesc}>Въведете модел, сериен номер и дата на регистрация. Приложението автоматично изчислява кога изтича КОС.</Text>
            </View>
          </View>

          {/* STEP 2 */}
          <View style={styles.step}>
            <View style={styles.iconBox}>
              <Ionicons name="notifications" size={28} color="#B71C1C" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>2. Напомняния за КОС</Text>
              <Text style={styles.stepDesc}>Ще получите известие точно 30 дни преди изтичане на разрешителното, заедно с пълен списък с нужните документи за подновяване.</Text>
            </View>
          </View>

          {/* STEP 3 */}
          <View style={styles.step}>
            <View style={styles.iconBox}>
              <Ionicons name="flame" size={28} color="#B71C1C" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>3. Тренировки и Поддръжка</Text>
              <Text style={styles.stepDesc}>След като стреляте на стрелбището, натиснете "Тренировка". Ще получавате известия да почистите оръжието си.</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* FIXED BOTTOM BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <Text style={styles.btnText}>РАЗБРАХ, ЗАПОЧНИ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: '#E0E0E0', marginTop: 15 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  stepContainer: { gap: 20 },
  step: { 
    flexDirection: 'row', alignItems: 'center', gap: 16, 
    backgroundColor: '#1C1C1E', padding: 20, 
    borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A' 
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 25, 
    backgroundColor: '#151515', borderWidth: 1, borderColor: '#2A2A2A',
    justifyContent: 'center', alignItems: 'center'
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#E0E0E0', marginBottom: 6 },
  stepDesc: { fontSize: 13, color: '#8A9BB0', lineHeight: 20 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#2A2A2A', backgroundColor: '#121212' },
  btn: { backgroundColor: '#B71C1C', paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '900', letterSpacing: 1.5, fontSize: 15 }
});