import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API, {
  addFavorite,
  createSwapRequest,
  getAdAnalytics,
  getAdQualityScore,
  getBoostStatus,
  generateBoostShareLink,
  getMyAds,
  removeFavorite,
  reportListing,
  trackAdClick,
  trackAdSave,
  trackAdShare,
  trackAdView,
  trackRecentlyViewed,
  getUserById,
} from "../src/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";
import { useLanguage } from "../src/context/LanguageContext";

const { width } = Dimensions.get("window");

export default function AdDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [ad, setAd] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [similarAds, setSimilarAds] = useState([]);
  const [qualityScore, setQualityScore] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [boostStatus, setBoostStatus] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  const [reportVisible, setReportVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [myAds, setMyAds] = useState([]);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [swapMessage, setSwapMessage] = useState("");
  const [loadingMyAds, setLoadingMyAds] = useState(false);
  const [submittingSwap, setSubmittingSwap] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/Ads/${id}`);
        setAd(res.data);

        await trackAdView(+id);
        await trackRecentlyViewed(+id);

        const score = await getAdQualityScore(+id);
        setQualityScore(score.data);

        try {
          const analyticsRes = await getAdAnalytics(+id);
          setAnalytics(analyticsRes.data);
        } catch {}

        try {
          const boost = await getBoostStatus(+id);
          setBoostStatus(boost.data);
        } catch {}

        try {
          const favRes = await API.get(`/favorites/me`);
          setFavorite(
            (favRes.data || []).some(
              (f) => f.adId === +id || f.ad?.id === +id
            )
          );
        } catch {}

        if (res.data?.userId) {
          const sellerRes = await getUserById(res.data.userId.toString());
          setSeller(sellerRes.data);
        }

        // Load similar ads
        try {
          const similarRes = await API.get(`/Ads`);
          const allAds = similarRes.data || [];
          setSimilarAds(
            allAds
              .filter(a => a.id !== res.data.id && a.category === res.data?.category)
              .slice(0, 4)
          );
        } catch {}
      } catch {
        Alert.alert("Error", "Failed to load ad");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const images = [
    ad?.imageUrl && getImageUrl(ad.imageUrl),
    ...(ad?.media?.map((m) => getImageUrl(m.filePath || m.mediaUrl)) || []),
  ].filter(Boolean);

  const getAdImage = (item) => {
    if (item.imageUrl) return getImageUrl(item.imageUrl);
    if (item.media?.length) return getImageUrl(item.media[0].filePath);
    return "https://via.placeholder.com/300";
  };

  const toggleFavorite = async () => {
    try {
      if (favorite) {
        await removeFavorite(+id);
      } else {
        await addFavorite(+id);
        await trackAdSave(+id);
      }
      setFavorite(!favorite);
    } catch {
      Alert.alert("Error", "Failed");
    }
  };

  const submitSwapRequest = async () => {
    if (!selectedAdId) return;
    try {
      setSubmittingSwap(true);
      await createSwapRequest({
        requesterAdId: selectedAdId,
        targetAdId: +id,
        message: swapMessage || undefined,
      });
      Alert.alert("Success", "Swap request sent");
      setSwapModalVisible(false);
      setSelectedAdId(null);
      setSwapMessage("");
    } finally {
      setSubmittingSwap(false);
    }
  };

  const submitReport = async () => {
    if (!reason.trim()) return;
    try {
      setSubmitting(true);
      await reportListing(ad.id, reason);
      Alert.alert("Reported", "Thanks for reporting");
      setReportVisible(false);
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer scrollable>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* IMAGE CAROUSEL */}
          <View style={styles.carousel}>
            <ScrollView
              horizontal
              pagingEnabled
              ref={carouselRef}
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
            >
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.image} />
              ))}
            </ScrollView>

            <View style={styles.topButtons}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={toggleFavorite}>
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={22}
                  color={favorite ? "#ef4444" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* DETAILS */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price - Prominently displayed */}
            <Text style={styles.price}>
              {ad.price ? `RS ${ad.price.toLocaleString()}` : "Contact"}
            </Text>

            {/* Title */}
            <Text style={styles.title}>{ad.title}</Text>

            {/* Description Section */}
            {ad.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{ad.description}</Text>
              </View>
            )}

            {/* Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsList}>
                {ad.category && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Brand:</Text>
                    <Text style={styles.detailValue}>{ad.category}</Text>
                  </View>
                )}
                {ad.condition && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Model:</Text>
                    <Text style={styles.detailValue}>{ad.condition}</Text>
                  </View>
                )}
                {ad.condition && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Condition:</Text>
                    <Text style={styles.detailValue}>{ad.condition}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Is Deliverable?:</Text>
                  <Text style={styles.detailValue}>Yes, All over the Pakistan</Text>
                </View>
              </View>
            </View>

            {/* Listed By Section */}
            {seller && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Listed By</Text>
                <View style={styles.listedByCard}>
                  <View style={styles.sellerAvatar}>
                    {seller.profileImage ? (
                      <Image source={{ uri: getImageUrl(seller.profileImage) }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="person" size={24} color={COLORS.textMuted} />
                    )}
                  </View>
                  <View style={styles.sellerInfo}>
                    <Text style={styles.sellerName}>{seller.name || "Seller"}</Text>
                    {seller.phone && (
                      <Text style={styles.sellerPhone}>{seller.phone}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Location Section */}
            {ad.location && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.locationCard}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.locationText}>{ad.location}</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryBtn}>
                <Ionicons name="chatbubble" size={18} color="#fff" />
                <Text style={styles.btnText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.successBtn}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.btnText}>Call</Text>
              </TouchableOpacity>
            </View>

            {/* Related Ads Section */}
            {similarAds.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Related Ads</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedAdsContainer}>
                  {similarAds.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.relatedAdCard}
                      onPress={() => router.push({ pathname: "/adDetail", params: { id: item.id } })}
                    >
                      <Image
                        source={{ uri: getAdImage(item) }}
                        style={styles.relatedAdImage}
                      />
                      <Text style={styles.relatedAdPrice}>
                        {item.price ? `Rs ${item.price.toLocaleString()}` : "Contact"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </ScreenContainer>

      {/* REPORT MODAL */}
      <Modal visible={reportVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Report Ad</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              placeholder="Reason"
              multiline
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setReportVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={submitReport}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SWAP MODAL */}
      <Modal visible={swapModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.swapModal}>
            <Text style={styles.modalTitle}>Swap Request</Text>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !selectedAdId && { opacity: 0.5 },
              ]}
              onPress={submitSwapRequest}
              disabled={!selectedAdId || submittingSwap}
            >
              {submittingSwap ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="swap-horizontal" size={18} color="#fff" />
                  <Text style={styles.btnText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  carousel: { height: width * 0.75 },
  image: { width, height: "100%", resizeMode: "cover" },

  topButtons: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    width: 120,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.textSecondary,
    flex: 1,
  },
  listedByCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  sellerPhone: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  relatedAdsContainer: {
    marginTop: 8,
  },
  relatedAdCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  relatedAdImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  relatedAdPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    padding: 8,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  successBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  swapModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 16 },

  cancelBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  dangerBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
});
