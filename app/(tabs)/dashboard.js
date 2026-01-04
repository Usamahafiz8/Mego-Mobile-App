import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../../src/api/api";
import { getImageUrl } from "../../src/config/api";
import ScreenContainer from "../../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../../src/styles/theme";
import { useLanguage } from "../../src/context/LanguageContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Category icon mapping
const categoryIconMap = {
  Vehicles: "car-sport",
  Property: "home",
  Mobiles: "phone-portrait",
  Electronics: "laptop",
  Fashion: "shirt",
  Gaming: "game-controller",
  Sports: "football",
  Books: "book",
  Furniture: "bed",
  Watches: "time",
  Cameras: "camera",
  Audio: "headset",
  Motorcycles: "bicycle",
  "Baby Items": "baby",
  Pets: "paw",
  "Musical Instruments": "musical-notes",
  "Art & Collectibles": "color-palette",
  "Tools & Hardware": "construct",
  "Garden & Outdoor": "leaf",
  "Sports Equipment": "basketball",
};

const categoryTabs = ["Popular", "Electric", "Categories", "Cities"];

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();

  const [ads, setAds] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Popular");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState("Gulberg Phase 4, Lahore"); // Default location from Figma

  /* ---------------- LOAD DATA ---------------- */
  const loadData = async () => {
    try {
      setLoading(true);

      // Load saved location
      const savedLocation = await AsyncStorage.getItem("userLocation");
      if (savedLocation) {
        setUserLocation(savedLocation);
      }

      const [adsRes, favRes, categoriesRes] = await Promise.all([
        API.get("/Ads"),
        API.get("/favorites/me").catch(() => ({ data: [] })),
        API.get("/Categories").catch(() => ({ data: [] })),
      ]);

      const list = adsRes.data || [];
      setAds(list);
      // Featured ads - first 4 with images
      setFeatured(list.filter(a => a.imageUrl || (a.media && a.media.length > 0)).slice(0, 4));

      setFavorites(
        new Set((favRes.data || []).map(f => f.adId || f.id || f.ad?.id))
      );

      // Set categories from backend
      if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }
    } catch (e) {
      console.log("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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

  // Filter ads based on search and category
  const filteredAds = useMemo(() => {
    let filtered = ads;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title?.toLowerCase().includes(query) ||
        ad.description?.toLowerCase().includes(query) ||
        ad.location?.toLowerCase().includes(query) ||
        ad.category?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(ad => 
        ad.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (minPrice > 0) {
      filtered = filtered.filter(ad => ad.price >= minPrice);
    }
    
    if (maxPrice < 10000000) {
      filtered = filtered.filter(ad => ad.price <= maxPrice);
    }
    
    return filtered;
  }, [ads, searchQuery, selectedCategory, minPrice, maxPrice]);

  const getAdImage = (ad) => {
    if (ad.imageUrl) return getImageUrl(ad.imageUrl);
    if (ad.media?.length) return getImageUrl(ad.media[0].filePath);
    return "https://via.placeholder.com/300";
  };

  /* ---------------- AD CARD ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <ScreenContainer scrollable={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER - MEGO Logo and Location (Figma Design) */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/images/splashlog.png")} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.logoText}>MEGO</Text>
          </View>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => router.push("/chooseLocation")}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.locationText} numberOfLines={1}>{userLocation}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push("/search")}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>
            {t("dashboard_search_placeholder") || "Search ads..."}
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="filter" size={20} color={showFilters ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* FILTERS SECTION */}
        {showFilters && (
          <View style={styles.filtersSection}>
            {/* Category Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  style={styles.picker}
                >
                  <Picker.Item label="All Categories" value="" />
                  {categories.map(cat => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInput}>
                  <TextInput
                    style={styles.priceInputField}
                    value={minPrice > 0 ? minPrice.toString() : ""}
                    onChangeText={(text) => setMinPrice(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <Text style={styles.priceSeparator}>-</Text>
                <View style={styles.priceInput}>
                  <TextInput
                    style={styles.priceInputField}
                    value={maxPrice < 10000000 ? maxPrice.toString() : ""}
                    onChangeText={(text) => setMaxPrice(parseInt(text) || 10000000)}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity 
              style={styles.clearFiltersBtn}
              onPress={() => {
                setSelectedCategory("");
                setMinPrice(0);
                setMaxPrice(10000000);
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BROWSE CATEGORIES TABS */}
        <View style={styles.categoryTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
            {categoryTabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.categoryTab, selectedTab === tab && styles.categoryTabActive]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.categoryTabText, selectedTab === tab && styles.categoryTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CATEGORY GRID */}
        {categories.length > 0 && (
          <View style={styles.categoryGrid}>
            {categories.slice(0, 6).map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryGridItem}
                onPress={() => {
                  router.push({
                    pathname: "/categoryDetail",
                    params: {
                      categoryName: cat.name,
                      categorySlug: cat.slug,
                    },
                  });
                }}
              >
                <View style={styles.categoryGridIcon}>
                  <Ionicons 
                    name={categoryIconMap[cat.name] || "grid"} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                </View>
                <Text style={styles.categoryGridText} numberOfLines={1}>
                  {cat.name}
                </Text>
                {cat.adCount > 0 && (
                  <Text style={styles.categoryCount}>{cat.adCount}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FEATURED SECTION */}
        {featured.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity>
                <Text style={styles.seeMore}>See more</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={featured}
              renderItem={({ item }) => <AdCard item={item} />}
              keyExtractor={item => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.adRow}
              contentContainerStyle={styles.adList}
              scrollEnabled={false}
            />
          </>
        )}

        {/* ALL ADS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t("dashboard_all_ads") || "All Ads"} {filteredAds.length > 0 ? `(${filteredAds.length})` : ""}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
        ) : filteredAds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No ads found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAds}
            renderItem={({ item }) => <AdCard item={item} />}
            keyExtractor={item => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.adRow}
            contentContainerStyle={[styles.adList, { paddingBottom: 100 }]}
            scrollEnabled={false}
          />
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    maxWidth: "60%",
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  filtersSection: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    justifyContent: "center",
  },
  picker: {
    height: 48,
    color: COLORS.text,
  },
  priceRangeContainer: {
    marginBottom: 16,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  priceInputField: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    height: 44,
  },
  clearFiltersBtn: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFiltersText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTabsContainer: {
    marginBottom: 16,
  },
  categoryTabs: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  categoryTabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  categoryGridItem: {
    width: (width - 48) / 3,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryGridIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryGridText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 4,
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  adRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  adList: {
    paddingBottom: 16,
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
});
