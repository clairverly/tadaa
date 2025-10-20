import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bill, BillCategory, BillRecurrence } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { Bell, CreditCard, Info } from 'lucide-react';
import { paymentStorage } from '@/lib/storage';

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
    autoPayEnabled: false,
    paymentMethodId: '',
  });

  const paymentMethods = paymentStorage.getAll();

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
        autoPayEnabled: bill.autoPayEnabled || false,
        paymentMethodId: bill.paymentMethodId || '',
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
        autoPayEnabled: false,
        paymentMethodId: '',
      });
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.dueDate) {
      showError('Please fill in all required fields');
      return;
    }

    if (formData.autoPayEnabled && !formData.paymentMethodId) {
      showError('Please select a payment method for auto-pay');
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
      autoPayEnabled: formData.autoPayEnabled,
      paymentMethodId: formData.autoPayEnabled ? formData.paymentMethodId : undefined,
      retryCount: bill?.retryCount || 0,
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

            {/* Auto-Pay Settings */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="autoPayEnabled" className="cursor-pointer">Enable Auto-Pay</Label>
                </div>
                <Switch
                  id="autoPayEnabled"
                  checked={formData.autoPayEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoPayEnabled: checked })}
                />
              </div>

              {formData.autoPayEnabled && (
                <div className="space-y-3 pl-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Auto-pay will attempt payment 3 times if it fails. You'll be notified of any issues.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    {paymentMethods.length === 0 ? (
                      <p className="text-sm text-amber-600">No payment methods available. Add one in the Payments section.</p>
                    ) : (
                      <Select
                        value={formData.paymentMethodId}
                        onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map(pm => (
                            <SelectItem key={pm.id} value={pm.id}>
                              {pm.nickname || `${pm.type} - ${pm.cardLast4 || pm.payNowMobile || pm.bankAccountLast4}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}
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