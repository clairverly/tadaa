import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { showError } from '@/utils/toast';

interface AddPayNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (method: PaymentMethod) => void;
}

export function AddPayNowDialog({ open, onOpenChange, onSave }: AddPayNowDialogProps) {
  const [formData, setFormData] = useState({
    mobile: '',
    nickname: '',
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mobile) {
      showError('Please enter your mobile number');
      return;
    }

    // Basic mobile validation (Singapore format)
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 8) {
      showError('Please enter a valid mobile number');
      return;
    }

    // Mask mobile number: +65 **** 1234
    const last4 = cleanMobile.slice(-4);
    const maskedMobile = `+65 **** ${last4}`;

    const newMethod: PaymentMethod = {
      id: `payment-${Date.now()}`,
      type: 'paynow',
      isDefault: formData.isDefault,
      nickname: formData.nickname,
      payNowMobile: maskedMobile,
      createdAt: new Date().toISOString(),
    };

    onSave(newMethod);
    
    // Reset form
    setFormData({
      mobile: '',
      nickname: '',
      isDefault: false,
    });
    
    onOpenChange(false);
  };

  const formatMobile = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add PayNow</DialogTitle>
          <DialogDescription>
            Link your PayNow mobile number for instant payments
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
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-gray-100 rounded-md border">
                  <span className="text-sm text-gray-600">+65</span>
                </div>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: formatMobile(e.target.value) })}
                  placeholder="9123 4567"
                  maxLength={9}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">Enter your Singapore mobile number registered with PayNow</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Personal PayNow"
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
            <Button type="submit">Add PayNow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}