import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Bell, FileText, Calendar, Plus, ArrowRight, ShoppingBag, Repeat, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { isOverdue, isUpcoming } from '@/lib/utils/date';
import { useNavigate } from 'react-router-dom';
import { errandStorage } from '@/lib/storage';
import { showSuccess } from '@/utils/toast';
import { Errand } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    bills,
    errands,
    appointments,
    notifications,
    reloadData,
  } = useDashboardData();

  // Helper function to determine actual status based on preferred date
  const getActualStatus = (errand: Errand) => {
    if (errand.status === 'done') return 'done';
    
    const preferredDate = new Date(errand.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    preferredDate.setHours(0, 0, 0, 0);
    
    if (preferredDate < today) {
      return 'overdue';
    }
    return 'upcoming';
  };

  // Derived data - bills due in next 30 days
  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate, 30));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const overdueErrands = errands.filter(e => getActualStatus(e) === 'overdue');
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

  const handleMarkTaskDone = (errand: Errand, e: React.MouseEvent) => {
    e.stopPropagation();
    errandStorage.update(errand.id, { status: 'done' });
    showSuccess('Task marked as done!');
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* 2x2 Grid of Main Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reminders - Top Left */}
        <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-slate-200 overflow-hidden" onClick={() => navigate('/settings?tab=notifications')}>
          <CardHeader className="pb-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Bell className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Reminders</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {allReminders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No active reminders</p>
                <p className="text-xs text-gray-400 mt-1">Enable reminders on bills or appointments</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allReminders.slice(0, 5).map((reminder, index) => (
                  <div
                    key={`${reminder.type}-${reminder.item.id}`}
                    className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        reminder.type === 'bill' ? '/bills' :
                        reminder.type === 'appointment' ? '/appointments' :
                        '/errands'
                      );
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      {reminder.type === 'bill' ? (
                        <FileText className="h-3.5 w-3.5 text-amber-700" />
                      ) : reminder.type === 'appointment' ? (
                        <Calendar className="h-3.5 w-3.5 text-amber-700" />
                      ) : (
                        <ShoppingBag className="h-3.5 w-3.5 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {reminder.type === 'bill' ? reminder.item.name :
                         reminder.type === 'appointment' ? reminder.item.title :
                         reminder.item.description}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {reminder.type === 'bill' ? 'Bill' :
                         reminder.type === 'appointment' ? 'Appointment' :
                         'Task'} • {new Date(reminder.date).toLocaleDateString()}
                        {reminder.type === 'appointment' && ` at ${reminder.item.time}`}
                      </p>
                    </div>
                  </div>
                ))}
                {allReminders.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate('/settings?tab=notifications'); }}>
                    View all reminders
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks - Top Right */}
        <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-slate-200 overflow-hidden" onClick={() => navigate('/errands')}>
          <CardHeader className="pb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <CheckSquare className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Tasks</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {activeErrands.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3 text-sm">No active tasks</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/errands'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Show overdue tasks alert if any */}
                {overdueErrands.length > 0 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2">
                    <p className="text-xs font-medium text-red-700">
                      {overdueErrands.length} overdue task{overdueErrands.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                
                {/* Display overdue tasks first */}
                {overdueErrands.slice(0, 3).map(errand => (
                  <div
                    key={errand.id}
                    className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate capitalize">{errand.type.replace('-', ' ')}</p>
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{errand.description}</p>
                      {errand.preferredDate && (
                        <p className="text-xs text-gray-500">Due: {new Date(errand.preferredDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={(e) => handleMarkTaskDone(errand, e)}
                      title="Mark as done"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {/* Display upcoming tasks */}
                {activeErrands.filter(e => getActualStatus(e) === 'upcoming').slice(0, 5 - overdueErrands.slice(0, 3).length).map(errand => (
                  <div
                    key={errand.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate capitalize">{errand.type.replace('-', ' ')}</p>
                        {errand.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{errand.description}</p>
                      {errand.preferredDate && (
                        <p className="text-xs text-gray-500">Due: {new Date(errand.preferredDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleMarkTaskDone(errand, e)}
                      title="Mark as done"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {activeErrands.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate('/errands'); }}>
                    View all tasks
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedules - Bottom Left */}
        <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-slate-200 overflow-hidden" onClick={() => navigate('/appointments')}>
          <CardHeader className="pb-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-600 -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Schedules</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3 text-sm">No upcoming appointments</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/appointments'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{appointment.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">{appointment.type}</Badge>
                  </div>
                ))}
                {upcomingAppointments.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate('/appointments'); }}>
                    View all appointments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bills - Bottom Right */}
        <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-slate-200 overflow-hidden" onClick={() => navigate('/bills')}>
          <CardHeader className="pb-2 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-600 -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <FileText className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Bills</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {upcomingBills.length === 0 && overdueBills.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3 text-sm">No upcoming bills</p>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/bills'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bill
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueBills.length > 0 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg mb-2">
                    <p className="text-xs font-medium text-red-700">
                      {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                {upcomingBills.slice(0, 5).map(bill => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/bills?category=${bill.category}`);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{bill.name}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      </div>
                      {bill.autoPayEnabled && (
                        <div className="p-1 rounded border-2 border-green-500 bg-green-50 flex-shrink-0">
                          <Repeat className="h-3 w-3 text-green-600" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    {bill.amount === 0 && bill.autoPayEnabled ? (
                      <p className="font-semibold text-blue-600 ml-2 text-sm">As Billed</p>
                    ) : (
                      <p className="font-semibold text-emerald-600 ml-2">${bill.amount}</p>
                    )}
                  </div>
                ))}
                {upcomingBills.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate('/bills'); }}>
                    View all bills
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