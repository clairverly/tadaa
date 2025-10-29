import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';

export function formatDate(date: string | Date): string {
  if (!date || date === '') {
    return 'Anytime';
  }
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return 'Anytime';
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
}

export function isOverdue(dueDate: string): boolean {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    due.setHours(0, 0, 0, 0);
    return isBefore(due, today);
  } catch {
    return false;
  }
}

export function isUpcoming(dueDate: string, days: number = 7): boolean {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    due.setHours(0, 0, 0, 0);
    const futureDate = addDays(today, days);
    return isAfter(due, today) && isBefore(due, futureDate);
  } catch {
    return false;
  }
}

export function getDaysUntil(dueDate: string): number {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    due.setHours(0, 0, 0, 0);
    return differenceInDays(due, today);
  } catch {
    return 0;
  }
}

export function getNextRecurringDate(currentDate: string, recurrence: string): string {
  try {
    const date = parseISO(currentDate);
    switch (recurrence) {
      case 'weekly':
        return addDays(date, 7).toISOString();
      case 'monthly':
        return addDays(date, 30).toISOString();
      case 'yearly':
        return addDays(date, 365).toISOString();
      default:
        return currentDate;
    }
  } catch {
    return currentDate;
  }
}