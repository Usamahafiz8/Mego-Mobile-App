import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API, { purchasePackage } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function DiscountedPackages() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/v1/DiscountedPackages");
      setPackages(res.data || []);
    } catch (err) {
      console.error("Load packages error:", err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg, method = 'points') => {
    try {
      setPurchasing(pkg.id);
      await purchasePackage(pkg.id, method);
      Alert.alert("Success", `Package "${pkg.name}" purchased successfully!`);
      loadPackages();
    } catch (err) {
      console.error("Purchase error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to purchase package");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discounted Packages</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : packages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No packages available</Text>
          <Text style={styles.emptySubtext}>
            Sell faster, more & at higher margins with packages
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {packages.map((pkg) => (
            <View key={pkg.id} style={[styles.packageCard, pkg.isPopular && styles.popularCard]}>
              {pkg.isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              {pkg.imageUrl && (
                <Image source={{ uri: getImageUrl(pkg.imageUrl) }} style={styles.packageImage} />
              )}
              <View style={styles.packageContent}>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>PKR {pkg.originalPrice.toLocaleString()}</Text>
                  <Text style={styles.discountedPrice}>PKR {pkg.discountedPrice.toLocaleString()}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{pkg.discountPercentage}% OFF</Text>
                  </View>
                </View>
                <View style={styles.purchaseOptions}>
                  {pkg.pointsCost > 0 && (
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => handlePurchase(pkg, 'points')}
                      disabled={purchasing === pkg.id}
                    >
                      <LinearGradient colors={GRADIENTS.primary} style={styles.purchaseButtonGradient}>
                        <Text style={styles.purchaseButtonText}>
                          {purchasing === pkg.id ? "Processing..." : `${pkg.pointsCost} Points`}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  {pkg.cashPrice && (
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => handlePurchase(pkg, 'cash')}
                      disabled={purchasing === pkg.id}
                    >
                      <LinearGradient colors={GRADIENTS.accentOrange} style={styles.purchaseButtonGradient}>
                        <Text style={styles.purchaseButtonText}>
                          {purchasing === pkg.id ? "Processing..." : `PKR ${pkg.cashPrice.toLocaleString()}`}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    zIndex: 1,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  packageImage: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.backgroundSecondary,
  },
  packageContent: {
    padding: 16,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },
  discountBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  purchaseOptions: {
    flexDirection: "row",
    gap: 12,
  },
  purchaseButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  purchaseButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
