import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import API from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";
import { useLanguage } from "../src/context/LanguageContext";

const { width } = Dimensions.get("window");

export default function MyAds() {
  const router = useRouter();
  const { t } = useLanguage();

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Filters"); 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ---------------- Load Ads ----------------
  const loadAds = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const res = await API.get("/Ads/my");
      setAds(res.data || []);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch {
      Alert.alert(t("common_error"), t("my_ads_load_error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAds();
    }, [])
  );

  // ---------------- Delete Ad ----------------
  const deleteAd = async (id) => {
    Alert.alert(t("my_ads_delete"), t("my_ads_delete_confirm"), [
      { text: t("common_cancel"), style: "cancel" },
      {
        text: t("my_ads_delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await API.delete(`/Ads/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setAds((prev) => prev.filter((x) => x.id !== id));
          } catch {
            Alert.alert(t("common_error"), t("my_ads_delete_error"));
          }
        },
      },
    ]);
  };

  // ---------------- Mark Sold ----------------
  const markSold = async (id) => {
    Alert.alert(t("my_ads_mark_sold"), t("my_ads_delete_confirm"), [
      { text: t("common_cancel"), style: "cancel" },
      {
        text: t("common_ok"),
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await API.post(
              `/Ads/${id}/sold`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            loadAds();
          } catch {
            Alert.alert(t("common_error"), t("my_ads_mark_sold_error"));
          }
        },
      },
    ]);
  };

  const filteredAds = ads.filter((ad) => {
    if (activeTab === "Filters") {
      // Show filtered ads (can add filter logic here)
      return true;
    }
    // "All Ads" - show all
    return true;
  });

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
    <ScreenContainer scrollable={false} onRefresh={() => loadAds(true)} refreshing={refreshing}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Ads</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs - Figma Design */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Filters" && styles.tabActive]}
            onPress={() => setActiveTab("Filters")}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={16} color={activeTab === "Filters" ? "#fff" : COLORS.textMuted} />
            <Text style={[styles.tabText, activeTab === "Filters" && styles.tabTextActive]}>
              Filters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "All Ads" && styles.tabActive]}
            onPress={() => setActiveTab("All Ads")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === "All Ads" && styles.tabTextActive]}>
              All Ads
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty State - Figma Design */}
        {filteredAds.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="megaphone-outline" size={64} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Ads Yet?</Text>
            <Text style={styles.emptyText}>
              Find something you like to sell and start conversation
            </Text>
          </View>
        )}

        {/* Ads List */}
        {filteredAds.length > 0 && (
          <FlatList
            data={filteredAds}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAds(true)}
                colors={[COLORS.primary]}
              />
            }
            renderItem={({ item, index }) => {
            const img = item.imageUrl
              ? getImageUrl(item.imageUrl)
              : "https://via.placeholder.com/150";

            return (
              <Animatable.View animation="fadeInUp" delay={index * 50}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({ pathname: "/adDetail", params: { id: item.id } })
                  }
                >
                  <View style={styles.card}>
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: img }} style={styles.image} />
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.title} numberOfLines={2}>
                        {item.title}
                      </Text>

                      <Text style={styles.price}>
                        {item.price ? `PKR ${item.price.toLocaleString()}` : "Contact"}
                      </Text>

                      <View style={styles.quickActions}>
                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() =>
                            router.push({ pathname: "/editAd", params: { id: item.id } })
                          }
                        >
                          <View style={styles.quickActionGradient}>
                            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.quickActionText}>Edit</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => markSold(item.id)}
                        >
                          <View style={styles.quickActionGradient}>
                            <Ionicons name="checkmark-done" size={16} color={COLORS.success} />
                            <Text style={styles.quickActionText}>Sold</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => deleteAd(item.id)}
                        >
                          <View style={styles.quickActionGradient}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                            <Text style={styles.quickActionText}>Delete</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            );
          }}
          />
        )}
      </Animated.View>
    </ScreenContainer>
  );
}

// ---------------- Styles ----------------
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  imageContainer: {
    width: 90,
    height: 90,
    marginRight: 12,
  },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  cardContent: { flex: 1 },
  title: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  price: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  quickActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  quickActionBtn: { flex: 1 },
  quickActionGradient: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  quickActionText: { fontSize: 12, fontWeight: "700" },
  listContent: { paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12 },
});

