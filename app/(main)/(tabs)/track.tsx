import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchMoodTrends,
  fetchActivityHistory,
  fetchJournalEntries,
} from "@/utils/api";
import { format } from "date-fns";
import { LineChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";

export default function TrackScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moodTrends, setMoodTrends] = useState(null);
  const [activities, setActivities] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("week"); // "week", "month", "year"

  const fetchData = useCallback(async () => {
    try {
      setError("");

      // Get dates based on selected time range
      const endDate = new Date().toISOString();
      let startDate;

      if (timeRange === "week") {
        startDate = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
      } else if (timeRange === "month") {
        startDate = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
      } else {
        startDate = new Date(
          Date.now() - 365 * 24 * 60 * 60 * 1000
        ).toISOString();
      }

      // Fetch all data in parallel
      const [trendsData, activitiesData, journalData] = await Promise.all([
        fetchMoodTrends(startDate, endDate),
        fetchActivityHistory(startDate, endDate),
        fetchJournalEntries(),
      ]);

      setMoodTrends(trendsData.data);
      setActivities(activitiesData.data.slice(0, 3)); // Show only latest 3 activities
      setJournalEntries(journalData.entries.slice(-3)); // Fix: Change from slice(-3, -1) to slice(-3)
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const renderMoodChart = () => {
    if (!moodTrends || Object.keys(moodTrends).length === 0) {
      return (
        <>
          <Ionicons name="bar-chart-outline" size={48} color="#007AFF" />
          <Text style={styles.placeholderText}>No mood data available</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/log-mood")}>
            <Text style={styles.ctaButtonText}>Log your first mood</Text>
          </TouchableOpacity>
        </>
      );
    }

    const dates = Object.keys(moodTrends).sort();
    const moodData = dates.map((date) => moodTrends[date].value);
    const labels = dates.map((date) => format(new Date(date), "MMM d"));

    return (
      <>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: moodData }],
          }}
          width={Dimensions.get("window").width - 40}
          height={180}
          chartConfig={{
            backgroundColor: "#f5f5f5",
            backgroundGradientFrom: "#f5f5f5",
            backgroundGradientTo: "#f5f5f5",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 12,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#007AFF",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 12,
          }}
        />
        <Text style={styles.placeholderText}>
          {Object.keys(moodTrends).length} moods tracked this {timeRange}
        </Text>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Progress</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mood Trends</Text>
          <View style={styles.timeRangeSelector}>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === "week" && styles.activeTimeButton,
              ]}
              onPress={() => setTimeRange("week")}>
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === "week" && styles.activeTimeButtonText,
                ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === "month" && styles.activeTimeButton,
              ]}
              onPress={() => setTimeRange("month")}>
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === "month" && styles.activeTimeButtonText,
                ]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === "year" && styles.activeTimeButton,
              ]}
              onPress={() => setTimeRange("year")}>
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === "year" && styles.activeTimeButtonText,
                ]}>
                Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartPlaceholder}>{renderMoodChart()}</View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          <TouchableOpacity
            onPress={() => router.push("/activity-history")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={styles.activityItem}
                onPress={() =>
                  router.push({
                    pathname: "/activity-detail",
                    params: { id: activity.id }
                  })
                }>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.activityText}>{activity.activityType}</Text>
                <Text style={styles.activityTime}>
                  {format(new Date(activity.createdAt), "h:mm a")}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.noDataText}>No activities recorded yet</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/activity-entry")}>
                <Text style={styles.ctaButtonText}>
                  Log your first activity
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Journal Entries</Text>
          <TouchableOpacity
            onPress={() => router.push("/journal-history")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.journalList}>
          {journalEntries.length > 0 ? (
            journalEntries.map((entry, index) => (
              <TouchableOpacity
                key={index}
                style={styles.journalItem}
                onPress={() => {
                  console.log(entry._id)
                  router.push({
                    pathname: "/journal-detail",
                    params: { id: entry._id}
                  })
                }
                }>
                <View style={styles.journalHeader}>
                  <Text style={styles.journalDate}>
                    {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
                <Text style={styles.journalPreview} numberOfLines={2}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.noDataText}>No journal entries yet</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/journal-entry")}>
                <Text style={styles.ctaButtonText}>Write your first entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: "#333",
  },
  viewAllText: {
    color: "#007AFF",
    fontSize: 14,
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 4,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeTimeButton: {
    backgroundColor: "#007AFF",
  },
  timeButtonText: {
    fontSize: 12,
    color: "#666",
  },
  activeTimeButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  chartPlaceholder: {
    height: 220,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  placeholderText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  activityTime: {
    fontSize: 14,
    color: "#666",
  },
  journalList: {
    gap: 12,
  },
  journalItem: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: "#666",
  },
  journalPreview: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginBottom: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  ctaButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
