import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useUser } from "@/context/UserContext";


interface Activity {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const moods = [
  { id: "great", label: "Great", icon: "happy-outline" },
  { id: "okay", label: "Okay", icon: "happy-outline" },
  { id: "not-great", label: "Not Great", icon: "sad-outline" },
  { id: "bad", label: "Bad", icon: "sad-outline" },
];

const defaultActivities: Activity[] = [
  { id: "exercise", name: "Exercise", icon: "fitness-outline" },
  { id: "reading", name: "Reading", icon: "book-outline" },
  { id: "meditation", name: "Meditation", icon: "leaf-outline" },
];

export default function JournalEntryScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const currentDate = format(new Date(), "MMMM dd, yyyy");
  const user = useUser();
  const [IsSubmitting, setIsSubmitting] = useState(false);

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert("Missing Information", "Please select your mood");
      return;
    }

    if (!thoughts.trim()) {
      Alert.alert(
        "Missing Information",
        "Please write some thoughts for your journal entry"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare journal entry data
      const journalData = {
        content: thoughts,
        mood: selectedMood,
        tags: selectedActivities,
        isPrivate: true, // Default to private entries
      };
      
      console.log(journalData)
      // Send journal entry to backend
      const response = await fetch(
        "http://localhost:3001/api/journal/entries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(journalData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save journal entry");
      }

      // If activities were selected, log them as well
      if (selectedActivities.length > 0) {
        await Promise.all(
          selectedActivities.map(async (activityId) => {
            // Find the activity name from our list
            const activity = defaultActivities.find((a) => a.id === activityId);
            if (!activity) return;

            const activityData = {
              activityType: activityId,
              duration: 30, // Default duration in minutes
              notes: `Logged from journal: ${activity.name}`,
            };

            await fetch("http://localhost:3001/api/activities/log", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`,
              },
              body: JSON.stringify(activityData),
            });
          })
        );
      }

      Alert.alert("Success", "Your journal entry has been saved", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      Alert.alert(
        "Error",
        "There was a problem saving your journal entry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journal</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodOptions}>
            {moods.map((mood) => (
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
          <TextInput
            style={styles.thoughtsInput}
            placeholder="Write your thoughts here..."
            multiline
            textAlignVertical="top"
            value={thoughts}
            onChangeText={setThoughts}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.activitiesContainer}>
            {defaultActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityButton,
                  selectedActivities.includes(activity.id) &&
                    styles.selectedActivity,
                ]}
                onPress={() => toggleActivity(activity.id)}>
                <Ionicons
                  name={activity.icon}
                  size={20}
                  color={
                    selectedActivities.includes(activity.id)
                      ? "#007AFF"
                      : "#666"
                  }
                />
                <Text
                  style={[
                    styles.activityLabel,
                    selectedActivities.includes(activity.id) &&
                      styles.selectedActivityLabel,
                  ]}>
                  {activity.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addActivityButton}>
              <Ionicons name="add" size={20} color="#666" />
              <Text style={styles.addActivityLabel}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    color: "#666",
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    color: "#333",
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  moodButton: {
    alignItems: "center",
    padding: 8,
    minWidth: 60,
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
  thoughtsInput: {
    height: 150,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedActivity: {
    backgroundColor: "#e6f2ff",
  },
  activityLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  selectedActivityLabel: {
    color: "#007AFF",
  },
  addActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addActivityLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
