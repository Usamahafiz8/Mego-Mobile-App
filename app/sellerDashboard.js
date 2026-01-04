import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAdAnalytics, getMyAds } from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS } from "../src/styles/theme";

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalClicks: 0,
    totalSaves: 0,
    totalShares: 0,
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const adsRes = await getMyAds();
      const myAds = adsRes.data || [];

      if (!myAds.length) {
        setAds([]);
        setStats({
          totalAds: 0,
          activeAds: 0,
          totalViews: 0,
          totalClicks: 0,
          totalSaves: 0,
          totalShares: 0,
        });
        return;
      }

      const enriched = await Promise.all(
        myAds.map(async (ad) => {
          try {
            const res = await getAdAnalytics(ad.id);
            return {
              ...ad,
              metrics: res.data || {},
              image: getImageUrl(ad.imageUrl || ad.media?.[0]?.filePath),
            };
          } catch {
            return {
              ...ad,
              metrics: {},
              image: getImageUrl(ad.imageUrl || ad.media?.[0]?.filePath),
            };
          }
        })
      );

      const totals = enriched.reduce(
        (acc, ad) => {
          acc.views += ad.metrics.views || 0;
          acc.clicks += ad.metrics.clicks || 0;
          acc.saves += ad.metrics.saves || 0;
          acc.shares += ad.metrics.shares || 0;
          return acc;
        },
        { views: 0, clicks: 0, saves: 0, shares: 0 }
      );

      setAds(enriched);
      setStats({
        totalAds: enriched.length,
        activeAds: enriched.filter((a) => a.isActive).length,
        totalViews: totals.views,
        totalClicks: totals.clicks,
        totalSaves: totals.saves,
        totalShares: totals.shares,
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadDashboard(); }, []));

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#002F34" />
          <Text style={styles.loading}>Loading…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 90 : 110 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <Text style={styles.headerSub}>Overview of your ads</Text>
      </View>

      {/* STATS (OLX STYLE) */}
      <View style={styles.statsRow}>
        <Stat label="Ads" value={stats.totalAds} />
        <Stat label="Views" value={stats.totalViews} />
        <Stat label="Clicks" value={stats.totalClicks} />
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actions}>
        <Action
          icon="add-circle-outline"
          text="Post New Ad"
          onPress={() => router.push("/(tabs)/postAd")}
        />
        <Action
          icon="list-outline"
          text="Manage Ads"
          onPress={() => router.push("/myAds")}
        />
      </View>

      {/* TOP ADS */}
      <Text style={styles.section}>Top Performing Ads</Text>

      <FlatList
        data={[...ads].sort((a, b) => (b.metrics.views || 0) - (a.metrics.views || 0)).slice(0, 5)}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.adRow}
            onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.adImage} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.adTitle}>{item.title}</Text>
              <Text style={styles.adMeta}>
                {item.metrics.views || 0} views • {item.metrics.clicks || 0} clicks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

/* SMALL COMPONENTS */

const Stat = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Action = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#002F34" />
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

/* STYLES */

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  loading: {
    marginTop: 10, color: "#777",
  },

  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#002F34",
  },
  headerSub: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#002F34",
  },
  statLabel: {
    fontSize: 11,
    color: "#7F8C8D",
  },

  actions: {
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#002F34",
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#002F34",
  },

  adRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    gap: 10,
  },
  adImage: {
    width: 50,
    height: 50,
    backgroundColor: "#eee",
  },
  adTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#002F34",
  },
  adMeta: {
    fontSize: 11,
    color: "#7F8C8D",
    marginTop: 2,
  },
});
