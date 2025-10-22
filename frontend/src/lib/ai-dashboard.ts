import { Bill, Errand, Appointment } from '@/types';
import { getDaysUntil, isOverdue, isUpcoming } from './utils/date';

export interface SmartPriority {
  id: string;
  type: 'bill' | 'errand' | 'appointment';
  title: string;
  urgencyScore: number;
  dueDate: string;
  reason: string;
  actionUrl: string;
  item: Bill | Errand | Appointment;
}

export interface PredictiveSuggestion {
  id: string;
  type: 'recurring-errand' | 'bill-pattern' | 'appointment-reminder';
  title: string;
  description: string;
  confidence: number;
  actionText: string;
  actionUrl: string;
}

export interface TadaaSnapshot {
  completionRate: number;
  tasksCompleted: number;
  tasksRemaining: number;
  upcomingDeadlines: number;
  motivationalMessage: string;
  weeklyProgress: number;
  streak: number;
}

export interface SmartReschedule {
  id: string;
  itemId: string;
  type: 'bill' | 'errand' | 'appointment';
  title: string;
  originalDate: string;
  suggestedDate: string;
  reason: string;
}

// Calculate urgency score (0-100)
export function calculateUrgencyScore(
  daysUntil: number,
  priority: string = 'normal',
  recurrence: string = 'one-time',
  lastInteraction?: string
): number {
  let score = 50; // Base score

  // Days until due date (most important factor)
  if (daysUntil < 0) {
    score += 50; // Overdue
  } else if (daysUntil === 0) {
    score += 45; // Due today
  } else if (daysUntil === 1) {
    score += 40; // Due tomorrow
  } else if (daysUntil <= 3) {
    score += 30; // Due in 3 days
  } else if (daysUntil <= 7) {
    score += 20; // Due this week
  } else if (daysUntil <= 14) {
    score += 10; // Due in 2 weeks
  }

  // Priority factor
  if (priority === 'urgent') {
    score += 20;
  } else if (priority === 'high') {
    score += 10;
  }

  // Recurrence factor (recurring items get slight boost)
  if (recurrence !== 'one-time') {
    score += 5;
  }

  // Recent interaction penalty (if user recently interacted, lower priority)
  if (lastInteraction) {
    const daysSinceInteraction = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceInteraction < 1) {
      score -= 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}

// Generate top 3 priorities
export function generateTopPriorities(
  bills: Bill[],
  errands: Errand[],
  appointments: Appointment[]
): SmartPriority[] {
  const priorities: SmartPriority[] = [];

  // Process bills
  bills
    .filter(b => b.status !== 'paid')
    .forEach(bill => {
      const daysUntil = getDaysUntil(bill.dueDate);
      const urgencyScore = calculateUrgencyScore(
        daysUntil,
        'normal',
        bill.recurrence,
        bill.updatedAt
      );

      let reason = '';
      if (daysUntil < 0) {
        reason = `${Math.abs(daysUntil)} days overdue`;
      } else if (daysUntil === 0) {
        reason = 'Due today';
      } else if (daysUntil === 1) {
        reason = 'Due tomorrow';
      } else {
        reason = `Due in ${daysUntil} days`;
      }

      priorities.push({
        id: bill.id,
        type: 'bill',
        title: bill.name,
        urgencyScore,
        dueDate: bill.dueDate,
        reason,
        actionUrl: '/bills',
        item: bill,
      });
    });

  // Process errands
  errands
    .filter(e => e.status !== 'done')
    .forEach(errand => {
      const daysUntil = getDaysUntil(errand.preferredDate);
      const urgencyScore = calculateUrgencyScore(
        daysUntil,
        errand.priority,
        'one-time',
        errand.updatedAt
      );

      let reason = '';
      if (errand.priority === 'urgent') {
        reason = 'Urgent priority';
      } else if (daysUntil < 0) {
        reason = 'Past preferred date';
      } else if (daysUntil === 0) {
        reason = 'Preferred date is today';
      } else {
        reason = `Preferred date in ${daysUntil} days`;
      }

      priorities.push({
        id: errand.id,
        type: 'errand',
        title: errand.description.substring(0, 50) + (errand.description.length > 50 ? '...' : ''),
        urgencyScore,
        dueDate: errand.preferredDate,
        reason,
        actionUrl: '/errands',
        item: errand,
      });
    });

  // Process appointments
  appointments
    .filter(a => isUpcoming(a.date, 7))
    .forEach(appointment => {
      const daysUntil = getDaysUntil(appointment.date);
      const urgencyScore = calculateUrgencyScore(
        daysUntil,
        appointment.type === 'medical' ? 'high' : 'normal',
        appointment.recurrence,
        appointment.updatedAt
      );

      let reason = '';
      if (daysUntil === 0) {
        reason = 'Today';
      } else if (daysUntil === 1) {
        reason = 'Tomorrow';
      } else {
        reason = `In ${daysUntil} days`;
      }

      priorities.push({
        id: appointment.id,
        type: 'appointment',
        title: appointment.title,
        urgencyScore,
        dueDate: appointment.date,
        reason,
        actionUrl: '/appointments',
        item: appointment,
      });
    });

  // Sort by urgency score and return top 3
  return priorities
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 3);
}

// Generate predictive suggestions
export function generatePredictiveSuggestions(
  bills: Bill[],
  errands: Errand[],
  appointments: Appointment[]
): PredictiveSuggestion[] {
  const suggestions: PredictiveSuggestion[] = [];

  // Detect recurring bill patterns
  const recurringBills = bills.filter(b => b.recurrence !== 'one-time' && b.status !== 'paid');
  if (recurringBills.length > 0) {
    const nextDue = recurringBills
      .sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate))[0];
    
    if (getDaysUntil(nextDue.dueDate) <= 7) {
      suggestions.push({
        id: `suggestion-bill-${nextDue.id}`,
        type: 'bill-pattern',
        title: 'Upcoming Recurring Bill',
        description: `Your ${nextDue.name} bill is due soon. Want to set up auto-pay?`,
        confidence: 0.85,
        actionText: 'Set Up Auto-Pay',
        actionUrl: '/bills',
      });
    }
  }

  // Detect errand patterns (simulate based on day of week)
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Sunday grocery suggestion
  if (dayOfWeek === 0) {
    const hasGroceryErrand = errands.some(e => 
      e.type === 'groceries' && e.status !== 'done'
    );
    
    if (!hasGroceryErrand) {
      suggestions.push({
        id: 'suggestion-grocery-sunday',
        type: 'recurring-errand',
        title: 'Weekly Grocery Run',
        description: 'You usually order groceries on Sundays. Want to create an errand?',
        confidence: 0.75,
        actionText: 'Create Grocery Errand',
        actionUrl: '/errands',
      });
    }
  }

  // Appointment follow-up suggestions
  const recentAppointments = appointments.filter(a => {
    const daysSince = Math.abs(getDaysUntil(a.date));
    return daysSince <= 30 && daysSince > 0 && a.type === 'medical';
  });

  if (recentAppointments.length > 0) {
    suggestions.push({
      id: 'suggestion-followup',
      type: 'appointment-reminder',
      title: 'Medical Follow-up',
      description: 'You had a medical appointment recently. Need to schedule a follow-up?',
      confidence: 0.65,
      actionText: 'Schedule Follow-up',
      actionUrl: '/appointments',
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Generate Tadaa Snapshot
export function generateTadaaSnapshot(
  bills: Bill[],
  errands: Errand[],
  appointments: Appointment[]
): TadaaSnapshot {
  // Calculate completion metrics
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  
  const totalErrands = errands.length;
  const doneErrands = errands.filter(e => e.status === 'done').length;
  
  const totalTasks = totalBills + totalErrands;
  const completedTasks = paidBills + doneErrands;
  const remainingTasks = totalTasks - completedTasks;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Count upcoming deadlines (next 7 days)
  const upcomingDeadlines = [
    ...bills.filter(b => b.status !== 'paid' && isUpcoming(b.dueDate, 7)),
    ...errands.filter(e => e.status !== 'done' && isUpcoming(e.preferredDate, 7)),
    ...appointments.filter(a => isUpcoming(a.date, 7)),
  ].length;

  // Calculate weekly progress (simulate)
  const weeklyProgress = Math.min(100, completionRate + 10);

  // Calculate streak (simulate based on completion rate)
  const streak = completionRate > 80 ? 7 : completionRate > 60 ? 3 : 1;

  // Generate motivational message
  let motivationalMessage = '';
  if (completionRate >= 90) {
    motivationalMessage = "🎉 Amazing! You're crushing it this week!";
  } else if (completionRate >= 70) {
    motivationalMessage = "💪 Great progress! Keep up the momentum!";
  } else if (completionRate >= 50) {
    motivationalMessage = "👍 You're on track! A few more tasks to go!";
  } else if (completionRate >= 30) {
    motivationalMessage = "🚀 Let's finish strong! You've got this!";
  } else {
    motivationalMessage = "✨ Fresh start! Let's tackle today's priorities!";
  }

  return {
    completionRate: Math.round(completionRate),
    tasksCompleted: completedTasks,
    tasksRemaining: remainingTasks,
    upcomingDeadlines,
    motivationalMessage,
    weeklyProgress: Math.round(weeklyProgress),
    streak,
  };
}

// Generate smart reschedule suggestions
export function generateRescheduleSuggestions(
  bills: Bill[],
  errands: Errand[],
  appointments: Appointment[]
): SmartReschedule[] {
  const suggestions: SmartReschedule[] = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Overdue bills
  bills
    .filter(b => isOverdue(b.dueDate) && b.status !== 'paid')
    .forEach(bill => {
      suggestions.push({
        id: `reschedule-bill-${bill.id}`,
        itemId: bill.id,
        type: 'bill',
        title: bill.name,
        originalDate: bill.dueDate,
        suggestedDate: tomorrowStr,
        reason: 'This bill is overdue. Pay it tomorrow?',
      });
    });

  // Past-due errands
  errands
    .filter(e => isOverdue(e.preferredDate) && e.status === 'pending')
    .forEach(errand => {
      suggestions.push({
        id: `reschedule-errand-${errand.id}`,
        itemId: errand.id,
        type: 'errand',
        title: errand.description.substring(0, 50),
        originalDate: errand.preferredDate,
        suggestedDate: tomorrowStr,
        reason: 'Preferred date passed. Reschedule for tomorrow?',
      });
    });

  return suggestions;
}

// Generate context-aware notification message
export function generateContextAwareMessage(
  type: 'reminder' | 'encouragement' | 'summary',
  context: {
    itemCount?: number;
    completionRate?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    itemName?: string;
  }
): string {
  const { itemCount = 0, completionRate = 0, timeOfDay = 'morning', itemName = '' } = context;

  if (type === 'reminder') {
    const templates = [
      `Quick reminder: ${itemName} needs your attention! 📋`,
      `Hey! Don't forget about ${itemName} 👋`,
      `Friendly nudge: ${itemName} is waiting for you ⏰`,
      `Time to tackle ${itemName}? You've got this! 💪`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  if (type === 'encouragement') {
    if (completionRate >= 80) {
      return "🎉 You're on fire! Almost everything is done!";
    } else if (completionRate >= 60) {
      return "💪 Great momentum! Keep going!";
    } else if (completionRate >= 40) {
      return "👍 You're making progress! Stay focused!";
    } else {
      return "✨ Let's do this! Start with one task at a time!";
    }
  }

  if (type === 'summary') {
    const greetings = {
      morning: '☀️ Good morning!',
      afternoon: '👋 Good afternoon!',
      evening: '🌙 Good evening!',
    };

    if (itemCount === 0) {
      return `${greetings[timeOfDay]} You're all caught up! Enjoy your day! 🎉`;
    } else if (itemCount === 1) {
      return `${greetings[timeOfDay]} You have 1 task remaining today.`;
    } else if (itemCount <= 3) {
      return `${greetings[timeOfDay]} ${itemCount} tasks remaining. You're almost there!`;
    } else {
      return `${greetings[timeOfDay]} ${itemCount} tasks on your plate today. Let's prioritize!`;
    }
  }

  return '';
}