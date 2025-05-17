import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import moodRoutes from "./routes/mood.routes";
import journalRoutes from "./routes/journal.routes";
import activityRoutes from "./routes/activity.routes";
import chatRoutes from "./routes/chat.routes";
import aiChatRoutes from "./routes/ai-chat.routes";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // In development, you might want to allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai-chat", aiChatRoutes);
app.get("/", (req, res) => {
  console.log('cloilkdsjf')
  res.send("Hello World!");
})

// Database connection
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = "localhost"; // Changed from 0.0.0.0 to localhost

app.listen(PORT,() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});