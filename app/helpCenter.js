import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenContainer from "../src/components/ScreenContainer";
import { COLORS, RADIUS, SHADOWS } from "../src/styles/theme";

const helpCategories = [
  {
    id: 1,
    title: "Important Updates",
    description: "All important details regarding Mego pakistan App Upgradation",
  },
  {
    id: 2,
    title: "Safety",
    description: "All safety measures for our valuable customers' convenience, are to be found",
  },
  {
    id: 3,
    title: "Legal & Privacy Information",
    description: "There is some Legal & Privacy information for our valued customer",
  },
  {
    id: 4,
    title: "Featured Ads & Packages",
    description: "Featured Ads and Business Packages for customers' ease and convenience over",
  },
  {
    id: 5,
    title: "Free Ads Limit",
    description: "There is a description for the guidance of customer about free Ad limitations",
  },
  {
    id: 6,
    title: "Payment & Invoices",
    description: "Payment methods, Billing details, & General information",
  },
  {
    id: 7,
    title: "Chat",
    description: "A convenient way for our valued customers to communicate",
  },
  {
    id: 8,
    title: "About Us",
    description: "Learn more about MEGO and our mission",
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = helpCategories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>MEGO Help Center</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>How can we help you?</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Help Categories */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => {
              // Navigate to category detail
              router.push({
                pathname: "/help",
                params: { category: category.title },
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {category.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Help</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Terms of use</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Safety Tips</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Contact Us</Text>
        </TouchableOpacity>
        <Text style={styles.footerSeparator}>•</Text>
        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Sell</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.copyright}>
        Mego Free classifieds in pakistan - Copyright 2022 to 2024 Mego
      </Text>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 32,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.primary,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexWrap: "wrap",
    gap: 8,
  },
  footerLink: {
    paddingHorizontal: 4,
  },
  footerLinkText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  footerSeparator: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  copyright: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
  },
});



