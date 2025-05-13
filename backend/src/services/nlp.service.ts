import natural from 'natural';
import { IMessage } from '../models/chat.model';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Mental health related keywords for basic classification
const mentalHealthCategories = {
  anxiety: ['anxious', 'worry', 'nervous', 'panic', 'fear', 'stress', 'tense'],
  depression: ['sad', 'depress', 'hopeless', 'down', 'unhappy', 'miserable', 'empty'],
  sleep: ['insomnia', 'sleep', 'tired', 'fatigue', 'exhausted', 'rest', 'awake'],
  trauma: ['trauma', 'ptsd', 'flashback', 'nightmare', 'abuse', 'violent'],
  addiction: ['addict', 'substance', 'alcohol', 'drug', 'dependence', 'craving'],
  general: ['mental', 'health', 'therapy', 'counseling', 'psychiatrist', 'psychologist']
};

// Sentiment analysis dictionary - basic implementation
const sentimentDictionary = {
  positive: ['good', 'great', 'happy', 'better', 'improve', 'hope', 'positive', 'well', 'calm'],
  negative: ['bad', 'sad', 'depress', 'anxious', 'worry', 'stress', 'fear', 'hurt', 'pain', 'awful'],
  neutral: ['okay', 'fine', 'normal', 'average', 'so-so']
};

// Intent recognition patterns
const intentPatterns = {
  seekingHelp: ['help', 'need', 'assist', 'advice', 'suggestion', 'recommend'],
  expressingDistress: ['can\'t', 'unable', 'struggle', 'difficult', 'hard', 'overwhelm'],
  suicidalIdeation: ['suicide', 'kill myself', 'end it all', 'no reason to live', 'better off dead'],
  gratitude: ['thank', 'appreciate', 'grateful', 'helped'],
  greeting: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening']
};

/**
 * Analyzes text for mental health related content
 */
export class NLPService {
  /**
   * Analyze message sentiment
   * @param text Message text to analyze
   * @returns Sentiment classification
   */
  static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    if (!tokens || tokens.length === 0) return 'neutral';
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    tokens.forEach(token => {
      const stemmed = stemmer.stem(token);
      
      if (sentimentDictionary.positive.some(word => stemmer.stem(word) === stemmed)) {
        positiveScore++;
      }
      
      if (sentimentDictionary.negative.some(word => stemmer.stem(word) === stemmed)) {
        negativeScore++;
      }
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
  
  /**
   * Identify mental health topics in text
   * @param text Message text to analyze
   * @returns Array of identified topics
   */
  static identifyTopics(text: string): string[] {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    if (!tokens || tokens.length === 0) return [];
    
    const topics: string[] = [];
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    Object.entries(mentalHealthCategories).forEach(([category, keywords]) => {
      const stemmedKeywords = keywords.map(keyword => stemmer.stem(keyword));
      
      if (stemmedTokens.some(token => stemmedKeywords.includes(token))) {
        topics.push(category);
      }
    });
    
    return topics.length > 0 ? topics : ['general'];
  }
  
  /**
   * Detect user intent from message
   * @param text Message text to analyze
   * @returns Detected intent
   */
  static detectIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Check for suicidal ideation first (highest priority)
    if (intentPatterns.suicidalIdeation.some(keyword => 
      lowerText.includes(keyword))) {
      return 'suicidalIdeation';
    }
    
    // Check other intents
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        return intent;
      }
    }
    
    return 'general';
  }
  
  /**
   * Process a message with all NLP analysis
   * @param messageText The message text to analyze
   * @returns Processed message with NLP metadata
   */
  static processMessage(messageText: string): Pick<IMessage, 'sentiment' | 'categories'> {
    return {
      sentiment: this.analyzeSentiment(messageText),
      categories: this.identifyTopics(messageText)
    };
  }
}