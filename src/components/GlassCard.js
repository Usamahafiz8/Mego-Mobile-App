import { StyleSheet, View } from "react-native";
import { useColors, RADIUS, SHADOWS } from "../styles/theme";

export default function GlassCard({ children, style, innerStyle }) {
  const COLORS = useColors();
  
  return (
    <View style={[styles.card, { borderColor: COLORS.border, backgroundColor: COLORS.card }, style]}>
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  inner: {
    padding: 0, // Let parent control padding
  },
});

