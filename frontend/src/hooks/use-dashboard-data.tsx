import { useState, useEffect } from 'react';
import { billStorage, errandStorage, appointmentStorage, notificationStorage, paymentStorage } from '@/lib/storage';
import { generateAllAIInsights } from '@/lib/ai-insights';
import { generateAllNotifications } from '@/lib/notifications';
import { 
  generateTopPriorities, 
  generatePredictiveSuggestions, 
  generateTadaaSnapshot,
  generateRescheduleSuggestions,
  SmartReschedule
} from '@/lib/ai-dashboard';
import { Bill, Errand, Appointment, Notification } from '@/types';

export interface SpendingAnalytics {
  totalMonthly: number;
  totalYearly: number;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthOverMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  topCategories: Array<{ category: string; amount: number }>;
}

export function useDashboardData() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [errands, setErrands] = useState<Errand[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [spendingAnalytics, setSpendingAnalytics] = useState<SpendingAnalytics | null>(null);
  const [topPriorities, setTopPriorities] = useState<any[]>([]);
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<any[]>([]);
  const [tadaaSnapshot, setTadaaSnapshot] = useState<any>(null);
  const [rescheduleSuggestions, setRescheduleSuggestions] = useState<SmartReschedule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allBills = billStorage.getAll();
    const allErrands = errandStorage.getAll();
    const allAppointments = appointmentStorage.getAll();
    
    setBills(allBills);
    setErrands(allErrands);
    setAppointments(allAppointments);
    
    // Generate AI insights
    const insights = generateAllAIInsights(allBills);
    setAiInsights(insights);

    // Generate AI dashboard features
    const priorities = generateTopPriorities(allBills, allErrands, allAppointments);
    setTopPriorities(priorities);

    const suggestions = generatePredictiveSuggestions(allBills, allErrands, allAppointments);
    setPredictiveSuggestions(suggestions);

    const snapshot = generateTadaaSnapshot(allBills, allErrands, allAppointments);
    setTadaaSnapshot(snapshot);

    const reschedules = generateRescheduleSuggestions(allBills, allErrands, allAppointments);
    setRescheduleSuggestions(reschedules);

    // Generate notifications
    const paymentMethods = paymentStorage.getAll();
    const allNotifications = generateAllNotifications(
      allBills,
      allAppointments,
      allErrands,
      paymentMethods
    );
    
    // Merge with stored read states
    const stored = notificationStorage.getAll();
    const storedMap = new Map(stored.map(n => [n.id, n.isRead]));
    const merged = allNotifications.map(n => ({
      ...n,
      isRead: storedMap.get(n.id) || false,
    }));
    
    setNotifications(merged);

    // Calculate spending analytics
    calculateSpendingAnalytics(allBills);
  };

  const calculateSpendingAnalytics = (bills: Bill[]) => {
    const monthlyBills = bills.filter(b => b.recurrence === 'monthly' || b.recurrence === 'as-billed');
    const yearlyBills = bills.filter(b => b.recurrence === 'yearly');
    
    const totalMonthly = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalYearly = yearlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const yearlyAsMonthly = totalYearly / 12;
    const combinedMonthly = totalMonthly + yearlyAsMonthly;

    const categoryMap = new Map<string, number>();
    bills.forEach(bill => {
      const amount = bill.recurrence === 'yearly' ? bill.amount / 12 : bill.amount;
      const current = categoryMap.get(bill.category) || 0;
      categoryMap.set(bill.category, current + amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / combinedMonthly) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    const recentPayments = bills.flatMap(b => b.paymentHistory.slice(-2));
    const lastMonthTotal = recentPayments.slice(0, recentPayments.length / 2)
      .reduce((sum, p) => sum + p.amount, 0);
    const thisMonthTotal = recentPayments.slice(recentPayments.length / 2)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const monthOverMonth = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    const trend = monthOverMonth > 5 ? 'increasing' : monthOverMonth < -5 ? 'decreasing' : 'stable';
    const topCategories = categoryBreakdown.slice(0, 3);

    setSpendingAnalytics({
      totalMonthly: combinedMonthly,
      totalYearly: totalYearly,
      categoryBreakdown,
      monthOverMonth,
      trend,
      topCategories,
    });
  };

  const handleReschedule = (suggestion: SmartReschedule) => {
    setRescheduleSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleDismissReschedule = (suggestionId: string) => {
    setRescheduleSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  return {
    bills,
    errands,
    appointments,
    notifications,
    aiInsights,
    spendingAnalytics,
    topPriorities,
    predictiveSuggestions,
    tadaaSnapshot,
    rescheduleSuggestions,
    handleReschedule,
    handleDismissReschedule,
    reloadData: loadData,
  };
}