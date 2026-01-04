import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import API from "../src/api/api";

export default function KycScreen() {
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState(null);

  async function loadStatus() {
    try {
      const res = await API.get("/v1/kyc/status");
      setKyc(res.data);
    } catch (e) {
      console.log("KYC STATUS ERROR:", e);
    } finally {
      setLoading(false);
    }
  }

  // 🟢 Load API
  useEffect(() => {
    loadStatus();
  }, []);

  // 🟢 Handle navigation SEPARATE from render
  useEffect(() => {
    if (!loading) {
      if (!kyc || kyc.status === "NotSubmitted") {
        router.replace("/KycFormScreen");
      } 
      else if (kyc.status === "Pending") {
        router.replace("/KycPendingScreen");
      } 
      else if (kyc.status === "Rejected") {
        router.replace({
          pathname: "/KycRejectedScreen",
          params: { reason: kyc.rejectionReason }
        });
      } 
      else if (kyc.status === "Approved") {
        router.replace("/KycApprovedScreen");
      }
    }
  }, [loading, kyc]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return null; // screen will redirect
}
