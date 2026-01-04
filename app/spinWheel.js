import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Alert, Animated, Dimensions, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spinWheelApi } from "../src/api/api";
import { useWallet } from "../src/context/WalletContext";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(SCREEN_W * 0.8, 320);
const CENTER_SIZE = 80;
const SLICE_COUNT = 8;

// Enhanced slices with better colors and icons
const slices = [
  { label: "+10", subLabel: "Points", color: "#2563eb", icon: "star", gradient: ["#2563eb", "#1e40af"] },
  { label: "+25", subLabel: "Points", color: "#38bdf8", icon: "star", gradient: ["#38bdf8", "#0284c7"] },
  { label: "+50", subLabel: "Points", color: "#60a5fa", icon: "star", gradient: ["#60a5fa", "#3b82f6"] },
  { label: "+1", subLabel: "Boost", color: "#22c55e", icon: "flash", gradient: ["#22c55e", "#16a34a"] },
  { label: "+100", subLabel: "Points", color: "#a855f7", icon: "trophy", gradient: ["#a855f7", "#9333ea"] },
  { label: "+1", subLabel: "Coin", color: "#facc15", icon: "diamond", gradient: ["#facc15", "#eab308"] },
  { label: "+75", subLabel: "Points", color: "#fb923c", icon: "gift", gradient: ["#fb923c", "#f97316"] },
  { label: "Try", subLabel: "Again", color: "#ef4444", icon: "refresh", gradient: ["#ef4444", "#dc2626"] },
];

export default function SpinWheel() {
  const { fetchPoints } = useWallet();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [highlightSlice, setHighlightSlice] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.5)).current;

  // Pulse animation for center button
  useEffect(() => {
    if (!spinning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [spinning]);

  // Glow opacity animation (using native driver for opacity)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacityAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, // Changed to true - opacity can use native driver
        }),
        Animated.timing(glowOpacityAnim, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, // Changed to true
        }),
      ])
    ).start();
  }, []);

  const spinWheel = async () => {
    if (spinning) return;
    setSpinning(true);
    setHighlightSlice(null);
    setLastResult(null);

    try {
      const res = await spinWheelApi();
      const prize = res.data?.prize || "Points";
      const value = res.data?.value || 0;

      // Find matching slice index based on prize
      let targetIndex = 0;
      if (value > 0) {
        const valueStr = value.toString();
        targetIndex = slices.findIndex(
          (s) => s.label.includes(valueStr) || (value >= 10 && value < 25 && s.label === "+10") ||
                (value >= 25 && value < 50 && s.label === "+25") ||
                (value >= 50 && value < 75 && s.label === "+50") ||
                (value >= 75 && value < 100 && s.label === "+75") ||
                (value >= 100 && s.label === "+100")
        );
        if (targetIndex === -1) targetIndex = Math.floor(Math.random() * (SLICE_COUNT - 1));
      } else {
        targetIndex = SLICE_COUNT - 1; // "Try Again"
      }

      setHighlightSlice(targetIndex);

      // Calculate spin: multiple rotations + stop at target
      const fullRotations = 5 + Math.random() * 3; // 5-8 rotations
      const sliceAngle = 360 / SLICE_COUNT;
      const targetAngle = targetIndex * sliceAngle;
      const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6); // Random position within slice
      const finalAngle = fullRotations * 360 + (360 - targetAngle) + randomOffset;

      Animated.timing(spinAnim, {
        toValue: finalAngle,
        duration: 4000 + Math.random() * 1000, // 4-5 seconds
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(async () => {
        setSpinning(false);
        setLastResult({ prize, value });
        
        // Show result alert
        setTimeout(() => {
          Alert.alert(
            value > 0 ? "🎉 Congratulations!" : "😔 Better Luck Next Time!",
            value > 0 
              ? `You won ${value} ${prize}!` 
              : "Don't worry, you can try again!",
            [
              { text: "OK", style: "default" },
              { text: "Spin Again", onPress: () => spinWheel(), style: "default" },
            ]
          );
        }, 500);
        
        await fetchPoints();
      });
    } catch (err) {
      console.error("Spin error:", err);
      console.error("Spin error:", err.response?.data || err.message);
      setSpinning(false);
    }
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const glowOpacity = glowOpacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <ScreenContainer scrollable={false}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>🎡 Spin & Win</Text>
          <Text style={styles.headerSubtitle}>Try your luck and win amazing rewards!</Text>
        </View>
      </View>

      <View style={styles.wheelWrapper}>
        {/* Outer Glow Effect */}
        <Animated.View
          style={[
            styles.outerGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Highlighted Slice Glow */}
        {highlightSlice !== null && (
          <Animated.View
            style={[
              styles.glowCircle,
              {
                borderColor: slices[highlightSlice].color,
                shadowColor: slices[highlightSlice].color,
                opacity: spinning ? 0.8 : 0.4,
              },
            ]}
          />
        )}

        {/* Main Wheel */}
        <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
          {slices.map((slice, index) => {
            const sliceAngle = 360 / SLICE_COUNT;
            const rotateDeg = index * sliceAngle;
            const isHighlighted = highlightSlice === index && spinning;

            return (
              <View
                key={`slice-${index}`}
                style={[
                  styles.sliceContainer,
                  {
                    transform: [
                      { translateX: WHEEL_SIZE / 2 },
                      { translateY: WHEEL_SIZE / 2 },
                      { rotate: `${rotateDeg}deg` },
                      { translateX: -WHEEL_SIZE / 4 },
                      { translateY: -WHEEL_SIZE / 4 },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={isHighlighted ? [slice.gradient[0], slice.gradient[1], slice.gradient[0]] : slice.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.slice,
                    isHighlighted && styles.sliceHighlighted,
                  ]}
                >
                  <View style={styles.sliceContent}>
                    <Ionicons
                      name={slice.icon}
                      size={isHighlighted ? 20 : 16}
                      color="#fff"
                      style={styles.sliceIcon}
                    />
                    <Text
                      style={[
                        styles.sliceLabel,
                        isHighlighted && styles.sliceLabelHighlighted,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {slice.label}
                    </Text>
                    <Text
                      style={[
                        styles.sliceSubLabel,
                        isHighlighted && styles.sliceSubLabelHighlighted,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {slice.subLabel}
                    </Text>
                  </View>
                </LinearGradient>
                {/* Slice divider */}
                <View style={styles.sliceDivider} />
              </View>
            );
          })}
        </Animated.View>

        {/* Center Circle */}
        <View style={styles.centerCircle}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.centerGradient}>
            <Ionicons name="diamond" size={32} color="#fff" />
          </LinearGradient>
        </View>

        {/* Pointer/Indicator */}
        <View style={styles.pointerContainer}>
          <LinearGradient colors={GRADIENTS.warning} style={styles.pointerGradient}>
            <View style={styles.pointerTriangle} />
            <Ionicons name="caret-up" size={24} color="#fff" style={styles.pointerIcon} />
          </LinearGradient>
        </View>
      </View>

      {/* Last Result Display */}
      {lastResult && !spinning && (
        <View style={styles.resultCard}>
          <LinearGradient colors={GRADIENTS.success} style={styles.resultGradient}>
            <Ionicons name="trophy" size={24} color="#fff" />
            <Text style={styles.resultText}>
              {lastResult.value > 0 
                ? `You won ${lastResult.value} ${lastResult.prize}!` 
                : "Better luck next time!"}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Spin Button */}
      <TouchableOpacity
        onPress={spinWheel}
        disabled={spinning}
        activeOpacity={0.8}
        style={styles.button}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={spinning ? ["#64748b", "#475569"] : GRADIENTS.success}
            style={styles.buttonGradient}
          >
            {spinning ? (
              <>
                <Animated.View
                  style={[
                    styles.spinner,
                    {
                      transform: [
                        {
                          rotate: spinAnim.interpolate({
                            inputRange: [0, 360],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Text style={styles.buttonText}>Spinning...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.buttonText}>Spin Now</Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          💡 Tap the spin button to try your luck and win rewards!
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: { marginRight: 12 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: COLORS.text, 
    marginBottom: 2 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: COLORS.muted 
  },
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    position: "relative",
    height: WHEEL_SIZE + 100,
  },
  outerGlow: {
    position: "absolute",
    width: WHEEL_SIZE + 60,
    height: WHEEL_SIZE + 60,
    borderRadius: (WHEEL_SIZE + 60) / 2,
    backgroundColor: COLORS.primary,
    ...SHADOWS.glow,
  },
  glowCircle: {
    position: "absolute",
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    borderRadius: (WHEEL_SIZE + 40) / 2,
    borderWidth: 6,
    shadowOpacity: 0.8,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 8,
    borderColor: COLORS.primary,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    ...SHADOWS.xl,
    elevation: 15,
  },
  sliceContainer: {
    position: "absolute",
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    left: 0,
    top: 0,
    overflow: "hidden",
  },
  slice: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: WHEEL_SIZE / 2,
    borderBottomRightRadius: WHEEL_SIZE / 2,
  },
  sliceHighlighted: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  sliceContent: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }],
    marginTop: 10,
  },
  sliceIcon: {
    marginBottom: 4,
    ...SHADOWS.sm,
  },
  sliceLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sliceLabelHighlighted: {
    fontSize: 18,
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  sliceSubLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sliceSubLabelHighlighted: {
    fontSize: 11,
    color: "#fff",
  },
  sliceDivider: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  centerCircle: {
    position: "absolute",
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    zIndex: 10,
    ...SHADOWS.lg,
    elevation: 20,
  },
  centerGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pointerContainer: {
    position: "absolute",
    top: -20,
    zIndex: 20,
    alignItems: "center",
  },
  pointerGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
    elevation: 15,
  },
  pointerTriangle: {
    position: "absolute",
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#f59e0b",
  },
  pointerIcon: {
    marginTop: -4,
  },
  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  resultGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  resultText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 100 : 20,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.lg,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: RADIUS.lg,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
    borderTopColor: "transparent",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  instructions: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
