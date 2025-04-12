import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { JournalEntry } from "../models/journal.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Create journal entry
router.post("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const journalEntry = new JournalEntry({
      ...req.body,
      userId: req.user._id,
    });
    await journalEntry.save();
    res.status(201).json(journalEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get journal entries
router.get("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { page = 1, limit = 10, search } = req.query;
    const query: any = { userId: req.user._id };

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const journalEntries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await JournalEntry.countDocuments(query);

    res.json({
      entries: journalEntries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single journal entry
router.get("/entries/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    res.json(journalEntry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update journal entry
router.patch("/entries/:id", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["content", "mood", "tags", "isPrivate"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }

  try {
    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    updates.forEach((update) => {
      if (allowedUpdates.includes(update)) {
        (journalEntry as any)[update] = req.body[update];
      }
    });

    await journalEntry.save();
    res.json(journalEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete journal entry
router.delete("/entries/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const journalEntry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    res.json(journalEntry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
