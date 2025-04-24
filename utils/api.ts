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

export const fetchMoodEntries = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/mood/entries`, {
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

export const fetchActivityHistory = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/activities/history`, { // Changed from activity to activities
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
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Logout failed");
  }
  
  await AsyncStorage.removeItem("token");
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
    console.log(
      "Fetching mood trends with token:",
      token ? "present" : "missing"
    );

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/mood/trends?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
