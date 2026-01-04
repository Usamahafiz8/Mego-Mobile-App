import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getKycStatus } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import { COLORS, RADIUS } from "../src/styles/theme";

export default function KycPendingScreen() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const res = await getKycStatus();
      const data = res.data;
      setKyc(data);
      if (data.status !== "Pending") {
        if (data.status === "Approved") router.replace("/KycApprovedScreen");
        else if (data.status === "Rejected")
          router.replace({ pathname: "/KycRejectedScreen", params: { reason: data.rejectionReason } });
      }
    } catch (e) {
      console.error("KYC status error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading status...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSubtitle}>Identity verification in progress</Text>
        </View>
      </View>

      <GlassCard style={styles.statusCard}>
        <View style={styles.statusBody}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="time" size={48} color={COLORS.warning} />
          </View>
          <Text style={styles.statusTitle}>Verification Pending</Text>
          <Text style={styles.statusDescription}>
            Your KYC documents are under review. We'll notify you once the verification is complete.
          </Text>
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>CNIC Number</Text>
              <Text style={styles.infoValue}>{kyc?.cnic || "N/A"}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Verification Tier</Text>
              <Text style={styles.infoValue}>{kyc?.verificationTier || "Basic"}</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <View style={styles.tipsIcon}>
            <Ionicons name="bulb" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.tipsTitle}>What's Next?</Text>
        </View>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.tipText}>Your documents have been submitted successfully</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.tipText}>Our team is reviewing your information</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.tipText}>You'll receive a notification once verified</Text>
          </View>
        </View>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    marginBottom: 20,
  },
  backButton: { marginRight: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: COLORS.text, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: COLORS.muted },
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
  statusCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusBody: {
    alignItems: "center",
    gap: 16,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  infoSection: {
    gap: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "700",
  },
  tipsCard: {
    marginTop: 8,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  tipsIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5F0FA",
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  tipsList: {
    gap: 14,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});

