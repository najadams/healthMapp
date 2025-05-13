export interface MoodEntry {
  _id: string;
  userId: string;
  mood: string;
  intensity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: string;
  activityType: string;
  duration: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodTrend {
  count: number;
  totalIntensity: number;
  averageIntensity: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
  };
}
