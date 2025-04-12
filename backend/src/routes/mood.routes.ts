import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { MoodEntry } from "../models/mood.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Create mood entry
router.post("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const moodEntry = new MoodEntry({
      ...req.body,
      userId: req.user._id,
    });
    await moodEntry.save();
    res.status(201).json(moodEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get mood entries
router.get("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const moodEntries = await MoodEntry.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(moodEntries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get mood trends
router.get("/trends", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const moodEntries = await MoodEntry.find(query).sort({ createdAt: 1 });

    // Group by mood and calculate averages
    const trends = moodEntries.reduce((acc: any, entry) => {
      if (!acc[entry.mood]) {
        acc[entry.mood] = {
          count: 0,
          totalIntensity: 0,
          averageIntensity: 0,
        };
      }
      acc[entry.mood].count++;
      acc[entry.mood].totalIntensity += entry.intensity;
      acc[entry.mood].averageIntensity =
        acc[entry.mood].totalIntensity / acc[entry.mood].count;
      return acc;
    }, {});

    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
