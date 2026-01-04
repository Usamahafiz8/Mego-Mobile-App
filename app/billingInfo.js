import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function BillingInfo() {
  const [customerType, setCustomerType] = useState("");
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = async () => {
    try {
      setLoadingData(true);
      const res = await API.get("/BillingInfo");
      if (res.data) {
        setCustomerType(res.data.customerType || "");
        setEmail(res.data.email || "");
        setCustomerName(res.data.customerName || "");
        setBusinessName(res.data.businessName || "");
        setPhoneNumber(res.data.phoneNumber || "");
        setAddressLine(res.data.addressLine || "");
        setCity(res.data.city || "");
      }
    } catch (err) {
      console.error("Load billing info error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!customerType || !email || !customerName || !phoneNumber || !addressLine || !city) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await API.post("/BillingInfo", {
        customerType,
        email,
        customerName,
        businessName,
        phoneNumber,
        addressLine,
        city,
      });
      Alert.alert("Success", "Billing information saved successfully");
      router.back();
    } catch (err) {
      console.error("Save billing error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to save billing information");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Billing Info</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Customer Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Type*</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={customerType}
                onValueChange={setCustomerType}
                style={styles.picker}
              >
                <Picker.Item label="Select A customer" value="" />
                <Picker.Item label="Sole Proprietor/Individual" value="individual" />
                <Picker.Item label="Business/Company" value="business" />
              </Picker>
            </View>
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Customer Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your name"
              placeholderTextColor={COLORS.textMuted}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          {/* Business Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your business"
              placeholderTextColor={COLORS.textMuted}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number*</Text>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your Num"
                placeholderTextColor={COLORS.textMuted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.whatsappButton}>
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.success} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Customer Address Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Address</Text>
          </View>

          {/* Address Line */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              placeholderTextColor={COLORS.textMuted}
              value={addressLine}
              onChangeText={setAddressLine}
              multiline
            />
          </View>

          {/* City */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your City"
              placeholderTextColor={COLORS.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Save Button */}
          <PrimaryButton
            title={loading ? "Saving..." : "Save"}
            loading={loading}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 50,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 50,
  },
  whatsappButton: {
    padding: 4,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  saveButton: {
    marginTop: 24,
  },
});

