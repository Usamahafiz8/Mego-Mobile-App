import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

// Conditionally import maps only for native platforms (not web)
let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    // Maps not available - will use placeholder
  }
}

export default function ChooseLocation() {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 31.5204, 
    longitude: 74.3587,
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const mapRef = useRef(null);

  const searchLocation = async () => {
  if (!query) return;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
      {
        headers: {
          "User-Agent": "mego-app/1.0", 
          "Accept-Language": "en",
        },
      }
    );
    const data = await res.json();
    setResults(data);
  } catch (err) {
    console.error("Search error:", err);
  }
};

  const selectLocation = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setSelectedLocation({ latitude: lat, longitude: lon });

    if (Platform.OS !== 'web' && mapRef.current && mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    setResults([]); 
    setQuery(item.display_name);
  };

  const handleConfirm = async () => {
    try {
      // Save location to AsyncStorage
      await AsyncStorage.setItem("userLocation", query || "Lahore");
      await AsyncStorage.setItem("userLocationLat", selectedLocation.latitude.toString());
      await AsyncStorage.setItem("userLocationLng", selectedLocation.longitude.toString());
      router.back();
    } catch (e) {
      console.log("Save location error:", e);
      router.back();
    }
  };

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
          <Text style={styles.headerText}>Choose Location</Text>
          <Text style={styles.headerSubtitle}>Select your location on the map</Text>
        </View>
      </View>

      {/* Enhanced Search Box */}
      <GlassCard style={styles.searchBox}>
        <View style={styles.searchInputContainer}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color="#fff" />
          </LinearGradient>
          <TextInput
            style={styles.input}
            placeholder="Search location..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchLocation}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={searchLocation} style={styles.searchButton}>
            <LinearGradient colors={GRADIENTS.success} style={styles.searchButtonGradient}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {results.length > 0 && (
          <GlassCard style={styles.resultsContainer}>
            <FlatList
              data={results}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => selectLocation(item)}>
                  <Ionicons name="location" size={18} color={COLORS.primary} />
                  <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          </GlassCard>
        )}
      </GlassCard>

      <GlassCard style={styles.mapCard}>
        {Platform.OS === 'web' || !MapView ? (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Map view available on mobile devices</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Selected: {query || "Lahore, Pakistan"}
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          >
            {Marker && (
              <Marker coordinate={selectedLocation} title="Selected Location" />
            )}
          </MapView>
        )}
      </GlassCard>

      <TouchableOpacity onPress={handleConfirm} style={styles.button}>
        <LinearGradient colors={GRADIENTS.success} style={styles.buttonGradient}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Confirm Location</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  headerText: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted },
  searchBox: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    zIndex: 2,
    ...SHADOWS.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: { padding: 4 },
  searchButton: {},
  searchButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsContainer: {
    marginTop: 12,
    maxHeight: 200,
    ...SHADOWS.sm,
  },
  resultsList: { maxHeight: 200 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  resultText: { flex: 1, color: COLORS.text, fontSize: 14 },
  mapCard: {
    margin: 16,
    marginTop: 0,
    padding: 0,
    overflow: "hidden",
    height: 300,
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: RADIUS.md,
  },
  mapPlaceholder: {
    width: "100%",
    height: 300,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 20,
  },
  mapPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  mapPlaceholderSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  button: {
    margin: 16,
    marginBottom: Platform.OS === "ios" ? 100 : 20,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: RADIUS.lg,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
