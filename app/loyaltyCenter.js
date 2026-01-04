import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useWallet } from "../src/context/WalletContext";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

const SCREEN_W = Dimensions.get("window").width;
const FEATURE_CARD_W = Math.floor(SCREEN_W * 0.7);

export default function LoyaltyCenter() {
  const { points, fetchPoints } = useWallet();
  const [featuredRewards, setFeaturedRewards] = useState([
    { id: 1, title: "50% Cashback", img: require("../assets/images/reward3.jpeg") },
    { id: 2, title: "Free Shipping", img: require("../assets/images/reward2.png") },
    { id: 3, title: "Bonus Points", img: require("../assets/images/reward1.jpg") },
  ]);

  const featureScrollRef = useRef(null);
  const [featureIndex, setFeatureIndex] = useState(0);

  useEffect(() => {
    fetchPoints();
  }, []);

  useEffect(() => {
    if (!featuredRewards.length) return;
    const interval = setInterval(() => {
      const nextIndex = (featureIndex + 1) % featuredRewards.length;
      featureScrollRef.current?.scrollTo({ x: nextIndex * (FEATURE_CARD_W + 16), animated: true });
      setFeatureIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [featuredRewards, featureIndex]);

  const totalPoints = points?.total ?? 0;
  const availablePoints = points?.available ?? 0;
  const rate = 0.1;
  const balancePKR = (availablePoints * rate).toFixed(2);

  const rewardOptions = [
    { icon: "sync", label: "Spin the Wheel", route: "/spinWheel", gradient: GRADIENTS.accent },
    { icon: "list", label: "Daily & Weekly Tasks", route: "/dailyTasks", gradient: GRADIENTS.accentGreen },
    { icon: "share-social", label: "Invite & Earn", route: "/referralCenter", gradient: GRADIENTS.accentBlue },
    { icon: "wallet", label: "My Wallet", route: "/wallet", gradient: GRADIENTS.button },
  ];

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Program</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Featured Rewards Carousel */}
      <View style={styles.rewardsSection}>
        <ScrollView
          horizontal
          ref={featureScrollRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rewardsList}
        >
          {featuredRewards.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              activeOpacity={0.9}
            >
              <Image source={item.img} style={styles.featureImg} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.featureGradient}
              />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {featuredRewards.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, featureIndex === i && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* Points Card */}
      <GlassCard style={styles.pointsCard}>
        <LinearGradient
          colors={GRADIENTS.button}
          style={styles.pointsGradient}
        >
          <View style={styles.pointsHeader}>
            <Ionicons name="trophy" size={28} color="#fff" />
            <Text style={styles.pointsTitle}>Your Points</Text>
          </View>
          <Text style={styles.points}>{totalPoints.toLocaleString()}</Text>
          <View style={styles.pointsDetails}>
            <View style={styles.pointsDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.subPoints}>{availablePoints.toLocaleString()} available</Text>
            </View>
            <View style={styles.pointsDetailItem}>
              <Ionicons name="cash" size={16} color="#fff" />
              <Text style={styles.subPoints}>≈ PKR {balancePKR}</Text>
            </View>
          </View>
        </LinearGradient>
      </GlassCard>

      {/* Reward Options */}
      <View>
        <Text style={styles.sectionTitle}>Earn More Points</Text>
        {rewardOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => router.push(item.route)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={item.gradient}
              style={styles.optionIcon}
            >
              <Ionicons name={item.icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.optionText}>{item.label}</Text>
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

const styles = StyleSheet.create({
  rewardsSection: {
    marginBottom: 24,
  },
  rewardsList: {
    paddingHorizontal: 16,
  },
  featureCard: {
    width: FEATURE_CARD_W,
    height: 180,
    borderRadius: RADIUS["2xl"],
    marginRight: 16,
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  featureImg: {
    width: "100%",
    height: "100%",
  },
  featureGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  featureInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  pointsCard: {
    padding: 0,
    overflow: "hidden",
    ...SHADOWS.xl,
  },
  pointsGradient: {
    padding: 28,
    borderRadius: RADIUS.xl,
    gap: 16,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  pointsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  points: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "700",
    letterSpacing: -2,
  },
  pointsDetails: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  pointsDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  subPoints: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 4,
    letterSpacing: -0.3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: RADIUS.xl,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardGlass,
    gap: 14,
    ...SHADOWS.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
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
});
