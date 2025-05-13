import axios from 'axios';

// Update this URL to match your backend server
const API_URL = 'http://localhost:5000/api';

export const chatService = {
  /**
   * Send a message to the Rasa chatbot via the backend API
   * @param userId User identifier
   * @param message Message to send
   * @returns Promise with the chatbot response
   */
  sendMessage: async (userId: string, message: string) => {
    try {
      const response = await axios.post(`${API_URL}/ai-chat/message`, {
        userId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }
};