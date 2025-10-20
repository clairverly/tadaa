import { Bill, PaymentRecord, PaymentMethod } from '@/types';
import { billStorage, paymentStorage, notificationStorage } from './storage';
import { Notification } from '@/types';

export interface PaymentResult {
  success: boolean;
  paymentRecord: PaymentRecord;
  shouldRetry: boolean;
  failureReason?: string;
}

// Simulate payment processing with 80% success rate
export function processPayment(bill: Bill, paymentMethod: PaymentMethod): PaymentResult {
  const random = Math.random();
  const success = random > 0.2; // 80% success rate
  
  const paymentRecord: PaymentRecord = {
    id: `payment-${Date.now()}`,
    date: new Date().toISOString(),
    amount: bill.amount,
    status: success ? 'success' : 'failed',
    paymentMethodId: paymentMethod.id,
    failureReason: success ? undefined : getRandomFailureReason(),
  };

  return {
    success,
    paymentRecord,
    shouldRetry: !success && bill.retryCount < 3,
    failureReason: paymentRecord.failureReason,
  };
}

function getRandomFailureReason(): string {
  const reasons = [
    'Insufficient funds',
    'Card declined',
    'Payment gateway timeout',
    'Invalid card details',
    'Bank authorization failed',
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

export async function attemptAutomaticPayment(billId: string): Promise<void> {
  const bills = billStorage.getAll();
  const bill = bills.find(b => b.id === billId);
  
  if (!bill || !bill.autoPayEnabled || !bill.paymentMethodId) {
    return;
  }

  // Check auto-pay limit
  if (bill.autoPayLimit && bill.amount > bill.autoPayLimit) {
    createLimitExceededNotification(bill);
    return;
  }

  const paymentMethods = paymentStorage.getAll();
  const paymentMethod = paymentMethods.find(pm => pm.id === bill.paymentMethodId);
  
  if (!paymentMethod) {
    createPaymentFailureNotification(bill, 'Payment method not found');
    return;
  }

  const result = processPayment(bill, paymentMethod);
  
  // Update bill with payment attempt
  const updates: Partial<Bill> = {
    lastPaymentAttempt: new Date().toISOString(),
    paymentHistory: [...bill.paymentHistory, result.paymentRecord],
  };

  if (result.success) {
    updates.status = 'paid';
    updates.retryCount = 0;
    createPaymentSuccessNotification(bill);
  } else {
    updates.retryCount = bill.retryCount + 1;
    
    if (result.shouldRetry) {
      // Schedule retry (in real app, this would be a background job)
      updates.status = 'upcoming';
      createPaymentRetryNotification(bill, updates.retryCount, result.failureReason);
    } else {
      // Max retries reached
      updates.status = 'payment-failed';
      createPaymentFailureNotification(bill, result.failureReason);
    }
  }

  billStorage.update(billId, updates);
}

function createLimitExceededNotification(bill: Bill): void {
  const notification: Notification = {
    id: `notif-limit-exceeded-${Date.now()}`,
    type: 'payment-failure',
    priority: 'high',
    title: 'Auto-Pay Limit Exceeded',
    message: `${bill.name} bill amount ($${bill.amount.toFixed(2)}) exceeds your auto-pay limit of $${bill.autoPayLimit!.toFixed(2)}. Please review and pay manually.`,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: '/bills',
    relatedId: bill.id,
    customizable: true,
  };
  
  const notifications = notificationStorage.getAll();
  notificationStorage.save([notification, ...notifications]);
}

function createPaymentSuccessNotification(bill: Bill): void {
  const notification: Notification = {
    id: `notif-payment-success-${Date.now()}`,
    type: 'payment',
    priority: 'low',
    title: 'Payment Successful',
    message: `Your payment of $${bill.amount.toFixed(2)} for ${bill.name} was processed successfully.`,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: '/bills',
    relatedId: bill.id,
    customizable: false,
  };
  
  const notifications = notificationStorage.getAll();
  notificationStorage.save([notification, ...notifications]);
}

function createPaymentRetryNotification(bill: Bill, retryCount: number, reason?: string): void {
  const notification: Notification = {
    id: `notif-payment-retry-${Date.now()}`,
    type: 'payment-failure',
    priority: 'medium',
    title: 'Payment Retry Scheduled',
    message: `Payment for ${bill.name} failed (${reason}). Retry attempt ${retryCount} of 3 will be made shortly.`,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: '/bills',
    relatedId: bill.id,
    customizable: true,
  };
  
  const notifications = notificationStorage.getAll();
  notificationStorage.save([notification, ...notifications]);
}

function createPaymentFailureNotification(bill: Bill, reason?: string): void {
  const notification: Notification = {
    id: `notif-payment-failed-${Date.now()}`,
    type: 'payment-failure',
    priority: 'urgent',
    title: 'Payment Failed - Action Required',
    message: `Automatic payment for ${bill.name} ($${bill.amount.toFixed(2)}) has failed after 3 attempts. ${reason ? `Reason: ${reason}.` : ''} Please update your payment method or pay manually.`,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: '/bills',
    relatedId: bill.id,
    customizable: true,
  };
  
  const notifications = notificationStorage.getAll();
  notificationStorage.save([notification, ...notifications]);
}

export function retryFailedPayment(billId: string): void {
  attemptAutomaticPayment(billId);
}