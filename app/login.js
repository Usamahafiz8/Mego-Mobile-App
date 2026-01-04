import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
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
import { login, loginWithGoogle } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS } from "../src/styles/theme";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  // Google Auth - make androidClientId optional (required by hook but can be dummy if not configured)
  const googleConfig = {
    ...(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID && { expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID }),
    ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID && { iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID }),
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
                     process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
                     "dummy-android-client-id-for-hook",
    scopes: ["profile", "email"],
  };

  const [_, __, promptAsync] = Google.useAuthRequest(googleConfig);
  
  const hasGoogleConfig = !!(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
                             process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const res = await login(email, password);
      await AsyncStorage.setItem("userToken", res.data.token);
      router.replace("/(tabs)/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ backgroundColor: "#fff" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
          
          <Text style={styles.title}>Login</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Login" loading={loading} onPress={handleLogin} />

          <Text style={styles.or}>OR</Text>

          <TouchableOpacity 
            style={styles.socialBtn} 
            onPress={() => {
              if (!hasGoogleConfig) {
                Alert.alert(
                  "Setup Required",
                  "Google login is not configured yet. Please add your Google Client ID.",
                  [{ text: "OK" }]
                );
                return;
              }
              promptAsync();
            }}
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupRow}>
            <Text style={styles.smallText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.link}> Sign up</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: "600", color: COLORS.primary, marginBottom: 30, textAlign: "center" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  error: { color: "red", fontSize: 13, marginBottom: 10 },
  or: { textAlign: "center", marginVertical: 20, color: "#999", fontSize: 13 },
  socialBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: RADIUS.md,
  },
  socialText: { fontSize: 14, color: "#333" },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  smallText: { fontSize: 14, color: "#777" },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
});
