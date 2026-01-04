import { LinearGradient } from "expo-linear-gradient";
import { Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors, useGradients } from "../styles/theme";

export default function ScreenContainer({
  children,
  scrollable = true,
  contentContainerStyle,
  edges = ["top", "left", "right"],
  refreshControl,
  onRefresh,
  refreshing = false,
}) {
  const COLORS = useColors();
  const GRADIENTS = useGradients();
  
  const Wrapper = scrollable ? ScrollView : View;
  const wrapperProps = scrollable
    ? {
        contentContainerStyle: [
          styles.content,
          contentContainerStyle,
          { 
            paddingBottom: Platform.OS === "ios" ? 120 : 100,
            flexGrow: 1,
          },
        ],
        showsVerticalScrollIndicator: false,
        refreshControl: refreshControl || (onRefresh ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        ) : undefined),
      }
    : { style: [styles.content, contentContainerStyle] };

  return (
    <LinearGradient colors={GRADIENTS.screen} style={[styles.gradient, { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle={COLORS.background === "#0f172a" ? "light-content" : "dark-content"} backgroundColor={COLORS.background} translucent={Platform.OS === "android"} />
      <SafeAreaView style={styles.safe} edges={edges}>
        <Wrapper {...wrapperProps}>{children}</Wrapper>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : Platform.OS === "android" ? 12 : 8,
  },
});

