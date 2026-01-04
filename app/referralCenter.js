import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { generateReferral, redeemReferral } from "../src/api/api";
import { useWallet } from "../src/context/WalletContext";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function ReferralCenter() {
  const { fetchPoints } = useWallet();
  const [referralCode, setReferralCode] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReferral();
  }, []);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const res = await generateReferral();
      setReferralCode(res.data.referralCode);
    } catch (err) {
      console.error("Referral fetch error:", err);
      Alert.alert("Error", "Could not fetch referral code.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert("✅ Copied!", "Referral code copied to clipboard.");
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Join MeGo using my referral code: ${referralCode}\n\nGet amazing deals and earn rewards!`,
        title: "Join MeGo",
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return Alert.alert("Error", "Please enter a referral code.");

    try {
      setLoading(true);
      const res = await redeemReferral({ referralCode: redeemCode.trim() });
      Alert.alert("✅ Success", res.data.message || "Referral redeemed successfully!");
      setRedeemCode("");
      await fetchPoints(); 
    } catch (err) {
      console.error("Redeem error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to redeem referral code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      // TODO: Call backend API to send invitation email
      // await API.post("/v1/invite/send", { email });
      
      // Show success modal (Figma design)
      Alert.alert(
        "✅ Invitation Send Successful!",
        "Please wait. You will be directed to the homepage soon.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/dashboard") }]
      );
      
      setEmail("");
    } catch (err) {
      Alert.alert("Error", "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite a Friend & Earn Points</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Your Referral Code */}
      <GlassCard style={styles.referralCard}>
        <LinearGradient
          colors={GRADIENTS.button}
          style={styles.referralGradient}
        >
          <View style={styles.referralHeader}>
            <Ionicons name="gift" size={28} color="#fff" />
            <Text style={styles.referralTitle}>Your Referral Code</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{referralCode || "Loading..."}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={copyCode}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.accentBlue}
                style={styles.actionBtnGradient}
              >
                <Ionicons name="copy" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Copy</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={shareCode}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.accent}
                style={styles.actionBtnGradient}
              >
                <Ionicons name="share-social" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.hintContainer}>
            <Ionicons name="information-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.hint}>
              Share this code with friends — when they sign up, you both earn bonus points!
            </Text>
          </View>
        </LinearGradient>
      </GlassCard>

      {/* Email Invite Section - Figma Design */}
      <GlassCard>
        <Text style={styles.sectionTitle}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter email address"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <PrimaryButton
          title="Send Invitation"
          loading={loading}
          onPress={handleSendInvitation}
        />
      </GlassCard>

      {/* Copy Link Section - Figma Design */}
      <GlassCard>
        <Text style={styles.sectionTitle}>Copy Link</Text>
        <View style={styles.linkContainer}>
          <TextInput
            style={styles.linkInput}
            value={referralCode ? `https://mego.app/invite/${referralCode}` : "Loading..."}
            editable={false}
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity
            style={styles.copyLinkButton}
            onPress={copyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.copyLinkText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Redeem Code */}
      <GlassCard>
        <SectionHeading title="Redeem Code" subtitle="Enter a referral code" />
        <View style={styles.inputContainer}>
          <Ionicons name="ticket" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter referral code"
            placeholderTextColor={COLORS.textMuted}
            value={redeemCode}
            onChangeText={setRedeemCode}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>
        <PrimaryButton
          title="Redeem Code"
          loading={loading}
          onPress={handleRedeem}
        />
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  referralCard: {
    padding: 0,
    overflow: "hidden",
    ...SHADOWS.xl,
  },
  referralGradient: {
    padding: 28,
    borderRadius: RADIUS.xl,
    gap: 20,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  referralTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  codeContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  code: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 4,
    fontFamily: "monospace",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: RADIUS.md,
  },
  hint: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 20,
  },
  inputIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyLinkButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  copyLinkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
