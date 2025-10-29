import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  bills: any[];
  errands: any[];
  appointments: any[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: ChatContext;
}

export interface ChatResponse {
  message: string;
  role: string;
}

/**
 * Send a message to Claude AI and get a response
 */
export async function sendMessageToClaude(
  messages: ChatMessage[],
  context?: ChatContext
): Promise<string> {
  try {
    const response = await api.post<ChatResponse>('/api/ai/chat', {
      messages,
      context,
    });
    
    return response.data.message;
  } catch (error: any) {
    console.error('Claude API error:', error);
    
    // Fallback error message
    if (error.response?.status === 401) {
      throw new Error('Please log in to use the AI assistant');
    } else if (error.response?.status === 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}