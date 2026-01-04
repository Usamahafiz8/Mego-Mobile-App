import { StyleSheet, Text, View } from "react-native";
import { useColors, SPACING, TYPOGRAPHY } from "../styles/theme";

export default function SectionHeading({ title, subtitle, action }) {
  const COLORS = useColors();
  
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: COLORS.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize["2xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: 2,
  },
  actionContainer: {
    marginLeft: SPACING[3],
  },
});

