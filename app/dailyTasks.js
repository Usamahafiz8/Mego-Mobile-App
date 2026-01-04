import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { completeTask, getLoyaltyTasks } from "../src/api/api";
import ScreenContainer from "../src/components/ScreenContainer";
import GlassCard from "../src/components/GlassCard";
import SectionHeading from "../src/components/SectionHeading";
import PrimaryButton from "../src/components/PrimaryButton";
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from "../src/styles/theme";

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLoyaltyTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error("Tasks fetch error", err?.response?.data || err.message);
      Alert.alert("Error", "Unable to load tasks right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCompleteTask = async (task) => {
    if (task.completed) return;
    try {
      setCompleting(task.taskType);
      await completeTask({ taskType: task.taskType, points: task.points });
      Alert.alert("✅ Done", `${task.title} completed! +${task.points} points`);
      fetchTasks();
    } catch (err) {
      Alert.alert("Info", err.response?.data?.message || "Task already completed today.");
    } finally {
      setCompleting(null);
    }
  };

  const renderTask = ({ item }) => {
    const disabled = item.completed || completing === item.taskType;
    return (
      <GlassCard style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <LinearGradient colors={GRADIENTS.info} style={styles.taskIcon}>
              <Ionicons name="checkbox" size={18} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDesc}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.pointsPill}>
            <Ionicons name="star" size={14} color="#facc15" />
            <Text style={styles.pointsText}>+{item.points}</Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <Text style={styles.frequency}>{item.frequency.toUpperCase()}</Text>
          <PrimaryButton
            title={item.completed ? "Completed" : "Complete"}
            disabled={disabled}
            loading={completing === item.taskType}
            onPress={() => handleCompleteTask(item)}
            style={{ flex: 0.5 }}
          />
        </View>
      </GlassCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 120 : 120, gap: 20 }}
    >
      <SectionHeading title="Daily & Weekly Tasks" subtitle="Earn bonus points every day" />
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.taskType}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTasks();
            }}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  taskCard: {
    padding: 18,
    gap: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  taskTitleRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  taskTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  taskDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardAlt,
  },
  pointsText: {
    color: "#facc15",
    fontWeight: "700",
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  frequency: {
    color: COLORS.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
});
