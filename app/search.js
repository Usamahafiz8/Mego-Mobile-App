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

export default function SearchScreen() {
  const { query: initialQuery } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showSortModal, setShowSortModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadCategories();
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const res = await API.get("/Categories");
      setCategories(res.data || []);
    } catch (e) {
      console.log("Load categories error:", e);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setAds([]);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("search", query);
      if (selectedCategory) params.append("category", selectedCategory);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await API.get(`/Ads?${params.toString()}`);
      setAds(res.data || []);
    } catch (e) {
      console.log("Search error:", e);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const toggleFavorite = async (id) => {
    try {
      const set = new Set(favorites);
      set.has(id) ? set.delete(id) : set.add(id);
      setFavorites(set);
      await API.post("/v1/favorites/toggle", { adId: id });
    } catch (e) {
      console.log("Toggle favorite error:", e);
    }
  };

  const getAdImage = (ad) => {
    if (ad.imageUrl) return getImageUrl(ad.imageUrl);
    if (ad.media?.length) return getImageUrl(ad.media[0].filePath);
    return "https://via.placeholder.com/300";
  };

  const AdCard = ({ item }) => {
    const isFav = favorites.has(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: getAdImage(item) }} style={styles.image} />
          {item.isBoosted && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.heart}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>Rs {item.price?.toLocaleString()}</Text>
          <Text style={styles.meta}>{item.location || "Lahore"} • 2h ago</Text>
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
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ads..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Row */}
      <View style={styles.filtersRow}>
        <View style={styles.filterChip}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              performSearch(searchQuery);
            }}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={18} color={COLORS.primary} />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : ads.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
        </View>
      ) : (
        <FlatList
          data={ads}
          renderItem={({ item }) => <AdCard item={item} />}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.adRow}
          contentContainerStyle={styles.adList}
          showsVerticalScrollIndicator={false}
        />
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
                  sortBy === option && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                  performSearch(searchQuery);
                }}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option && styles.sortOptionTextActive
                ]}>
                  {option === "relevance" ? "Relevance" :
                   option === "price_low" ? "Price: Low to High" :
                   option === "price_high" ? "Price: High to Low" :
                   option === "newest" ? "Newest First" :
                   "Oldest First"}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    padding: 0,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
    justifyContent: "center",
  },
  picker: {
    height: 40,
    color: COLORS.text,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  centerContainer: {
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
  },
  adRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  adList: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  imageWrap: {
    height: 160,
    backgroundColor: COLORS.backgroundSecondary,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FFD400",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text,
  },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  cardBody: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortOptionActive: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});



