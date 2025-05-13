import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { Chat } from "../models/chat.model";
import { AuthRequest } from "../types";
import { NLPService } from "../services/nlp.service";

const router = express.Router();

// Get all chats for a user
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name profilePicture")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch chats",
    });
  }
});

// Get a specific chat
router.get("/:chatId", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id,
    }).populate("participants", "name profilePicture");

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch chat",
    });
  }
});

// Create a new chat
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { participantId, message } = req.body;

    if (!participantId || !message) {
      return res.status(400).json({
        success: false,
        error: "Participant ID and initial message are required",
      });
    }

    // Process message with NLP
    const nlpData = NLPService.processMessage(message);

    const newMessage = {
      sender: req.user._id,
      content: message,
      timestamp: new Date(),
      read: false,
      sentiment: nlpData.sentiment,
      categories: nlpData.categories
    };

    // Determine if this is an AI chat
    const isAiChat = participantId === 'ai-assistant';

    const chat = new Chat({
      participants: [req.user._id, participantId],
      messages: [newMessage],
      lastMessage: newMessage,
      chatType: isAiChat ? 'ai' : 'human',
      mentalHealthTopics: nlpData.categories,
      aiAssistantId: isAiChat ? 'mental-health-ai' : undefined
    });

    await chat.save();

    const populatedChat = await chat.populate("participants", "name profilePicture");

    res.status(201).json({
      success: true,
      chat: populatedChat,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create chat",
    });
  }
});

// Send a message in a chat
router.post("/:chatId/messages", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Message content is required",
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    // Process message with NLP
    const nlpData = NLPService.processMessage(content);

    const newMessage = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
      read: false,
      sentiment: nlpData.sentiment,
      categories: nlpData.categories
    };

    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    
    // Update mental health topics for the chat
    // Update mental health topics
    if (!chat.mentalHealthTopics) {
      chat.mentalHealthTopics = [];
    }
    
    // Use optional chaining and nullish coalescing
    (nlpData.categories || []).forEach(category => {
    if (!chat.mentalHealthTopics?.includes(category)) {
    chat.mentalHealthTopics?.push(category);
    }
    });
    
    await chat.save();

    res.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send message",
    });
  }
});

// Mark messages as read
router.patch("/:chatId/read", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    // Mark all messages as read
    chat.messages = chat.messages.map(msg => ({
      ...msg,
      read: true,
    }));

    await chat.save();

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to mark messages as read",
    });
  }
});

export default router;