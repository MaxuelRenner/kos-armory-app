import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'industrial' | 'girlypop' | 'light';

export const THEMES = {
  industrial: { 
    bg: '#121212', card: '#1C1C1E', text: '#E0E0E0', muted: '#6B7280', 
    accent: '#B71C1C', border: '#2A2A2A', input: '#151515' 
  },
  girlypop: { 
    bg: '#FFE4E1', card: '#FFF0F5', text: '#D81B60', muted: '#F06292', 
    accent: '#FF1493', border: '#FFB6C1', input: '#FFFFFF' 
  },
  light: { 
    bg: '#F8F9FA', card: '#FFFFFF', text: '#111827', muted: '#6B7280', 
    accent: '#111827', border: '#E5E7EB', input: '#F3F4F6' // Changed accent to Black/Dark Gray
  }
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeType>('industrial');

  useEffect(() => {
    AsyncStorage.getItem('appTheme').then((saved) => {
      if (saved) setThemeName(saved as ThemeType);
    });
  }, []);

  const changeTheme = async (newTheme: ThemeType) => {
    setThemeName(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: THEMES[themeName], changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);