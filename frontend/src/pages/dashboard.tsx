import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, Calendar, AlertTriangle, Plus, TrendingUp, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIInsightsCard } from '@/components/ai-assistant/ai-insights-card';
import { billStorage, errandStorage, appointmentStorage } from '@/lib/storage';
import { isOverdue, isUpcoming, formatDate, getDaysUntil } from '@/lib/utils/date';
import { generateAllAIInsights } from '@/lib/ai-insights';
import { exportAllBillsToCalendar } from '@/lib/calendar-integration';
import { Bill, Errand, Appointment } from '@/types';
import { showSuccess } from '@/utils/toast';

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [errands, setErrands] = useState<Errand[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

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
  };

  const handleExportToCalendar = () => {
    exportAllBillsToCalendar(bills);
    showSuccess('Calendar file downloaded! Import it to your calendar app.');
  };

  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date, 14));

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

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <AIInsightsCard 
          insights={aiInsights} 
          onExportToCalendar={handleExportToCalendar}
        />
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Bills</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{upcomingBills.length}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue Bills</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueBills.length}</div>
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Errands</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeErrands.length}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Next 2 weeks
            </p>
          </CardContent>
        </Card>
      </div>

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
            <CardDescription>Bills due in the next 7 days</CardDescription>
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