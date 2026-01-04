import { Ionicons } from "@expo/vector-icons";
import * as SignalR from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import API, { getConversations } from "../../src/api/api";
import { getImageUrl, API_BASE_URL } from "../../src/config/api";
import ScreenContainer from "../../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../../src/styles/theme";

export default function Chats() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await getConversations();
      const data = res?.data;
      setConversations(Array.isArray(data) ? data : []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error("❌ Load conversations error:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  useEffect(() => {
    let hub;

    const connectHub = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const id = await AsyncStorage.getItem("userId");
        setMyId(id);

        hub = new SignalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/chatHub`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();

        hub.on("ReceiveMessage", (msg) => {
          setConversations((prev) => {
            if (!Array.isArray(prev)) return [];
            const updated = [...prev];
            const index = updated.findIndex(
              (c) => c && (c.id === msg.conversationId || c.Id === msg.conversationId)
            );
            if (index !== -1) {
              updated[index].lastMessage = {
                content: msg.content,
                createdAt: msg.createdAt,
                sender: msg.sender,
              };
              const moved = updated.splice(index, 1)[0];
              updated.unshift(moved);
            }
            return [...updated];
          });
        });

        hub.on("ConversationDeleted", (conversationId) => {
          setConversations((prev) => {
            if (!Array.isArray(prev)) return [];
            return prev.filter((c) => c && c.id !== conversationId);
          });
        });

        await hub.start();
        console.log("✅ SignalR connected");
      } catch (error) {
        console.error("SignalR connection failed:", error);
      }
    };

    connectHub();

    return () => {
      if (hub) hub.stop();
    };
  }, []);

  const handleDeleteConversation = async (conversationId) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/v1/Conversations/${conversationId}`);
            setConversations((prev) => prev.filter((c) => c.id !== conversationId));
          } catch (err) {
            console.error("❌ Delete conversation error:", err);
            Alert.alert("Error", "Failed to delete conversation");
          }
        },
      },
    ]);
  };

  const filteredConversations = (Array.isArray(conversations) ? conversations : [])
    .filter((c) => {
      if (!c) return false;
      const otherUser = c.user1?.id === myId ? c.user2 : c.user1;
      return otherUser?.name?.toLowerCase().includes(search.toLowerCase());
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || 0) -
        new Date(a.lastMessage?.createdAt || 0)
    );

  const ChatCard = ({ item, index }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () =>
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    const otherUser = item.user1?.id === myId ? item.user2 : item.user1;
    const profileUri = otherUser?.profileImage || otherUser?.ProfileImage || otherUser?.image || otherUser?.Image;

    const lastMsg = item.lastMessage?.content || item.LastMessage?.content || "No messages yet";
    const time = item.lastMessage?.createdAt || item.LastMessage?.createdAt
      ? new Date(item.lastMessage?.createdAt || item.LastMessage?.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const unreadCount = item.unreadCount || 0;

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 50}
      >
        <Swipeable
          renderRightActions={() => (
            <TouchableOpacity
              style={styles.deleteSwipe}
              onPress={() => handleDeleteConversation(item.id)}
            >
              <View style={styles.deleteGradient}>
                <Ionicons name="trash-outline" size={24} color="#fff" />
                <Text style={styles.deleteText}>Delete</Text>
              </View>
            </TouchableOpacity>
          )}
        >
          <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() =>
                router.push({
                  pathname: "/chatDetail",
                  params: {
                    conversationId: item.id,
                    name: otherUser?.name || "User",
                    userId: otherUser?.id,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.chatCard}>
                <View style={styles.avatarContainer}>
                  {profileUri ? (
                    <Image
                      source={{ uri: getImageUrl(profileUri) }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={28} color={COLORS.primary} />
                    </View>
                  )}
                  {unreadCount > 0 && (
                    <View style={styles.onlineIndicator}>
                      <View style={styles.onlineDot} />
                    </View>
                  )}
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {otherUser?.name || "User"}
                    </Text>
                    {time && (
                      <Text style={styles.chatTime}>{time}</Text>
                    )}
                  </View>
                  <View style={styles.chatMessageRow}>
                    <Text style={styles.chatMessage} numberOfLines={1}>
                      {lastMsg}
                    </Text>
                    {unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Swipeable>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120 }}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {filteredConversations.length} {filteredConversations.length === 1 ? "conversation" : "conversations"}
            </Text>
          </View>
        </View>

        {/* Simple Search Bar - OLX Style */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchCard}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              placeholder="Search chats..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chat List */}
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animatable.View animation="zoomIn" delay={200}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.primary} />
              </View>
            </Animatable.View>
            <Text style={styles.emptyTitle}>
              {search ? "No chats found" : "No conversations yet"}
            </Text>
            <Text style={styles.emptyText}>
              {search
                ? "Try a different search term"
                : "Start chatting with sellers and buyers"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({ item, index }) => <ChatCard item={item} index={index} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
        )}
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "400",
  },
  searchWrapper: {
    marginBottom: 16,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 8,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
    letterSpacing: -0.1,
  },
  chatTime: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "400",
    marginLeft: 8,
  },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatMessage: {
    fontSize: 12,
    color: "#666666",
    flex: 1,
    fontWeight: "400",
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0077B5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  deleteSwipe: {
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  deleteGradient: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
