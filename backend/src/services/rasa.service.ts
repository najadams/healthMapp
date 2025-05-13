import axios from 'axios';
import { IMessage } from '../models/chat.model';

const RASA_SERVER_URL = process.env.RASA_SERVER_URL || 'http://127.0.0.1:5005';

export class RasaService {
  /**
   * Send a message to Rasa and get a response
   * @param userId User identifier for conversation tracking
   * @param message Message text to send to Rasa
   * @returns Promise with Rasa response
   */
  static async sendMessage(userId: string, message: string): Promise<string[]> {
    try {
      const response = await axios.post(`${RASA_SERVER_URL}/webhooks/rest/webhook`, {
        sender: userId,
        message: message
      });
      
      // Extract text responses from Rasa
      const messages = response.data.map((msg: any) => msg.text);
      return messages.length > 0 ? messages : ["I'm not sure how to respond to that. Could you rephrase?"];
    } catch (error) {
      console.error('Error communicating with Rasa:', error);
      return ["I'm having trouble processing your message right now. Please try again later."];
    }
  }
  
  /**
   * Process a message with Rasa and format it for the chat system
   * @param userId User identifier
   * @param messageText Message content
   * @returns Formatted AI response message
   */
  static async processMessage(userId: string, messageText: string): Promise<Pick<IMessage, 'content' | 'sentiment' | 'categories'>> {
    const rasaResponses = await this.sendMessage(userId, messageText);
    
    // Join multiple responses with line breaks
    const combinedResponse = rasaResponses.join('\n\n');
    
    // For now, use simple sentiment detection
    // In a production app, you might want to use Rasa's intent confidence scores
    const sentiment = this.detectSentiment(combinedResponse);
    
    // Extract categories based on response content
    const categories = this.extractCategories(combinedResponse, messageText);
    
    return {
      content: combinedResponse,
      sentiment,
      categories
    };
  }
  
  /**
   * Simple sentiment detection (placeholder for more sophisticated analysis)
   */
  private static detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['good', 'great', 'better', 'improve', 'positive', 'progress', 'helpful'];
    const negativeWords = ['sorry', 'difficult', 'challenging', 'concern', 'worried'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
  
  /**
   * Extract mental health categories from response
   */
  private static extractCategories(response: string, userMessage: string): string[] {
    const categories: string[] = [];
    const combinedText = (response + ' ' + userMessage).toLowerCase();
    
    if (/anxi|worry|stress|panic|nervous/.test(combinedText)) categories.push('anxiety');
    if (/depress|sad|hopeless|down|unhappy/.test(combinedText)) categories.push('depression');
    if (/sleep|insomnia|tired|fatigue|rest/.test(combinedText)) categories.push('sleep');
    if (/trauma|ptsd|flashback|nightmare|abuse/.test(combinedText)) categories.push('trauma');
    if (/suicid|harm|kill|end it|die/.test(combinedText)) categories.push('crisis');
    
    return categories.length > 0 ? categories : ['general'];
  }
}