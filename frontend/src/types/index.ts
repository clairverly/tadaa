export type BillStatus = 'upcoming' | 'overdue' | 'paid';
export type BillRecurrence = 'one-time' | 'weekly' | 'monthly' | 'yearly';
export type BillCategory = 'utilities' | 'rent' | 'insurance' | 'subscription' | 'credit-card' | 'other';

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
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
}

export type ErrandStatus = 'pending' | 'in-progress' | 'done';
export type ErrandPriority = 'normal' | 'urgent';
export type ErrandCategory = 'home-maintenance' | 'cleaning' | 'gardening' | 'groceries' | 'delivery' | 'pharmacy';

export interface Errand {
  id: string;
  type: ErrandCategory;
  description: string;
  priority: ErrandPriority;
  status: ErrandStatus;
  preferredDate: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  trustedContacts: TrustedContact[];
  notificationPreferences: {
    billReminders: boolean;
    appointmentReminders: boolean;
    errandUpdates: boolean;
  };
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
export type NotificationType = 'bill' | 'appointment' | 'errand' | 'payment' | 'system';
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
  relatedId?: string; // ID of related bill, appointment, etc.
}