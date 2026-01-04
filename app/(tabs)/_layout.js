import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS, RADIUS } from "../../src/styles/theme";

export default function UserTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: Platform.OS === "ios" ? 2 : 4,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === "ios" ? 2 : 4,
        },
        tabBarBackground: () => (
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.card }} />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={focused ? 26 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="postAd"
        options={{
          title: "Post Ad",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name={focused ? "add-circle" : "add-circle-outline"} 
                size={focused ? 26 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name={focused ? "chatbubbles" : "chatbubble-outline"} 
                size={focused ? 26 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name={focused ? "wallet" : "wallet-outline"} 
                size={focused ? 26 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={focused ? 26 : size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    alignItems: "center",
    justifyContent: "center",
  },
});