import { Appointment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, MapPin, Clock, Calendar as CalendarIcon, User, Users, Stethoscope, Bell, BellOff } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}

const typeIcons = {
  personal: User,
  family: Users,
  medical: Stethoscope,
};

const typeGradients = {
  personal: 'from-blue-500 to-indigo-500',
  family: 'from-purple-500 to-pink-500',
  medical: 'from-red-500 to-orange-500',
};

export function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const TypeIcon = typeIcons[appointment.type] || CalendarIcon;
  const gradientColor = typeGradients[appointment.type] || 'from-gray-500 to-slate-500';

  const handleSendReminder = () => {
    showSuccess(`Reminder sent for ${appointment.title}`);
  };

  const getTypeColor = () => {
    switch (appointment.type) {
      case 'medical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'family':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'personal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReminderText = () => {
    const minutes = appointment.reminderMinutes;
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${minutes / 60} hour${minutes / 60 > 1 ? 's' : ''} before`;
    return `${minutes / 1440} day${minutes / 1440 > 1 ? 's' : ''} before`;
  };

  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md">
      <CardContent className="p-0">
        {/* Gradient Header */}
        <div className={cn('h-2 bg-gradient-to-r', gradientColor)}></div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-3 rounded-xl bg-gradient-to-br shadow-sm', gradientColor)}>
                <TypeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{appointment.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getTypeColor()}>
                    {appointment.type}
                  </Badge>
                  {appointment.reminderEnabled ? (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Reminder On
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex items-center gap-1 text-gray-400">
                      <BellOff className="h-3 w-3" />
                      No Reminder
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {appointment.reminderEnabled && (
                  <DropdownMenuItem onClick={handleSendReminder}>
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminder Now
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(appointment)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(appointment)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">{formatDate(appointment.date)}</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">{appointment.time}</span>
            </div>

            {appointment.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 text-sm">{appointment.location}</span>
              </div>
            )}

            {appointment.reminderEnabled && appointment.reminderMinutes > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-900 font-medium mb-1">Reminder set:</p>
                <p className="text-xs text-blue-700">{getReminderText()}</p>
              </div>
            )}

            {appointment.recurrence !== 'one-time' && (
              <div className="text-xs text-gray-500 capitalize px-3">
                Repeats: {appointment.recurrence}
              </div>
            )}

            {appointment.notes && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}