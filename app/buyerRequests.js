import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  closeBuyerRequest,
  createBuyerRequest,
  getBuyerRequests,
  getMyBuyerRequests,
  respondToBuyerRequest,
} from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function BuyerRequests() {
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    maxPrice: "",
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [allRes, myRes] = await Promise.all([
        getBuyerRequests(),
        getMyBuyerRequests(),
      ]);
      setRequests(allRes.data || []);
      setMyRequests(myRes.data || []);
    } catch (err) {
      console.error("Load buyer requests error:", err);
      Alert.alert("Error", "Failed to load buyer requests");
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

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      await createBuyerRequest({
        ...newRequest,
        maxPrice: newRequest.maxPrice ? parseFloat(newRequest.maxPrice) : null,
      });
      Alert.alert("Success", "Buyer request created!");
      setShowCreateModal(false);
      setNewRequest({ title: "", description: "", category: "", location: "", maxPrice: "" });
      loadRequests();
    } catch (err) {
      Alert.alert("Error", "Failed to create buyer request");
    }
  };

  const handleCloseRequest = async (id) => {
    try {
      await closeBuyerRequest(id);
      Alert.alert("Success", "Request closed");
      loadRequests();
    } catch (err) {
      Alert.alert("Error", "Failed to close request");
    }
  };

  const displayRequests = activeTab === "all" ? requests : myRequests;

  const renderItem = ({ item }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === "active" && styles.statusActive,
            item.status === "fulfilled" && styles.statusFulfilled,
          ]}
        >
          <LinearGradient
            colors={
              item.status === "active"
                ? GRADIENTS.success
                : item.status === "fulfilled"
                ? GRADIENTS.primary
                : ["#64748b", "#475569"]
            }
            style={styles.statusBadgeGradient}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </LinearGradient>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.metaIconContainer}>
            <Ionicons name="pricetag" size={14} color="#fff" />
          </LinearGradient>
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <View style={styles.metaItem}>
          <LinearGradient colors={GRADIENTS.warning} style={styles.metaIconContainer}>
            <Ionicons name="location" size={14} color="#fff" />
          </LinearGradient>
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        {item.maxPrice && (
          <View style={styles.metaItem}>
            <LinearGradient colors={GRADIENTS.success} style={styles.metaIconContainer}>
              <Ionicons name="cash" size={14} color="#fff" />
            </LinearGradient>
            <Text style={styles.metaText}>Max: PKR {item.maxPrice}</Text>
          </View>
        )}
      </View>

      {item.responses && item.responses.length > 0 && (
        <View style={styles.responses}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.responsesBadge}>
            <Ionicons name="chatbubbles" size={14} color="#fff" />
            <Text style={styles.responsesTitle}>
              {item.responses.length} Response{item.responses.length > 1 ? "s" : ""}
            </Text>
          </LinearGradient>
        </View>
      )}

      {activeTab === "my" && item.status === "active" && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => handleCloseRequest(item.id)}
        >
          <LinearGradient colors={GRADIENTS.danger} style={styles.closeButtonGradient}>
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.closeButtonText}>Close Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </GlassCard>
  );

  return (
    <ScreenContainer scrollable={false}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>What to Buy</Text>
          <Text style={styles.headerSubtitle}>Find what you need</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <LinearGradient colors={GRADIENTS.success} style={styles.iconContainer}>
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Enhanced Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.tabActive]}
          onPress={() => setActiveTab("all")}
        >
          {activeTab === "all" && (
            <LinearGradient colors={GRADIENTS.primary} style={StyleSheet.absoluteFill} />
          )}
          <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
            All Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my" && styles.tabActive]}
          onPress={() => setActiveTab("my")}
        >
          {activeTab === "my" && (
            <LinearGradient colors={GRADIENTS.primary} style={StyleSheet.absoluteFill} />
          )}
          <Text style={[styles.tabText, activeTab === "my" && styles.tabTextActive]}>
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={displayRequests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadRequests} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={48} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyText}>No buyer requests yet</Text>
              <Text style={styles.emptySubtext}>Create your first request to get started</Text>
            </View>
          }
        />
      )}

      {/* Enhanced Create Request Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Buyer Request</Text>
                <Text style={styles.modalSubtitle}>Tell sellers what you're looking for</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeModalButton}>
                <LinearGradient colors={GRADIENTS.danger} style={styles.iconContainer}>
                  <Ionicons name="close" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#64748b"
              value={newRequest.title}
              onChangeText={(text) => setNewRequest({ ...newRequest, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              value={newRequest.description}
              onChangeText={(text) => setNewRequest({ ...newRequest, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#64748b"
              value={newRequest.category}
              onChangeText={(text) => setNewRequest({ ...newRequest, category: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#64748b"
              value={newRequest.location}
              onChangeText={(text) => setNewRequest({ ...newRequest, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Price (optional)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={newRequest.maxPrice}
              onChangeText={(text) => setNewRequest({ ...newRequest, maxPrice: text })}
            />

            <TouchableOpacity onPress={handleCreateRequest} style={styles.createButton}>
              <LinearGradient colors={GRADIENTS.success} style={styles.createButtonGradient}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Request</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: { marginRight: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: COLORS.muted },
  addButton: {},
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabActive: { borderColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.muted },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: Platform.OS === "ios" ? 100 : 120 },
  card: {
    marginBottom: 16,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleContainer: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  statusBadge: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  statusBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  description: { fontSize: 14, color: COLORS.muted, marginBottom: 12, lineHeight: 20 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaIconContainer: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  metaText: { fontSize: 12, color: COLORS.muted, fontWeight: "500" },
  responses: { marginTop: 8 },
  responsesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    alignSelf: "flex-start",
  },
  responsesTitle: { fontSize: 12, color: "#fff", fontWeight: "600" },
  closeButton: {
    marginTop: 12,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  closeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  closeButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...SHADOWS.md,
  },
  emptyText: { fontSize: 18, color: COLORS.text, fontWeight: "700", marginTop: 8 },
  emptySubtext: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: COLORS.muted },
  closeModalButton: {},
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: RADIUS.md,
    padding: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  createButton: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginTop: 8,
    ...SHADOWS.md,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
  },
  createButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

