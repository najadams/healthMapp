import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format } from "date-fns";

interface Symptom {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const symptoms: Symptom[] = [
  { id: "anxiety", name: "Anxiety", icon: "brain-outline" },
  { id: "depression", name: "Depression", icon: "sad-outline" },
  { id: "sleep", name: "Sleep Issues", icon: "bed-outline" },
];

const moods = [
  { id: "great", label: "Great", icon: "happy-outline" },
  { id: "good", label: "Good", icon: "happy-outline" },
  { id: "okay", label: "Okay", icon: "sad-outline" },
  { id: "bad", label: "Bad", icon: "sad-outline" },
  { id: "awful", label: "Awful", icon: "sad" },
];

export default function LogSymptomsScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const currentDate = format(new Date(), "MMM dd yyyy");

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Symptoms</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.dateText}>Today, {currentDate}</Text>
        <TouchableOpacity style={styles.changeDateButton}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <Text style={styles.changeDateText}>Change Date</Text>
        </TouchableOpacity>
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
                name={mood.icon}
                size={24}
                color={selectedMood === mood.id ? "#007AFF" : "#666"}
              />
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select your symptoms</Text>
        {symptoms.map((symptom) => (
          <TouchableOpacity
            key={symptom.id}
            style={styles.symptomItem}
            onPress={() => toggleSymptom(symptom.id)}>
            <View style={styles.symptomInfo}>
              <Ionicons name={symptom.icon} size={24} color="#666" />
              <Text style={styles.symptomText}>{symptom.name}</Text>
            </View>
            <View
              style={[
                styles.checkbox,
                selectedSymptoms.includes(symptom.id) &&
                  styles.checkboxSelected,
              ]}>
              {selectedSymptoms.includes(symptom.id) && (
                <Ionicons name="checkmark" size={16} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How are you feeling today? (Optional)"
          multiline
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
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
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  changeDateButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeDateText: {
    marginLeft: 4,
    color: "#007AFF",
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  symptomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  symptomInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  symptomText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  notesInput: {
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    margin: 16,
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
