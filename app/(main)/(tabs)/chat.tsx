import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,  // Add this import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ChatListItem from "@/app/components/ChatListItem";
import { useUser } from "@/context/UserContext";

// Mock data for chats
const mockChats = [
  {
    id: "1",
    name: "AI Assistant",
    lastMessage: "Have you made any improvements?",
    time: "2:30 PM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Dr House",
    lastMessage: "Hope the allergy medicine is working",
    time: "1:45 PM",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Dr Louis",
    lastMessage: "Your session is confirmed for tomorrow",
    time: "12:00 PM",
    unreadCount: 5,
  },
];

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

// Default contacts
const defaultContacts = [
  {
    id: "1",
    name: "Dr House",
    lastMessage: "Have a great day!",
    time: "2:30 PM",
    unreadCount: 0,
  },
  {
    id: "2",
    name: "Dr Shean",
    lastMessage: "See you at the next appointment",
    time: "1:45 PM",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Dr Lisa",
    lastMessage: "Take care!",
    time: "12:00 PM",
    unreadCount: 0,
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const user = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For development, use your actual API endpoint
      const response = await fetch("http://your-api-endpoint/api/chats", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      // Combine default contacts with fetched chats, avoiding duplicates
      const uniqueChats = [...defaultContacts];
      data.chats.forEach((chat: Chat) => {
        if (!uniqueChats.some(c => c.id === chat.id)) {
          uniqueChats.push(chat);
        }
      });
      setChats(uniqueChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      // Show default contacts as fallback
      setChats(defaultContacts);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    Alert.alert(
      "New Chat",
      "Select a doctor to start a conversation with",
      defaultContacts.map((contact) => ({
        text: contact.name,
        onPress: () => startNewChat(contact),
      }))
    );
  };

  const startNewChat = async (contact: Chat) => {
    try {
      const response = await fetch("http://localhost:3001/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          doctorId: contact.id,
          message: `Hello, I'd like to start a conversation with ${contact.name}`,
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
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <Text style={styles.title}>Messages</Text>
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
        placeholder="Search chats..."
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
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              name={item.name}
              lastMessage={item.lastMessage}
              time={item.time}
              unreadCount={item.unreadCount}
              onPress={() => handleChatPress(item.id)}
              onOptionPress={(option) => handleOptionPress(item.id, option)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chats available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
