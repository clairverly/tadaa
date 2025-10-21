import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, Calendar, AlertTriangle, Plus, TrendingUp, Clock, CheckCircle2, Sparkles, Bell, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIInsightsCard } from '@/components/ai-assistant/ai-insights-card';
import { billStorage, errandStorage, appointmentStorage, notificationStorage, paymentStorage } from '@/lib/storage';
import { isOverdue, isUpcoming, formatDate, getDaysUntil } from '@/lib/utils/date';
import { generateAllAIInsights } from '@/lib/ai-insights';
import { generateAllNotifications } from '@/lib/notifications';
import { exportAllBillsToCalendar } from '@/lib/calendar-integration';
import { Bill, Errand, Appointment, Notification } from '@/types';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface SpendingAnalytics {
  totalMonthly: number;
  totalYearly: number;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  monthOverMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  topCategories: Array<{ category: string; amount: number }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [errands, setErrands] = useState<Errand[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [spendingAnalytics, setSpendingAnalytics] = useState<SpendingAnalytics | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allBills = billStorage.getAll();
    setBills(allBills);
    setErrands(errandStorage.getAll());
    setAppointments(appointmentStorage.getAll());
    
    // Generate AI insights
    const insights = generateAllAIInsights(allBills);
    setAiInsights(insights);

    // Generate notifications
    const paymentMethods = paymentStorage.getAll();
    const allNotifications = generateAllNotifications(
      allBills,
      appointmentStorage.getAll(),
      errandStorage.getAll(),
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
    // Calculate total monthly spending
    const monthlyBills = bills.filter(b => b.recurrence === 'monthly' || b.recurrence === 'as-billed');
    const yearlyBills = bills.filter(b => b.recurrence === 'yearly');
    
    const totalMonthly = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalYearly = yearlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const yearlyAsMonthly = totalYearly / 12;
    const combinedMonthly = totalMonthly + yearlyAsMonthly;

    // Category breakdown
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

    // Month-over-month comparison (simplified - using payment history)
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

  const handleExportToCalendar = () => {
    exportAllBillsToCalendar(bills);
    showSuccess('Calendar file downloaded! Import it to your calendar app.');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      notificationStorage.markAsRead(notification.id);
      loadData();
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate, 30));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date, 14));
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const urgentNotifications = notifications.filter(n => !n.isRead && (n.priority === 'urgent' || n.priority === 'high')).slice(0, 3);

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    if (trend === 'decreasing') return <ArrowDownRight className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'increasing') return 'text-red-600';
    if (trend === 'decreasing') return 'text-green-600';
    return 'text-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      utilities: '⚡',
      'telco-internet': '📡',
      insurance: '🛡️',
      subscriptions: '▶️',
      'credit-loans': '💳',
      general: '💰',
    };
    return icons[category] || '💰';
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 right-20 w-32 h-32 border-4 border-white/20 rounded-full"></div>
        <div className="absolute bottom-10 right-40 w-20 h-20 border-4 border-white/10 rounded-full"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Welcome back!</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-blue-100 text-lg">Everything you need to stay organized and on track</p>
          </div>
          
          {/* Hero Illustration */}
          <div className="hidden lg:block">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-center h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform">
                    <FileText className="h-12 w-12" />
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform -rotate-6 hover:-rotate-12 transition-transform">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform -rotate-3 hover:-rotate-6 transition-transform">
                    <Calendar className="h-12 w-12" />
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-800 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <span>Urgent Notifications</span>
              </CardTitle>
              <Badge className="bg-red-600 text-white">
                {unreadNotifications.length} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${
                    notification.priority === 'urgent' ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      notification.priority === 'urgent' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'default'}>
                    {notification.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Link to="/notifications">
              <Button className="w-full mt-4" variant="outline">
                View All Notifications ({notifications.length})
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Spending Analytics */}
      {spendingAnalytics && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Spending Overview */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Monthly Spending
              </CardTitle>
              <CardDescription>Your average monthly expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${spendingAnalytics.totalMonthly.toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(spendingAnalytics.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(spendingAnalytics.trend)}`}>
                      {Math.abs(spendingAnalytics.monthOverMonth).toFixed(1)}% vs last month
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3">Top Categories:</p>
                  <div className="space-y-3">
                    {spendingAnalytics.topCategories.map((cat, index) => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span>{getCategoryIcon(cat.category)}</span>
                            {cat.category.replace('-', ' ')}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${cat.amount.toFixed(0)}
                          </span>
                        </div>
                        <Progress 
                          value={cat.percentage} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {spendingAnalytics.totalYearly > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Annual bills (prorated)</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(spendingAnalytics.totalYearly / 12).toFixed(0)}/mo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total yearly: ${spendingAnalytics.totalYearly.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Spending Trends */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Spending Insights
              </CardTitle>
              <CardDescription>AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spendingAnalytics.trend === 'increasing' && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      <strong>Spending Increase Detected:</strong> Your bills have increased by {Math.abs(spendingAnalytics.monthOverMonth).toFixed(1)}% compared to last month. Review your bills to identify the cause.
                    </AlertDescription>
                  </Alert>
                )}

                {spendingAnalytics.trend === 'decreasing' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      <strong>Great News!</strong> Your spending decreased by {Math.abs(spendingAnalytics.monthOverMonth).toFixed(1)}% compared to last month. Keep up the good work!
                    </AlertDescription>
                  </Alert>
                )}

                {spendingAnalytics.trend === 'stable' && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Stable Spending:</strong> Your bills are consistent with last month. Your budget is on track!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-sm text-gray-700">Category Breakdown:</h4>
                  {spendingAnalytics.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {cat.category.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${cat.amount.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cat.percentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <AIInsightsCard 
          insights={aiInsights} 
          onExportToCalendar={handleExportToCalendar}
        />
      )}

      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <span>Overdue Bills Require Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBills.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{bill.name}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">${bill.amount.toFixed(2)}</p>
                    <Badge variant="destructive" className="text-xs">
                      {Math.abs(getDaysUntil(bill.dueDate))} days overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/bills">
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 shadow-lg">
                View All Overdue Bills
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Upcoming Bills</CardTitle>
            </div>
            <CardDescription>Bills due in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No upcoming bills</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBills.slice(0, 3).map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{bill.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(bill.dueDate)}</p>
                    </div>
                    <p className="font-semibold text-blue-600">${bill.amount.toFixed(2)}</p>
                  </div>
                ))}
                {upcomingBills.length > 3 && (
                  <p className="text-xs text-center text-gray-500 pt-2">
                    +{upcomingBills.length - 3} more bill{upcomingBills.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
            <Link to="/bills">
              <Button className="w-full mt-4" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Bill
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Active Errands</CardTitle>
            </div>
            <CardDescription>Tasks in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {activeErrands.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No active errands</p>
                <p className="text-xs text-gray-400 mt-1">All tasks completed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeErrands.slice(0, 3).map(errand => (
                  <div key={errand.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg hover:from-purple-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{errand.description.substring(0, 30)}...</p>
                      <p className="text-xs text-gray-500 capitalize">{errand.type.replace('-', ' ')}</p>
                    </div>
                    <Badge variant={errand.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                      {errand.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Link to="/errands">
              <Button className="w-full mt-4" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Errand
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Upcoming Appointments</CardTitle>
            </div>
            <CardDescription>Next 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-3">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No upcoming appointments</p>
                <p className="text-xs text-gray-400 mt-1">Your schedule is clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg hover:from-green-100 transition-colors">
                    <p className="font-medium text-sm">{apt.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(apt.date)} at {apt.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link to="/appointments">
              <Button className="w-full mt-4" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}