import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { fetchJournalEntry } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadJournalEntry = async () => {
      try {
        if (!id) {
          setError("No journal entry ID provided");
          setLoading(false);
          return;
        }
        const data = await fetchJournalEntry(id as string);
        setEntry(data.entry);
        setEditedContent(data.entry.content);
      } catch (err) {
        console.error(err);
        setError("Failed to load journal entry");
      } finally {
        setLoading(false);
      }
    };

    loadJournalEntry();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`http://localhost:3001/api/journal/entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }

      const updatedData = await response.json();
      setEntry(updatedData.entry);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.title}>Journal Details</Text>
        <TouchableOpacity onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}>
          <Ionicons 
            name={isEditing ? "checkmark-outline" : "create-outline"} 
            size={24} 
            color="#007AFF" 
          />
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

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              autoFocus
              placeholder="Write your thoughts..."
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => {
                  setIsEditing(false);
                  setEditedContent(entry.content);
                }}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.entryContent}>{entry.content}</Text>
        )}

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
  editContainer: {
    marginBottom: 20,
  },
  editInput: {
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 16,
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