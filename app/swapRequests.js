import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  acceptSwapRequest,
  getSwapRequestsForMyAds,
  rejectSwapRequest,
} from "../src/api/api";
import { getImageUrl } from "../src/config/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getSwapRequestsForMyAds();
      setRequests(res.data || []);
    } catch (err) {
      console.error("Load swap requests error:", err);
      console.error("Load swap requests error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [])
  );

  const handleAccept = async (id) => {
    try {
      await acceptSwapRequest(id);
      Alert.alert("Success", "Swap request accepted!");
      loadRequests();
    } catch (err) {
      console.error("Accept swap request error:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectSwapRequest(id);
      Alert.alert("Success", "Swap request rejected");
      loadRequests();
    } catch (err) {
      console.error("Reject swap request error:", err);
    }
  };

  const getAdImage = (ad) => getImageUrl(ad?.imageUrl || ad?.media?.[0]?.filePath);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    const isIncoming = item.targetAd?.userId !== item.requesterId;
    const requesterAd = isIncoming ? item.requesterAd : item.targetAd;
    const targetAd = isIncoming ? item.targetAd : item.requesterAd;

    const getStatusGradient = () => {
      if (item.status === "accepted") return GRADIENTS.accentGreen;
      if (item.status === "rejected") return GRADIENTS.danger;
      return GRADIENTS.accentBlue;
    };

    return (
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={GRADIENTS.accentBlue}
              style={styles.headerIcon}
            >
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.cardTitle}>
              {isIncoming ? "Incoming Swap Request" : "Your Swap Request"}
            </Text>
          </View>
          <LinearGradient
            colors={getStatusGradient()}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </LinearGradient>
        </View>

        <View style={styles.swapContainer}>
          <View style={styles.adBox}>
            <View style={styles.adLabelContainer}>
              <Ionicons name="cube" size={14} color={COLORS.primary} />
              <Text style={styles.adLabel}>Your Ad</Text>
            </View>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: getAdImage(targetAd) }} style={styles.adImage} />
            </View>
            <Text style={styles.adTitle} numberOfLines={2}>
              {targetAd?.title}
            </Text>
            <Text style={styles.adPrice}>PKR {targetAd?.price?.toLocaleString()}</Text>
          </View>

          <LinearGradient
            colors={GRADIENTS.button}
            style={styles.swapIconContainer}
          >
            <Ionicons name="swap-horizontal" size={28} color="#fff" />
          </LinearGradient>

          <View style={styles.adBox}>
            <View style={styles.adLabelContainer}>
              <Ionicons name="cube-outline" size={14} color={COLORS.textMuted} />
              <Text style={[styles.adLabel, styles.adLabelTheir]}>Their Ad</Text>
            </View>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: getAdImage(requesterAd) }} style={styles.adImage} />
            </View>
            <Text style={styles.adTitle} numberOfLines={2}>
              {requesterAd?.title}
            </Text>
            <Text style={styles.adPrice}>PKR {requesterAd?.price?.toLocaleString()}</Text>
          </View>
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Ionicons name="chatbubble" size={16} color={COLORS.textMuted} />
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="time" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>Requested on {formatDate(item.createdAt)}</Text>
        </View>

        {item.status === "pending" && (
          <View style={styles.actions}>
            {isIncoming ? (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAccept(item.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={GRADIENTS.accentGreen}
                    style={styles.actionBtnGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleReject(item.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={GRADIENTS.danger} style={styles.actionBtnGradient}>
                    <Ionicons name="close" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { flex: 1 }]}
                onPress={() => handleReject(item.id)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={GRADIENTS.warning} style={styles.actionBtnGradient}>
                  <Ionicons name="close-circle" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Cancel Request</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.linkRow}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/adDetail", params: { id: targetAd?.id } })}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>View your ad</Text>
            <Ionicons name="open-outline" size={14} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/adDetail", params: { id: requesterAd?.id } })}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>View their ad</Text>
            <Ionicons name="open-outline" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading swap requests...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      <SectionHeading
        title="Swap Requests"
        subtitle={`${requests.length} request${requests.length !== 1 ? "s" : ""}`}
      />

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={GRADIENTS.accentBlue}
            style={styles.emptyIcon}
          >
            <Ionicons name="swap-horizontal-outline" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>No swap requests yet</Text>
          <Text style={styles.emptyText}>
            Swap requests for your ads will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadRequests}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
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
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  swapContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  adBox: {
    flex: 1,
    alignItems: "center",
  },
  adLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  adLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
  adLabelTheir: {
    color: COLORS.textMuted,
  },
  imageWrapper: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: 10,
    ...SHADOWS.md,
  },
  adImage: {
    width: 100,
    height: 100,
  },
  adTitle: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "600",
    lineHeight: 18,
  },
  adPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  swapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.cardAlt,
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

