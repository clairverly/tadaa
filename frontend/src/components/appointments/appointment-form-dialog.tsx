import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Appointment, AppointmentType, BillRecurrence } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Bell } from 'lucide-react';

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSave: (appointment: Appointment) => void;
}

export function AppointmentFormDialog({ open, onOpenChange, appointment, onSave }: AppointmentFormDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'personal' as AppointmentType,
    notes: '',
    recurrence: 'one-time' as BillRecurrence,
    reminderMinutes: '30',
    reminderEnabled: true,
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        date: appointment.date.split('T')[0],
        time: appointment.time,
        location: appointment.location,
        type: appointment.type,
        notes: appointment.notes,
        recurrence: appointment.recurrence,
        reminderMinutes: appointment.reminderMinutes.toString(),
        reminderEnabled: appointment.reminderEnabled ?? true,
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'personal',
        notes: '',
        recurrence: 'one-time',
        reminderMinutes: '30',
        reminderEnabled: true,
      });
    }
  }, [appointment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time) {
      showError('Please fill in all required fields');
      return;
    }

    const newAppointment: Appointment = {
      id: appointment?.id || `appointment-${Date.now()}`,
      title: formData.title,
      date: new Date(formData.date).toISOString(),
      time: formData.time,
      location: formData.location,
      type: formData.type,
      notes: formData.notes,
      recurrence: formData.recurrence,
      reminderMinutes: formData.reminderEnabled ? parseInt(formData.reminderMinutes) : 0,
      reminderEnabled: formData.reminderEnabled,
      createdAt: appointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newAppointment);
    showSuccess(appointment ? 'Appointment updated successfully' : 'Appointment scheduled successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
          <DialogDescription>
            {appointment ? 'Update appointment details' : 'Add a new appointment to your calendar'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Doctor's Appointment"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., 123 Main St, City"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as AppointmentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) => setFormData({ ...formData, recurrence: value as BillRecurrence })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Settings */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable Reminder</Label>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                />
              </div>

              {formData.reminderEnabled && (
                <div className="grid gap-2 pl-6">
                  <Label htmlFor="reminderMinutes">Remind me before appointment:</Label>
                  <Select
                    value={formData.reminderMinutes}
                    onValueChange={(value) => setFormData({ ...formData, reminderMinutes: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                      <SelectItem value="2880">2 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {appointment ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}