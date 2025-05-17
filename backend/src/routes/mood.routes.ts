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

    // Validate request body
    const { mood, intensity, notes } = req.body;
    if (!mood || !intensity) {
      return res.status(400).json({ error: "Mood and intensity are required" });
    }

    if (intensity < 1 || intensity > 10) {
      return res
        .status(400)
        .json({ error: "Intensity must be between 1 and 10" });
    }

    const moodEntry = new MoodEntry({
      mood,
      intensity,
      notes,
      userId: req.user._id,
    });

    await moodEntry.save();

    res.status(201).json({
      success: true,
      data: moodEntry,
      message: "Mood entry created successfully",
    });
  } catch (error: any) {
    console.error("Error creating mood entry:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create mood entry",
    });
  }
});

// Get mood entries with pagination
router.get("/entries", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    console.log("tried entries")

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    // Add date range filter if provided
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (start > end) {
        return res.status(400).json({ error: "Start date must be before end date" });
      }

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const [moodEntries, total] = await Promise.all([
      MoodEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MoodEntry.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: moodEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch mood entries",
    });
  }
});

// Get mood trends with date range
// router.get("/trends", auth, async (req: AuthRequest, res: Response) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const { startDate, endDate } = req.query;
//     const query: any = { userId: req.user._id };

//     // Validate date range
//     if (startDate && endDate) {
//       const start = new Date(startDate as string);
//       const end = new Date(endDate as string);

//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res.status(400).json({ error: "Invalid date format" });
//       }

//       if (start > end) {
//         return res
//           .status(400)
//           .json({ error: "Start date must be before end date" });
//       }

//       query.createdAt = {
//         $gte: start,
//         $lte: end,
//       };
//     }

//     const moodEntries = await MoodEntry.find(query).sort({ createdAt: 1 });

//     // Group by mood and calculate averages
//     const trends = moodEntries.reduce((acc: any, entry) => {
//       if (!acc[entry.mood]) {
//         acc[entry.mood] = {
//           count: 0,
//           totalIntensity: 0,
//           averageIntensity: 0,
//           entries: [],
//         };
//       }
//       acc[entry.mood].count++;
//       acc[entry.mood].totalIntensity += entry.intensity;
//       acc[entry.mood].averageIntensity =
//         acc[entry.mood].totalIntensity / acc[entry.mood].count;
//       acc[entry.mood].entries.push({
//         intensity: entry.intensity,
//         notes: entry.notes,
//         createdAt: entry.createdAt,
//       });
//       return acc;
//     }, {});

//     res.json({
//       success: true,
//       data: trends,
//       totalEntries: moodEntries.length,
//     });
//   } catch (error: any) {
//     console.error("Error fetching mood trends:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message || "Failed to fetch mood trends",
//     });
//   }
// });

router.get("/trends", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (start > end) {
        return res
          .status(400)
          .json({ error: "Start date must be before end date" });
      }

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const moodEntries = await MoodEntry.find(query).sort({ createdAt: 1 });

    // Transform data into date-keyed format
    const formattedData = moodEntries.reduce((acc: any, entry) => {
      // Use ISO date as key (YYYY-MM-DD)
      const dateKey = entry.createdAt.toISOString().split("T")[0];

      acc[dateKey] = {
        value: entry.intensity,
        note: entry.notes || "",
        mood: entry.mood,
      };

      return acc;
    }, {});

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error("Error fetching mood trends:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch mood trends",
    });
  }
});

export default router;
