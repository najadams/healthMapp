import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";

// Default AI assistant for mental health
const mentalHealthAI = {
  id: "ai-assistant",
  name: "Mental Health Assistant",
  lastMessage: "How are you feeling today?",
  time: "Now",
  unreadCount: 0,
};

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const router = useRouter();
  const user = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, use your actual API endpoint
      const response = await fetch(`http://localhost:3001/api/chats`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      
      // Always include the AI assistant at the top
      const uniqueChats = [mentalHealthAI];
      
      // Add user's previous chats
      data.chats.forEach((chat: Chat) => {
        if (!uniqueChats.some(c => c.id === chat.id)) {
          uniqueChats.push(chat);
        }
      });
      
      setChats(uniqueChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      // Show AI assistant as fallback
      setChats([mentalHealthAI]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const handleNewChat = () => {
    // Start a new chat with the AI assistant
    startNewChat(mentalHealthAI);
  };

  const startNewChat = async (contact: Chat) => {
    try {
      if (contact.id === "ai-assistant") {
        // For AI assistant, create a direct chat without API call
        router.push(`/chat/ai-assistant`);
        return;
      }
      
      // For other chats, use the API
      const response = await fetch("http://localhost:3001/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          participantId: contact.id,
          message: `Hello, I'd like to discuss my mental health.`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await response.json();
      router.push(`/chat/${data.chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create new chat. Please try again.");
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}` as any);
  };

  const handleOptionPress = (chatId: string, option: string) => {
    switch (option) {
      case "prioritize":
        Alert.alert(
          "Chat Prioritized",
          "This chat has been moved to the top of your list."
        );
        break;
      case "raven":
        Alert.alert("Access Granted", "Raven now has access to this chat.");
        break;
      case "mute":
        Alert.alert(
          "Chat Muted",
          "You will no longer receive notifications from this chat."
        );
        break;
      case "lock":
        Alert.alert(
          "Chat Locked",
          "This chat is now locked and requires authentication to access."
        );
        break;
      case "block":
        Alert.alert("Chat Blocked", "This chat has been blocked.");
        break;
      case "delete":
        Alert.alert(
          "Delete Chat",
          "Are you sure you want to delete this chat?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                setChats(chats.filter((chat) => chat.id !== chatId));
              },
            },
          ]
        );
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mental Health Chat</Text>
      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Ionicons name="create-outline" size={24} color="#2C3E50" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color="#95A5A6"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search conversations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#95A5A6"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={20} color="#95A5A6" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Please log in to view your chats</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            name={item.name as string}
            lastMessage={item.lastMessage}
            time={item.time}
            unreadCount={item.unreadCount}
            onPress={() => handleChatPress(item.id)}
            onOptionPress={(option: string) => handleOptionPress(item.id, option)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  listContent: {
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
