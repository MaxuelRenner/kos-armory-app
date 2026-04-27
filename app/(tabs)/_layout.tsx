import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 25 : insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Арсенал', tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="add-gun"
        options={{ title: 'Добави', tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Настройки', tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> }}
      />
    </Tabs>
  );
}