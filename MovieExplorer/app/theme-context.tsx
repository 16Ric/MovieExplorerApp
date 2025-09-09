import React, { createContext, ReactNode, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserDoc, updateUserSettings } from "../services/userService";

export const lightTheme = { background: "#ffffff", text: "#000000", card: "#f0f0f0", accent: "gold" };
export const darkTheme = { background: "#121212", text: "#ffffff", card: "#1e1e1e", accent: "gold" };

type ThemeContextType = {
  darkMode: boolean;
  theme: typeof lightTheme;
  toggleTheme: (value: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const user = await getUserDoc();
        if (user?.darkMode !== undefined) {
          setDarkMode(user.darkMode);
          await AsyncStorage.setItem("darkMode", JSON.stringify(user.darkMode));
        } else {
          const stored = await AsyncStorage.getItem("darkMode");
          if (stored !== null) setDarkMode(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load dark mode:", err);
        const stored = await AsyncStorage.getItem("darkMode");
        if (stored !== null) setDarkMode(JSON.parse(stored));
      }
    };
    loadDarkMode();
  }, []);

  const toggleTheme = useCallback(async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem("darkMode", JSON.stringify(value));
    try {
      await updateUserSettings({ darkMode: value });
    } catch (err) {
      console.error("Failed to save dark mode to Firebase:", err);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, theme: darkMode ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
