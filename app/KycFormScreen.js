import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { submitKyc } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS } from "../src/styles/theme";

export default function KycFormScreen() {
  const [cnic, setCnic] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);

  const pick = async (setter) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setter(res.assets[0].uri);
  };

  const submit = async () => {
    if (!cnic || !front || !back || !selfie) {
      Alert.alert("Error", "Please complete all fields");
      return;
    }

    const fd = new FormData();
    fd.append("CnicNumber", cnic);
    fd.append("CnicFrontImage", { uri: front, name: "front.jpg", type: "image/jpeg" });
    fd.append("CnicBackImage", { uri: back, name: "back.jpg", type: "image/jpeg" });
    fd.append("Selfie", { uri: selfie, name: "selfie.jpg", type: "image/jpeg" });
    fd.append("VerificationTier", "Intermediate");

    try {
      setLoading(true);
      await submitKyc(fd);
      router.replace("/KycPendingScreen");
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ label, image, onPick, onRemove }) => (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.upload} onPress={onPick}>
        {image ? (
          <>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.remove} onPress={onRemove}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="camera-outline" size={26} color="#777" />
            <Text style={styles.uploadText}>Upload image</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 90 : 110 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.sub}>Verify your identity</Text>
        </View>
      </View>

      {/* CNIC */}
      <View style={styles.box}>
        <Text style={styles.label}>CNIC Number</Text>
        <TextInput
          value={cnic}
          onChangeText={setCnic}
          placeholder="12345-1234567-1"
          style={styles.input}
        />
      </View>

      <UploadBox label="CNIC Front" image={front} onPick={() => pick(setFront)} onRemove={() => setFront(null)} />
      <UploadBox label="CNIC Back" image={back} onPick={() => pick(setBack)} onRemove={() => setBack(null)} />
      <UploadBox label="Selfie with CNIC" image={selfie} onPick={() => pick(setSelfie)} onRemove={() => setSelfie(null)} />

      <PrimaryButton
        title={loading ? "Submitting..." : "Submit KYC"}
        loading={loading}
        onPress={submit}
        disabled={loading}
        style={{ marginTop: 20 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", gap: 12, padding: 16 },
  back: {
    width: 36, height: 36, borderRadius: 6,
    borderWidth: 1, borderColor: "#E5E5E5",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 12, color: "#777" },

  box: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#E5E5E5",
    borderRadius: 6, padding: 12, fontSize: 14,
  },

  upload: {
    height: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CCC",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  uploadText: { fontSize: 12, color: "#777", marginTop: 4 },

  image: { width: "100%", height: "100%", borderRadius: 6 },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 2,
  },
});
