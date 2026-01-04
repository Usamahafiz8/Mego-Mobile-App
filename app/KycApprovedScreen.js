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
import PrimaryButton from "../src/components/PrimaryButton";

export default function KycApprovedScreen() {
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState(null);

  useEffect(() => {
    getKycStatus().then(r => setKyc(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 90 : 110 }}>
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
        <Text style={styles.title}>KYC Approved</Text>
        <Text style={styles.sub}>Your identity has been verified</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.row}>CNIC: {kyc?.cnic}</Text>
        <Text style={styles.row}>Tier: {kyc?.verificationTier}</Text>
      </View>

      <PrimaryButton title="Continue" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", padding: 32 },
  title: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  sub: { fontSize: 13, color: "#777", marginTop: 4 },
  info: { padding: 16 },
  row: { fontSize: 14, marginBottom: 6 },
});
