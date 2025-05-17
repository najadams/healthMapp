import { MoodEntry } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the API base URL - ensure this matches your backend
export const API_BASE_URL = "http://localhost:3001/api";

// Helper function to get auth headers
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Auth functions
export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Authentication failed");
  }
  
  return response.json();
};

export const registerUser = async (userData: { 
  email: string; 
  password: string;
  name?: string;
  username?: string;
  phone?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }
  
  return response.json();
};

export const logoutUser = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    
    // Clear both token and userData from AsyncStorage
    await Promise.all([
      AsyncStorage.removeItem("token"),
      AsyncStorage.removeItem("userData")
    ]);
    
    return true;
  } catch (error) {
    console.error("Error in logoutUser:", error);
    throw error;
  }
};

// User profile functions
export const fetchUserProfile = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userData: {
  name?: string;
  email?: string;
  profilePicture?: string;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};

// Chat functions
export const fetchChats = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chats`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchChats:", error);
    throw error;
  }
};

export const createChat = async (participantId: string, message: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        participantId,
        message,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to create chat");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in createChat:", error);
    throw error;
  }
};

export const fetchChatHistory = async (chatId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchChatHistory:", error);
    throw error;
  }
};

export const sendMessage = async (chatId: string, content: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const sendAiMessage = async (content: string, chatId?: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ai-chat/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content, chatId }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in sendAiMessage:", error);
    throw error;
  }
};

// Mood tracking functions
export const fetchMoodEntries = async (startDate: string, endDate: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/mood/entries?startDate=${startDate}&endDate=${endDate}`, 
      { headers }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch mood entries");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchMoodEntries:", error);
    throw error;
  }
};

export const fetchMoodTrends = async (startDate: string, endDate: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/mood/trends?startDate=${startDate}&endDate=${endDate}`, 
      { headers }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch mood trends");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchMoodTrends:", error);
    throw error;
  }
};

// Journal functions
export const fetchJournalEntries = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/journal/entries`, { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch journal entries");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchJournalEntries:", error);
    throw error;
  }
};

export const fetchJournalEntry = async (id: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/journal/entries/${id}`, { headers });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch journal entry");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchJournalEntry:", error);
    throw error;
  }
};

export const updateJournalEntry = async (id: string, content: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/journal/entries/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update journal entry');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in updateJournalEntry:", error);
    throw error;
  }
};

// Activity functions
export const fetchActivityHistory = async (startDate: string, endDate: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/activities/history?startDate=${startDate}&endDate=${endDate}`, 
      { headers }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch activity history");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in fetchActivityHistory:", error);
    throw error;
  }
};
