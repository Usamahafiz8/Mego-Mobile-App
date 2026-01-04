import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { getFavorites, removeFavorite as removeFavoriteApi } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../src/styles/theme";
import { useLanguage } from "../src/context/LanguageContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function Favorites() {
  const router = useRouter();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Iphones"); 
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      setFavorites(res.data || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error("Fetch favorites error:", err?.response?.data || err.message);
      Alert.alert(t("common_error"), t("favorites_load_error"));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (adId) => {
    try {
      await removeFavoriteApi(adId);
      setFavorites((prev) => prev.filter((fav) => {
        const id = fav.id || fav.adId || fav.ad?.id;
        return id !== adId;
      }));
    } catch (err) {
      console.error("Remove favorite error:", err);
      Alert.alert(t("common_error"), t("favorites_remove_error"));
    }
  };

  const getAdImage = (item) => {
    const ad = item.ad || item;
    if (ad.imageUrl) return getImageUrl(ad.imageUrl);
    if (ad.media && ad.media.length > 0) {
      return getImageUrl(ad.media[0].filePath || ad.media[0].mediaUrl);
    }
    return "https://via.placeholder.com/300x200/1e293b/64748b?text=No+Image";
  };

  const renderAd = ({ item, index }) => {
    const ad = item.ad || item;
    const adId = item.adId || item.id || ad.id;
    const scale = new Animated.Value(1);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animatable.View
        animation="zoomIn"
        delay={index * 80}
        style={{ width: CARD_WIDTH, marginBottom: 16 }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/adDetail", params: { id: adId } })}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: getAdImage(item) }} 
                    style={styles.image} 
                    resizeMode="cover" 
                  />
                  
                  {/* Boost Badge */}
                  {(ad.isBoosted || item.isBoosted) && (
                    <View style={styles.boostTag}>
                      <View style={styles.boostTagGradient}>
                        <Ionicons name="flash" size={10} color="#fff" />
                        <Text style={styles.boostText}>BOOST</Text>
                      </View>
                    </View>
                  )}

                  {/* Heart Button */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(adId);
                    }}
                    style={styles.heartButton}
                    activeOpacity={0.7}
                  >
                    <View style={styles.heartButtonGradient}>
                      <Ionicons name="heart" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>

                  {/* Price Overlay */}
                  {(ad.price || item.price) && (
                    <View style={styles.priceOverlay}>
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>
                          PKR {(ad.price || item.price).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.title} numberOfLines={2}>
                    {ad.title || item.title || "Untitled"}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.location} numberOfLines={1}>
                        {ad.location || item.location || "N/A"}
                      </Text>
                    </View>
                  </View>

                  {ad.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{ad.category}</Text>
                    </View>
                  )}
                </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common_loading")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      {/* Header with Back Button - Figma Design */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs - Figma Design */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Iphones" && styles.tabActive]}
          onPress={() => setActiveTab("Iphones")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "Iphones" && styles.tabTextActive]}>
            Iphones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Furniture's" && styles.tabActive]}
          onPress={() => setActiveTab("Furniture's")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "Furniture's" && styles.tabTextActive]}>
            Furniture's
          </Text>
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <Animatable.View
          animation="fadeIn"
          style={styles.emptyContainer}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="thumbs-up-outline" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No favorites saved</Text>
          <Text style={styles.emptyText}>
            The iPhone is a sleek high-performance smartphone by Apple, known for its premium design, powerful features.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard")}
            style={styles.browseButton}
            activeOpacity={0.7}
          >
            <View style={styles.browseButtonGradient}>
              <Text style={styles.browseButtonText}>Let find some favourites</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={favorites}
            renderItem={renderAd}
            keyExtractor={(item) => (item.id || item.adId || item.ad?.id)?.toString() || Math.random().toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
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
    fontWeight: "600",
  },
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 120,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  browseButton: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  browseButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#0077B5",
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  boostTag: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  boostTagGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    backgroundColor: "#f59e0b",
  },
  boostText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  heartButtonGradient: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  priceOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
  },
  priceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  infoContainer: {
    padding: 10,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    lineHeight: 20,
    letterSpacing: -0.2,
    minHeight: 40,
  },
  metaRow: {
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
});
