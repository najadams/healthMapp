import { NLPService } from './nlp.service';

// Response templates by category and sentiment
const responseTemplates = {
  anxiety: {
    positive: [
      "It's great that you're feeling better about your anxiety. What strategies have been helping you?",
      "I'm glad you're managing your anxiety well. Remember to continue your coping techniques."
    ],
    negative: [
      "I'm sorry to hear you're feeling anxious. Have you tried any breathing exercises?",
      "Anxiety can be challenging. Would it help to talk about what's triggering these feelings?"
    ],
    neutral: [
      "How long have you been experiencing these anxiety symptoms?",
      "There are several techniques that can help with anxiety. Would you like to learn about some?"
    ]
  },
  depression: {
    positive: [
      "I'm happy to hear you're having some positive moments. What's been helping your mood improve?",
      "That's a good sign. Even small improvements in mood are worth celebrating."
    ],
    negative: [
      "I'm sorry you're feeling down. Remember that depression often distorts our thinking.",
      "Depression can make everything feel overwhelming. Have you spoken to a professional about these feelings?"
    ],
    neutral: [
      "How long have you been feeling this way?",
      "Depression affects everyone differently. Could you tell me more about your experience?"
    ]
  },
  sleep: {
    positive: [
      "I'm glad your sleep is improving. Consistent sleep patterns are so important for mental health.",
      "Great to hear about your sleep improvements. What changes have you made to your routine?"
    ],
    negative: [
      "Sleep difficulties can significantly impact how we feel. Have you established a bedtime routine?",
      "I'm sorry to hear about your sleep troubles. Avoiding screens before bed might help."
    ],
    neutral: [
      "How many hours of sleep do you typically get?",
      "Sleep hygiene can make a big difference. Would you like some tips?"
    ]
  },
  trauma: {
    positive: [
      "It takes courage to process trauma. I'm glad you're seeing some positive changes.",
      "Healing from trauma is a journey. It's good to hear you're making progress."
    ],
    negative: [
      "Trauma responses can be very difficult to manage. Have you worked with a trauma-informed therapist?",
      "I'm sorry you're struggling with these traumatic memories. You deserve support with this."
    ],
    neutral: [
      "Processing trauma takes time and support. How are you taking care of yourself?",
      "There are specific approaches that can help with trauma. Would you like to know more?"
    ]
  },
  general: {
    positive: [
      "I'm glad to hear you're doing well. What's been contributing to your positive feelings?",
      "That's great to hear. What other aspects of your wellbeing would you like to discuss?"
    ],
    negative: [
      "I'm sorry you're having a difficult time. Would it help to talk more about what's happening?",
      "It sounds like things are challenging right now. What kind of support would be most helpful?"
    ],
    neutral: [
      "How have you been managing your mental health lately?",
      "Is there a specific aspect of your wellbeing you'd like to focus on today?"
    ]
  }
};

// Intent-based responses
const intentResponses = {
  seekingHelp: [
    "I'd be happy to help. Could you tell me more about what you're looking for?",
    "I'm here to support you. What kind of help would be most useful right now?"
  ],
  expressingDistress: [
    "I'm sorry you're feeling this way. Would it help to talk more about what's happening?",
    "That sounds really difficult. Remember that it's okay to reach out for professional support."
  ],
  suicidalIdeation: [
    "I'm concerned about what you're sharing. Please know that help is available. The National Suicide Prevention Lifeline is available 24/7 at 988 or 1-800-273-8255.",
    "I hear that you're in a lot of pain right now. Please reach out to a crisis service like the Crisis Text Line (text HOME to 741741) or call 988 for immediate support."
  ],
  gratitude: [
    "You're welcome. I'm glad I could be helpful.",
    "I'm here to support you whenever you need to talk."
  ],
  greeting: [
    "Hello! How are you feeling today?",
    "Hi there. How can I support your mental health today?"
  ],
  general: [
    "I'm here to listen. Would you like to tell me more?",
    "Thank you for sharing that with me. How does that make you feel?"
  ]
};

export class AIResponseService {
  /**
   * Generate an appropriate AI response based on message content
   * @param messageText User's message
   * @returns AI response
   */
  static generateResponse(messageText: string): string {
    // Analyze the message
    const sentiment = NLPService.analyzeSentiment(messageText);
    const topics = NLPService.identifyTopics(messageText);
    const intent = NLPService.detectIntent(messageText);
    
    // Handle suicidal ideation with highest priority
    if (intent === 'suicidalIdeation') {
      return this.getRandomResponse(intentResponses.suicidalIdeation);
    }
    
    // Handle other intents with next priority
    if (intent !== 'general' && intentResponses[intent as keyof typeof intentResponses]) {
      return this.getRandomResponse(intentResponses[intent as keyof typeof intentResponses]);
    }
    
    // If no specific intent, respond based on topic and sentiment
    const primaryTopic = topics[0] || 'general';
    
    if (responseTemplates[primaryTopic as keyof typeof responseTemplates]) {
      const sentimentResponses = responseTemplates[primaryTopic as keyof typeof responseTemplates][sentiment as keyof typeof responseTemplates.general];
      return this.getRandomResponse(sentimentResponses);
    }
    
    // Fallback to general response
    return this.getRandomResponse(responseTemplates.general[sentiment as keyof typeof responseTemplates.general]);
  }
  
  /**
   * Get a random response from an array of possible responses
   * @param responses Array of possible responses
   * @returns A single randomly selected response
   */
  private static getRandomResponse(responses: string[]): string {
    const index = Math.floor(Math.random() * responses.length);
    return responses[index];
  }
}