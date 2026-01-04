import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCurrentUser, updateProfile } from "../../src/api/api";
import { getImageUrl } from "../../src/config/api";
import ScreenContainer from "../../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../../src/styles/theme";
import { useLanguage } from "../../src/context/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch (err) {
      console.error("❌ Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      await handleUpdateImage(imageUri);
    }
  };

  const handleUpdateImage = async (uri) => {
    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("Image", {
        uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      const res = await updateProfile(formData);
      setUser((prev) => ({ ...prev, profileImage: res.data.profileImage }));
      Alert.alert("✅ " + t("common_success"), t("profile_update_success"));
    } catch (err) {
      console.error("❌ Update image error:", err);
      Alert.alert(t("common_error"), t("profile_update_error"));
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    router.replace("/login");
  };

  if (loading)
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );

  const menus = menuItems(user, t);

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}>
      {/* Simple Profile Header - OLX Style */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.9}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.profileImage
                  ? { uri: getImageUrl(user.profileImage) }
                  : require("../../assets/images/c2.png")
              }
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
            {updating && (
              <View style={styles.updatingOverlay}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || "User"}</Text>
          <View style={styles.verifiedRow}>
            {user?.kycInfo?.status === "Approved" && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.contactInfo}>
            {user?.email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.subText}>{user.email}</Text>
              </View>
            )}
            {user?.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.subText}>{user.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View>
        <View style={styles.menuCard}>
          {menus.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, idx !== menus.length - 1 && styles.menuDivider]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuText}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtext}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>{t("profile_logout")}</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const menuItems = (user, t) => [
  { 
    id: 1, 
    title: "Public Profile", 
    icon: "people-outline", 
    route: "/sellerDetail",
    subtitle: "See how other view your profile"
  },
  { 
    id: 2, 
    title: "Favorites", 
    icon: "heart-outline", 
    route: "/favorites",
    subtitle: "All of your favourites and saved searches"
  },
  { 
    id: 3, 
    title: "Discounted Packages", 
    icon: "cube-outline", 
    route: "/discountedPackages",
    subtitle: "Sell faster, more & at higher margins with packages"
  },
  { 
    id: 4, 
    title: "Order & Billing", 
    icon: "document-text-outline", 
    route: "/orderBilling",
    subtitle: "Sell faster, more & at higher margins with packages"
  },
  { 
    id: 5, 
    title: "Delivery Orders", 
    icon: "car-outline", 
    route: "/deliveryOrders",
    subtitle: "Track your selling or buying delivery order"
  },
  { 
    id: 6, 
    title: "Setting", 
    icon: "settings-outline", 
    route: "/settings",
    subtitle: "Privacy and manage account"
  },
  { 
    id: 7, 
    title: "Help & Support", 
    icon: "help-circle-outline", 
    route: "/help",
    subtitle: "Help center and legal account"
  },
  { 
    id: 8, 
    title: "Invite a user", 
    icon: "person-add-outline", 
    route: "/inviteUser",
    subtitle: "Invite a user and a member to join us"
  },
  { 
    id: 9, 
    title: "Loyalty Program", 
    icon: "diamond-outline", 
    route: "/loyaltyCenter",
    subtitle: "To achieve more client use this to"
  },
];

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  updatingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.2,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  verifiedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "600",
  },
  contactInfo: {
    width: "100%",
    gap: 8,
    marginTop: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  subText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuIconVerified: {
    backgroundColor: "#10b981",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "400",
    lineHeight: 16,
    fontSize: 14,
  },
  menuSubtext: {
    color: "#666666",
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginTop: 16,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
  },
});

