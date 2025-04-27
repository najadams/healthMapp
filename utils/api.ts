import { MoodEntry } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API_BASE_URL = "http://localhost:3001/api";

export const fetchUserProfile = async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};

export const fetchChats = async () => {
  try {
    // For development, use your actual API endpoint
    const response = await fetch(`http://${API_B}/api/chats`, {
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
      if (!uniqueChats.some((c) => c.id === chat.id)) {
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
export const fetchMoodEntries = async (startDate : string, endDate : string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/mood/entries?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Mood entries fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorData.message || "Failed to fetch mood entries");
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchMoodEntries:", error);
    throw error;
  }
};

export const fetchActivityHistory = async (startDate: string, endDate: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/activities/history?startDate=${startDate}&endDate=${endDate}`, { // Changed from activity to activities
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Activity history fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorData.message || "Failed to fetch activity history");
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchActivityHistory:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/user/auth/logout`, {  // Updated endpoint
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error(response.type);
  }
  
  // Clear both token and userData from AsyncStorage
  await Promise.all([
    AsyncStorage.removeItem("token"),
    AsyncStorage.removeItem("userData")
  ]);
  
  return true;
};

export const updateUserProfile = async (userData: {
  name?: string;
  email?: string;
  profilePicture?: string;
}) => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
};

export const fetchMoodTrends = async (startDate: string, endDate: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/mood/trends?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Mood trends fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorData.message || "Failed to fetch mood trends");
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchMoodTrends:", error);
    throw error;
  }
};

export const fetchJournalEntries = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/journal/entries`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Journal entries fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
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
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/journal/entries/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Journal entry fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorData.message || "Failed to fetch journal entry");
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchJournalEntry:", error);
    throw error;
  }
};
