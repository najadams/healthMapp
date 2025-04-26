import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { JournalEntry } from "../models/journal.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Get journal entriest
router.get("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const entries = await JournalEntry.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      entries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch journal entries",
    });
  }
});

// Create journal entry
router.post("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { content, mood, tags } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const journalEntry = new JournalEntry({
      content,
      mood,
      tags,
      userId: req.user._id,
    });

    await journalEntry.save();

    res.status(201).json({
      success: true,
      data: journalEntry,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create journal entry",
    });
  }
});

export default router;
