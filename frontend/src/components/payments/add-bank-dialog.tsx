import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { showError } from '@/utils/toast';

interface AddBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (method: PaymentMethod) => void;
}

export function AddBankDialog({ open, onOpenChange, onSave }: AddBankDialogProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    nickname: '',
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName || !formData.accountNumber || !formData.accountHolderName) {
      showError('Please fill in all required fields');
      return;
    }

    // Basic account number validation
    const cleanAccountNumber = formData.accountNumber.replace(/\D/g, '');
    if (cleanAccountNumber.length < 8) {
      showError('Please enter a valid account number');
      return;
    }

    // Get last 4 digits
    const last4 = cleanAccountNumber.slice(-4);

    const newMethod: PaymentMethod = {
      id: `payment-${Date.now()}`,
      type: 'bank',
      isDefault: formData.isDefault,
      nickname: formData.nickname,
      bankName: formData.bankName,
      bankAccountLast4: last4,
      bankAccountHolderName: formData.accountHolderName,
      createdAt: new Date().toISOString(),
    };

    onSave(newMethod);
    
    // Reset form
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      nickname: '',
      isDefault: false,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>
            Set up direct debit from your bank account
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Demo Mode: This is a prototype. No real payment data is processed or stored securely.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Select
                value={formData.bankName}
                onValueChange={(value) => setFormData({ ...formData, bankName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DBS Bank">DBS Bank</SelectItem>
                  <SelectItem value="OCBC Bank">OCBC Bank</SelectItem>
                  <SelectItem value="UOB">United Overseas Bank (UOB)</SelectItem>
                  <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                  <SelectItem value="Citibank">Citibank</SelectItem>
                  <SelectItem value="HSBC">HSBC</SelectItem>
                  <SelectItem value="Maybank">Maybank</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="123456789"
                maxLength={20}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="John Doe"
              />
              <p className="text-xs text-gray-500">Must match the name on your bank account</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Savings Account"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
              />
              <label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Set as default payment method
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Bank Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}