import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill, Errand, Appointment } from '@/types';
import { formatDate } from '@/lib/utils/date';

interface QuickActionsProps {
  upcomingBills: Bill[];
  activeErrands: Errand[];
  upcomingAppointments: Appointment[];
}

export function QuickActions({ upcomingBills, activeErrands, upcomingAppointments }: QuickActionsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Upcoming Bills */}
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

      {/* Active Errands */}
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

      {/* Upcoming Appointments */}
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
  );
}