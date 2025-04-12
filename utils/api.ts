import { MoodEntry } from "@/types";

const API_BASE_URL = "http://localhost:3001/api";

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};

export const fetchMoodEntries = async () => {
  const response = await fetch(`${API_BASE_URL}/mood/entries`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch mood entries");
  return response.json();
};

export const fetchActivityHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/activity/history`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch activity history");
  return response.json();
};

export const fetchMoodTrends = async (startDate: string, endDate: string) => {
  const response = await fetch(
    `${API_BASE_URL}/mood/trends?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch mood trends");
  return response.json();
};
