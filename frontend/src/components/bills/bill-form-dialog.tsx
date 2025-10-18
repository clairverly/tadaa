import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bill, BillCategory, BillRecurrence } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

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
  });

  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.split('T')[0],
        category: bill.category,
        recurrence: bill.recurrence,
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities',
        recurrence: 'monthly',
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
      reminderDays: [7, 3, 1],
      paymentHistory: bill?.paymentHistory || [],
      createdAt: bill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newBill);
    showSuccess(bill ? 'Bill updated successfully' : 'Bill added successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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