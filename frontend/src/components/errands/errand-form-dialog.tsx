import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Errand, ErrandCategory, ErrandPriority } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Bell, Info } from 'lucide-react';

interface ErrandFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errand?: Errand | null;
  onSave: (errand: Errand) => void;
}

export function ErrandFormDialog({ open, onOpenChange, errand, onSave }: ErrandFormDialogProps) {
  const [formData, setFormData] = useState({
    type: 'home-maintenance' as ErrandCategory,
    description: '',
    priority: 'normal' as ErrandPriority,
    preferredDate: '',
    reminderEnabled: true,
    reminderHours: 24,
  });

  useEffect(() => {
    if (errand) {
      setFormData({
        type: errand.type,
        description: errand.description,
        priority: errand.priority,
        preferredDate: errand.preferredDate.split('T')[0],
        reminderEnabled: errand.reminderEnabled ?? true,
        reminderHours: errand.reminderHours ?? 24,
      });
    } else {
      setFormData({
        type: 'home-maintenance',
        description: '',
        priority: 'normal',
        preferredDate: '',
        reminderEnabled: true,
        reminderHours: 24,
      });
    }
  }, [errand, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      showError('Please fill in all required fields');
      return;
    }

    const newErrand: Errand = {
      id: errand?.id || `errand-${Date.now()}`,
      type: formData.type,
      description: formData.description,
      priority: formData.priority,
      status: errand?.status || 'upcoming',
      preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : '',
      adminNotes: errand?.adminNotes || '',
      reminderEnabled: formData.reminderEnabled,
      reminderHours: formData.reminderHours,
      createdAt: errand?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newErrand);
    showSuccess(errand ? 'Task updated successfully' : 'Task created successfully');
    onOpenChange(false);
  };

  const canEdit = !errand || errand.status !== 'done';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{errand ? 'Edit Task' : 'Request New Task'}</DialogTitle>
          <DialogDescription>
            {errand ? 'Update task details' : 'Fill in the details for your task request'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Task Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ErrandCategory })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home-maintenance">Home Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="gardening">Gardening</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="delivery">Delivery Management</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy Pickup</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what needs to be done..."
                rows={4}
                disabled={!canEdit}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as ErrandPriority })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferredDate">Preferred Completion Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                disabled={!canEdit}
              />
            </div>

            {/* Reminder Settings */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable Task Reminder</Label>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                  disabled={!canEdit}
                />
              </div>

              {formData.reminderEnabled && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="reminderHours">Remind me before task date</Label>
                    <Select
                      value={formData.reminderHours.toString()}
                      onValueChange={(value) => setFormData({ ...formData, reminderHours: parseInt(value) })}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="3">3 hours before</SelectItem>
                        <SelectItem value="6">6 hours before</SelectItem>
                        <SelectItem value="12">12 hours before</SelectItem>
                        <SelectItem value="24">1 day before</SelectItem>
                        <SelectItem value="48">2 days before</SelectItem>
                        <SelectItem value="72">3 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      You'll receive a reminder {formData.reminderHours >= 24 ? `${formData.reminderHours / 24} day(s)` : `${formData.reminderHours} hour(s)`} before the preferred completion date.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {!formData.reminderEnabled && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Without reminders, you'll need to manually check your task list. Consider enabling reminders to stay on track.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {errand && errand.adminNotes && (
              <div className="grid gap-2">
                <Label>Admin Notes</Label>
                <div className="p-3 bg-blue-50 rounded-md text-sm text-gray-700">
                  {errand.adminNotes}
                </div>
              </div>
            )}

            {!canEdit && (
              <p className="text-sm text-amber-600">
                This task is {errand?.status} and cannot be edited.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {canEdit && (
              <Button type="submit">
                {errand ? 'Update Task' : 'Create Task'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}