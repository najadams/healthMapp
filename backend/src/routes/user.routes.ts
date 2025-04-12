import express, { Request, Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { User } from "../models/user.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    res.json(req.user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch("/profile", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "phone", "profilePicture"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.json(req.user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update user preferences
router.patch("/preferences", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["notifications", "darkMode"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }

  try {
    updates.forEach(
      (update) => (req.user.preferences[update] = req.body[update])
    );
    await req.user.save();
    res.json(req.user.preferences);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
