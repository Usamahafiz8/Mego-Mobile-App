import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  const slides = [
    {
      title: "Welcome to MEGO",
      desc: "Pakistan’s trusted marketplace to buy and sell with confidence.",
      image: require("../assets/images/shop.gif"),
    },
    {
      title: "Shop Smarter",
      desc: "Discover products faster with a smooth and modern experience.",
      image: require("../assets/images/search.gif"),
    },
    {
      title: "Earn Rewards",
      desc: "Get points, rewards, and referrals on every transaction.",
      image: require("../assets/images/reward1.jpg"),
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.top} />
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                index === i && { width: 24, opacity: 1 },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() =>
              index === 2 ? router.replace("/login") : null
            }
          >
            <Text style={styles.nextText}>
              {index === 2 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  slide: { alignItems: "center" },
  top: {
    height: height * 0.25,
    width: "100%",
    backgroundColor: "#FFD700",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  image: {
    width: width * 0.75,
    height: height * 0.3,
    resizeMode: "contain",
    marginTop: -40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0A5ED7",
    marginTop: 20,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 10,
    lineHeight: 22,
  },
  bottom: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    width: "100%",
    paddingHorizontal: 24,
  },
  dots: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#0A5ED7",
    opacity: 0.3,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skip: {
    fontSize: 14,
    color: "#0A5ED7",
    fontWeight: "500",
  },
  nextBtn: {
    backgroundColor: "#0A5ED7",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
