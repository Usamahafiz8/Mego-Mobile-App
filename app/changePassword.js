import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { changePassword } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!current || !newPass || !confirm)
      return Alert.alert("Error", "All fields are required");
    if (newPass !== confirm)
      return Alert.alert("Error", "Passwords do not match");

    try {
      setLoading(true);
      await changePassword({ currentPassword: current, newPassword: newPass });
      Alert.alert("✅ Success", "Password changed successfully!");
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch (err) {
      console.error("Change password error:", err);
      Alert.alert("Error", err.response?.data || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    { label: "Current Password", value: current, setValue: setCurrent, icon: "lock-closed" },
    { label: "New Password", value: newPass, setValue: setNewPass, icon: "lock-open" },
    { label: "Confirm New Password", value: confirm, setValue: setConfirm, icon: "checkmark-circle" },
  ];

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.wrapper}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%" }}
      >
        <SectionHeading title="Change Password" subtitle="Update your account security" />

        <GlassCard style={styles.formCard}>
          {passwordFields.map((field, i) => (
            <View key={i} style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Ionicons name={field.icon} size={18} color={COLORS.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={field.label}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={field.value}
                onChangeText={field.setValue}
              />
            </View>
          ))}

          <PrimaryButton
            title={loading ? "Updating..." : "Update Password"}
            loading={loading}
            onPress={handleChangePassword}
            style={styles.button}
          />
        </GlassCard>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    gap: 18,
    padding: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  button: {
    marginTop: 8,
  },
});
