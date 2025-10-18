import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, Calendar, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { billStorage, errandStorage, appointmentStorage } from '@/lib/storage';
import { isOverdue, isUpcoming, formatDate, getDaysUntil } from '@/lib/utils/date';
import { Bill, Errand, Appointment } from '@/types';

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [errands, setErrands] = useState<Errand[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBills(billStorage.getAll());
    setErrands(errandStorage.getAll());
    setAppointments(appointmentStorage.getAll());
  };

  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date, 14));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what needs your attention.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBills.length}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueBills.length}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Errands</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeErrands.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Next 2 weeks</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Bills Require Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueBills.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bill.name}</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${bill.amount.toFixed(2)}</p>
                    <Badge variant="destructive" className="text-xs">
                      {Math.abs(getDaysUntil(bill.dueDate))} days overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/bills">
              <Button className="w-full mt-4" variant="destructive">
                View All Overdue Bills
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bills</CardTitle>
            <CardDescription>Bills due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming bills</p>
            ) : (
              <div className="space-y-3">
                {upcomingBills.slice(0, 3).map(bill => (
                  <div key={bill.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{bill.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(bill.dueDate)}</p>
                    </div>
                    <p className="font-semibold">${bill.amount.toFixed(2)}</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Active Errands</CardTitle>
            <CardDescription>Tasks in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {activeErrands.length === 0 ? (
              <p className="text-sm text-gray-500">No active errands</p>
            ) : (
              <div className="space-y-3">
                {activeErrands.slice(0, 3).map(errand => (
                  <div key={errand.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{errand.description}</p>
                      <p className="text-xs text-gray-500 capitalize">{errand.type.replace('-', ' ')}</p>
                    </div>
                    <Badge variant={errand.priority === 'urgent' ? 'destructive' : 'secondary'}>
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

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Next 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id}>
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