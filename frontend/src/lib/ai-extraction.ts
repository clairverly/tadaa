import api from './api';
import {
  ChatRequest,
  ChatResponse,
  Conversation,
  ExtractionResponse,
  ItemType,
  ExtractionStatus
} from '@/types';

/**
 * Send a message to the AI extraction service
 */
export async function sendMessageWithExtraction(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  try {
    const request: ChatRequest = {
      message,
      conversation_id: conversationId
    };

    const response = await api.post<ChatResponse>('/api/ai/extract/chat', request);
    return response.data;
  } catch (error: any) {
    console.error('AI Extraction error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to use the AI assistant');
    } else if (error.response?.status === 500) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await api.get<Conversation[]>('/api/ai/extract/conversations');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  try {
    const response = await api.get<Conversation>(`/api/ai/extract/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation');
  }
}

/**
 * Save an extracted item to its appropriate collection
 */
export async function saveExtractedItem(
  conversationId: string,
  itemId: string
): Promise<{ success: boolean; item_id: string; collection: string }> {
  try {
    const response = await api.post(
      `/api/ai/extract/conversations/${conversationId}/save-item/${itemId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error saving extracted item:', error);
    
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to save item');
  }
}

/**
 * Helper to determine if extraction is complete
 */
export function isExtractionComplete(extraction?: ExtractionResponse): boolean {
  if (!extraction || !extraction.detected) return false;
  return extraction.status === 'complete' && extraction.missing_fields.length === 0;
}

/**
 * Helper to get user-friendly field names
 */
export function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    // Task fields
    type: 'Task Type',
    description: 'Description',
    priority: 'Priority',
    preferredDate: 'Preferred Date',
    notes: 'Notes',
    
    // Reminder fields
    title: 'Title',
    reminderDate: 'Reminder Date',
    reminderTime: 'Reminder Time',
    recurrence: 'Recurrence',
    
    // Bill fields
    name: 'Bill Name',
    amount: 'Amount',
    dueDate: 'Due Date',
    category: 'Category',
    reminderDays: 'Reminder Days',
    autoPayEnabled: 'Auto-Pay',
    
    // Schedule fields
    date: 'Date',
    time: 'Time',
    location: 'Location',
    
    // Payment fields
    nickname: 'Nickname',
    cardBrand: 'Card Brand',
    cardLast4: 'Last 4 Digits',
    cardExpiryMonth: 'Expiry Month',
    cardExpiryYear: 'Expiry Year',
    cardHolderName: 'Cardholder Name',
    payNowMobile: 'PayNow Mobile',
    bankName: 'Bank Name',
    bankAccountLast4: 'Account Last 4 Digits',
    bankAccountHolderName: 'Account Holder Name'
  };
  
  return fieldMap[field] || field.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Helper to get item type display name
 */
export function getItemTypeDisplayName(itemType: ItemType | null): string {
  if (!itemType) return 'Unknown';
  
  const typeMap: Record<ItemType, string> = {
    task: 'Task',
    reminder: 'Reminder',
    bill: 'Bill',
    schedule: 'Appointment',
    payment: 'Payment Method'
  };
  
  return typeMap[itemType] || itemType;
}

/**
 * Helper to format extracted data for display
 */
export function formatExtractedData(data: Record<string, any>): string {
  const entries = Object.entries(data);
  if (entries.length === 0) return 'No data extracted yet';
  
  return entries
    .map(([key, value]) => {
      const displayName = getFieldDisplayName(key);
      let displayValue = value;
      
      // Format specific types
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (typeof value === 'number') {
        // Check if it's a currency amount
        if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
          displayValue = `$${value.toFixed(2)}`;
        }
      } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        // Format dates
        displayValue = new Date(value).toLocaleDateString();
      }
      
      return `• ${displayName}: ${displayValue}`;
    })
    .join('\n');
}

/**
 * Helper to get extraction status color
 */
export function getExtractionStatusColor(status: ExtractionStatus): string {
  const colorMap: Record<ExtractionStatus, string> = {
    extracting: 'text-blue-600',
    incomplete: 'text-yellow-600',
    complete: 'text-green-600',
    saved: 'text-gray-600'
  };
  
  return colorMap[status] || 'text-gray-600';
}

/**
 * Helper to get extraction status icon
 */
export function getExtractionStatusIcon(status: ExtractionStatus): string {
  const iconMap: Record<ExtractionStatus, string> = {
    extracting: '🔄',
    incomplete: '⚠️',
    complete: '✅',
    saved: '💾'
  };
  
  return iconMap[status] || '❓';
}