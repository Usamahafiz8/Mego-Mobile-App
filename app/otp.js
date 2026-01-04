import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { verifyEmailOtp, sendEmailOtp } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";
import { useLanguage } from "../src/context/LanguageContext";

export default function OTP() {
  const { t } = useLanguage();
  const { email, phone } = useLocalSearchParams();
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const pastedCode = text.slice(0, 4).split("");
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 4) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      // Focus last filled input
      const lastIndex = Math.min(index + pastedCode.length - 1, 3);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Auto-focus next input
      if (text && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== 4) {
      Alert.alert("Error", "Please enter the complete 4-digit code");
      return;
    }

    try {
      setLoading(true);
      
      if (email) {
        await verifyEmailOtp(email, otpCode);
      } else if (phone) {
        // Handle phone OTP if needed
        Alert.alert("Info", "Phone OTP verification will be implemented");
        return;
      }

      // Show success modal
      Alert.alert(
        "Sign In Successful",
        "Please wait...\nYou will be directed to the homepage soon.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)/dashboard");
            },
          },
        ]
      );
    } catch (err) {
      console.error("OTP verification error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      if (email) {
        await sendEmailOtp(email);
        setCountdown(30);
        setCanResend(false);
        Alert.alert("Success", "Code has been resent to your email");
      } else if (phone) {
        Alert.alert("Info", "Phone OTP resend will be implemented");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const emailOrPhone = email || phone || "your email";

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.wrapper}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        style={{ width: "100%", flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Verify Account</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Code has been sent to {emailOrPhone}. Enter the code to verify your account.
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter Code</Text>
            <Text style={styles.otpSubLabel}>4 digit code</Text>
            <View style={styles.codeInputContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.codeInput, digit && styles.codeInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't Receive Code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={!canResend || resendLoading}
              style={styles.resendButton}
            >
              <Text style={[styles.resendLink, (!canResend || resendLoading) && styles.resendLinkDisabled]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>
          {!canResend && (
            <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
          )}

          {/* Verify Button */}
          <PrimaryButton 
            title={loading ? "Verifying..." : "Verify Account"} 
            loading={loading} 
            onPress={handleVerify}
            style={styles.verifyButton}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  placeholder: {
    width: 36,
  },
  instructionsContainer: {
    marginBottom: 32,
  },
  instructionsText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  otpSubLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 60,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundSecondary,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  resendButton: {
    padding: 4,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  resendLinkDisabled: {
    color: COLORS.textMuted,
    opacity: 0.5,
  },
  countdownText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  verifyButton: {
    marginTop: 8,
  },
});
