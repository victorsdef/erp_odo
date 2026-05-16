import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';

const ThemeContext = createContext(null);

const STORAGE_KEY = '@odo_theme';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState(null); // null = follow system

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const isDark = mode === null
    ? systemScheme === 'dark'
    : mode === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  const toggleTheme = async () => {
    const next = isDark ? 'light' : 'dark';
    setMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
