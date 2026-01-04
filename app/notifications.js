import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser, updateSettings } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function Notifications() {
  const [activateNotifications, setActivateNotifications] = useState(true);
  const [recommendations, setRecommendations] = useState(true);
  const [specialCommunications, setSpecialCommunications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getCurrentUser();
      if (res?.data) {
        setActivateNotifications(res.data.notificationsEnabled ?? true);
        setRecommendations(res.data.recommendationsEnabled ?? true);
        setSpecialCommunications(res.data.specialCommunicationsEnabled ?? true);
      }
    } catch (err) {
      console.error("Load settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, value) => {
    try {
      const payload = {
        notificationsEnabled: key === "activate" ? value : activateNotifications,
        recommendationsEnabled: key === "recommendations" ? value : recommendations,
        specialCommunicationsEnabled: key === "special" ? value : specialCommunications,
      };

      await updateSettings(payload);

      if (key === "activate") setActivateNotifications(value);
      else if (key === "recommendations") setRecommendations(value);
      else setSpecialCommunications(value);
    } catch (err) {
      console.error("Update settings error:", err);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Activate Notifications */}
        <View style={styles.optionCard}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Activate Notifications</Text>
            <Text style={styles.optionSubtitle}>Activate Notification</Text>
          </View>
          <Switch
            value={activateNotifications}
            onValueChange={(val) => handleToggle("activate", val)}
            thumbColor={activateNotifications ? COLORS.primary : "#fff"}
            trackColor={{ true: COLORS.primary + "80", false: COLORS.border }}
          />
        </View>

        {/* Recommendations */}
        <View style={styles.optionCard}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Recommendations</Text>
            <Text style={styles.optionSubtitle}>Activate Notification</Text>
          </View>
          <Switch
            value={recommendations}
            onValueChange={(val) => handleToggle("recommendations", val)}
            thumbColor={recommendations ? COLORS.primary : "#fff"}
            trackColor={{ true: COLORS.primary + "80", false: COLORS.border }}
          />
        </View>

        {/* Special Communications */}
        <View style={styles.optionCard}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Special communications & offers</Text>
            <Text style={styles.optionSubtitle}>
              Receive update offers surveys and more
            </Text>
          </View>
          <Switch
            value={specialCommunications}
            onValueChange={(val) => handleToggle("special", val)}
            thumbColor={specialCommunications ? COLORS.primary : "#fff"}
            trackColor={{ true: COLORS.primary + "80", false: COLORS.border }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
