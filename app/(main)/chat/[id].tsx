import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Animated,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  type?: "text" | "image" | "file";
}

// Mental health conversation starters
const mentalHealthPrompts = [
  "How are you feeling today?",
  "Would you like to talk about your symptoms?",
  "Have you been experiencing anxiety lately?",
  "Tell me about your sleep patterns",
  "How has your mood been this week?",
];

// AI responses for mental health
const aiResponses = {
  anxiety: [
    "It sounds like you're experiencing anxiety. Have you tried any relaxation techniques?",
    "Anxiety can be challenging. What triggers your anxiety most often?",
    "Deep breathing exercises can help with anxiety. Would you like to try one now?",
  ],
  depression: [
    "I'm sorry to hear you're feeling down. Have you spoken to a professional about these feelings?",
    "Depression can make everyday tasks difficult. What activities usually bring you joy?",
    "Remember that it's okay to ask for help. Would you like resources for professional support?",
  ],
  sleep: [
    "Sleep problems can significantly impact mental health. How many hours do you typically sleep?",
    "Creating a bedtime routine might help improve your sleep. Would you like some suggestions?",
    "Have you noticed any patterns in your sleep disturbances?",
  ],
  general: [
    "Thank you for sharing that with me. How does that make you feel?",
    "I'm here to listen. Would you like to tell me more about that?",
    "It's important to acknowledge your feelings. What do you think might help?",
    "Have you discussed these concerns with a healthcare provider?",
  ],
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputHeight = useRef(new Animated.Value(40)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load chat history or start new chat
    if (id === "ai-assistant") {
      // New chat with AI assistant
      const initialMessage: Message = {
        id: "welcome",
        text: "Hello! I'm your mental health assistant. How are you feeling today?",
        sender: "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "read",
      };
      setMessages([initialMessage]);
    } else {
      // Load existing chat
      fetchChatHistory();
    }
  }, [id]);

  const fetchChatHistory = async () => {
    try {
      // For existing chats, fetch history from API
      const response = await fetch(`http://localhost:3001/api/chats/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();
      
      // Transform messages to the format needed by the UI
      const formattedMessages = data.messages.map((msg: any) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.sender === user?.id ? "user" : "other",
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: msg.read ? "read" : "delivered",
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // If error, show a default message
      const errorMessage: Message = {
        id: "error",
        text: "Failed to load chat history. Please try again.",
        sender: "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([errorMessage]);
    }
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sending",
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
      setIsTyping(false);
      setShowSuggestions(false);

      // Reset input height
      Animated.spring(inputHeight, {
        toValue: 40,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();

      // Dismiss keyboard
      Keyboard.dismiss();

      // Simulate message sending status update
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
        
        // For AI assistant, generate a response
        if (id === "ai-assistant") {
          generateAiResponse(userMessage.text);
        } else {
          // For regular chats, send to API
          sendMessageToApi(userMessage.text);
        }
      }, 500);

      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const generateAiResponse = async (userText: string) => {
    // Show AI typing indicator
    setIsAiTyping(true);
    
    try {
      // Call the AI chat API
      const response = await fetch(`http://localhost:3001/api/ai-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ 
          content: userText,
          chatId: id === 'ai-assistant' ? undefined : id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.aiResponse.content,
        sender: "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "read",
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to local response if API fails
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "I'm having trouble connecting right now. this is a fallback message",
        sender: "other",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "read",
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsAiTyping(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const sendMessageToApi = async (text: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chats/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      // Update message status to delivered
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.text === text && msg.sender === "user" ? { ...msg, status: "delivered" } : msg
        )
      );
      
      // Fetch updated messages to get response
      fetchChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.otherMessage,
      ]}>
      {item.sender === "other" && (
        <Image
          source={require("../../../assets/images/ai-avatar.jpg")}
          style={styles.avatar}
        />
      )}
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            item.sender === "user" ? styles.userBubble : styles.otherBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              item.sender === "user"
                ? styles.userMessageText
                : styles.otherMessageText,
            ]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          {item.sender === "user" && item.status && (
            <View style={styles.statusContainer}>
              {item.status === "sending" ? (
                <ActivityIndicator size={12} color="#8E8E93" />
              ) : (
                <Ionicons
                  name={
                    item.status === "read"
                      ? "checkmark-done"
                      : item.status === "delivered"
                      ? "checkmark-done-outline"
                      : "checkmark"
                  }
                  size={16}
                  color={item.status === "read" ? "#4FC3F7" : "#8E8E93"}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const handleInputChange = (text: string) => {
    setNewMessage(text);
    setIsTyping(text.length > 0);

    const lines = text.split("\n").length;
    const newHeight = Math.min(Math.max(40, lines * 20 + 20), 120);

    Animated.spring(inputHeight, {
      toValue: newHeight,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Suggested topics:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mentalHealthPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionBubble}
            onPress={() => {
              setNewMessage(prompt);
              setShowSuggestions(false);
            }}>
            <Text style={styles.suggestionText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {id === "ai-assistant" ? "Mental Health Assistant" : "Chat"}
        </Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isAiTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Assistant is typing</Text>
          <ActivityIndicator size="small" color="#4FC3F7" />
        </View>
      )}

      {showSuggestions && renderSuggestions()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setShowSuggestions(!showSuggestions)}>
          <Ionicons name="help-circle-outline" size={24} color="#95A5A6" />
        </TouchableOpacity>
        
        <Animated.View style={[styles.textInputContainer, { height: inputHeight }]}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={handleInputChange}
            multiline
          />
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.sendButton, isTyping ? styles.sendButtonActive : {}]}
          onPress={handleSend}
          disabled={!isTyping}>
          <Ionicons
            name="send"
            size={24}
            color={isTyping ? "#007AFF" : "#95A5A6"}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  infoButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
  otherMessage: {
    alignSelf: "flex-start",
    marginRight: "auto",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageContent: {
    flexDirection: "column",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#E8E8E8",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#2C3E50",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#95A5A6",
    marginRight: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  suggestionButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonActive: {
    backgroundColor: "#F0F8FF",
    borderRadius: 20,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: 16,
  },
  typingText: {
    fontSize: 14,
    color: "#95A5A6",
    marginRight: 8,
  },
  suggestionsContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E50",
    marginBottom: 8,
  },
  suggestionBubble: {
    backgroundColor: "#E8E8E8",
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#2C3E50",
  },
});
