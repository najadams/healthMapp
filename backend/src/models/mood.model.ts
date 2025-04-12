import mongoose from "mongoose";

export interface IMoodEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  mood: "happy" | "sad" | "anxious" | "calm" | "energetic";
  intensity: number;
  notes?: string;
  tags?: string[];
}

const moodEntrySchema = new mongoose.Schema<IMoodEntry>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["happy", "sad", "anxious", "calm", "energetic"],
      required: true,
    },
    intensity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const MoodEntry = mongoose.model<IMoodEntry>(
  "MoodEntry",
  moodEntrySchema
);
