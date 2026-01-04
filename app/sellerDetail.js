import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import API, { getSellerDetails } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, GRADIENTS, RADIUS, SHADOWS, TYPOGRAPHY } from "../src/styles/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function sellerDetail() {
  const { sellerId } = useLocalSearchParams();
  const router = useRouter();

  const [seller, setSeller] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      
      // Convert sellerId to string if needed
      const sellerIdStr = typeof sellerId === 'string' ? sellerId : sellerId?.toString();
      
      if (!sellerIdStr) {
        Alert.alert("Error", "Invalid seller ID");
        setLoading(false);
        return;
      }
      
      // First, try to get seller info from ads (more reliable)
      const adsRes = await API.get("/Ads");
      const allAds = adsRes.data || [];
      
      // Find seller's ads
      const sellerAds = allAds.filter((ad) => {
        const adUserId = ad.userId || ad.user?.id || ad.UserId;
        return adUserId && adUserId.toString().toLowerCase() === sellerIdStr.toLowerCase();
      });
      setAds(sellerAds);
      
      // Try to get seller details from first ad
      if (sellerAds.length > 0 && sellerAds[0].user) {
        const userData = sellerAds[0].user;
        setSeller({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          profileImage: userData.profileImage,
          createdAt: userData.createdAt,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // If not found in ads, try API endpoint
      try {
        const sellerRes = await getSellerDetails(sellerIdStr);
        if (sellerRes.data) {
          setSeller(sellerRes.data);
        }
      } catch (sellerErr) {
        console.log("Seller API fetch failed, using fallback:", sellerErr.response?.status);
        // Use basic info if available
        if (sellerAds.length > 0) {
          setSeller({
            id: sellerIdStr,
            name: "Seller",
            phone: sellerAds[0].contact,
          });
        }
      }
    } catch (err) {
      console.error("⚠️ Seller fetch failed:", err.response?.status, err.response?.data || err.message);
      // Don't show alert, just log the error
      if (err.response?.status !== 404) {
        Alert.alert("Error", "Failed to load seller details. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSellerData();
  };

  const handleCall = () => {
    if (seller?.phone) {
      Linking.openURL(`tel:${seller.phone}`);
    }
  };

  const handleEmail = () => {
    if (seller?.email) {
      Linking.openURL(`mailto:${seller.email}`);
    }
  };

  const getAdImage = (item) => {
    if (item.media?.length > 0) {
      const mediaUrl = item.media[0].mediaUrl || item.media[0].filePath;
      return getImageUrl(mediaUrl);
    }
    if (item.imageUrl) {
      return getImageUrl(item.imageUrl);
    }
    return null;
  };

  const renderAd = ({ item, index }) => {
    const imageUri = getAdImage(item);

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 50}
        style={{ width: CARD_WIDTH, marginBottom: 16 }}
      >
        <TouchableOpacity
          style={styles.adCard}
          onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
          activeOpacity={0.95}
        >
          <View style={styles.adImageWrapper}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.adImage} resizeMode="cover" />
            ) : (
              <View style={styles.noImg}>
                <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)"]}
              style={styles.imageGradient}
            />
          </View>
          <View style={styles.adBody}>
            <Text numberOfLines={2} style={styles.adTitle}>
              {item.title || "Untitled"}
            </Text>
            <View style={styles.adLocationRow}>
              <Ionicons name="location" size={12} color={COLORS.textMuted} />
              <Text numberOfLines={1} style={styles.adLocation}>
                {item.location || item.city || "Location"}
              </Text>
            </View>
            <View style={styles.adFooter}>
              <Text style={styles.adPrice}>
                {item.price ? `PKR ${item.price.toLocaleString()}` : "Contact"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Loading seller profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!seller && !loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.loading}>
          <Ionicons name="person-remove-outline" size={64} color={COLORS.danger} />
          <Text style={styles.error}>Seller not found</Text>
          <Text style={styles.errorDesc}>Unable to load seller profile</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seller Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Seller Card */}
        <View style={styles.sellerCard}>
          <LinearGradient
            colors={GRADIENTS.cardGlow}
            style={styles.sellerGradient}
          >
            <View style={styles.avatarContainer}>
              {seller.profileImage ? (
                <Image
                  source={{
                    uri: getImageUrl(seller.profileImage),
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.primary} />
                </View>
              )}
              {seller.kycStatus === "Approved" && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
              )}
            </View>

            <Text style={styles.name}>{seller.name || "Seller"}</Text>
            <Text style={styles.sellerTag}>
              Active Seller • Member since {seller.createdAt 
                ? new Date(seller.createdAt).getFullYear() 
                : "2024"}
            </Text>
            {seller.averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {seller.averageRating} ({seller.totalRatings} reviews)
                </Text>
              </View>
            )}

            <View style={styles.contactRow}>
              {seller.phone && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleCall}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={GRADIENTS.button}
                    style={styles.contactButtonGradient}
                  >
                    <Ionicons name="call" size={18} color="#fff" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {seller.email && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleEmail}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={GRADIENTS.accentBlue}
                    style={styles.contactButtonGradient}
                  >
                    <Ionicons name="mail" size={18} color="#fff" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoRow}>
              {seller.phone && (
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.infoText}>{seller.phone}</Text>
                </View>
              )}
              {seller.email && (
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {seller.email}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ads.length}</Text>
            <Text style={styles.statLabel}>Active Ads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {ads.filter((a) => a.condition === "New").length}
            </Text>
            <Text style={styles.statLabel}>New Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {ads.filter((a) => a.condition === "Used").length}
            </Text>
            <Text style={styles.statLabel}>Used Items</Text>
          </View>
        </View>

        {/* Ads Section */}
        <View style={styles.adsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📢 Ads by {seller.name}</Text>
              <Text style={styles.sectionSubtitle}>{ads.length} listings available</Text>
            </View>
          </View>

          {ads.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={GRADIENTS.card}
                style={styles.emptyIcon}
              >
                <Ionicons name="albums-outline" size={48} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No ads posted yet</Text>
              <Text style={styles.emptyDesc}>
                This seller hasn't posted any listings yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={ads}
              renderItem={renderAd}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              numColumns={2}
              columnWrapperStyle={styles.cardRow}
              scrollEnabled={false}
              contentContainerStyle={styles.cardGrid}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  error: {
    color: COLORS.danger,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  errorDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardGlass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  sellerCard: {
    marginBottom: 20,
    borderRadius: RADIUS["2xl"],
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  sellerGradient: {
    padding: 24,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sellerTag: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    backgroundColor: COLORS.warning + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    alignSelf: "center",
  },
  ratingText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: "700",
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    width: "100%",
  },
  contactButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  contactButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  infoRow: {
    width: "100%",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.cardGlass,
    borderRadius: RADIUS.xl,
    paddingVertical: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  adsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...SHADOWS.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  cardRow: {
    justifyContent: "space-between",
  },
  cardGrid: {
    paddingBottom: 20,
  },
  adCard: {
    backgroundColor: COLORS.cardGlass,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  adImageWrapper: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  noImg: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  adBody: {
    padding: 12,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    minHeight: 38,
    lineHeight: 18,
  },
  adLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  adLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  adFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
