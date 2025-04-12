import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";

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
  { id: "good", label: "Good", icon: "smile-outline" },
  { id: "okay", label: "Okay", icon: "sad-outline" },
  { id: "bad", label: "Bad", icon: "sad" },
];

export default function HomeScreen() {
  const user = useUser();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  console.log(user);

  const QuickAction = ({ icon, title, onPress }: QuickActionProps) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#666" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName}>{user?.name || "Sarah Johnson"}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

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
                onPress={() => setSelectedMood(mood.id)}>
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
              onPress={() => {}}
            />
            <QuickAction
              icon="people-outline"
              title="Get Support"
              onPress={() => {}}
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
              <View style={[styles.progressBar, { width: "75%" }]} />
            </View>
            <Text style={styles.progressCount}>3/4</Text>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Journal Entries</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: "50%" }]} />
            </View>
            <Text style={styles.progressCount}>1/2</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <View style={styles.upcomingItem}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
            <View style={styles.upcomingContent}>
              <Text style={styles.upcomingTitle}>Therapy Session</Text>
              <Text style={styles.upcomingDetails}>2:00 PM with Dr. Smith</Text>
            </View>
            <Text style={styles.upcomingTime}>Tomorrow</Text>
          </View>

          <View style={styles.upcomingItem}>
            <Ionicons name="alarm-outline" size={24} color="#666" />
            <View style={styles.upcomingContent}>
              <Text style={styles.upcomingTitle}>Medication Reminder</Text>
              <Text style={styles.upcomingDetails}>8:00 PM - Evening dose</Text>
            </View>
            <Text style={styles.upcomingTime}>Today</Text>
          </View>
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
});
