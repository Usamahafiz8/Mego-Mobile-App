import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function CategoryDetail() {
  const { categoryName, categorySlug } = useLocalSearchParams();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState("relevance");
  const [showSortModal, setShowSortModal] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAds();
    loadFavorites();
  }, [categoryName, categorySlug]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await API.get("/Ads", {
        params: {
          category: categoryName || categorySlug,
        },
      });
      setAds(res.data || []);
    } catch (e) {
      console.log("Load ads error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await API.get("/favorites/me");
      setFavorites(
        new Set((res.data || []).map(f => f.adId || f.id || f.ad?.id))
      );
    } catch (e) {
      console.log("Load favorites error:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAds();
    await loadFavorites();
    setRefreshing(false);
  };

  const toggleFavorite = async (id) => {
    try {
      const set = new Set(favorites);
      set.has(id) ? set.delete(id) : set.add(id);
      setFavorites(set);
      await API.post("/favorites/toggle", { adId: id });
    } catch (e) {
      console.log("Toggle favorite error:", e);
    }
  };

  const filteredAds = ads.filter((ad) => {
    const matchesCategory = !categoryName || 
      ad.category?.toLowerCase() === categoryName.toLowerCase();
    const matchesPrice = ad.price >= minPrice && ad.price <= maxPrice;
    return matchesCategory && matchesPrice;
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const AdCard = ({ item }) => {
    const img = item.imageUrl
      ? getImageUrl(item.imageUrl)
      : item.media && item.media.length > 0
      ? getImageUrl(item.media[0].filePath || item.media[0].mediaUrl)
      : "https://via.placeholder.com/300x200";

    return (
      <TouchableOpacity
        style={styles.adCard}
        onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: img }} style={styles.adImage} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <Ionicons
              name={favorites.has(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={favorites.has(item.id) ? COLORS.danger : "#fff"}
            />
          </TouchableOpacity>
          {item.isBoosted && (
            <View style={styles.boostBadge}>
              <Ionicons name="flash" size={12} color="#fff" />
              <Text style={styles.boostText}>BOOST</Text>
            </View>
          )}
        </View>
        <View style={styles.adInfo}>
          <Text style={styles.adTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.adPrice}>
            PKR {item.price?.toLocaleString() || "Contact"}
          </Text>
          <View style={styles.adMeta}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.adLocation} numberOfLines={1}>
              {item.location || "N/A"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{categoryName || "Category"}</Text>
          <Text style={styles.headerSubtitle}>
            {sortedAds.length} {sortedAds.length === 1 ? "ad" : "ads"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                keyboardType="numeric"
                value={minPrice > 0 ? minPrice.toString() : ""}
                onChangeText={(text) => setMinPrice(parseInt(text) || 0)}
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                keyboardType="numeric"
                value={maxPrice < 10000000 ? maxPrice.toString() : ""}
                onChangeText={(text) => setMaxPrice(parseInt(text) || 10000000)}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {["relevance", "price_low", "price_high", "newest", "oldest"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive,
                  ]}
                >
                  {option === "relevance" && "Relevance"}
                  {option === "price_low" && "Price: Low to High"}
                  {option === "price_high" && "Price: High to Low"}
                  {option === "newest" && "Newest First"}
                  {option === "oldest" && "Oldest First"}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Ads List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : sortedAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No ads found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or check back later
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedAds}
          renderItem={({ item }) => <AdCard item={item} />}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.adRow}
          contentContainerStyle={styles.adList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    padding: 4,
  },
  sortButton: {
    padding: 4,
  },
  filtersPanel: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceSeparator: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary + "10",
  },
  sortOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
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
  adList: {
    padding: 16,
    paddingBottom: 100,
  },
  adRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  adCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  boostBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  boostText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  adInfo: {
    padding: 12,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    minHeight: 40,
  },
  adPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 6,
  },
  adMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  adLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
});



