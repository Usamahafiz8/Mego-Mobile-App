import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";
import API, { getMyPoints } from "../../src/api/api";
import ScreenContainer from "../../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../../src/styles/theme";
import { useLanguage } from "../../src/context/LanguageContext";
import { Picker } from "@react-native-picker/picker";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.78;

export default function PostAd() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const scrollRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [condition, setCondition] = useState("New");
  const [adType, setAdType] = useState("Sell");
  const [images, setImages] = useState([]);
  const [voiceRecording, setVoiceRecording] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState("category");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await API.get("/Categories");
      setCategories(res.data || []);
    } catch (e) {
      console.log("Load categories error:", e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 2],
    outputRange: ["33%", "100%"],
  });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((p) =>
        p.concat(
          result.assets.map((a) => ({
            uri: a.uri,
            name: a.fileName || "image.jpg",
            type: "image/jpeg",
          }))
        )
      );
    }
  };

  const startRecording = async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== "granted") return;
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    setVoiceRecording({
      uri: recording.getURI(),
      name: "voice.m4a",
      type: "audio/m4a",
    });
    setRecording(null);
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || !category || !contact) {
      Alert.alert("Missing fields", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("Title", title);
      fd.append("Description", description);
      fd.append("Price", price);
      fd.append("Category", category);
      fd.append("Contact", contact);
      fd.append("Condition", condition);
      fd.append("AdType", adType);
      fd.append("Negotiable", negotiable);

      images.forEach((img) => fd.append("Image", img));
      if (voiceRecording) fd.append("VoiceDescription", voiceRecording);

      const res = await API.post("/Ads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getMyPoints();
      
      // Show success modal (Figma design)
      setShowSuccessModal(true);
      
      // After success modal, show featured modal
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowFeaturedModal(true);
      }, 3000);
    } catch (e) {
      Alert.alert("Error", "Failed to post ad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Ionicons name="add-circle" size={22} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Post New Ad</Text>
            <Text style={styles.headerSubtitle}>3 easy steps</Text>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>

          {/* FORM */}
          <ScrollView ref={scrollRef} horizontal pagingEnabled scrollEnabled={false}>
            {/* Step 1: Basic Info */}
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Step 1: Basic Information</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ad Title *" 
                value={title} 
                onChangeText={setTitle}
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Price (PKR) *" 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice}
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Category *</Text>
                {loadingCategories ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={category}
                      onValueChange={setCategory}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Category" value="" />
                      {categories.map(cat => (
                        <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.nextBtn, (!title || !price || !category) && styles.nextBtnDisabled]} 
                onPress={() => {
                  if (title && price && category) setStep(1);
                }}
                disabled={!title || !price || !category}
              >
                <Text style={styles.btnText}>Next</Text>
              </TouchableOpacity>
            </View>

            {/* Step 2: Details */}
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Step 2: Details</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Description *" 
                multiline 
                numberOfLines={5}
                value={description} 
                onChangeText={setDescription}
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Condition</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={condition}
                    onValueChange={setCondition}
                    style={styles.picker}
                  >
                    <Picker.Item label="New" value="New" />
                    <Picker.Item label="Like New" value="Like New" />
                    <Picker.Item label="Good" value="Good" />
                    <Picker.Item label="Fair" value="Fair" />
                    <Picker.Item label="Poor" value="Poor" />
                  </Picker>
                </View>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="Location" 
                value={location} 
                onChangeText={setLocation}
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Contact Number" 
                keyboardType="phone-pad"
                value={contact} 
                onChangeText={setContact}
                placeholderTextColor={COLORS.textMuted}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Price is negotiable</Text>
                <Switch
                  value={negotiable}
                  onValueChange={setNegotiable}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(0)}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.nextBtn, !description && styles.nextBtnDisabled]} 
                  onPress={() => {
                    if (description) setStep(2);
                  }}
                  disabled={!description}
                >
                  <Text style={styles.btnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 3: Images & Voice */}
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Step 3: Images & Voice</Text>
              
              {/* Image Upload */}
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
                <Ionicons name="image" size={24} color="#fff" />
                <Text style={styles.btnText}>Upload Images</Text>
              </TouchableOpacity>
              {images.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((img, idx) => (
                      <View key={idx} style={styles.imagePreview}>
                        <Image source={{ uri: img.uri }} style={styles.previewImage} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => setImages(images.filter((_, i) => i !== idx))}
                        >
                          <Ionicons name="close-circle" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Voice Recording */}
              {!isRecording ? (
                <TouchableOpacity style={styles.voiceBtn} onPress={startRecording}>
                  <Ionicons name="mic" size={24} color="#fff" />
                  <Text style={styles.btnText}>Record Voice Description</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                  <Ionicons name="stop" size={24} color="#fff" />
                  <Text style={styles.btnText}>Stop Recording</Text>
                </TouchableOpacity>
              )}
              {voiceRecording && (
                <View style={styles.voicePreview}>
                  <Ionicons name="musical-notes" size={20} color={COLORS.primary} />
                  <Text style={styles.voicePreviewText}>Voice recorded</Text>
                  <TouchableOpacity onPress={() => setVoiceRecording(null)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitBtn, (loading || images.length === 0) && styles.nextBtnDisabled]} 
                  onPress={handleSubmit}
                  disabled={loading || images.length === 0}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Post Ad</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Success Modal - Figma Design */}
      <Modal
        isVisible={showSuccessModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
        onBackdropPress={() => setShowSuccessModal(false)}
        style={styles.modal}
      >
        <View style={styles.successModal}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Ad Posted Successful!</Text>
          <Text style={styles.successMessage}>
            Please wait. You will be directed to the homepage soon.
          </Text>
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.successLoader} />
        </View>
      </Modal>

      {/* Featured Function Modal - Figma Design */}
      <Modal
        isVisible={showFeaturedModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onBackdropPress={() => setShowFeaturedModal(false)}
        style={styles.modal}
      >
        <View style={styles.featuredModal}>
          <View style={styles.featuredIconContainer}>
            <Ionicons name="flash" size={48} color="#fff" />
          </View>
          <Text style={styles.featuredTitle}>Do You Want To Sell Your Item Fast?</Text>
          <Text style={styles.featuredMessage}>
            Choose our featured function to sell your item in just hours
          </Text>
          <View style={styles.featuredButtons}>
            <TouchableOpacity
              style={styles.featuredYesBtn}
              onPress={async () => {
                setShowFeaturedModal(false);
                // TODO: Navigate to boost/featured ad upgrade screen
                Alert.alert("Featured Ad", "Featured ad upgrade feature coming soon!");
                router.replace("/(tabs)/dashboard");
              }}
            >
              <Text style={styles.featuredYesText}>Yes! I Want</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featuredNoBtn}
              onPress={() => {
                setShowFeaturedModal(false);
                router.replace("/(tabs)/dashboard");
              }}
            >
              <Text style={styles.featuredNoText}>No! Don't Want</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  headerBadge: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: COLORS.textMuted },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.cardElevated,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.primary,
  },
  step: {
    width,
    padding: 16,
    gap: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
  },
  voicePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  voicePreviewText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  voiceBtn: {
    backgroundColor: COLORS.success,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  stopBtn: {
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  successModal: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 32,
    alignItems: "center",
    width: width * 0.85,
    ...SHADOWS.xl,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  successLoader: {
    marginTop: 8,
  },
  featuredModal: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 32,
    alignItems: "center",
    width: width * 0.85,
    ...SHADOWS.xl,
  },
  featuredIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  featuredMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  featuredButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  featuredYesBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  featuredYesText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  featuredNoBtn: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredNoText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
