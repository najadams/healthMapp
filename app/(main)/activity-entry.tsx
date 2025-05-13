import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useUser } from "@/context/UserContext";

const activityTypes = [
  { id: "exercise", label: "Exercise", icon: "fitness-outline" },
  { id: "meditation", label: "Meditation", icon: "leaf-outline" },
  { id: "reading", label: "Reading", icon: "book-outline" },
  { id: "walking", label: "Walking", icon: "walk-outline" },
  { id: "yoga", label: "Yoga", icon: "body-outline" },
];

export default function ActivityEntryScreen() {
  const router = useRouter();
  const user = useUser();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = format(new Date(), "MMMM dd, yyyy");

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert("Missing Information", "Please select an activity type");
      return;
    }

    if (!duration || isNaN(Number(duration))) {
      Alert.alert("Invalid Duration", "Please enter a valid duration in minutes");
      return;
    }

    try {
      setIsSubmitting(true);

      const activityData = {
        activityType: selectedType,
        duration: Number(duration),
        notes: notes.trim(),
        completed: true,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3001/api/activities/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(activityData),
      });
      console.log(Object.keys(response))
      console.log(response.status)

      if (!response.ok) {
        throw new Error("Failed to save activity");
      }

      Alert.alert("Success", "Activity logged successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving activity:", error);
      Alert.alert("Error", "Failed to save activity. Please try again.");
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
        <Text style={styles.headerTitle}>Log Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Type</Text>
          <View style={styles.activityTypes}>
            {activityTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.activityButton,
                  selectedType === type.id && styles.selectedActivity,
                ]}
                onPress={() => setSelectedType(type.id)}>
                <Ionicons
                  name={type.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={selectedType === type.id ? "#007AFF" : "#666"}
                />
                <Text
                  style={[
                    styles.activityLabel,
                    selectedType === type.id && styles.selectedActivityLabel,
                  ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration (minutes)</Text>
          <TextInput
            style={styles.durationInput}
            keyboardType="number-pad"
            placeholder="Enter duration in minutes"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about your activity (optional)"
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Save Activity</Text>
            </>
          )}
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
  activityTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: "45%",
  },
  selectedActivity: {
    backgroundColor: "#e6f2ff",
  },
  activityLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  selectedActivityLabel: {
    color: "#007AFF",
  },
  durationInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.7,
  },
});