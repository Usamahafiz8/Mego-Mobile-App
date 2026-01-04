import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS } from "../src/styles/theme";

export default function KycRejectedScreen() {
  const { reason } = useLocalSearchParams();

  return (
    <ScreenContainer
      contentContainerStyle={{
        paddingBottom: Platform.OS === "ios" ? 90 : 110,
      }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#002F34" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSub}>Verification unsuccessful</Text>
        </View>
      </View>

      {/* STATUS */}
      <View style={styles.statusBox}>
        <Ionicons name="close-circle" size={64} color="#E11D48" />
        <Text style={styles.statusTitle}>Verification Rejected</Text>
        <Text style={styles.statusDesc}>
          Your KYC could not be verified. Please review the reason below and try again.
        </Text>
      </View>

      {/* REASON */}
      {reason && (
        <View style={styles.reasonBox}>
          <View style={styles.reasonHeader}>
            <Ionicons name="alert-circle" size={18} color="#F59E0B" />
            <Text style={styles.reasonTitle}>Rejection Reason</Text>
          </View>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      )}

      {/* TIPS */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>What you can do</Text>

        {[
          "Review the rejection reason carefully",
          "Ensure documents are clear and readable",
          "CNIC number must match exactly",
          "Resubmit your KYC application",
        ].map((t, i) => (
          <View key={i} style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#0A7AFF" />
            <Text style={styles.tipText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* ACTION */}
      <PrimaryButton
        title="Resubmit KYC"
        onPress={() => router.replace("/KycFormScreen")}
        style={{ marginTop: 24 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#002F34",
  },
  headerSub: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },

  statusBox: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    color: "#002F34",
  },
  statusDesc: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },

  reasonBox: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#002F34",
  },
  reasonText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },

  tipsBox: {
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#002F34",
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    flex: 1,
  },
});
