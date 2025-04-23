import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const resourceCategories = [
  {
    id: "emergency",
    title: "Emergency Support",
    icon: "alert-circle-outline",
    resources: [
      {
        id: "1",
        title: "National Crisis Line",
        description: "24/7 support for mental health emergencies",
        contact: "1-800-273-8255",
        type: "phone",
      },
      {
        id: "2",
        title: "Emergency Services",
        description: "Immediate emergency assistance",
        contact: "911",
        type: "phone",
      },
    ],
  },
  {
    id: "education",
    title: "Educational Content",
    icon: "book-outline",
    resources: [
      {
        id: "3",
        title: "Understanding Anxiety",
        description: "Learn about anxiety symptoms and management",
        type: "article",
      },
      {
        id: "4",
        title: "Stress Management Guide",
        description: "Comprehensive guide to managing stress",
        type: "article",
      },
    ],
  },
  {
    id: "exercises",
    title: "Wellness Exercises",
    icon: "fitness-outline",
    resources: [
      {
        id: "5",
        title: "Guided Meditation",
        description: "5-minute mindfulness meditation",
        type: "audio",
      },
      {
        id: "6",
        title: "Breathing Exercises",
        description: "Simple breathing techniques for anxiety",
        type: "video",
      },
    ],
  },
  {
    id: "community",
    title: "Community Support",
    icon: "people-outline",
    resources: [
      {
        id: "7",
        title: "Support Groups",
        description: "Find local support groups",
        type: "link",
      },
      {
        id: "8",
        title: "Online Forums",
        description: "Connect with others in similar situations",
        type: "link",
      },
    ],
  },
];

export default function ResourcesScreen() {
  const router = useRouter();

  const handleResourcePress = (resource: any) => {
    switch (resource.type) {
      case "phone":
        Linking.openURL(`tel:${resource.contact}`);
        break;
      case "article":
        router.push(`/resources/article/${resource.id}`);
        break;
      case "audio":
        router.push(`/resources/audio/${resource.id}`);
        break;
      case "video":
        router.push(`/resources/video/${resource.id}`);
        break;
      case "link":
        router.push(`/resources/link/${resource.id}`);
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resources</Text>
        <View style={{ width: 24 }} />
      </View>

      {resourceCategories.map((category) => (
        <View key={category.id} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Ionicons name={category.icon} size={24} color="#007AFF" />
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>

          {category.resources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>
                  {resource.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
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
  categorySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: "#666",
  },
});