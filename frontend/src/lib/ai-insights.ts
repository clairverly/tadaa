import { Bill, PaymentRecord } from '@/types';
import { getDaysUntil, formatDate } from './utils/date';

export interface AIInsight {
  id: string;
  type: 'reminder' | 'pattern' | 'prediction' | 'alert' | 'tip' | 'trend' | 'savings';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  naturalLanguage: string;
  actionable: boolean;
  actionUrl?: string;
  relatedBillId?: string;
  savingsAmount?: number;
  timestamp: string;
}

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface BillPrediction {
  billId: string;
  billName: string;
  predictedAmount: number;
  confidence: number;
  basedOnHistory: number;
}

export interface TrendAnalysis {
  billId: string;
  billName: string;
  category: string;
  currentAmount: number;
  previousAverage: number;
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  monthsAnalyzed: number;
}

export interface SubscriptionAnalysis {
  category: string;
  totalMonthly: number;
  bills: Array<{ name: string; amount: number }>;
  potentialSavings: number;
  recommendation: string;
}

// Generate natural language reminders
export function generateNaturalLanguageReminders(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  bills.forEach(bill => {
    if (bill.status === 'paid' || bill.autoPayEnabled) return;

    const daysUntil = getDaysUntil(bill.dueDate);
    
    // Tomorrow
    if (daysUntil === 1) {
      insights.push({
        id: `ai-reminder-tomorrow-${bill.id}`,
        type: 'reminder',
        priority: 'high',
        title: 'Bill Due Tomorrow',
        message: `${bill.name} payment is due tomorrow`,
        naturalLanguage: `Your ${bill.name} bill is due tomorrow. Amount: $${bill.amount.toFixed(2)}`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
    // Today
    else if (daysUntil === 0) {
      insights.push({
        id: `ai-reminder-today-${bill.id}`,
        type: 'reminder',
        priority: 'urgent',
        title: 'Bill Due Today',
        message: `${bill.name} payment is due today`,
        naturalLanguage: `Reminder: Your ${bill.name} bill of $${bill.amount.toFixed(2)} is due today. Don't forget to pay!`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
    // This week
    else if (daysUntil > 1 && daysUntil <= 7) {
      insights.push({
        id: `ai-reminder-week-${bill.id}`,
        type: 'reminder',
        priority: 'medium',
        title: 'Upcoming Bill',
        message: `${bill.name} due in ${daysUntil} days`,
        naturalLanguage: `Heads up! Your ${bill.name} bill ($${bill.amount.toFixed(2)}) is due in ${daysUntil} days on ${formatDate(bill.dueDate)}.`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
    // Overdue
    else if (daysUntil < 0) {
      insights.push({
        id: `ai-alert-overdue-${bill.id}`,
        type: 'alert',
        priority: 'urgent',
        title: 'Overdue Bill',
        message: `${bill.name} is ${Math.abs(daysUntil)} days overdue`,
        naturalLanguage: `⚠️ Your ${bill.name} bill of $${bill.amount.toFixed(2)} is ${Math.abs(daysUntil)} days overdue. Please pay as soon as possible to avoid late fees.`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
  });

  return insights;
}

// Analyze historical trends for individual bills
export function analyzeBillTrends(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  bills.forEach(bill => {
    if (bill.paymentHistory.length < 3) return; // Need at least 3 months of history

    // Get last 3 months of payments
    const recentPayments = bill.paymentHistory.slice(-3);
    const amounts = recentPayments.map(p => p.amount);
    const previousAverage = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const currentAmount = bill.amount;
    
    const percentageChange = ((currentAmount - previousAverage) / previousAverage) * 100;
    
    // Significant increase (>15%)
    if (percentageChange > 15) {
      let recommendation = '';
      let savingsAmount = 0;
      
      if (bill.category === 'utilities') {
        recommendation = 'Consider reviewing your usage patterns or switching to a more cost-effective plan.';
        savingsAmount = currentAmount - previousAverage;
      } else if (bill.category === 'telco-internet') {
        recommendation = 'Check if there are better plans available or if you can negotiate a lower rate.';
        savingsAmount = currentAmount * 0.2; // Estimate 20% potential savings
      } else if (bill.category === 'subscriptions') {
        recommendation = 'Review if you still need this subscription or if a lower tier would work.';
        savingsAmount = currentAmount * 0.3; // Estimate 30% potential savings
      }
      
      insights.push({
        id: `ai-trend-increase-${bill.id}`,
        type: 'trend',
        priority: 'high',
        title: `${bill.category === 'utilities' ? 'Usage' : 'Cost'} Increase Detected`,
        message: `${bill.name} has increased ${percentageChange.toFixed(0)}% over last 3 months`,
        naturalLanguage: `📈 Your ${bill.name} ${bill.category === 'utilities' ? 'usage' : 'cost'} has increased ${percentageChange.toFixed(0)}% over the last 3 months (from $${previousAverage.toFixed(2)} to $${currentAmount.toFixed(2)}). ${recommendation}`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        savingsAmount: savingsAmount > 0 ? savingsAmount : undefined,
        timestamp: now.toISOString(),
      });
    }
    // Significant decrease (>15%)
    else if (percentageChange < -15) {
      insights.push({
        id: `ai-trend-decrease-${bill.id}`,
        type: 'trend',
        priority: 'low',
        title: `${bill.category === 'utilities' ? 'Usage' : 'Cost'} Decrease`,
        message: `${bill.name} has decreased ${Math.abs(percentageChange).toFixed(0)}% over last 3 months`,
        naturalLanguage: `📉 Great news! Your ${bill.name} ${bill.category === 'utilities' ? 'usage' : 'cost'} has decreased ${Math.abs(percentageChange).toFixed(0)}% over the last 3 months (from $${previousAverage.toFixed(2)} to $${currentAmount.toFixed(2)}). Keep up the good work!`,
        actionable: false,
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
  });

  return insights;
}

// Analyze subscription spending and suggest optimizations
export function analyzeSubscriptions(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  // Group subscription bills
  const subscriptionBills = bills.filter(b => b.category === 'subscriptions');
  
  if (subscriptionBills.length === 0) return insights;

  const totalMonthly = subscriptionBills.reduce((sum, bill) => {
    // Convert to monthly if needed
    if (bill.recurrence === 'yearly') {
      return sum + (bill.amount / 12);
    }
    return sum + bill.amount;
  }, 0);

  // Identify streaming services
  const streamingKeywords = ['netflix', 'spotify', 'disney', 'hulu', 'prime', 'apple', 'youtube', 'hbo'];
  const streamingServices = subscriptionBills.filter(bill => 
    streamingKeywords.some(keyword => bill.name.toLowerCase().includes(keyword))
  );

  if (streamingServices.length >= 2) {
    const streamingTotal = streamingServices.reduce((sum, bill) => sum + bill.amount, 0);
    const potentialSavings = streamingTotal * 0.4; // Estimate 40% savings with family plans
    
    insights.push({
      id: 'ai-savings-streaming',
      type: 'savings',
      priority: 'medium',
      title: 'Streaming Subscription Optimization',
      message: `Streaming subscriptions cost $${streamingTotal.toFixed(2)}/month`,
      naturalLanguage: `💰 Your streaming subscriptions (${streamingServices.map(s => s.name).join(', ')}) cost $${streamingTotal.toFixed(2)}/month. You could save up to $${potentialSavings.toFixed(2)}/month by switching to family plans or bundling services.`,
      actionable: true,
      actionUrl: '/bills',
      savingsAmount: potentialSavings,
      timestamp: now.toISOString(),
    });
  }

  // Cloud storage analysis
  const cloudKeywords = ['icloud', 'google drive', 'dropbox', 'onedrive', 'storage'];
  const cloudServices = subscriptionBills.filter(bill => 
    cloudKeywords.some(keyword => bill.name.toLowerCase().includes(keyword))
  );

  if (cloudServices.length >= 2) {
    const cloudTotal = cloudServices.reduce((sum, bill) => sum + bill.amount, 0);
    const potentialSavings = cloudTotal * 0.5; // Estimate 50% savings by consolidating
    
    insights.push({
      id: 'ai-savings-cloud',
      type: 'savings',
      priority: 'medium',
      title: 'Cloud Storage Consolidation',
      message: `Multiple cloud storage subscriptions detected`,
      naturalLanguage: `☁️ You're paying for ${cloudServices.length} cloud storage services (${cloudServices.map(s => s.name).join(', ')}) totaling $${cloudTotal.toFixed(2)}/month. Consider consolidating to one service to save up to $${potentialSavings.toFixed(2)}/month.`,
      actionable: true,
      actionUrl: '/bills',
      savingsAmount: potentialSavings,
      timestamp: now.toISOString(),
    });
  }

  // Overall subscription spending insight
  if (totalMonthly > 100) {
    insights.push({
      id: 'ai-trend-subscriptions',
      type: 'trend',
      priority: 'medium',
      title: 'High Subscription Spending',
      message: `Total subscription spending: $${totalMonthly.toFixed(2)}/month`,
      naturalLanguage: `📊 You're spending $${totalMonthly.toFixed(2)}/month on ${subscriptionBills.length} subscription${subscriptionBills.length > 1 ? 's' : ''}. Review each one to ensure you're still using them and consider downgrading unused services.`,
      actionable: true,
      actionUrl: '/bills',
      timestamp: now.toISOString(),
    });
  }

  return insights;
}

// Analyze category spending trends
export function analyzeCategoryTrends(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  const categories = ['utilities', 'telco-internet', 'insurance', 'subscriptions', 'credit-loans'];

  categories.forEach(category => {
    const categoryBills = bills.filter(b => b.category === category);
    if (categoryBills.length === 0) return;

    const totalMonthly = categoryBills.reduce((sum, bill) => {
      if (bill.recurrence === 'yearly') {
        return sum + (bill.amount / 12);
      }
      return sum + bill.amount;
    }, 0);

    // Utilities specific insights
    if (category === 'utilities' && totalMonthly > 200) {
      insights.push({
        id: `ai-trend-${category}`,
        type: 'trend',
        priority: 'medium',
        title: 'High Utility Costs',
        message: `Utility bills total $${totalMonthly.toFixed(2)}/month`,
        naturalLanguage: `⚡ Your utility bills (electricity, water, gas) total $${totalMonthly.toFixed(2)}/month. Consider energy-efficient upgrades or reviewing your usage patterns to reduce costs.`,
        actionable: true,
        actionUrl: '/bills',
        savingsAmount: totalMonthly * 0.15, // Estimate 15% potential savings
        timestamp: now.toISOString(),
      });
    }

    // Telco & Internet insights
    if (category === 'telco-internet' && totalMonthly > 150) {
      insights.push({
        id: `ai-trend-${category}`,
        type: 'trend',
        priority: 'medium',
        title: 'High Telco & Internet Costs',
        message: `Telco & Internet bills total $${totalMonthly.toFixed(2)}/month`,
        naturalLanguage: `📱 Your telco and internet bills total $${totalMonthly.toFixed(2)}/month. Shop around for better deals or consider bundling services to save up to $${(totalMonthly * 0.25).toFixed(2)}/month.`,
        actionable: true,
        actionUrl: '/bills',
        savingsAmount: totalMonthly * 0.25, // Estimate 25% potential savings
        timestamp: now.toISOString(),
      });
    }
  });

  return insights;
}

// Detect unusual bill patterns
export function detectUnusualPatterns(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  bills.forEach(bill => {
    if (bill.paymentHistory.length < 3) return; // Need history to detect patterns

    const recentPayments = bill.paymentHistory.slice(-3);
    const amounts = recentPayments.map(p => p.amount);
    const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const currentAmount = bill.amount;

    // Detect significant increase (>30%)
    const percentageChange = ((currentAmount - average) / average) * 100;
    
    if (percentageChange > 30) {
      insights.push({
        id: `ai-pattern-spike-${bill.id}`,
        type: 'pattern',
        priority: 'high',
        title: 'Unusual Bill Amount',
        message: `${bill.name} is ${percentageChange.toFixed(0)}% higher than usual`,
        naturalLanguage: `⚠️ I noticed your ${bill.name} bill is unusually high this month at $${currentAmount.toFixed(2)}, which is ${percentageChange.toFixed(0)}% more than your average of $${average.toFixed(2)}. You might want to review this.`,
        actionable: true,
        actionUrl: '/bills',
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
    // Detect significant decrease (>30%)
    else if (percentageChange < -30) {
      insights.push({
        id: `ai-pattern-drop-${bill.id}`,
        type: 'pattern',
        priority: 'low',
        title: 'Lower Bill Amount',
        message: `${bill.name} is ${Math.abs(percentageChange).toFixed(0)}% lower than usual`,
        naturalLanguage: `✅ Good news! Your ${bill.name} bill is lower this month at $${currentAmount.toFixed(2)}, which is ${Math.abs(percentageChange).toFixed(0)}% less than your average of $${average.toFixed(2)}.`,
        actionable: false,
        relatedBillId: bill.id,
        timestamp: now.toISOString(),
      });
    }
  });

  return insights;
}

// Predict upcoming payments
export function predictUpcomingPayments(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();
  const next7Days = bills.filter(b => {
    const days = getDaysUntil(b.dueDate);
    return days >= 0 && days <= 7 && b.status !== 'paid';
  });

  if (next7Days.length > 0) {
    const totalAmount = next7Days.reduce((sum, bill) => sum + bill.amount, 0);
    const billNames = next7Days.map(b => b.name).join(', ');

    insights.push({
      id: 'ai-prediction-week',
      type: 'prediction',
      priority: 'medium',
      title: 'Upcoming Payments This Week',
      message: `${next7Days.length} bills due in the next 7 days`,
      naturalLanguage: `💳 You have ${next7Days.length} bill${next7Days.length > 1 ? 's' : ''} coming up this week (${billNames}) totaling $${totalAmount.toFixed(2)}. Make sure you have sufficient funds available.`,
      actionable: true,
      actionUrl: '/bills',
      timestamp: now.toISOString(),
    });
  }

  return insights;
}

// Generate smart tips
export function generateSmartTips(bills: Bill[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  // Tip: Enable auto-pay for recurring bills
  const recurringWithoutAutoPay = bills.filter(
    b => b.recurrence !== 'one-time' && !b.autoPayEnabled
  );

  if (recurringWithoutAutoPay.length > 0) {
    insights.push({
      id: 'ai-tip-autopay',
      type: 'tip',
      priority: 'low',
      title: 'Consider Auto-Pay',
      message: `${recurringWithoutAutoPay.length} recurring bills could use auto-pay`,
      naturalLanguage: `💡 Tip: You have ${recurringWithoutAutoPay.length} recurring bill${recurringWithoutAutoPay.length > 1 ? 's' : ''} that could benefit from auto-pay. This would save you time and help avoid late payments.`,
      actionable: true,
      actionUrl: '/bills',
      timestamp: now.toISOString(),
    });
  }

  // Tip: Set payment limits for auto-pay
  const autoPayWithoutLimit = bills.filter(
    b => b.autoPayEnabled && !b.autoPayLimit
  );

  if (autoPayWithoutLimit.length > 0) {
    insights.push({
      id: 'ai-tip-limits',
      type: 'tip',
      priority: 'low',
      title: 'Set Auto-Pay Limits',
      message: `${autoPayWithoutLimit.length} auto-pay bills without limits`,
      naturalLanguage: `💡 Tip: Consider setting payment limits for your ${autoPayWithoutLimit.length} auto-pay bill${autoPayWithoutLimit.length > 1 ? 's' : ''} to protect against unexpected charges.`,
      actionable: true,
      actionUrl: '/bills',
      timestamp: now.toISOString(),
    });
  }

  return insights;
}

// Analyze spending patterns
export function analyzeSpendingPatterns(bills: Bill[]): SpendingPattern[] {
  const patterns: SpendingPattern[] = [];
  const categories = ['utilities', 'telco-internet', 'insurance', 'subscriptions', 'credit-loans', 'general'];

  categories.forEach(category => {
    const categoryBills = bills.filter(b => b.category === category);
    if (categoryBills.length === 0) return;

    const amounts = categoryBills.map(b => b.amount);
    const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

    // Simple trend detection based on recent vs older payments
    const recentAvg = amounts.slice(-2).reduce((sum, amt) => sum + amt, 0) / Math.min(2, amounts.length);
    const olderAvg = amounts.slice(0, -2).reduce((sum, amt) => sum + amt, 0) / Math.max(1, amounts.length - 2);
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';

    patterns.push({
      category,
      averageAmount: average,
      trend,
      percentageChange: change,
    });
  });

  return patterns;
}

// Generate all AI insights
export function generateAllAIInsights(bills: Bill[]): AIInsight[] {
  const reminders = generateNaturalLanguageReminders(bills);
  const trends = analyzeBillTrends(bills);
  const subscriptions = analyzeSubscriptions(bills);
  const categoryTrends = analyzeCategoryTrends(bills);
  const patterns = detectUnusualPatterns(bills);
  const predictions = predictUpcomingPayments(bills);
  const tips = generateSmartTips(bills);

  const allInsights = [...reminders, ...trends, ...subscriptions, ...categoryTrends, ...patterns, ...predictions, ...tips];

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Generate calendar event data
export function generateCalendarEvents(bills: Bill[]): Array<{
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  reminder: number; // minutes before
}> {
  return bills
    .filter(b => b.status !== 'paid')
    .map(bill => ({
      title: `${bill.name} Payment Due`,
      description: `Payment of $${bill.amount.toFixed(2)} for ${bill.name}. ${bill.autoPayEnabled ? 'Auto-pay enabled.' : 'Manual payment required.'}`,
      startDate: bill.dueDate,
      endDate: bill.dueDate,
      location: 'Online Payment',
      reminder: 1440, // 1 day before
    }));
}