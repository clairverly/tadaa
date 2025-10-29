export type BillStatus = 'upcoming' | 'overdue' | 'paid' | 'payment-failed';
export type BillRecurrence = 'one-time' | 'daily' | 'daily-weekdays' | 'weekly' | 'monthly' | 'yearly' | 'as-billed';
export type BillCategory = 'utilities' | 'telco-internet' | 'insurance' | 'subscriptions' | 'credit-loans' | 'general';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  recurrence: BillRecurrence;
  category: BillCategory;
  status: BillStatus;
  reminderDays: number[];
  reminderEnabled: boolean;
  providerEmails: string[];
  attachmentPassword?: string;
  paymentHistory: PaymentRecord[];
  autoPayEnabled: boolean;
  autoPayLimit?: number;
  paymentMethodId?: string;
  retryCount: number;
  lastPaymentAttempt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  paymentMethodId?: string;
  failureReason?: string;
}

export type ErrandStatus = 'pending' | 'in-progress' | 'done';
export type ErrandPriority = 'normal' | 'urgent';
export type ErrandCategory = 'home-maintenance' | 'cleaning' | 'gardening' | 'groceries' | 'delivery' | 'pharmacy';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedPrice: number;
  purchased: boolean;
}

export interface Errand {
  id: string;
  type: ErrandCategory;
  description: string;
  priority: ErrandPriority;
  status: ErrandStatus;
  preferredDate: string;
  adminNotes: string;
  reminderEnabled: boolean;
  reminderHours: number;
  groceryList?: GroceryItem[];
  scannedImageUrl?: string;
  totalEstimatedCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseTrend {
  itemName: string;
  frequency: number; // times per month
  lastPurchased: string;
  averageQuantity: number;
  category: string;
}

export type AppointmentType = 'personal' | 'family' | 'medical';

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: AppointmentType;
  notes: string;
  recurrence: BillRecurrence;
  reminderMinutes: number;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface UrgentAlert {
  id: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastVerified?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  trustedContacts: TrustedContact[];
  notificationPreferences: {
    billReminders: boolean;
    appointmentReminders: boolean;
    errandUpdates: boolean;
    paymentFailures: boolean;
  };
  purchaseHistory: PurchaseTrend[];
  twoFactorAuth?: TwoFactorAuth;
}

export interface DashboardStats {
  upcomingBills: number;
  overdueBills: number;
  activeErrands: number;
  upcomingAppointments: number;
}

// Payment Method Types
export type PaymentMethodType = 'card' | 'paynow' | 'bank';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  nickname: string;
  createdAt: string;
  
  // Card specific fields
  cardBrand?: CardBrand;
  cardLast4?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardHolderName?: string;
  
  // PayNow specific fields
  payNowMobile?: string;
  
  // Bank account specific fields
  bankName?: string;
  bankAccountLast4?: string;
  bankAccountHolderName?: string;
}

// Notification Types
export type NotificationType = 'bill' | 'appointment' | 'errand' | 'payment' | 'payment-failure' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  relatedId?: string;
  customizable?: boolean;
}

// Grocery Subscription Types
export interface GrocerySubscription {
  id: string;
  name: string;
  items: GroceryItem[];
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextDelivery: string;
  active: boolean;
  paymentMethodId: string;
  createdAt: string;
}

// AI Extraction Types
export type ItemType = 'task' | 'reminder' | 'bill' | 'schedule' | 'payment';
export type ExtractionStatus = 'extracting' | 'incomplete' | 'complete' | 'saved';

export interface ExtractionResponse {
  detected: boolean;
  item_type: ItemType | null;
  extracted_data: Record<string, any>;
  missing_fields: string[];
  status: ExtractionStatus;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ExtractedItem {
  id: string;
  item_type: ItemType | null;
  status: ExtractionStatus;
  extracted_data: Record<string, any>;
  missing_fields: string[];
  created_at: string;
  updated_at: string;
  saved_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  extracted_items: ExtractedItem[];
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  extraction?: ExtractionResponse;
}