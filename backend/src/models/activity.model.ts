import mongoose from "mongoose";

export interface IActivityLog extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  activityType:
    | "exercise"
    | "meditation"
    | "reading"
    | "therapy"
    | "medication";
  duration: number;
  notes?: string;
  completed: boolean;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: ["exercise", "meditation", "reading", "therapy", "medication"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);
