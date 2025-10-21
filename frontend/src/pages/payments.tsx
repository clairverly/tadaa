import { useState, useEffect } from 'react';
import { Plus, CreditCard, Smartphone, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaymentMethodCard } from '@/components/payments/payment-method-card';
import { AddCardDialog } from '@/components/payments/add-card-dialog';
import { AddPayNowDialog } from '@/components/payments/add-paynow-dialog';
import { AddBankDialog } from '@/components/payments/add-bank-dialog';
import { paymentStorage } from '@/lib/storage';
import { PaymentMethod } from '@/types';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

export default function Payments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isPayNowDialogOpen, setIsPayNowDialogOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    const methods = paymentStorage.getAll();
    setPaymentMethods(methods);
  };

  const handleSavePaymentMethod = (method: PaymentMethod) => {
    paymentStorage.add(method);
    showSuccess('Payment method added successfully');
    loadPaymentMethods();
  };

  const handleSetDefault = (method: PaymentMethod) => {
    paymentStorage.setDefault(method.id);
    showSuccess('Default payment method updated');
    loadPaymentMethods();
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setDeletingMethod(method);
  };

  const confirmDelete = () => {
    if (deletingMethod) {
      paymentStorage.delete(deletingMethod.id);
      showSuccess('Payment method removed');
      loadPaymentMethods();
      setDeletingMethod(null);
    }
  };

  const cardMethods = paymentMethods.filter(m => m.type === 'card');
  const payNowMethods = paymentMethods.filter(m => m.type === 'paynow');
  const bankMethods = paymentMethods.filter(m => m.type === 'bank');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-500 mt-1">Manage your saved payment methods</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsCardDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Credit/Debit Card
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="opacity-50">
              <Smartphone className="h-4 w-4 mr-2" />
              <span>PayNow</span>
              <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="opacity-50">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Bank Account</span>
              <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Demo Warning */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Demo/Prototype Mode</AlertTitle>
        <AlertDescription className="text-amber-800">
          This is a frontend prototype. No real payment processing occurs, and no sensitive data is securely stored. 
          In production, this would integrate with secure payment processors like Stripe or PayPal.
        </AlertDescription>
      </Alert>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No payment methods added yet</p>
            <Button onClick={() => setIsCardDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credit/Debit Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Cards Section */}
          {cardMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Credit & Debit Cards
                </CardTitle>
                <CardDescription>Your saved cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cardMethods.map(method => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDeleteMethod}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* PayNow Section - Coming Soon */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-900">PayNow</CardTitle>
                </div>
                <Badge className="bg-purple-600">Coming Soon</Badge>
              </div>
              <CardDescription>Singapore's instant payment service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">PayNow Integration Coming Soon</p>
                  <p className="text-xs text-gray-600">
                    Link your mobile number for instant bill payments. We're working on integrating with Singapore's PayNow network.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Section - Coming Soon */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-900">Bank Accounts</CardTitle>
                </div>
                <Badge className="bg-blue-600">Coming Soon</Badge>
              </div>
              <CardDescription>Direct debit from your bank account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Bank Account Integration Coming Soon</p>
                  <p className="text-xs text-gray-600">
                    Set up direct debit from your bank account for automatic bill payments. We're working on secure bank integrations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Comparison</CardTitle>
          <CardDescription>Choose the best option for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CreditCard className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 text-sm">Credit/Debit Cards</p>
                <p className="text-xs text-green-700 mt-1">✓ Available now • Instant payments • Widely accepted • Rewards points</p>
              </div>
              <Badge className="bg-green-600">Active</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Smartphone className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-purple-900 text-sm">PayNow</p>
                <p className="text-xs text-purple-700 mt-1">Coming soon • Instant transfers • No fees • Singapore only</p>
              </div>
              <Badge variant="secondary">Soon</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 text-sm">Bank Account (Direct Debit)</p>
                <p className="text-xs text-blue-700 mt-1">Coming soon • Automatic payments • Lower fees • Secure</p>
              </div>
              <Badge variant="secondary">Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialogs */}
      <AddCardDialog
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
        onSave={handleSavePaymentMethod}
      />

      <AddPayNowDialog
        open={isPayNowDialogOpen}
        onOpenChange={setIsPayNowDialogOpen}
        onSave={handleSavePaymentMethod}
      />

      <AddBankDialog
        open={isBankDialogOpen}
        onOpenChange={setIsBankDialogOpen}
        onSave={handleSavePaymentMethod}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMethod} onOpenChange={() => setDeletingMethod(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}