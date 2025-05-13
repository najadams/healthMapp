import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../utils/chatService';
import { ThemedText } from './ThemedText';
import {useThemeColor } from '../hooks/useThemeColor';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  useEffect(() => {
    // Generate or retrieve a user ID for the chat session
    const getUserId = async () => {
      let id = await AsyncStorage.getItem('chatUserId');
      if (!id) {
        id = `user_${Date.now()}`;
        await AsyncStorage.setItem('chatUserId', id);
      }
      setUserId(id);
      
      // Add a welcome message
      setMessages([
        {
          id: 'welcome',
          content: 'Hello! How can I help you today?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    };
    
    getUserId();
  }, []);
  
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Scroll to the bottom
      flatListRef.current?.scrollToEnd({ animated: true });
      
      // Send message to the backend
      const response = await chatService.sendMessage(userId, inputText);
      
      // Create bot response message
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: response.content || "Sorry, I couldn't process your request.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Scroll to the bottom again after receiving response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: "Sorry, there was an error processing your message. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : styles.botBubble,
        { backgroundColor: isUser ? tintColor : '#f0f0f0' }
      ]}>
        <ThemedText style={[
          styles.messageText,
          { color: isUser ? '#ffffff' : textColor }
        ]}>
          {item.content}
        </ThemedText>
      </View>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={tintColor} />
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: '#ccc' }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: tintColor }]} 
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 5,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
});