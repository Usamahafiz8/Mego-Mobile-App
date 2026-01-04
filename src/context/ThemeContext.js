
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme !== null) {
        setDarkMode(savedTheme === "dark");
      }
    } catch (err) {
      console.error("Failed to load theme:", err);
    }
  };

  const toggleTheme = async (value) => {
    const newMode = value ?? !darkMode;
    setDarkMode(newMode);
    try {
      await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  // Always provide colors object with default values
  const colors = {
    background: darkMode ? "#0f172a" : "#fff",
    text: darkMode ? "#f5f9ff" : "#1e293b",
    subText: darkMode ? "#94a3b8" : "#64748b",
    card: darkMode ? "#1e293b" : "#f8fafc",
    cardAlt: darkMode ? "#0b1220" : "#ffffff",
    border: darkMode ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0",
    primary: "#38bdf8",
    secondary: "#8b5cf6",
    muted: darkMode ? "#94a3b8" : "#64748b",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
  };

  const value = {
    darkMode,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if context is not available (shouldn't happen, but safety check)
    console.warn("useTheme called outside ThemeProvider, using defaults");
    return {
      darkMode: true,
      toggleTheme: () => {},
      colors: {
        background: "#0f172a",
        text: "#f5f9ff",
        subText: "#94a3b8",
        card: "#1e293b",
        cardAlt: "#0b1220",
        border: "rgba(56, 189, 248, 0.15)",
        primary: "#38bdf8",
        secondary: "#8b5cf6",
        muted: "#94a3b8",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    };
  }
  return context;
};

export { ThemeContext };

