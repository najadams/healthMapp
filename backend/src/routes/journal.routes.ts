import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { JournalEntry } from "../models/journal.model";
import { AuthRequest } from "../types";
import { error } from "console";

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

// Get specific journal entry by ID
router.get("/entries/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log(req.params)
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
    });
    console.log("this is the Journal \n ", entry)

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Journal entry not found",
      });
    }

    res.json({
      success: true,
      entry,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch journal entry",
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

// Update journal entry
router.patch("/entries/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Journal entry not found",
      });
    }

    entry.content = content;
    await entry.save();

    res.json({
      success: true,
      entry,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update journal entry",
    });
  }
});

export default router;
