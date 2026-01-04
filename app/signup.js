import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signup, signupWithGoogle } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS } from "../src/styles/theme";
import * as Google from "expo-auth-session/providers/google";

export default function Signup() {
  const [method, setMethod] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await signup({ name, email, phone, password });
    await AsyncStorage.setItem("userToken", res.data.token);
    router.replace("/(tabs)/dashboard");
  };

  return (
    <ScreenContainer style={{ backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-google" size={18} color="#DB4437" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.or}>OR</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity onPress={() => setMethod("email")} style={styles.methodBtn}>
            <Text style={styles.methodText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMethod("phone")} style={styles.methodBtn}>
            <Text style={styles.methodText}>Phone</Text>
          </TouchableOpacity>
        </View>

        {method && (
          <>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            {method === "email" && (
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            )}
            {method === "phone" && (
              <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <PrimaryButton title="Create Account" onPress={handleSignup} />
          </>
        )}

        <View style={styles.loginRow}>
          <Text style={styles.smallText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.link}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: "600", color: COLORS.primary, marginBottom: 30, textAlign: "center" },
  socialBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: RADIUS.md,
  },
  socialText: { fontSize: 14 },
  or: { textAlign: "center", marginVertical: 20, color: "#999", fontSize: 13 },
  methodRow: { flexDirection: "row", gap: 12 },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  methodText: { fontSize: 14, color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 15,
    marginTop: 14,
    backgroundColor: "#fff",
  },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  smallText: { fontSize: 14, color: "#777" },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
});
