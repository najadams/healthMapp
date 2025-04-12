import mongoose from "mongoose";

export interface IJournalEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  mood?: string;
  tags?: string[];
  isPrivate: boolean;
}

const journalEntrySchema = new mongoose.Schema<IJournalEntry>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const JournalEntry = mongoose.model<IJournalEntry>(
  "JournalEntry",
  journalEntrySchema
);
