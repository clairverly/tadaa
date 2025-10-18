import { useState, useEffect } from 'react';
import { Plus, CreditCard, Smartphone, Building2, AlertCircle } from 'lucide-react';
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
            <DropdownMenuItem onClick={() => setIsPayNowDialogOpen(true)}>
              <Smartphone className="h-4 w-4 mr-2" />
              PayNow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsBankDialogOpen(true)}>
              <Building2 className="h-4 w-4 mr-2" />
              Bank Account
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Payment Method
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCardDialogOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit/Debit Card
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPayNowDialogOpen(true)}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  PayNow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBankDialogOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Bank Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

          {/* PayNow Section */}
          {payNowMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  PayNow
                </CardTitle>
                <CardDescription>Your linked PayNow accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {payNowMethods.map(method => (
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

          {/* Bank Accounts Section */}
          {bankMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bank Accounts
                </CardTitle>
                <CardDescription>Your linked bank accounts for direct debit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bankMethods.map(method => (
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
        </div>
      )}

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