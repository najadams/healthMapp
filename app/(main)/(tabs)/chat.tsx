import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ChatListItem from "@/app/components/ChatListItem";

// Mock data for chats
const mockChats = [
  {
    id: "1",
    name: "AI Assistant",
    lastMessage: "How can I help you with your studies today?",
    time: "2:30 PM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Math Tutor",
    lastMessage: "Great work on the last session!",
    time: "1:45 PM",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Study Group",
    lastMessage: "Let's meet tomorrow at 3 PM",
    time: "12:00 PM",
    unreadCount: 5,
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState(mockChats);

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
      <TouchableOpacity style={styles.newChatButton}>
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

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
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
      />
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
});
