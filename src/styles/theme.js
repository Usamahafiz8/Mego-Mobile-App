// 🎨 Professional Design System for MeGo App
// Industry-level colors, typography, and spacing

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Get COLORS based on dark mode - OLX Style (Blue Theme)
export const getColors = (darkMode = false) => ({
  // Primary Brand Colors - OLX Blue
  primary: "#0077B5", // OLX Blue
  primaryDark: "#005885",
  primaryLight: "#0099CC",
  primaryGlow: "rgba(0, 119, 181, 0.15)",
  primaryGradient: ["#0077B5", "#005885"],
  
  // Secondary Colors - Light Blue
  secondary: "#0099CC",
  secondaryDark: "#0077B5",
  secondaryLight: "#00B3E6",
  secondaryGlow: "rgba(0, 153, 204, 0.12)",
  
  // Accent Colors - OLX Style
  accent: "#0077B5",
  accentOrange: "#FF6600", // OLX Orange
  accentGreen: "#00A651", // OLX Green
  
  // Background Colors - OLX Style (Clean White)
  background: darkMode ? "#1a1a1a" : "#FFFFFF",
  backgroundSecondary: darkMode ? "#2a2a2a" : "#F5F5F5",
  backgroundTertiary: darkMode ? "#333333" : "#E8E8E8",
  backgroundElevated: darkMode ? "#3a3a3a" : "#FFFFFF",
  
  // Card Colors - OLX Style (Simple White Cards)
  card: darkMode ? "#2a2a2a" : "#FFFFFF",
  cardAlt: darkMode ? "#1f1f1f" : "#FAFAFA",
  cardElevated: darkMode ? "#333333" : "#FFFFFF",
  cardGlass: darkMode ? "rgba(42, 42, 42, 0.95)" : "rgba(255, 255, 255, 0.98)",
  
  // Border & Divider - OLX Style (Light Gray)
  border: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
  borderStrong: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
  borderSubtle: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
  divider: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
  
  // Text Colors - Dynamic based on theme
  text: darkMode ? "#f5f9ff" : "#1e293b",
  textSecondary: darkMode ? "#cbd5e1" : "#334155",
  textMuted: darkMode ? "#94a3b8" : "#64748b",
  textDisabled: darkMode ? "#64748b" : "#94a3b8",
  textInverse: darkMode ? "#1e293b" : "#ffffff",
  
  // Status Colors - Professional (same for both themes)
  success: "#10b981",
  successDark: "#059669",
  successLight: "#34d399",
  warning: "#f59e0b",
  warningDark: "#d97706",
  warningLight: "#fbbf24",
  danger: "#ef4444",
  dangerDark: "#dc2626",
  dangerLight: "#f87171",
  info: "#0077B5",
  infoDark: "#005885",
  
  // Overlay
  overlay: "rgba(0, 0, 0, 0.75)",
  overlayLight: "rgba(0, 0, 0, 0.4)",
  overlayMedium: "rgba(0, 0, 0, 0.6)",
});

// Default COLORS for backward compatibility (light mode)
export const COLORS = getColors(false);

// Hook to get dynamic colors based on theme
export const useColors = () => {
  const themeContext = useContext(ThemeContext);
  const darkMode = themeContext?.darkMode ?? false;
  return getColors(darkMode);
};

// Get GRADIENTS based on dark mode
export const getGradients = (darkMode = false) => ({
  // Screen Backgrounds - OLX Style (Clean White)
  screen: darkMode 
    ? ["#1a1a1a", "#222222", "#2a2a2a"]
    : ["#FFFFFF", "#FAFAFA", "#F5F5F5"],
  screenAlt: darkMode
    ? ["#222222", "#2a2a2a", "#333333"]
    : ["#FFFFFF", "#FAFAFA", "#F5F5F5"],
  screenWarm: darkMode
    ? ["#1a1a1a", "#1f1f1f", "#222222"]
    : ["#FFFFFF", "#FAFAFA", "#F5F5F5"],
  
  // Card Gradients - OLX Style (Pure White)
  card: darkMode
    ? ["#2a2a2a", "#2a2a2a", "#1f1f1f"]
    : ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
  cardElevated: darkMode
    ? ["#333333", "#333333", "#2a2a2a"]
    : ["#FFFFFF", "#FFFFFF", "#FAFAFA"],
  cardGlass: darkMode
    ? ["rgba(42,42,42,0.98)", "rgba(42,42,42,0.95)", "rgba(31,31,31,0.9)"]
    : ["rgba(255,255,255,0.98)", "rgba(255,255,255,0.95)", "rgba(250,250,250,0.9)"],
  cardGlow: darkMode
    ? ["rgba(0,119,181,0.12)", "rgba(42,42,42,0.98)", "rgba(31,31,31,0.95)"]
    : ["rgba(0,119,181,0.06)", "rgba(255,255,255,0.98)", "rgba(250,250,250,0.95)"],
  
  // Button Gradients - OLX Blue
  button: ["#0077B5", "#005885"],
  buttonHover: ["#0099CC", "#0077B5"],
  buttonPressed: ["#005885", "#004466"],
  buttonSuccess: ["#00A651", "#008040"],
  buttonDanger: ["#ef4444", "#dc2626"],
  danger: ["#ef4444", "#dc2626"],
  buttonWarning: ["#FF6600", "#E55A00"],
  primary: ["#0077B5", "#005885"],
  success: ["#00A651", "#008040"],
  warning: ["#FF6600", "#E55A00"],
  info: ["#0077B5", "#005885"],
  neutral: ["#64748b", "#475569"],
  
  // Accent Gradients - OLX Colors
  accent: ["#0077B5", "#005885"],
  accentPurple: ["#0077B5", "#005885"],
  accentBlue: ["#0077B5", "#005885"],
  accentOrange: ["#FF6600", "#E55A00"], // OLX Orange
  accentGreen: ["#00A651", "#008040"], // OLX Green
  
  // Special Effects - OLX Blue Glows
  glow: ["rgba(0,119,181,0.15)", "rgba(0,153,204,0.12)", "rgba(0,119,181,0.1)"],
  glowStrong: ["rgba(0,119,181,0.25)", "rgba(0,153,204,0.2)"],
  shimmer: ["rgba(0,119,181,0.08)", "rgba(0,119,181,0.04)", "rgba(0,119,181,0.08)"],
  pulse: ["rgba(0,119,181,0.12)", "rgba(0,119,181,0.06)", "rgba(0,119,181,0.12)"],
});

// Default GRADIENTS for backward compatibility (light mode)
export const GRADIENTS = getGradients(false);

// Hook to get dynamic gradients based on theme
export const useGradients = () => {
  const themeContext = useContext(ThemeContext);
  const darkMode = themeContext?.darkMode ?? false;
  return getGradients(darkMode);
};

export const SHADOWS = {
  // Elevation Levels - OLX Style (Minimal Shadows)
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  xl: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    shadowColor: COLORS.border,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  glow: {
    shadowColor: "#0077B5",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  glowStrong: {
    shadowColor: "#0077B5",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  inner: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: -2,
  },
};

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
};

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

// Typography System - Industry Standard
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
  
  // Font Sizes - Professional & Readable
  fontSize: {
    xs: 11,        // Captions, labels
    sm: 13,        // Small text, secondary info
    base: 14,      // Body text (standard)
    md: 15,        // Slightly emphasized body
    lg: 16,        // Subheadings
    xl: 18,        // Section headings
    "2xl": 20,     // Page titles
    "3xl": 22,     // Large headings (max)
    "4xl": 24,     // Hero text (rare)
    "5xl": 28,     // Splash screens only
  },
  
  // Font Weights - Professional Scale
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  
  // Line Heights - Optimal Readability
  lineHeight: {
    tight: 1.3,      // Headings
    normal: 1.5,     // Body text
    relaxed: 1.7,    // Long paragraphs
  },
  
  // Letter Spacing - Refined
  letterSpacing: {
    tighter: -0.3,
    tight: -0.15,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
  
  // Text Styles - Predefined Combinations
  styles: {
    // Headings
    h1: {
      fontSize: 22,
      fontWeight: "700",
      lineHeight: 1.3,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 20,
      fontWeight: "700",
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 1.4,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 1.4,
      letterSpacing: -0.15,
    },
    // Body Text
    body: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodyLarge: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    // Small Text
    caption: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    small: {
      fontSize: 11,
      fontWeight: "400",
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    // Labels & Buttons
    label: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 1.4,
      letterSpacing: 0.1,
    },
    button: {
      fontSize: 15,
      fontWeight: "600",
      lineHeight: 1.4,
      letterSpacing: 0.1,
    },
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
};

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

