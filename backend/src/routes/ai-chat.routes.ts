import express, { Response } from "express";
import { auth } from "../middleware/auth.middleware";
import { Chat } from "../models/chat.model";
import { AuthRequest } from "../types";
import { RasaService } from "../services/rasa.service";

const router = express.Router();

// Get AI chat history or create new AI chat
router.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Find existing AI chat for this user
    let aiChat = await Chat.findOne({
      participants: req.user._id,
      chatType: 'ai',
      aiAssistantId: 'mental-health-ai'
    });

    // If no existing chat, create a new one
    if (!aiChat) {
      const welcomeMessage = {
        sender: 'ai-assistant', // Special ID for AI
        content: "Hello! I'm your mental health assistant. How are you feeling today?",
        timestamp: new Date(),
        read: true,
        sentiment: 'positive',
        categories: ['general']
      };

      aiChat = new Chat({
        participants: [req.user._id, 'ai-assistant'],
        messages: [welcomeMessage],
        lastMessage: welcomeMessage,
        chatType: 'ai',
        aiAssistantId: 'mental-health-ai',
        mentalHealthTopics: ['general']
      });

      await aiChat.save();
    }

    res.json({
      success: true,
      chat: aiChat
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get AI chat"
    });
  }
});

// Send message to AI and get response
router.post("/message", auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { content, chatId } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Message content is required"
      });
    }

    // Find or create AI chat
    let aiChat;
    if (chatId) {
      aiChat = await Chat.findOne({
        _id: chatId,
        participants: req.user._id,
        chatType: 'ai'
      });
    }

    if (!aiChat) {
      aiChat = await Chat.findOne({
        participants: req.user._id,
        chatType: 'ai',
        aiAssistantId: 'mental-health-ai'
      });
    }

    if (!aiChat) {
      // Create new AI chat if none exists
      aiChat = new Chat({
        participants: [req.user._id, 'ai-assistant'],
        messages: [],
        chatType: 'ai',
        aiAssistantId: 'mental-health-ai',
        mentalHealthTopics: []
      });
    }

    // Add user message to chat
    const userMessage = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
      read: true,
      // Change from string to one of the allowed values
      sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
      categories: ['general']
    };

    aiChat.messages.push(userMessage);
    aiChat.lastMessage = userMessage;

    // Process message with Rasa
    const rasaResponse = await RasaService.processMessage(req.user._id.toString(), content);
    
    // Update user message with sentiment and categories from Rasa
    // Add type assertion or default value to ensure it's one of the allowed values
    userMessage.sentiment = (rasaResponse.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral';
    if (rasaResponse.categories) {
      userMessage.categories = rasaResponse.categories;
    }
    
    // Update mental health topics for the chat
    if (!aiChat.mentalHealthTopics) {
      aiChat.mentalHealthTopics = [];
    }
    
    if (rasaResponse.categories) {
      rasaResponse.categories.forEach(category => {
        if (!aiChat.mentalHealthTopics?.includes(category)) {
          aiChat.mentalHealthTopics?.push(category);
        }
      });
    }

    // Create AI response message
    const aiResponse = {
      sender: 'ai-assistant',
      content: rasaResponse.content,
      timestamp: new Date(),
      read: true,
      sentiment: (rasaResponse.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
      categories: rasaResponse.categories
    };
    
    aiChat.messages.push(aiResponse);
    aiChat.lastMessage = aiResponse;
    
    await aiChat.save();

    res.json({
      success: true,
      userMessage,
      aiResponse,
      chat: aiChat
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process AI message"
    });
  }
});

/**
 * Route to handle chat messages to Rasa
 * POST /api/ai-chat/message
 */
router.post('/message', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message are required' });
    }
    
    // Process the message with Rasa
    const response = await RasaService.processMessage(userId, message);
    
    return res.json(response);
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;