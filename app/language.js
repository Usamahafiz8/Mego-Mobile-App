import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser, updateLanguage } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { useLanguage } from "../src/context/LanguageContext";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function LanguageScreen() {
  const { language, setLanguage: setAppLanguage, t } = useLanguage();
  const [selected, setSelected] = useState(language || "en");
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  useEffect(() => {
    setSelected(language);
  }, [language]);

  const loadLanguagePreference = async () => {
    try {
      const res = await getCurrentUser();
      const apiLanguage = res?.data?.language;
      if (apiLanguage) {
        setSelected(apiLanguage);
        setAppLanguage(apiLanguage);
      } else {
        const cached = await AsyncStorage.getItem("appLanguage");
        if (cached) {
          setSelected(cached);
          setAppLanguage(cached);
        }
      }
    } catch (err) {
      console.error("Language fetch error:", err?.response?.data || err.message);
      const cached = await AsyncStorage.getItem("appLanguage");
      if (cached) {
        setSelected(cached);
        setAppLanguage(cached);
      }
    } finally {
      setInitializing(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await updateLanguage({ language: selected });
      await AsyncStorage.setItem("appLanguage", selected);
      setAppLanguage(selected);
      Alert.alert("✅ " + t("common_success"), t("language_updated"));
    } catch (err) {
      console.error("Language update error:", err);
      await AsyncStorage.setItem("appLanguage", selected);
      setAppLanguage(selected);
      Alert.alert("✅ " + t("common_success"), t("language_saved_local"));
    } finally {
      setSaving(false);
    }
  };

  const languages = [
    { code: "en", label: t("language_option_english"), icon: "language", flag: "🇬🇧" },
    { code: "ur", label: t("language_option_urdu"), icon: "language", flag: "🇵🇰" },
  ];

  if (initializing) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>{t("language_loading")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      <SectionHeading title={t("settings_language")} subtitle={t("settings_language_subtitle")} />

      <GlassCard style={{ paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" }}>
        {languages.map((lang, idx) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setSelected(lang.code)}
              style={[
                styles.option,
                idx !== languages.length - 1 && styles.optionDivider,
              ]}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={GRADIENTS.button}
                  style={styles.optionIcon}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.optionIconInactive}>
                  <Text style={styles.flag}>{lang.flag}</Text>
                </View>
              )}
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {lang.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </GlassCard>

      <PrimaryButton title={t("language_save")} onPress={handleSave} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  optionIconInactive: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  flag: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  optionTextSelected: {
    fontWeight: "700",
    color: COLORS.primary,
  },
});
