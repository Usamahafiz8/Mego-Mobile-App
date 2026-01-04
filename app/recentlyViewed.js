import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { clearRecentlyViewed, getRecentlyViewed } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await getRecentlyViewed();
      setItems(res.data || []);
    } catch (err) {
      console.error("Load recently viewed error:", err);
      Alert.alert("Error", "Failed to load recently viewed items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const handleClear = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all recently viewed items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearRecentlyViewed();
              setItems([]);
              Alert.alert("Success", "History cleared");
            } catch (err) {
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const imageUri = getImageUrl(item.ad.imageUrl || item.ad.media?.[0]?.filePath);
    const viewedDate = new Date(item.viewedAt);
    const timeAgo = getTimeAgo(viewedDate);

    return (
      <View style={{ marginBottom: 12 }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: "/adDetail", params: { id: item.ad.id } })}
          activeOpacity={0.9}
        >
          <GlassCard style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)"]}
                style={styles.imageGradient}
              />
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.timeBadgeText}>{timeAgo}</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {item.ad.title}
              </Text>
              <Text style={styles.price}>
                PKR {item.ad.price?.toLocaleString() || "Contact"}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={COLORS.textMuted} />
                <Text style={styles.location} numberOfLines={1}>
                  {item.ad.location || "Unknown"}
                </Text>
              </View>
              <View style={styles.viewedRow}>
                <Ionicons name="eye" size={14} color={COLORS.primary} />
                <Text style={styles.viewedAt}>
                  Viewed {viewedDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </View>
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
          <Text style={styles.headerSubtitle}>{items.length} items</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.danger}
              style={styles.clearBtnGradient}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={GRADIENTS.accentBlue}
            style={styles.emptyIcon}
          >
            <Ionicons name="eye-outline" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>
            Items you view will appear here for quick access
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadItems}
              tintColor={COLORS.primary}
            />
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
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 20,
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
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  clearBtnGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 12,
    fontWeight: "500",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    padding: 0,
    overflow: "hidden",
  },
  imageContainer: {
    width: 120,
    height: 120,
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
    height: 40,
  },
  timeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  timeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    fontWeight: "500",
  },
  viewedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewedAt: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  emptyContainer: {
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
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

