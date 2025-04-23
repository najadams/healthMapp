import express, { Request, Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { User } from "../models/user.model";
import { AuthRequest } from "../types";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Remove sensitive data before sending
    const userProfile = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      profilePicture: req.user.profilePicture,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.json({
      success: true,
      data: userProfile,
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user profile",
    });
  }
});

// Update user profile
router.patch("/profile", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "User not authenticated",
    });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "phone", "profilePicture"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      error: "Invalid updates! Allowed updates: " + allowedUpdates.join(", "),
    });
  }

  try {
    // Validate email format if email is being updated
    if (updates.includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }
    }

    // Validate phone format if phone is being updated
    if (updates.includes("phone")) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(req.body.phone)) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    // Remove sensitive data before sending
    const updatedUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      profilePicture: req.user.profilePicture,
      preferences: req.user.preferences,
      updatedAt: req.user.updatedAt,
    };

    res.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update profile",
    });
  }
});

// Update user preferences
router.patch("/preferences", auth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "User not authenticated",
    });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["notifications", "darkMode"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      error: "Invalid updates! Allowed updates: " + allowedUpdates.join(", "),
    });
  }

  try {
    updates.forEach(
      (update) => (req.user.preferences[update] = req.body[update])
    );
    await req.user.save();

    res.json({
      success: true,
      data: req.user.preferences,
      message: "Preferences updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update preferences",
    });
  }
});

export default router;
