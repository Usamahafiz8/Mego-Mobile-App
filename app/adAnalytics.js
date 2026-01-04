import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAdAnalytics, getAdHistory } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function AdAnalytics() {
  const { adId } = useLocalSearchParams();
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [adId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, historyRes] = await Promise.all([
        getAdAnalytics(parseInt(adId)),
        getAdHistory(parseInt(adId)),
      ]);
      setAnalytics(analyticsRes.data);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Load analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ icon, label, value }) => (
    <GlassCard style={styles.metricCard}>
      <View style={styles.metricBody}>
        <View style={styles.metricHeader}>
          <View style={styles.metricIconContainer}>
            <Ionicons name={icon} size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
        <Text style={styles.metricValue}>{value?.toLocaleString() || 0}</Text>
      </View>
    </GlassCard>
  );

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      <SectionHeading
        title="Ad Analytics"
        subtitle="Track your ad performance"
      />

      <View style={styles.metricsGrid}>
        <MetricCard icon="eye" label="Views" value={analytics?.views} />
        <MetricCard icon="hand-right" label="Clicks" value={analytics?.clicks} />
        <MetricCard icon="bookmark" label="Saves" value={analytics?.saves} />
        <MetricCard icon="share-social" label="Shares" value={analytics?.shares} />
      </View>

      {history.length > 0 && (
        <GlassCard style={{ paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderInner}>
              <Ionicons name="time" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Ad History</Text>
            </View>
          </View>
          {history.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.historyItem,
                idx !== history.length - 1 && styles.historyDivider,
              ]}
            >
              <View style={styles.historyHeader}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={
                      item.action === "created"
                        ? "add-circle"
                        : item.action === "updated"
                        ? "create"
                        : "checkmark-circle"
                    }
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyAction}>
                    {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </GlassCard>
      )}

      {history.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No history available</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 0,
    overflow: "hidden",
  },
  metricBody: {
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  historyItem: {
    padding: 16,
  },
  historyDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
    fontWeight: "500",
  },
});

