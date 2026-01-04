import { Ionicons } from "@expo/vector-icons";
import * as SignalR from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { API_BASE_URL, getImageUrl } from "../src/config/api";
import API, {
  addChatReaction,
  getChatReactions,
  getMessages,
  getUserById,
  markMessageAsRead,
  removeChatReaction,
  sendMessage,
} from "../src/api/api";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, name, userId } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [connection, setConnection] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [myId, setMyId] = useState("");
  const [messageReactions, setMessageReactions] = useState({});
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherUserProfile, setOtherUserProfile] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeout = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  useEffect(() => {
    if (!userId) return;
    getUserById(userId)
      .then((res) => setOtherUserProfile(res.data))
      .catch(() => {});
  }, [userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await getMessages(conversationId);
      setMessages(res.data || []);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    const connectHub = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const id = (await AsyncStorage.getItem("userId"))?.toLowerCase();
      setMyId(id);

      const hub = new SignalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/chatHub`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      hub.on("ReceiveMessage", (msg) => {
        if (msg.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      await hub.start();
      await hub.invoke("JoinConversation", conversationId);
      setConnection(hub);
      loadMessages();
    };

    connectHub();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await sendMessage(conversationId, msg);
  };

  const handlePickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      const formData = new FormData();
      formData.append("file", {
        uri: res.assets[0].uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      setUploading(true);
      await API.post(`/Messages/${conversationId}/upload`, formData);
      setUploading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const isMine = item.senderId === myId || item.senderId?.toLowerCase() === myId?.toLowerCase();
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevItem || prevItem.senderId !== item.senderId;
    const showTime = index === messages.length - 1 || 
      new Date(item.createdAt).getTime() - new Date(messages[index + 1]?.createdAt || 0).getTime() > 300000; // 5 minutes

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={300}
        style={[
          styles.messageWrapper,
          isMine ? styles.messageWrapperRight : styles.messageWrapperLeft,
        ]}
      >
        {!isMine && showAvatar && (
          <Image
            source={
              otherUserProfile?.profileImage
                ? { uri: getImageUrl(otherUserProfile.profileImage) }
                : require("../assets/images/c2.png")
            }
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageContainer,
            isMine ? styles.messageRight : styles.messageLeft,
          ]}
        >
          {item.imageUrl && (
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={styles.messageImage}
            />
          )}
          {item.content && (
            <Text style={[
              styles.messageText,
              isMine && styles.messageTextRight
            ]}>
              {item.content}
            </Text>
          )}
          {showTime && (
            <Text style={[
              styles.messageTime,
              isMine && styles.messageTimeRight
            ]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
        {isMine && showAvatar && (
          <View style={styles.myAvatarPlaceholder} />
        )}
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          
          {/* HEADER - Figma Design */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            {otherUserProfile?.profileImage && (
              <Image
                source={{ uri: getImageUrl(otherUserProfile.profileImage) }}
                style={styles.headerAvatar}
              />
            )}

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {name || otherUserProfile?.name || "Chat"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {typingUser ? "typing..." : "Online"}
              </Text>
            </View>

            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="call-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="videocam-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {uploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />

          {/* Input Container - Figma Design */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.inputAction}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={(txt) => {
                  setText(txt);
                  if (connection && txt.length > 0) {
                    connection.invoke("Typing", conversationId);
                    if (typingTimeout.current) clearTimeout(typingTimeout.current);
                    typingTimeout.current = setTimeout(() => {
                      connection.invoke("StopTyping", conversationId);
                    }, 2000);
                  }
                }}
                placeholder="Type a message"
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={500}
              />
            </View>

            {text.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.7}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => {
                  // Handle voice message
                  Alert.alert("Voice Message", "Voice message feature coming soon!");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="mic-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    maxWidth: "80%",
  },
  messageWrapperLeft: {
    alignSelf: "flex-start",
  },
  messageWrapperRight: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  myAvatarPlaceholder: {
    width: 32,
    marginLeft: 8,
  },
  messageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    maxWidth: "100%",
  },
  messageLeft: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xs,
    ...SHADOWS.sm,
  },
  messageRight: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: RADIUS.xs,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.md,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
    fontWeight: "500",
  },
  messageTextRight: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  messageTimeRight: {
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
  },
  emptyMessages: {
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 8,
  },
  inputAction: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  micButton: {
    padding: 8,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
