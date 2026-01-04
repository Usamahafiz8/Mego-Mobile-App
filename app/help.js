import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";
import { useLanguage } from "../src/context/LanguageContext";

export default function HelpSupport() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const fetchTickets = async () => {
    try {
      const res = await API.get("/v1/support/my-tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Fetch tickets error:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, name: asset.fileName || "screenshot.jpg", type: "image/jpeg" });
    }
  };
  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t("common_error"), t("help_message_required"));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("Message", message);
      if (image) {
        formData.append("Image", image);
      }

      await API.post("/v1/support/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("✅ " + t("common_success"), t("help_success"));
      setMessage("");
      setImage(null);
      fetchTickets();
    } catch (err) {
      console.error("Send support error:", err);
      console.error("Send support error:", err);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: t("help_faq_1_q"), a: t("help_faq_1_a") },
    { q: t("help_faq_2_q"), a: t("help_faq_2_a") },
    { q: t("help_faq_3_q"), a: t("help_faq_3_a") },
    { q: t("help_faq_4_q"), a: t("help_faq_4_a") },
  ];

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 100 : 120, gap: 20 }}
    >
      {/* Header with Navigation */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>{t("help_title")}</Text>
        </View>
        <TouchableOpacity
          style={styles.helpCenterButton}
          onPress={() => router.push("/helpCenter")}
        >
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/helpCenter")}
        >
          <Ionicons name="book-outline" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            // Handle feedback
          }}
        >
          <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => {
            // Handle submit request
          }}
        >
          <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Submit Request</Text>
        </TouchableOpacity>
      </View>

      {/* FAQs Section */}
      <GlassCard style={{ paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" }}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={GRADIENTS.cardGlow}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="help-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t("help_faq")}</Text>
          </LinearGradient>
        </View>

        {faqs.map((f, i) => (
          <View key={i} style={[styles.faqItem, i !== faqs.length - 1 && styles.faqDivider]}>
            <View style={styles.faqHeader}>
              <LinearGradient
                colors={GRADIENTS.accentBlue}
                style={styles.faqIcon}
              >
                <Text style={styles.faqQ}>Q</Text>
              </LinearGradient>
              <Text style={styles.question}>{f.q}</Text>
            </View>
            <View style={styles.faqAnswer}>
              <LinearGradient
                colors={GRADIENTS.accentGreen}
                style={styles.faqIcon}
              >
                <Text style={styles.faqA}>A</Text>
              </LinearGradient>
              <Text style={styles.answer}>{f.a}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      {/* Contact Support */}
      <GlassCard>
        <SectionHeading title={t("help_contact")} subtitle={t("help_subtitle")} />
        <View style={styles.inputContainer}>
          <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t("help_message_placeholder")}
            placeholderTextColor={COLORS.textMuted}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.cardGlow}
            style={styles.imagePickerGradient}
          >
            <Ionicons
              name={image ? "checkmark-circle" : "image-outline"}
              size={20}
              color={image ? COLORS.success : COLORS.primary}
            />
            <Text style={styles.imagePickerText}>
              {image ? t("common_success") + " ✅" : t("help_attach_image")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}

        <PrimaryButton
          title={loading ? t("help_sending") : t("help_send")}
          loading={loading}
          onPress={handleSubmit}
        />
      </GlassCard>

      {/* My Requests */}
      <GlassCard style={{ paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" }}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={GRADIENTS.cardGlow}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>My Support Requests</Text>
          </LinearGradient>
        </View>

        {tickets.length === 0 ? (
          <View style={styles.emptyTickets}>
            <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTicketsText}>No previous requests</Text>
            <Text style={styles.emptyTicketsSubtext}>
              Your support tickets will appear here
            </Text>
          </View>
        ) : (
          tickets.map((t, i) => (
            <View key={i} style={[styles.ticketCard, i !== tickets.length - 1 && styles.ticketDivider]}>
              <View style={styles.ticketHeader}>
                <View style={[
                  styles.statusBadge,
                  t.status === "Resolved" && styles.statusResolved,
                  t.status === "Pending" && styles.statusPending,
                ]}>
                  <Text style={styles.statusText}>{t.status}</Text>
                </View>
                <Text style={styles.ticketDate}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.ticketMsg}>{t.message}</Text>
              {t.adminReply && (
                <View style={styles.adminReply}>
                  <LinearGradient
                    colors={GRADIENTS.accentGreen}
                    style={styles.adminReplyGradient}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.adminReplyText}>{t.adminReply}</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          ))
        )}
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  faqItem: {
    padding: 16,
  },
  faqDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  faqAnswer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginLeft: 8,
  },
  faqIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  faqQ: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  faqA: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 22,
  },
  answer: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  inputIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: "top",
    fontWeight: "500",
  },
  imagePicker: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  imagePickerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  imagePickerText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  imagePreview: {
    position: "relative",
    marginBottom: 16,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: RADIUS.lg,
  },
  removeImage: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    padding: 4,
  },
  emptyTickets: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTicketsText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyTicketsSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  ticketCard: {
    padding: 16,
  },
  ticketDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.warning + "30",
  },
  statusResolved: {
    backgroundColor: COLORS.success + "30",
  },
  statusPending: {
    backgroundColor: COLORS.warning + "30",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.warning,
  },
  ticketDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  ticketMsg: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  adminReply: {
    marginTop: 8,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  adminReplyGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  adminReplyText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  helpCenterButton: {
    padding: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.md,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
});
