import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "../src/context/ThemeContext";
import { WalletProvider } from "../src/context/WalletContext";
import { LanguageProvider } from "../src/context/LanguageContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <WalletProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast />
          </GestureHandlerRootView>
        </WalletProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
