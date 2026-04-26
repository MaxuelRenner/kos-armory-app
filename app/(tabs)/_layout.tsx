import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // THIS KILLS THE UGLY "index" HEADER
        tabBarStyle: { 
          backgroundColor: theme.card, 
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Арсенал', tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="add-gun" 
        options={{ title: 'Добави', tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ title: 'Настройки', tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}