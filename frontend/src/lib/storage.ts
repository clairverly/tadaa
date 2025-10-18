import { Bill, Errand, Appointment, UserProfile, UrgentAlert, PaymentMethod, Notification } from '@/types';

const STORAGE_KEYS = {
  BILLS: 'tadaa_bills',
  ERRANDS: 'tadaa_errands',
  APPOINTMENTS: 'tadaa_appointments',
  USER_PROFILE: 'tadaa_user_profile',
  URGENT_ALERTS: 'tadaa_urgent_alerts',
  PAYMENT_METHODS: 'tadaa_payment_methods',
  NOTIFICATIONS: 'tadaa_notifications',
} as const;

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// Bills
export const billStorage = {
  getAll: (): Bill[] => getFromStorage(STORAGE_KEYS.BILLS, []),
  save: (bills: Bill[]) => saveToStorage(STORAGE_KEYS.BILLS, bills),
  add: (bill: Bill) => {
    const bills = billStorage.getAll();
    bills.push(bill);
    billStorage.save(bills);
  },
  update: (id: string, updates: Partial<Bill>) => {
    const bills = billStorage.getAll();
    const index = bills.findIndex(b => b.id === id);
    if (index !== -1) {
      bills[index] = { ...bills[index], ...updates, updatedAt: new Date().toISOString() };
      billStorage.save(bills);
    }
  },
  delete: (id: string) => {
    const bills = billStorage.getAll().filter(b => b.id !== id);
    billStorage.save(bills);
  },
};

// Errands
export const errandStorage = {
  getAll: (): Errand[] => getFromStorage(STORAGE_KEYS.ERRANDS, []),
  save: (errands: Errand[]) => saveToStorage(STORAGE_KEYS.ERRANDS, errands),
  add: (errand: Errand) => {
    const errands = errandStorage.getAll();
    errands.push(errand);
    errandStorage.save(errands);
  },
  update: (id: string, updates: Partial<Errand>) => {
    const errands = errandStorage.getAll();
    const index = errands.findIndex(e => e.id === id);
    if (index !== -1) {
      errands[index] = { ...errands[index], ...updates, updatedAt: new Date().toISOString() };
      errandStorage.save(errands);
    }
  },
  delete: (id: string) => {
    const errands = errandStorage.getAll().filter(e => e.id !== id);
    errandStorage.save(errands);
  },
};

// Appointments
export const appointmentStorage = {
  getAll: (): Appointment[] => getFromStorage(STORAGE_KEYS.APPOINTMENTS, []),
  save: (appointments: Appointment[]) => saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments),
  add: (appointment: Appointment) => {
    const appointments = appointmentStorage.getAll();
    appointments.push(appointment);
    appointmentStorage.save(appointments);
  },
  update: (id: string, updates: Partial<Appointment>) => {
    const appointments = appointmentStorage.getAll();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
      appointmentStorage.save(appointments);
    }
  },
  delete: (id: string) => {
    const appointments = appointmentStorage.getAll().filter(a => a.id !== id);
    appointmentStorage.save(appointments);
  },
};

// User Profile
export const userStorage = {
  get: (): UserProfile | null => getFromStorage(STORAGE_KEYS.USER_PROFILE, null),
  save: (profile: UserProfile) => saveToStorage(STORAGE_KEYS.USER_PROFILE, profile),
  update: (updates: Partial<UserProfile>) => {
    const profile = userStorage.get();
    if (profile) {
      userStorage.save({ ...profile, ...updates });
    }
  },
};

// Urgent Alerts
export const alertStorage = {
  getAll: (): UrgentAlert[] => getFromStorage(STORAGE_KEYS.URGENT_ALERTS, []),
  save: (alerts: UrgentAlert[]) => saveToStorage(STORAGE_KEYS.URGENT_ALERTS, alerts),
  add: (alert: UrgentAlert) => {
    const alerts = alertStorage.getAll();
    alerts.push(alert);
    alertStorage.save(alerts);
  },
};

// Payment Methods
export const paymentStorage = {
  getAll: (): PaymentMethod[] => getFromStorage(STORAGE_KEYS.PAYMENT_METHODS, []),
  save: (methods: PaymentMethod[]) => saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, methods),
  add: (method: PaymentMethod) => {
    const methods = paymentStorage.getAll();
    
    if (method.isDefault) {
      methods.forEach(m => m.isDefault = false);
    }
    
    methods.push(method);
    paymentStorage.save(methods);
  },
  update: (id: string, updates: Partial<PaymentMethod>) => {
    const methods = paymentStorage.getAll();
    const index = methods.findIndex(m => m.id === id);
    
    if (index !== -1) {
      if (updates.isDefault) {
        methods.forEach(m => m.isDefault = false);
      }
      
      methods[index] = { ...methods[index], ...updates };
      paymentStorage.save(methods);
    }
  },
  delete: (id: string) => {
    const methods = paymentStorage.getAll().filter(m => m.id !== id);
    
    const hasDefault = methods.some(m => m.isDefault);
    if (!hasDefault && methods.length > 0) {
      methods[0].isDefault = true;
    }
    
    paymentStorage.save(methods);
  },
  setDefault: (id: string) => {
    const methods = paymentStorage.getAll();
    methods.forEach(m => m.isDefault = m.id === id);
    paymentStorage.save(methods);
  },
};

// Notifications
export const notificationStorage = {
  getAll: (): Notification[] => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []),
  save: (notifications: Notification[]) => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications),
  markAsRead: (id: string) => {
    const notifications = notificationStorage.getAll();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      notificationStorage.save(notifications);
    }
  },
  markAllAsRead: () => {
    const notifications = notificationStorage.getAll();
    notifications.forEach(n => n.isRead = true);
    notificationStorage.save(notifications);
  },
  delete: (id: string) => {
    const notifications = notificationStorage.getAll().filter(n => n.id !== id);
    notificationStorage.save(notifications);
  },
  clearAll: () => {
    notificationStorage.save([]);
  },
};

// Initialize default user profile if none exists
export function initializeUserProfile() {
  if (!userStorage.get()) {
    const defaultProfile: UserProfile = {
      id: 'user-1',
      name: 'User',
      email: 'user@tadaa.app',
      trustedContacts: [],
      notificationPreferences: {
        billReminders: true,
        appointmentReminders: true,
        errandUpdates: true,
      },
    };
    userStorage.save(defaultProfile);
  }
}