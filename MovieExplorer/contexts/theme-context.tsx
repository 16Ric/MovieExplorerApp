import React, { createContext, ReactNode, useEffect, useState, useCallback, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserDoc, updateUserSettings } from "../services/userService";
import { AuthContext } from "./auth-context";

export const lightTheme = { background: "#ffffff", text: "#000000", card: "#f0f0f0", accent: "gold" };
export const darkTheme = { background: "#121212", text: "#ffffff", card: "#1e1e1e", accent: "gold" };

type ThemeContextType = {
  darkMode: boolean;
  theme: typeof lightTheme;
  toggleTheme: (value: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: true, // default dark mode for unknown users (login/signup)
  theme: darkTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true); // default dark mode
  const { user, isLoading } = useContext(AuthContext);

  // Load preference from Firebase once user is available
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        if (user) {
          // If user exists, use their preference
          setDarkMode(user.darkMode ?? true);
          await AsyncStorage.setItem("darkMode", JSON.stringify(user.darkMode ?? true));
        } else {
          // Fallback to stored local preference if available
          const stored = await AsyncStorage.getItem("darkMode");
          if (stored !== null) setDarkMode(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load dark mode:", err);
      }
    };
    if (!isLoading) loadDarkMode();
  }, [user, isLoading]);

  const toggleTheme = useCallback(async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem("darkMode", JSON.stringify(value));
    try {
      if (user) {
        await updateUserSettings({ darkMode: value });
      }
    } catch (err) {
      console.error("Failed to save dark mode to Firebase:", err);
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ darkMode, theme: darkMode ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
