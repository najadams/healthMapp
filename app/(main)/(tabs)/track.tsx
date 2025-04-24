import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchMoodTrends, fetchActivityHistory, fetchJournalEntries } from "@/utils/api";
import { format } from "date-fns";

export default function TrackScreen() {
  const [loading, setLoading] = useState(true);
  const [moodTrends, setMoodTrends] = useState(null);
  const [activities, setActivities] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get dates for the last 7 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all data in parallel
      const [trendsData, activitiesData, journalData] = await Promise.all([
        fetchMoodTrends(startDate, endDate),
        fetchActivityHistory(),
        fetchJournalEntries()
      ]);

      setMoodTrends(trendsData.data);
      setActivities(activitiesData.data.slice(0, 3)); // Show only latest 3 activities
      setJournalEntries(journalData.entries.slice(0, 3)); // Show only latest 3 entries
    } catch (err) {
      console.error("Error fetching track data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
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
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Progress</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Trends</Text>
        <View style={styles.chartPlaceholder}>
          {moodTrends ? (
            <View>
              {/* Here you can add a chart component using the moodTrends data */}
              <Text style={styles.placeholderText}>
                {Object.keys(moodTrends).length} moods tracked this week
              </Text>
            </View>
          ) : (
            <>
              <Ionicons name="bar-chart-outline" size={48} color="#007AFF" />
              <Text style={styles.placeholderText}>No mood data available</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Log</Text>
        <View style={styles.activityList}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.activityText}>{activity.activityType}</Text>
                <Text style={styles.activityTime}>
                  {format(new Date(activity.createdAt), 'h:mm a')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent activities</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journal Entries</Text>
        <View style={styles.journalList}>
          {journalEntries.length > 0 ? (
            journalEntries.map((entry, index) => (
              <View key={index} style={styles.journalItem}>
                <View style={styles.journalHeader}>
                  <Text style={styles.journalDate}>
                    {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
                <Text style={styles.journalPreview} numberOfLines={2}>
                  {entry.content}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent journal entries</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 12,
  },
});
