import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email,username, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      username,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET ||
        "71d798332d419df907eeb4bbb72db42c02456a088ddce35fc0288bb7268d6f5883214c2211ed1cea9ba9c4484d771db44e033d437c28c32136101afa34288fa2",
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({ $or: [{ email }, { username: email}] });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET ||
        "71d798332d419df907eeb4bbb72db42c02456a088ddce35fc0288bb7268d6f5883214c2211ed1cea9ba9c4484d771db44e033d437c28c32136101afa34288fa2",
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
