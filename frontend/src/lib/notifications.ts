import { Bill, Appointment, Errand, PaymentMethod, Notification, NotificationPriority } from '@/types';
import { getDaysUntil, isAfter, isBefore, addDays, differenceInDays } from './utils/date';

export function generateBillNotifications(bills: Bill[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  bills.forEach(bill => {
    if (bill.status === 'paid') return;
    
    // Skip reminder notifications if auto-pay is enabled
    if (bill.autoPayEnabled) return;

    const daysUntil = getDaysUntil(bill.dueDate);
    
    // Overdue bills
    if (daysUntil < 0) {
      notifications.push({
        id: `notif-bill-overdue-${bill.id}`,
        type: 'bill',
        priority: 'urgent',
        title: 'Overdue Bill',
        message: `${bill.name} is ${Math.abs(daysUntil)} days overdue ($${bill.amount.toFixed(2)})`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/bills',
        relatedId: bill.id,
      });
    }
    // Due today
    else if (daysUntil === 0) {
      notifications.push({
        id: `notif-bill-today-${bill.id}`,
        type: 'bill',
        priority: 'high',
        title: 'Bill Due Today',
        message: `${bill.name} is due today ($${bill.amount.toFixed(2)})`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/bills',
        relatedId: bill.id,
      });
    }
    // Due in 1 day
    else if (daysUntil === 1) {
      notifications.push({
        id: `notif-bill-1day-${bill.id}`,
        type: 'bill',
        priority: 'high',
        title: 'Bill Due Tomorrow',
        message: `${bill.name} is due tomorrow ($${bill.amount.toFixed(2)})`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/bills',
        relatedId: bill.id,
      });
    }
    // Due in 3 days
    else if (daysUntil === 3) {
      notifications.push({
        id: `notif-bill-3days-${bill.id}`,
        type: 'bill',
        priority: 'medium',
        title: 'Bill Due Soon',
        message: `${bill.name} is due in 3 days ($${bill.amount.toFixed(2)})`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/bills',
        relatedId: bill.id,
      });
    }
    // Due in 7 days
    else if (daysUntil === 7) {
      notifications.push({
        id: `notif-bill-7days-${bill.id}`,
        type: 'bill',
        priority: 'low',
        title: 'Upcoming Bill',
        message: `${bill.name} is due in 7 days ($${bill.amount.toFixed(2)})`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/bills',
        relatedId: bill.id,
      });
    }
  });

  return notifications;
}

export function generateAppointmentNotifications(appointments: Appointment[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  appointments.forEach(apt => {
    const daysUntil = getDaysUntil(apt.date);
    
    // Today
    if (daysUntil === 0) {
      notifications.push({
        id: `notif-apt-today-${apt.id}`,
        type: 'appointment',
        priority: 'high',
        title: 'Appointment Today',
        message: `${apt.title} at ${apt.time}`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/appointments',
        relatedId: apt.id,
      });
    }
    // Tomorrow
    else if (daysUntil === 1) {
      notifications.push({
        id: `notif-apt-tomorrow-${apt.id}`,
        type: 'appointment',
        priority: 'medium',
        title: 'Appointment Tomorrow',
        message: `${apt.title} at ${apt.time}`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/appointments',
        relatedId: apt.id,
      });
    }
    // This week
    else if (daysUntil > 0 && daysUntil <= 7) {
      notifications.push({
        id: `notif-apt-week-${apt.id}`,
        type: 'appointment',
        priority: 'low',
        title: 'Upcoming Appointment',
        message: `${apt.title} in ${daysUntil} days at ${apt.time}`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/appointments',
        relatedId: apt.id,
      });
    }
  });

  return notifications;
}

export function generateErrandNotifications(errands: Errand[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  errands.forEach(errand => {
    // Urgent errands that are pending
    if (errand.priority === 'urgent' && errand.status === 'pending') {
      notifications.push({
        id: `notif-errand-urgent-${errand.id}`,
        type: 'errand',
        priority: 'high',
        title: 'Urgent Errand Pending',
        message: `${errand.type.replace('-', ' ')}: ${errand.description.substring(0, 50)}...`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/errands',
        relatedId: errand.id,
      });
    }
    
    // Status updates (simulated - in real app would track status changes)
    if (errand.status === 'in-progress') {
      notifications.push({
        id: `notif-errand-progress-${errand.id}`,
        type: 'errand',
        priority: 'medium',
        title: 'Errand In Progress',
        message: `Your ${errand.type.replace('-', ' ')} errand is now in progress`,
        timestamp: now.toISOString(),
        isRead: false,
        actionUrl: '/errands',
        relatedId: errand.id,
      });
    }
  });

  return notifications;
}

export function generatePaymentNotifications(paymentMethods: PaymentMethod[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  paymentMethods.forEach(method => {
    if (method.type === 'card' && method.cardExpiryMonth && method.cardExpiryYear) {
      const expiryYear = 2000 + parseInt(method.cardExpiryYear);
      const expiryMonth = parseInt(method.cardExpiryMonth);
      
      // Card expiring this month
      if (expiryYear === currentYear && expiryMonth === currentMonth) {
        notifications.push({
          id: `notif-card-expiring-${method.id}`,
          type: 'payment',
          priority: 'high',
          title: 'Card Expiring Soon',
          message: `Your ${method.cardBrand?.toUpperCase()} ending in ${method.cardLast4} expires this month`,
          timestamp: now.toISOString(),
          isRead: false,
          actionUrl: '/payments',
          relatedId: method.id,
        });
      }
      // Card expiring next month
      else if (
        (expiryYear === currentYear && expiryMonth === currentMonth + 1) ||
        (currentMonth === 12 && expiryYear === currentYear + 1 && expiryMonth === 1)
      ) {
        notifications.push({
          id: `notif-card-expiring-next-${method.id}`,
          type: 'payment',
          priority: 'medium',
          title: 'Card Expiring Next Month',
          message: `Your ${method.cardBrand?.toUpperCase()} ending in ${method.cardLast4} expires next month`,
          timestamp: now.toISOString(),
          isRead: false,
          actionUrl: '/payments',
          relatedId: method.id,
        });
      }
    }
  });

  return notifications;
}

export function generateAllNotifications(
  bills: Bill[],
  appointments: Appointment[],
  errands: Errand[],
  paymentMethods: PaymentMethod[]
): Notification[] {
  const billNotifs = generateBillNotifications(bills);
  const aptNotifs = generateAppointmentNotifications(appointments);
  const errandNotifs = generateErrandNotifications(errands);
  const paymentNotifs = generatePaymentNotifications(paymentMethods);

  const allNotifications = [
    ...billNotifs,
    ...aptNotifs,
    ...errandNotifs,
    ...paymentNotifs,
  ];

  // Sort by priority and timestamp
  const priorityOrder: Record<NotificationPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return allNotifications.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}