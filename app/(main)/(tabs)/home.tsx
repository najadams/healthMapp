import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import {
  fetchMoodEntries,
  fetchActivityHistory,
  fetchMoodTrends,
} from "@/utils/api";
import { MoodEntry, ActivityLog, MoodTrend } from "@/types";

interface MoodOption {
  id: string;
  label: string;
  icon: string;
}

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

const moodOptions: MoodOption[] = [
  { id: "great", label: "Great", icon: "happy-outline" },
  { id: "good", label: "Good", icon: "happy" },
  { id: "okay", label: "Okay", icon: "sad-outline" },
  { id: "bad", label: "Bad", icon: "sad-outline" },
  { id: "bad", label: "Awful", icon: "sad" }, // This has the same id as the previous option
];

export default function HomeScreen() {
  const user = useUser();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [moodTrends, setMoodTrends] = useState<Record<string, MoodTrend>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get today's date range for mood trends
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const [entries, activities, trends] = await Promise.all([
        fetchMoodEntries(startDate, endDate),
        fetchActivityHistory(startDate, endDate),
        fetchMoodTrends(startDate, endDate), // Re-enable this and pass the dates
      ]);

      setMoodEntries(entries.data);
      setActivityLogs(activities.data.slice(0, 5));
      setMoodTrends(trends)

      console.log(moodEntries)
    } catch (err) {
      setError("Failed to load data. Please try again later.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
     setRefreshing(true);
     await fetchData();
   };


  const QuickAction = ({ icon, title, onPress }: QuickActionProps) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#666" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  if (error) {
    console.log(error)
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/(main)/(tabs)/home")}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}
      refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={["#007AFF"]}
        progressBackgroundColor="#f5f5f5"
        />}
    >
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {!selectedMood && (
          <View style={styles.moodSection}>
            <Text style={styles.moodQuestion}>How are you feeling?</Text>
            <View style={styles.moodOptions}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.id && styles.selectedMood,
                  ]}
                  onPress={async () => {
                    setSelectedMood(mood.id);
                    try {
                      // Record mood in database
                      await fetch('/api/mood', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          moodId: mood.id,
                          timestamp: new Date().toISOString()
                        })
                      });
                    } catch (error) {
                      console.error('Failed to save mood:', error);
                      // Optionally show error to user
                    }
                  }}>
                  <Ionicons
                    name={mood.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={selectedMood === mood.id ? "#007AFF" : "#666"}
                  />
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  icon="document-text-outline"
                  title="Log Symptoms"
                  onPress={() => router.push("/log-symptoms")}
                />
                <QuickAction
                  icon="journal-outline"
                  title="Journal Entry"
                  onPress={() => router.push("/journal-entry")}
                />
                <QuickAction
                  icon="library-outline"
                  title="Resources"
                  onPress={() => router.push("/resources")}
                />
                <QuickAction
                  icon="fitness-outline"
                  title="Activity Entry"
                  onPress={() => router.push("/activity-entry")}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Progress</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Mood Logs</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${(moodEntries.length / 5) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressCount}>{moodEntries.length}/5</Text>
              </View>

              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Activity Logs</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${(activityLogs.length / 5) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressCount}>
                  {activityLogs.length}/5
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              {Array.isArray(activityLogs) && activityLogs.length > 0 ? (
                activityLogs.slice(0, 5).map((activity) => (
                  <View key={activity._id} style={styles.upcomingItem}>
                    <Ionicons name="fitness-outline" size={24} color="#666" />
                    <View style={styles.upcomingContent}>
                      <Text style={styles.upcomingTitle}>
                        {activity.activityType}
                      </Text>
                      <Text style={styles.upcomingDetails}>
                        {activity.duration} minutes
                      </Text>
                    </View>
                    <Text style={styles.upcomingTime}>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.upcomingDetails}>No recent activities</Text>
              )}
            </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  moodSection: {
    marginBottom: 24,
  },
  moodQuestion: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodButton: {
    alignItems: "center",
    padding: 12,
  },
  selectedMood: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
  },
  moodLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  viewAll: {
    color: "#007AFF",
    fontSize: 14,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  progressBarContainer: {
    flex: 2,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginHorizontal: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  progressCount: {
    fontSize: 14,
    color: "#666",
    width: 40,
    textAlign: "right",
  },
  upcomingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  upcomingContent: {
    flex: 1,
    marginLeft: 12,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  upcomingDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  upcomingTime: {
    fontSize: 14,
    color: "#007AFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  newUserSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  newUserTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  newUserText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  getStartedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
