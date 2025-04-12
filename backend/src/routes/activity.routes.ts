import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { ActivityLog } from "../models/activity.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Log activity
router.post("/log", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const activityLog = new ActivityLog({
      ...req.body,
      userId: req.user._id,
    });
    await activityLog.save();
    res.status(201).json(activityLog);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get activity history
router.get("/history", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const { startDate, endDate, activityType } = req.query;
    const query: any = { userId: req.user._id };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (activityType) {
      query.activityType = activityType;
    }

    const activityLogs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activityLogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update activity status
router.patch("/:id/complete", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const activityLog = await ActivityLog.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!activityLog) {
      return res.status(404).json({ error: "Activity log not found" });
    }

    activityLog.completed = true;
    await activityLog.save();
    res.json(activityLog);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
