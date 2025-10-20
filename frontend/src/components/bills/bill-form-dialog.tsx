import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Bill, BillCategory, BillRecurrence } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Bell } from 'lucide-react';

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  onSave: (bill: Bill) => void;
}

export function BillFormDialog({ open, onOpenChange, bill, onSave }: BillFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'utilities' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    reminderEnabled: true,
    reminderDays: [7, 3, 1],
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.split('T')[0],
        category: bill.category,
        recurrence: bill.recurrence,
        reminderEnabled: bill.reminderEnabled ?? true,
        reminderDays: bill.reminderDays || [7, 3, 1],
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities',
        recurrence: 'monthly',
        reminderEnabled: true,
        reminderDays: [7, 3, 1],
      });
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.dueDate) {
      showError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    const newBill: Bill = {
      id: bill?.id || `bill-${Date.now()}`,
      name: formData.name,
      amount,
      dueDate: new Date(formData.dueDate).toISOString(),
      category: formData.category,
      recurrence: formData.recurrence,
      status: 'upcoming',
      reminderDays: formData.reminderEnabled ? formData.reminderDays : [],
      reminderEnabled: formData.reminderEnabled,
      paymentHistory: bill?.paymentHistory || [],
      createdAt: bill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newBill);
    showSuccess(bill ? 'Bill updated successfully' : 'Bill added successfully');
    onOpenChange(false);
  };

  const toggleReminderDay = (day: number) => {
    const days = [...formData.reminderDays];
    const index = days.indexOf(day);
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
      days.sort((a, b) => b - a);
    }
    setFormData({ ...formData, reminderDays: days });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
          <DialogDescription>
            {bill ? 'Update bill information' : 'Add a new bill to track'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bill Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electric Bill"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as BillCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                  <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable Reminders</Label>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                />
              </div>

              {formData.reminderEnabled && (
                <div className="space-y-3 pl-6">
                  <Label className="text-sm text-gray-600">Remind me before due date:</Label>
                  <div className="space-y-2">
                    {[14, 7, 3, 1].map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reminder-${day}`}
                          checked={formData.reminderDays.includes(day)}
                          onCheckedChange={() => toggleReminderDay(day)}
                        />
                        <label
                          htmlFor={`reminder-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {day === 1 ? '1 day before' : `${day} days before`}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.reminderDays.length === 0 && (
                    <p className="text-xs text-amber-600">Select at least one reminder time</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {bill ? 'Update Bill' : 'Add Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}