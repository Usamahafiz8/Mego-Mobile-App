import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function DeliveryOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  const loadDeliveryOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/v1/DeliveryOrders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Load delivery orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No delivery orders</Text>
          <Text style={styles.emptySubtext}>
            Track your selling or buying delivery orders here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
                <View style={[
                  styles.statusBadge,
                  order.status === 'delivered' && styles.statusDelivered,
                  order.status === 'in_transit' && styles.statusInTransit,
                  order.status === 'pending' && styles.statusPending,
                ]}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.productName}>{order.productName}</Text>
              {order.trackingNumber && (
                <Text style={styles.tracking}>Tracking: {order.trackingNumber}</Text>
              )}
              {order.estimatedDeliveryDate && (
                <Text style={styles.deliveryDate}>
                  Est. Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </Text>
              )}
              {order.deliveryAddress && (
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warning,
  },
  statusDelivered: {
    backgroundColor: COLORS.success,
  },
  statusInTransit: {
    backgroundColor: COLORS.info,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  tracking: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
