import mongoose from "mongoose";
import { User } from "../models/user.model";
import { MoodEntry } from "../models/mood.model";
import { ActivityLog } from "../models/activity.model";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mental-wellness"
    );
    console.log("Connected to MongoDB");

    // Find the user
    console.log("Finding user...");
    const user = await User.findOne({ username: "rexplode" });
    if (!user) {
      console.error("User not found");
      process.exit(1);
    }
    console.log("User found:", user.username);

    // Clear existing data
    console.log("Clearing existing data...");
    await MoodEntry.deleteMany({ userId: user._id });
    await ActivityLog.deleteMany({ userId: user._id });
    console.log("Existing data cleared");

    // Create mood entries
    console.log("Creating mood entries...");
    const moodEntries = [
      {
        userId: user._id,
        mood: "happy",
        intensity: 8,
        notes: "Had a great day at work",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: user._id,
        mood: "calm",
        intensity: 7,
        notes: "Morning meditation was very peaceful",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        userId: user._id,
        mood: "energetic",
        intensity: 9,
        notes: "Great workout session",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ];

    // Create activity logs
    console.log("Creating activity logs...");
    const activityLogs = [
      {
        userId: user._id,
        activityType: "exercise",
        duration: 45,
        notes: "Morning jog in the park",
        completed: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: user._id,
        activityType: "meditation",
        duration: 20,
        notes: "Guided meditation session",
        completed: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        userId: user._id,
        activityType: "reading",
        duration: 30,
        notes: "Read a chapter of my book",
        completed: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ];

    // Insert the data
    console.log("Inserting mood entries...");
    const insertedMoodEntries = await MoodEntry.insertMany(moodEntries);
    console.log(`Inserted ${insertedMoodEntries.length} mood entries`);

    console.log("Inserting activity logs...");
    const insertedActivityLogs = await ActivityLog.insertMany(activityLogs);
    console.log(`Inserted ${insertedActivityLogs.length} activity logs`);

    console.log("Data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedData();
