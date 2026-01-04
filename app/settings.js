import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser, updateSettings } from "../src/api/api";
import { useTheme } from "../src/context/ThemeContext";
import { useLanguage } from "../src/context/LanguageContext";
import ScreenContainer from "../src/components/ScreenContainer";
import { useColors, RADIUS, SHADOWS, COLORS as THEME_COLORS } from "../src/styles/theme";

export default function Settings() {
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const COLORS = useColors();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getCurrentUser();
      if (res?.data) {
        setNotifications(res.data.notificationsEnabled ?? true);
        if (typeof res.data.darkMode === "boolean" && res.data.darkMode !== darkMode) {
          toggleTheme(res.data.darkMode);
        }
      }
    } catch (err) {
      console.error("❌ Fetch settings error:", err);
    }
  };

  const handleUpdateSettings = async (key, value) => {
    try {
      const payload = {
        darkMode: key === "darkMode" ? value : darkMode,
        notificationsEnabled: key === "notifications" ? value : notifications,
      };

      await updateSettings(payload);

      if (key === "darkMode") toggleTheme(value);
      else setNotifications(value);

      Alert.alert("✅ Success", "Settings updated successfully!");
    } catch (err) {
      console.error("Update settings error:", err);
      // Update UI even if backend fails for better UX
      if (key === "darkMode") toggleTheme(value);
      else setNotifications(value);
      Alert.alert("✅ Saved", "Settings saved locally!");
    }
  };

  const accountOptions = useMemo(
    () => [
      { 
        id: 1, 
        title: "Account", 
        icon: "person-outline", 
        route: "/editProfile",
        subtitle: "Name, Email, Phone Number, Address, City, Change Password"
      },
      { 
        id: 2, 
        title: "Notifications", 
        icon: "notifications-outline", 
        route: "/notifications",
        subtitle: "Push Notifications, Email Notifications"
      },
      { 
        id: 3, 
        title: "Privacy", 
        icon: "shield-checkmark-outline", 
        route: "/privacy",
        subtitle: "Show my phone number, Show my email, Show my address"
      },
      { 
        id: 4, 
        title: "Language", 
        icon: "language-outline", 
        route: "/language",
        subtitle: "English, Urdu"
      },
      { 
        id: 5, 
        title: "About Us", 
        icon: "information-circle-outline", 
        route: "/about",
        subtitle: "Learn more about MEGO"
      },
      { 
        id: 6, 
        title: "Terms & Conditions", 
        icon: "document-text-outline", 
        route: "/terms",
        subtitle: "Read our terms and conditions"
      },
      { 
        id: 7, 
        title: "Privacy Policy", 
        icon: "lock-closed-outline", 
        route: "/privacyPolicy",
        subtitle: "Read our privacy policy"
      },
      { 
        id: 8, 
        title: "Delete account", 
        icon: "trash-outline", 
        route: "/deleteAccount",
        subtitle: "Take action on account",
        danger: true
      },
    ],
    [t]
  );

  const styles = createStyles(COLORS);
  
  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t("settings_title")}</Text>
        <Text style={styles.pageSubtitle}>{t("settings_subtitle")}</Text>
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderGradient}>
            <Ionicons name="options" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("settings_preferences")}</Text>
          </View>
        </View>

        <View style={styles.optionRow}>
          <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + "15" }]}>
            <Ionicons name="moon" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionText}>{t("settings_dark_mode")}</Text>
            <Text style={styles.optionSubtext}>{t("settings_dark_mode_desc")}</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(val) => handleUpdateSettings("darkMode", val)}
            thumbColor={darkMode ? COLORS.primary : "#fff"}
            trackColor={{ true: COLORS.primary + "80", false: COLORS.border }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.optionRow}>
          <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + "15" }]}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionText}>{t("settings_notifications")}</Text>
            <Text style={styles.optionSubtext}>{t("settings_notifications_desc")}</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(val) => handleUpdateSettings("notifications", val)}
            thumbColor={notifications ? COLORS.primary : "#fff"}
            trackColor={{ true: COLORS.primary + "80", false: COLORS.border }}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.card}>
        {accountOptions.map((opt, idx) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.optionRow,
              idx !== accountOptions.length - 1 && styles.optionRowWithDivider,
            ]}
            onPress={() => router.push(opt.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + "15" }]}>
              <Ionicons 
                name={opt.icon} 
                size={20} 
                color={opt.danger ? COLORS.danger : COLORS.primary} 
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionText, opt.danger && styles.optionTextDanger]}>
                {opt.title}
              </Text>
              {opt.subtitle && (
                <Text style={styles.optionSubtext}>{opt.subtitle}</Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textMuted}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

// Styles need to be created inside component or use function
const createStyles = (COLORS) => StyleSheet.create({
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.card,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  optionRowWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "400",
    lineHeight: 16,
    marginTop: 2,
  },
  optionTextDanger: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
});
