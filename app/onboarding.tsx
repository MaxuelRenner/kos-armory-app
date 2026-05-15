import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      icon: "shield-checkmark",
      title: "АРСЕНАЛ БГ",
      subtitle: "Добре дошли в първото приложение за следене на вашия личен арсенал и спазване на законовите срокове към служба КОС.",
      content: (
        <View style={styles.introContent}>
          <Text style={[styles.stepDesc, { color: theme.muted, textAlign: 'center' }]}>
            Това е единственото ръководство от което ще се нуждаете за управление на лични оръжия и спазване на срокове.
          </Text>
        </View>
      )
    },
    {
      icon: "add-circle",
      title: "1. Добавяне на оръжие",
      content: (
        <View>
          <Text style={[styles.stepDesc, { color: theme.muted, textAlign: 'center'  }]}>В таб "Добави" въвеждате цялата техническа информация:</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Спецификации:</Text> Въведете име и сериен номер, изберете модел, тип и калибър чрез менюта. Въведете незареденото тегло на оръжието ви и зареденият му капацитет.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Документация:</Text> Системата автоматично изчислява 5-годишния срок на разрешителното ви.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Снимки:</Text> Можете да добавите и снимка за по-бързо и лесно разпознаване.</Text>
        </View>
      )
    },
    {
      icon: "shield-checkmark",
      title: "2. Вашият арсенал",
      content: (
        <View>
          <Text style={[styles.stepDesc, { color: theme.muted, textAlign: 'center'  }]}>Главният екран е вашето командно табло:</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Умно сортиране:</Text> Оръжията с изтичащо разрешително или имащи нужда от почистване, автоматично излизат най-отгоре.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Цветови кодове:</Text> Зелено (Валидно), Оранжево (Подновете разрешителното в 30 дневен срок), Червено (Изтекло разрешително).</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Филтри:</Text> Намерете оръжие по име, S/N, калибър или тип за секунди.</Text>
        </View>
      )
    },
    {
      icon: "document-text",
      title: "3. Управление на разрешителни",
      content: (
        <View>
          <Text style={[styles.stepDesc, { color: theme.muted, textAlign: 'center'  }]}>Без повече глоби за пропуснати срокове!</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Известия:</Text> Напомняне 30 дни преди изтичане на разрешителното за дадено оръжие.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Чеклист:</Text> Пълен списък с нужните документи за подновяване давноста на разрешителното ви.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Подновяване:</Text> Бутонът се отключва само при пълна готовност и не по-рано от 30 дни преди изтичането.</Text>
        </View>
      )
    },
    {
      icon: "flame",
      title: "4. Поддръжка",
      content: (
        <View>
          <Text style={[styles.stepDesc, { color: theme.muted, textAlign: 'center'  }]}>Грижата за оръжието е ключова:</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Тренировки:</Text> Всяко ползване се записва в историята на оръжието ви, чрез бутонът "Тренировка".</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Напомняния:</Text> Системата ви подсеща да почиствате оръжията си след стрелба.</Text>
          <Text style={[styles.bullet, { color: theme.muted }]}><Text style={{ color: theme.text, fontWeight: 'bold' }}>• Индикатор:</Text> Оръжието ви ще свети с визуален маркер "За почистване", докато не го отметнете като обслужено.</Text>
        </View>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      if (onFinish) {
        onFinish();
      } else {
        router.replace('/(tabs)');
      }
    }
  };
  const activeStep = STEPS[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 0 }]}>
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <Ionicons name={activeStep.icon as any} size={50} color={theme.accent} />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>{activeStep.title}</Text>
          {activeStep.subtitle && (
            <Text style={[styles.subtitle, { color: theme.muted }]}>{activeStep.subtitle}</Text>
          )}
          
          <View style={styles.bodyContent}>
            {activeStep.content}
          </View>
        </View>
        <View style={styles.footer}>
          {currentStep > 0 ? (
            <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)}>
              <Text style={{ color: theme.muted, fontWeight: '600' }}>НАЗАД</Text>
            </TouchableOpacity>
          ) : <View />}

          <TouchableOpacity 
            style={[styles.nextBtn, { backgroundColor: theme.accent }]} 
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === STEPS.length - 1 ? 'ЗАПОЧНИ' : 'НАПРЕД'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.dotContainer}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === currentStep ? theme.accent : theme.border }]} />
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 25,
    marginBottom: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bodyContent: {
    width: '100%',
    marginTop: 30,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    paddingLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
  },
  nextBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
  },
  introContent: {
    marginTop: 20,
  }
});