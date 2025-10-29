import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Bell, FileText, Calendar, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { isOverdue, isUpcoming } from '@/lib/utils/date';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    bills,
    errands,
    appointments,
    notifications,
  } = useDashboardData();

  // Derived data - bills due in next 30 days
  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate, 30));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date, 14));
  const unreadNotifications = notifications.filter(n => !n.isRead);
  
  // Items with reminders enabled for the Reminders section
  const billsWithReminders = bills.filter(b => b.reminderEnabled && b.status !== 'paid');
  const appointmentsWithReminders = appointments.filter(a => a.reminderEnabled);
  const errandsWithReminders = errands.filter(e => e.reminderEnabled && e.status !== 'done' && e.preferredDate);
  const allReminders = [
    ...billsWithReminders.map(b => ({ type: 'bill' as const, item: b, date: b.dueDate })),
    ...appointmentsWithReminders.map(a => ({ type: 'appointment' as const, item: a, date: a.date })),
    ...errandsWithReminders.map(e => ({ type: 'errand' as const, item: e, date: e.preferredDate }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* 2x2 Grid of Main Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks - Top Left */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/errands')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <CardDescription>Your active errands</CardDescription>
                </div>
              </div>
              {activeErrands.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {activeErrands.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeErrands.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No active tasks</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/errands'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeErrands.slice(0, 3).map(errand => (
                  <div key={errand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{errand.type}</p>
                      <p className="text-xs text-gray-500">{errand.description}</p>
                    </div>
                    <Badge variant={errand.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {errand.status}
                    </Badge>
                  </div>
                ))}
                {activeErrands.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/errands'); }}>
                    View all {activeErrands.length} tasks
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders - Top Right */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/settings?tab=notifications')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reminders</CardTitle>
                  <CardDescription>Items with reminders</CardDescription>
                </div>
              </div>
              {allReminders.length > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {allReminders.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allReminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No active reminders</p>
                <p className="text-xs text-gray-400 mt-2">Enable reminders on bills or appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allReminders.slice(0, 3).map((reminder, index) => (
                  <div
                    key={`${reminder.type}-${reminder.item.id}`}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        reminder.type === 'bill' ? '/bills' :
                        reminder.type === 'appointment' ? '/appointments' :
                        '/errands'
                      );
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      {reminder.type === 'bill' ? (
                        <FileText className="h-4 w-4 text-purple-600" />
                      ) : reminder.type === 'appointment' ? (
                        <Calendar className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {reminder.type === 'bill' ? reminder.item.name :
                         reminder.type === 'appointment' ? reminder.item.title :
                         reminder.item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reminder.type === 'bill' ? 'Bill' :
                         reminder.type === 'appointment' ? 'Appointment' :
                         'Task'} • {new Date(reminder.date).toLocaleDateString()}
                        {reminder.type === 'appointment' && ` at ${reminder.item.time}`}
                      </p>
                    </div>
                    <Bell className="h-4 w-4 text-purple-500 flex-shrink-0 mt-1" />
                  </div>
                ))}
                {allReminders.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/settings?tab=notifications'); }}>
                    View all {allReminders.length} reminders
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills - Bottom Left */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/bills')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Bills</CardTitle>
                  <CardDescription>Upcoming payments</CardDescription>
                </div>
              </div>
              {upcomingBills.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {upcomingBills.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 && overdueBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming bills</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/bills'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueBills.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-700">
                      {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {upcomingBills.slice(0, 3).map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bill.name}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <p className="font-semibold text-green-600">${bill.amount}</p>
                  </div>
                ))}
                {upcomingBills.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/bills'); }}>
                    View all {upcomingBills.length} bills
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedules - Bottom Right */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/appointments')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Schedules</CardTitle>
                  <CardDescription>Upcoming appointments</CardDescription>
                </div>
              </div>
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/appointments'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{appointment.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <Badge variant="outline">{appointment.type}</Badge>
                  </div>
                ))}
                {upcomingAppointments.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/appointments'); }}>
                    View all {upcomingAppointments.length} appointments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}