import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { fetchJournalEntry } from "@/utils/api";

// Define your API service or data fetching function
// This should be imported from your API services file in a real app
const fetchEntryById = async (entryId: string) => {
  try {
    // Replace with your actual API call
    // Example: return api.get(`/journals/${entryId}`);

    // For testing, you can use mock data:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          entry: {
            id: entryId,
            content: "This is a journal entry",
            mood: "great",
            createdAt: new Date().toISOString(),
            tags: ["personal", "thoughts"],
          },
        });
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching entry:", error);
    throw error;
  }
};

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  createdAt: string;
  tags: string[];
}

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("this is the id", id)
    const loadJournalEntry = async () => {
      try {
        if (!id) {
          setError("No journal entry ID provided");
          setLoading(false);
          return;
        }
        // Call the fetch function, not itself
        const data = await fetchJournalEntry(id as string);
        console.log(data.entry)
        setEntry(data.entry);
      } catch (err) {
        console.error(err);
        setError("Failed to load journal entry");
      } finally {
        setLoading(false);
      }
    };

    loadJournalEntry();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Entry not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Journal Entry</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.entryHeader}>
          <Text style={styles.date}>
            {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </Text>
          <View style={styles.moodIndicator}>
            <Ionicons
              name={entry.mood === "great" ? "happy-outline" : "sad-outline"}
              size={24}
              color="#666"
            />
          </View>
        </View>

        <Text style={styles.entryContent}>{entry.content}</Text>

        <View style={styles.tagsContainer}>
          {entry.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  moodIndicator: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  entryContent: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
  },
  tag: {
    backgroundColor: '#e1e1e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
});