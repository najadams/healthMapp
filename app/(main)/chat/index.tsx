import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ChatInterface from '../../../components/ChatInterface';
import { ThemedView } from '../../../components/ThemedView';

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Chat with Assistant',
          headerShadowVisible: false,
        }} 
      />
      <ChatInterface />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});