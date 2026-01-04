import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { getNeighborhoodFeed } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function NeighborhoodFeed() {
  const [location, setLocation] = useState("");
  const [feed, setFeed] = useState({ ads: [], buyerRequests: [] });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ads"); // "ads" or "requests"

  const loadFeed = async () => {
    if (!location.trim()) return;

    try {
      setLoading(true);
      const res = await getNeighborhoodFeed(location);
      setFeed(res.data || { ads: [], buyerRequests: [] });
    } catch (err) {
      console.error("Load neighborhood feed error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Auto-load if location is set
      if (location) loadFeed();
    }, [location])
  );

  const renderAd = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
    >
      <GlassCard style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: getImageUrl(item.imageUrl || item.media?.[0]?.filePath),
            }}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={styles.imageGradient}
          />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>PKR {item.price?.toLocaleString()}</Text>
          <View style={styles.meta}>
            <Ionicons name="location" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderBuyerRequest = ({ item }) => (
    <GlassCard style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <LinearGradient
          colors={GRADIENTS.accentBlue}
          style={styles.requestIcon}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
        </LinearGradient>
        <View style={styles.requestInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="pricetag" size={14} color={COLORS.primary} />
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
      </View>
      {item.maxPrice && (
        <View style={styles.maxPriceContainer}>
          <Ionicons name="cash" size={16} color={COLORS.primary} />
          <Text style={styles.maxPrice}>Max: PKR {item.maxPrice?.toLocaleString()}</Text>
        </View>
      )}
      {item.responses && item.responses.length > 0 && (
        <View style={styles.responsesContainer}>
          <LinearGradient
            colors={GRADIENTS.accentGreen}
            style={styles.responsesBadge}
          >
            <Ionicons name="chatbubbles" size={14} color="#fff" />
            <Text style={styles.responses}>
              {item.responses.length} Response{item.responses.length > 1 ? "s" : ""}
            </Text>
          </LinearGradient>
        </View>
      )}
    </GlassCard>
  );

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      <SectionHeading
        title="Neighborhood Feed"
        subtitle="Discover local listings and requests"
      />

      <GlassCard style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="location" size={20} color={COLORS.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter location..."
              placeholderTextColor={COLORS.textMuted}
              value={location}
              onChangeText={setLocation}
              onSubmitEditing={loadFeed}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={loadFeed}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.button}
              style={styles.searchButtonGradient}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {location && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ads" && styles.tabActive]}
            onPress={() => setActiveTab("ads")}
            activeOpacity={0.8}
          >
            {activeTab === "ads" ? (
              <LinearGradient
                colors={GRADIENTS.button}
                style={styles.tabGradient}
              >
                <Ionicons name="grid" size={18} color="#fff" />
                <Text style={styles.tabTextActive}>
                  Listings ({feed.ads?.length || 0})
                </Text>
              </LinearGradient>
            ) : (
              <>
                <Ionicons name="grid-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.tabText}>
                  Listings ({feed.ads?.length || 0})
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "requests" && styles.tabActive]}
            onPress={() => setActiveTab("requests")}
            activeOpacity={0.8}
          >
            {activeTab === "requests" ? (
              <LinearGradient
                colors={GRADIENTS.accentBlue}
                style={styles.tabGradient}
              >
                <Ionicons name="document-text" size={18} color="#fff" />
                <Text style={styles.tabTextActive}>
                  Requests ({feed.buyerRequests?.length || 0})
                </Text>
              </LinearGradient>
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />
                <Text style={styles.tabText}>
                  Requests ({feed.buyerRequests?.length || 0})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === "ads" ? feed.ads : feed.buyerRequests}
          renderItem={activeTab === "ads" ? renderAd : renderBuyerRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadFeed}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient
                colors={GRADIENTS.accentBlue}
                style={styles.emptyIcon}
              >
                <Ionicons name="location-outline" size={48} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>
                {location ? "No items found" : "Enter a location"}
              </Text>
              <Text style={styles.emptyText}>
                {location
                  ? "Try a different location or check back later"
                  : "Enter a location to see neighborhood feed"}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchIcon: {
    marginTop: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  searchButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  tabActive: {
    borderColor: COLORS.primary,
  },
  tabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    minHeight: 200,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "500",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
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
  cardBody: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 10,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  requestCard: {
    padding: 20,
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  requestInfo: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 16,
  },
  maxPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: COLORS.cardAlt,
    padding: 10,
    borderRadius: RADIUS.md,
  },
  maxPrice: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "700",
  },
  responsesContainer: {
    marginTop: 12,
  },
  responsesBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  responses: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

