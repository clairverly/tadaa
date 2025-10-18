import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PaymentMethod, CardBrand } from '@/types';
import { showError } from '@/utils/toast';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (method: PaymentMethod) => void;
}

export function AddCardDialog({ open, onOpenChange, onSave }: AddCardDialogProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardBrand: 'visa' as CardBrand,
    nickname: '',
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardNumber || !formData.cardHolderName || !formData.expiryMonth || !formData.expiryYear) {
      showError('Please fill in all required fields');
      return;
    }

    // Basic card number validation (demo only)
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      showError('Please enter a valid card number');
      return;
    }

    // Get last 4 digits
    const last4 = cleanCardNumber.slice(-4);

    const newMethod: PaymentMethod = {
      id: `payment-${Date.now()}`,
      type: 'card',
      isDefault: formData.isDefault,
      nickname: formData.nickname,
      cardBrand: formData.cardBrand,
      cardLast4: last4,
      cardExpiryMonth: formData.expiryMonth,
      cardExpiryYear: formData.expiryYear,
      cardHolderName: formData.cardHolderName,
      createdAt: new Date().toISOString(),
    };

    onSave(newMethod);
    
    // Reset form
    setFormData({
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardBrand: 'visa',
      nickname: '',
      isDefault: false,
    });
    
    onOpenChange(false);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Credit/Debit Card</DialogTitle>
          <DialogDescription>
            Add a new card for payments
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
              <Label htmlFor="cardBrand">Card Type *</Label>
              <Select
                value={formData.cardBrand}
                onValueChange={(value) => setFormData({ ...formData, cardBrand: value as CardBrand })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cardHolderName">Cardholder Name *</Label>
              <Input
                id="cardHolderName"
                value={formData.cardHolderName}
                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiryMonth">Month *</Label>
                <Select
                  value={formData.expiryMonth}
                  onValueChange={(value) => setFormData({ ...formData, expiryMonth: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, '0');
                      return <SelectItem key={month} value={month}>{month}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiryYear">Year *</Label>
                <Select
                  value={formData.expiryYear}
                  onValueChange={(value) => setFormData({ ...formData, expiryYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="YY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString().slice(-2);
                      return <SelectItem key={year} value={year}>{year}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Personal Card"
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
            <Button type="submit">Add Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}