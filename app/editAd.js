import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import API from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, GRADIENTS, RADIUS, SHADOWS, TYPOGRAPHY } from "../src/styles/theme";
import { getImageUrl } from "../src/config/api";

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.78;

export default function EditAd() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAd, setLoadingAd] = useState(true);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState("category");

  const categories = [
    { key: "Mobiles", icon: "phone-portrait", color: COLORS.primary },
    { key: "Electronics", icon: "hardware-chip", color: COLORS.secondary },
    { key: "Vehicles", icon: "car-sport", color: COLORS.danger },
    { key: "Furniture", icon: "bed", color: COLORS.warning },
    { key: "Property", icon: "home", color: COLORS.success },
    { key: "Jobs", icon: "briefcase", color: COLORS.info },
    { key: "Services", icon: "construct", color: COLORS.accent },
  ];
  const conditions = [{ key: "New" }, { key: "Used" }];
  const types = [
    { key: "Sell", icon: "cash", color: COLORS.success },
    { key: "Rent", icon: "calendar", color: COLORS.primary },
    { key: "Exchange", icon: "swap-horizontal", color: COLORS.warning },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateProgressTo = useCallback(
    (s) => {
      Animated.timing(progressAnim, {
        toValue: s / 2,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim]
  );

  useEffect(() => animateProgressTo(step), [step, animateProgressTo]);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoadingAd(true);
        const res = await API.get(`/v1/Ads/${id}`);
        const data = res.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "");
        setLocation(data.location || "");
        setContact(data.contact || "");
        setCondition(data.condition || "New");
        setAdType(data.adType || "Sell");
        setNegotiable(Boolean(data.negotiable));

        const img =
          data.media?.length > 0
            ? getImageUrl(data.media[0].mediaUrl || data.media[0].filePath)
            : data.imageUrl
            ? getImageUrl(data.imageUrl)
            : null;
        if (img) setImage(img);
      } catch (err) {
        console.error("Error loading ad:", err);
        Alert.alert("Error", "Failed to load ad details.");
      } finally {
        setLoadingAd(false);
      }
    };
    if (id) loadAd();
  }, [id]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["33%", "100%"],
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const name = asset.fileName || asset.uri.split("/").pop() || "image.jpg";
        const ext = name.split(".").pop()?.toLowerCase();
        const type =
          ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        setImage({ uri: asset.uri, name, type, preview: asset.uri });
      }
    } catch {
      Alert.alert("Error", "Unable to open gallery.");
    }
  };

  const handleUpdate = async () => {
    if (!title || !price || !description || !category || !contact) {
      Alert.alert("⚠️ Required fields", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Description", description);
      formData.append("Price", price.toString());
      formData.append("Negotiable", negotiable ? "true" : "false");
      formData.append("Category", category);
      formData.append("Location", location);
      formData.append("Contact", contact);
      formData.append("Condition", condition);
      formData.append("AdType", adType);

      if (image && typeof image === "object") {
        formData.append("Image", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        });
      }

      await API.put(`/v1/Ads/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("✅ Success", "Ad updated successfully!");
      setTimeout(() => router.replace("/myAds"), 700);
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Update Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openSheet = (t) => {
    setSheetType(t);
    setIsSheetVisible(true);
  };

  const onSelectSheet = (val) => {
    if (sheetType === "category") setCategory(val);
    if (sheetType === "condition") setCondition(val);
    if (sheetType === "type") setAdType(val);
    setIsSheetVisible(false);
  };

  const renderStepContent = (index) => {
    switch (index) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Animatable.View animation="fadeInUp" delay={100}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => openSheet("category")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={GRADIENTS.cardGlow}
                  style={styles.dropdownGradient}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons
                      name="grid-outline"
                      size={20}
                      color={category ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        !category && styles.dropdownTextPlaceholder,
                      ]}
                    >
                      {category || "Select Category"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={150}>
              <Text style={styles.label}>
                Ad Type <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => openSheet("type")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={GRADIENTS.cardGlow}
                  style={styles.dropdownGradient}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={adType ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        !adType && styles.dropdownTextPlaceholder,
                      ]}
                    >
                      {adType || "Select Type"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200}>
              <Text style={styles.label}>
                Condition <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => openSheet("condition")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={GRADIENTS.cardGlow}
                  style={styles.dropdownGradient}
                >
                  <View style={styles.dropdownContent}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={condition ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        !condition && styles.dropdownTextPlaceholder,
                      ]}
                    >
                      {condition || "Select Condition"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={250}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Ionicons
                    name="swap-horizontal"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.switchLabel}>Price Negotiable</Text>
                </View>
                <Switch
                  value={negotiable}
                  onValueChange={setNegotiable}
                  trackColor={{
                    false: COLORS.cardElevated,
                    true: COLORS.primary + "80",
                  }}
                  thumbColor={negotiable ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </Animatable.View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Animatable.View animation="fadeInUp" delay={100}>
              <Text style={styles.label}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <LinearGradient colors={GRADIENTS.cardGlow} style={styles.inputWrapper}>
                <View style={styles.iconInput}>
                  <LinearGradient
                    colors={GRADIENTS.button}
                    style={styles.inputIconContainer}
                  >
                    <Ionicons name="text-outline" size={18} color="#fff" />
                  </LinearGradient>
                  <TextInput
                    style={styles.inputText}
                    placeholder="Update your ad title..."
                    placeholderTextColor={COLORS.textMuted}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </LinearGradient>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={150}>
              <Text style={styles.label}>
                Price (PKR) <Text style={styles.required}>*</Text>
              </Text>
              <LinearGradient colors={GRADIENTS.cardGlow} style={styles.inputWrapper}>
                <View style={styles.iconInput}>
                  <LinearGradient
                    colors={GRADIENTS.buttonSuccess}
                    style={styles.inputIconContainer}
                  >
                    <Ionicons name="pricetag" size={18} color="#fff" />
                  </LinearGradient>
                  <TextInput
                    style={styles.inputText}
                    keyboardType="numeric"
                    placeholder="e.g. 25000"
                    placeholderTextColor={COLORS.textMuted}
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </LinearGradient>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200}>
              <Text style={styles.label}>Location</Text>
              <LinearGradient colors={GRADIENTS.cardGlow} style={styles.inputWrapper}>
                <View style={styles.iconInput}>
                  <LinearGradient
                    colors={GRADIENTS.accentBlue}
                    style={styles.inputIconContainer}
                  >
                    <Ionicons name="location" size={18} color="#fff" />
                  </LinearGradient>
                  <TextInput
                    style={styles.inputText}
                    placeholder="City or Area"
                    placeholderTextColor={COLORS.textMuted}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </LinearGradient>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={250}>
              <Text style={styles.label}>
                Contact Info <Text style={styles.required}>*</Text>
              </Text>
              <LinearGradient colors={GRADIENTS.cardGlow} style={styles.inputWrapper}>
                <View style={styles.iconInput}>
                  <LinearGradient
                    colors={GRADIENTS.accentGreen}
                    style={styles.inputIconContainer}
                  >
                    <Ionicons name="call" size={18} color="#fff" />
                  </LinearGradient>
                  <TextInput
                    style={styles.inputText}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number or email"
                    placeholderTextColor={COLORS.textMuted}
                    value={contact}
                    onChangeText={setContact}
                  />
                </View>
              </LinearGradient>
            </Animatable.View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Animatable.View animation="fadeInUp" delay={100}>
              <Text style={styles.label}>Listing Image</Text>
              <TouchableOpacity
                style={styles.imageBox}
                onPress={pickImage}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={GRADIENTS.cardGlow}
                  style={styles.imageBoxGradient}
                >
                  {image ? (
                    <>
                      <Image
                        source={{ uri: typeof image === "string" ? image : image.preview }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        onPress={() => setImage(null)}
                        style={styles.removeImageBtn}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={GRADIENTS.danger}
                          style={styles.removeImageBtnGradient}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <LinearGradient
                        colors={GRADIENTS.button}
                        style={styles.imageIconContainer}
                      >
                        <Ionicons name="camera" size={28} color="#fff" />
                      </LinearGradient>
                      <Text style={styles.imageBoxText}>Tap to upload image</Text>
                      <Text style={styles.imageBoxSubtext}>
                        Recommended size 1200x800
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200}>
              <Text style={styles.label}>
                Description <Text style={styles.required}>*</Text>
              </Text>
              <LinearGradient colors={GRADIENTS.cardGlow} style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={6}
                  placeholder="Describe your product..."
                  placeholderTextColor={COLORS.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </LinearGradient>
            </Animatable.View>
          </View>
        );
    }
  };

  const steps = [
    { key: "step1", label: "Basic Info", icon: "information-circle" },
    { key: "step2", label: "Details", icon: "document-text" },
    { key: "step3", label: "Media", icon: "image" },
  ];

  if (loadingAd) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your ad…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.outerScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <LinearGradient
                  colors={GRADIENTS.button}
                  style={styles.headerBadge}
                >
                  <Ionicons name="create" size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.headerTitle}>Edit Your Ad</Text>
                <Text style={styles.headerSubtitle}>
                  Fine tune your listing for better conversions
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressWidth,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={GRADIENTS.button}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              </View>
              <View style={styles.progressSteps}>
                {steps.map((stepItem, index) => (
                  <View
                    key={stepItem.key}
                    style={[
                      styles.progressStep,
                      step >= index && styles.progressStepActive,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        step >= index ? GRADIENTS.button : GRADIENTS.cardElevated
                      }
                      style={styles.progressStepCircle}
                    >
                      <Ionicons
                        name={stepItem.icon}
                        size={16}
                        color={step >= index ? "#fff" : COLORS.textMuted}
                      />
                    </LinearGradient>
                    <Text
                      style={[
                        styles.progressStepLabel,
                        step >= index && styles.progressStepLabelActive,
                      ]}
                    >
                      {stepItem.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Steps */}
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.scrollContent}
            >
              {steps.map((stepItem, index) => (
                <View key={stepItem.key} style={styles.stepContainer}>
                  <View style={styles.cardWrapper}>
                    <LinearGradient
                      colors={GRADIENTS.cardGlow}
                      style={styles.cardGradient}
                    >
                      <Animatable.View
                        animation="fadeInUp"
                        duration={400}
                        style={styles.card}
                      >
                      <View style={styles.stepHeader}>
                        <LinearGradient
                          colors={GRADIENTS.button}
                          style={styles.stepNumberBadge}
                        >
                          <Text style={styles.stepNumber}>{index + 1}</Text>
                        </LinearGradient>
                        <Text style={styles.stepTitle}>{stepItem.label}</Text>
                      </View>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.stepScroll}
                        contentContainerStyle={styles.stepScrollContent}
                        keyboardShouldPersistTaps="handled"
                      >
                        {renderStepContent(index)}
                      </ScrollView>
                      </Animatable.View>
                    </LinearGradient>
                  </View>
                </View>
              ))}
            </ScrollView>
          </ScrollView>

          {/* Actions */}
          <View style={styles.btnRowWrapper}>
            <View style={styles.btnRow}>
              {step > 0 && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => {
                    const newStep = step - 1;
                    setStep(newStep);
                    scrollRef.current?.scrollTo({
                      x: width * newStep,
                      animated: true,
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={GRADIENTS.cardGlow}
                    style={styles.navBtnGradient}
                  >
                    <Ionicons name="arrow-back" size={18} color={COLORS.text} />
                    <Text style={styles.navBtnText}>Back</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {step < 2 ? (
                <TouchableOpacity
                  style={[styles.navBtn, styles.navBtnPrimary]}
                  onPress={() => {
                    const newStep = step + 1;
                    setStep(newStep);
                    scrollRef.current?.scrollTo({
                      x: width * newStep,
                      animated: true,
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={GRADIENTS.button}
                    style={styles.navBtnGradient}
                  >
                    <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>
                      Next
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navBtn, styles.navBtnPrimary]}
                  onPress={handleUpdate}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={GRADIENTS.buttonSuccess}
                    style={styles.navBtnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="save" size={18} color="#fff" />
                        <Text
                          style={[styles.navBtnText, styles.navBtnTextPrimary]}
                        >
                          Save Changes
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

        {/* Bottom Sheet */}
        <ModalSheet
          visible={isSheetVisible}
          sheetType={sheetType}
          onClose={() => setIsSheetVisible(false)}
          onSelect={onSelectSheet}
          categories={categories}
          conditions={conditions}
          types={types}
          category={category}
          condition={condition}
          adType={adType}
        />
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function ModalSheet({
  visible,
  sheetType,
  onClose,
  onSelect,
  categories,
  conditions,
  types,
  category,
  condition,
  adType,
}) {
  const data =
    sheetType === "category" ? categories : sheetType === "condition" ? conditions : types;

  const renderItem = ({ item }) => {
    const label = item.key || item;
    const iconName = item.icon;
    const itemColor = item.color || COLORS.primary;
    const selected =
      (sheetType === "category" && category === label) ||
      (sheetType === "condition" && condition === label) ||
      (sheetType === "type" && adType === label);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelect(label)}
        style={styles.sheetPill}
      >
        <LinearGradient
          colors={selected ? [itemColor, itemColor + "dd"] : GRADIENTS.cardGlow}
          style={styles.sheetPillGradient}
        >
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={selected ? "#fff" : COLORS.textMuted}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.sheetPillText,
              selected && styles.sheetPillTextActive,
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.5}
    >
      <Animatable.View animation="slideInUp" duration={250} style={styles.bottomSheet}>
        <LinearGradient
          colors={GRADIENTS.cardElevated}
          style={styles.bottomSheetGradient}
        >
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.sheetTitle}>
              {sheetType === "category"
                ? "Select Category"
                : sheetType === "condition"
                ? "Select Condition"
                : "Select Type"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeSheetBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
            keyExtractor={(i) => i.key || i}
            renderItem={renderItem}
          />
        </LinearGradient>
      </Animatable.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 16,
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  backButtonGradient: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...SHADOWS.lg,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.cardElevated,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: RADIUS.full,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressStepCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    ...SHADOWS.sm,
  },
  progressStepLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
  },
  progressStepLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    width: width,
    minHeight: CARD_HEIGHT + 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  cardWrapper: {
    width: width - 32,
    maxWidth: width - 32,
    borderRadius: RADIUS.xl,
    padding: 3,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: COLORS.primary + "40",
    backgroundColor: COLORS.card,
    ...SHADOWS.none,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: RADIUS.xl - 3,
    padding: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl - 5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 24,
    minHeight: CARD_HEIGHT,
    maxHeight: CARD_HEIGHT,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  stepNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  stepNumber: {
    ...TYPOGRAPHY.h3,
    color: "#fff",
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  stepContent: {
    gap: 16,
  },
  stepScroll: {
    flex: 1,
  },
  stepScrollContent: {
    paddingBottom: 16,
    gap: 16,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  required: {
    color: COLORS.danger,
  },
  dropdownBox: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  dropdownGradient: {
    padding: 2,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardGlass,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  dropdownText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 15,
  },
  dropdownTextPlaceholder: {
    color: COLORS.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  iconInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  inputText: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 15,
  },
  imageBox: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  imageBoxGradient: {
    padding: 2,
    borderRadius: RADIUS.lg,
  },
  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: RADIUS.lg - 2,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  imageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...SHADOWS.lg,
  },
  imageBoxText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  imageBoxSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  removeImageBtnGradient: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  textAreaWrapper: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  textArea: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    padding: 16,
    minHeight: 140,
    fontSize: 15,
  },
  btnRowWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  navBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  navBtnPrimary: {
    flex: 1.5,
  },
  navBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  navBtnText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  navBtnTextPrimary: {
    color: "#fff",
    fontWeight: "700",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  bottomSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: "hidden",
    maxHeight: height * 0.4,
  },
  bottomSheetGradient: {
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  bottomSheetHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted,
    borderRadius: RADIUS.full,
    marginBottom: 12,
    opacity: 0.5,
  },
  sheetTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: "center",
  },
  closeSheetBtn: {
    position: "absolute",
    right: 20,
    top: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  sheetPill: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  sheetPillGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sheetPillText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sheetPillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
});
