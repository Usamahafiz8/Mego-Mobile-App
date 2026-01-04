import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecentWithdrawals, requestWithdraw } from "../../src/api/api";
import { useWallet } from "../../src/context/WalletContext";
import ScreenContainer from "../../src/components/ScreenContainer";
import PrimaryButton from "../../src/components/PrimaryButton";
import { COLORS, RADIUS, SHADOWS } from "../../src/styles/theme";

const CARD_W = 160;

export default function Wallet() {
  const { points, loading, fetchPoints } = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);
  const [recent, setRecent] = useState([]);
  const [featureIndex, setFeatureIndex] = useState(0);
  const scrollRef = useRef(null);

  const jazzAnim = useRef(new Animated.Value(1)).current;
  const easyAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPoints();
    fetchRecent();
  }, []);

  useEffect(() => {
    if (!recent.length) return;
    const interval = setInterval(() => {
      const nextIndex = (featureIndex + 1) % recent.length;
      scrollRef.current?.scrollToOffset({ offset: nextIndex * (CARD_W + 12), animated: true });
      setFeatureIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [recent, featureIndex]);

  const fetchRecent = async () => {
    try {
      const res = await getRecentWithdrawals();
      setRecent(res.data?.withdrawals || res.data || []);
    } catch (err) {
      console.log("Recent withdrawals not available", err?.response?.data || err.message);
      setRecent([]);
    }
  };

  const totalPoints = points?.total ?? 0;
  const availablePoints = points?.available ?? 0;
  const rate = 0.1;
  const balancePKR = (availablePoints * rate).toFixed(2);

  const handlePressIn = (anim) => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = (anim) => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

  const handleWithdraw = async (method) => {
    if (availablePoints < 500) {
      Alert.alert("⚠️ Minimum Limit", "You must have at least 500 points to withdraw.");
      return;
    }

    Alert.alert("Withdraw Request", `Withdraw PKR ${balancePKR} via ${method}?`, [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            setWithdrawing(true);
            await requestWithdraw({ method, amount: balancePKR });
            Alert.alert("✅ Success", "Your withdrawal request has been submitted!");
            await fetchPoints();
            await fetchRecent();
          } catch (err) {
            console.error("Withdraw Error:", err);
            Alert.alert("Error", err.response?.data?.message || "Failed to send request.");
          } finally {
            setWithdrawing(false);
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.muted, marginTop: 8 }}>Loading wallet...</Text>
        </View>
      </ScreenContainer>
    );

  const renderRecent = ({ item }) => {
    const dateValue = item.createdAt || item.date;
    const formattedDate = dateValue
      ? new Date(dateValue).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—";
    return (
      <View style={styles.recentCard}>
        <Text style={styles.recentAmount}>PKR {(item.amount ?? 0).toLocaleString()}</Text>
        <Text style={styles.recentMethod}>{item.method || "Wallet"}</Text>
        <Text style={styles.recentDate}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}>
      <View style={styles.headerCard}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.walletTitle}>My Wallet</Text>
              <View style={styles.tag}>
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={styles.tagText}>Pro Member</Text>
              </View>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.balanceLabel}>Total Points</Text>
            </View>
            <View style={styles.availableRow}>
              <View style={styles.availableItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.subBalance}>{availablePoints.toLocaleString()} available</Text>
              </View>
              <View style={styles.availableItem}>
                <Ionicons name="cash" size={16} color={COLORS.primary} />
                <Text style={styles.subBalance}>PKR {balancePKR}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
        <Text style={styles.sectionSubtitle}>Latest payout history</Text>
        {recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ color: COLORS.textMuted }}>No recent withdrawals yet.</Text>
          </View>
        ) : (
          <FlatList
            data={recent}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRecent}
            showsHorizontalScrollIndicator={false}
            ref={scrollRef}
            contentContainerStyle={{ paddingVertical: 4, columnGap: 12 }}
          />
        )}
      </View>

      <View style={styles.withdrawCard}>
        <Text style={styles.sectionTitle}>Withdraw via</Text>
        <Text style={styles.sectionSubtitle}>Choose your payout method</Text>
        <Animated.View style={{ transform: [{ scale: jazzAnim }] }}>
          <TouchableOpacity
            style={styles.methodBtn}
            onPress={() => handleWithdraw("JazzCash")}
            activeOpacity={0.7}
            onPressIn={() => handlePressIn(jazzAnim)}
            onPressOut={() => handlePressOut(jazzAnim)}
            disabled={withdrawing}
          >
            <View style={[styles.methodIconContainer, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="cash" size={24} color="#fff" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>JazzCash</Text>
              <Text style={styles.methodSubtitle}>Instant wallet payout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: easyAnim }] }}>
          <TouchableOpacity
            style={styles.methodBtn}
            onPress={() => handleWithdraw("Easypaisa")}
            activeOpacity={0.7}
            onPressIn={() => handlePressIn(easyAnim)}
            onPressOut={() => handlePressOut(easyAnim)}
            disabled={withdrawing}
          >
            <View style={[styles.methodIconContainer, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="wallet" size={24} color="#fff" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Easypaisa</Text>
              <Text style={styles.methodSubtitle}>Trusted by millions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <PrimaryButton title="Withdraw Now" loading={withdrawing} onPress={() => handleWithdraw("JazzCash")} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Minimum withdrawal: PKR 50</Text>
        <Text style={styles.infoText}>• Processing time: 24 hours</Text>
        <Text style={styles.infoText}>• 1 Point = PKR 0.10</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerGradient: {
    padding: 28,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  withdrawCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
    ...SHADOWS.sm,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  balanceContainer: {
    gap: 8,
  },
  balanceText: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "700",
    letterSpacing: -2,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  availableRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  availableItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  subBalance: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tagText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  recentCard: {
    width: CARD_W,
    padding: 18,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  recentAmount: { 
    color: COLORS.warning, 
    fontWeight: "600", 
    fontSize: 18, 
    marginBottom: 6,
  },
  recentMethod: { 
    color: COLORS.text, 
    fontWeight: "700", 
    fontSize: 15, 
    marginBottom: 4,
  },
  recentDate: { 
    color: COLORS.textMuted, 
    fontSize: 13,
    fontWeight: "500",
  },
  methodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardGlass,
    ...SHADOWS.md,
  },
  methodIconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: { 
    color: COLORS.text, 
    fontWeight: "700", 
    fontSize: 16,
  },
  methodSubtitle: { 
    color: COLORS.textMuted, 
    fontSize: 13,
    fontWeight: "500",
  },
  infoText: { 
    color: COLORS.textMuted, 
    fontSize: 14, 
    marginBottom: 6,
    fontWeight: "500",
  },
});
