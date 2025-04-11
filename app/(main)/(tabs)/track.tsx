import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TrackScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Progress</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Trends</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart-outline" size={48} color="#007AFF" />
          <Text style={styles.placeholderText}>
            Your mood chart will appear here
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Log</Text>
        <View style={styles.activityList}>
          {["Exercise", "Meditation", "Reading"].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#007AFF"
              />
              <Text style={styles.activityText}>{activity}</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journal Entries</Text>
        <View style={styles.journalList}>
          {[1, 2, 3].map((entry, index) => (
            <View key={index} style={styles.journalItem}>
              <View style={styles.journalHeader}>
                <Text style={styles.journalDate}>Today, 2:30 PM</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
              <Text style={styles.journalPreview} numberOfLines={2}>
                Today was a good day. I felt productive and managed to complete
                all my tasks...
              </Text>
            </View>
          ))}
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
});
