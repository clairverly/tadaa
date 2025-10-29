import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bill, BillCategory, BillRecurrence } from '@/types';
import { ScannedBillData } from '@/lib/bill-ocr';
import { showSuccess, showError } from '@/utils/toast';
import { CreditCard, Info, Scan, Mail, Sparkles, Shield, BellOff, Plus, X, Building2, Lock, Eye, EyeOff, Calendar, RefreshCw, Bell, DollarSign } from 'lucide-react';
import { paymentStorage, userStorage } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';

interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  scannedData?: ScannedBillData | null;
  onSave: (bill: Bill) => void;
  defaultCategory?: BillCategory | null;
}

export function BillFormDialog({ open, onOpenChange, bill, scannedData, onSave, defaultCategory }: BillFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'utilities' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    reminderEnabled: true,
    autoPayEnabled: false,
    autoPayLimit: '',
    paymentMethodId: '',
    providerEmails: [] as string[],
    emailInput: '',
    attachmentPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const paymentMethods = paymentStorage.getAll();

  useEffect(() => {
    if (scannedData) {
      // Pre-fill with scanned data
      setFormData({
        name: scannedData.name,
        amount: scannedData.amount ? scannedData.amount.toString() : '',
        dueDate: scannedData.dueDate || '',
        category: scannedData.category,
        recurrence: scannedData.recurrence || 'monthly',
        reminderEnabled: true,
        autoPayEnabled: false,
        autoPayLimit: '',
        paymentMethodId: '',
        providerEmails: [],
        emailInput: '',
        attachmentPassword: '',
      });
    } else if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount ? bill.amount.toString() : '',
        dueDate: bill.dueDate || '',
        category: bill.category,
        recurrence: bill.recurrence,
        reminderEnabled: bill.reminderEnabled ?? true,
        autoPayEnabled: bill.autoPayEnabled || false,
        autoPayLimit: bill.autoPayLimit ? bill.autoPayLimit.toString() : '',
        paymentMethodId: bill.paymentMethodId || '',
        providerEmails: bill.providerEmails || [],
        emailInput: '',
        attachmentPassword: bill.attachmentPassword || '',
      });
    } else {
      // New bill - use default category if provided
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: defaultCategory || 'utilities',
        recurrence: 'monthly',
        reminderEnabled: true,
        autoPayEnabled: false,
        autoPayLimit: '',
        paymentMethodId: '',
        providerEmails: [],
        emailInput: '',
        attachmentPassword: '',
      });
    }
  }, [bill, scannedData, defaultCategory, open]);

  const handleAddEmail = () => {
    const email = formData.emailInput.trim();
    
    if (!email) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    // Check for duplicates
    if (formData.providerEmails.includes(email)) {
      showError('This email is already added');
      return;
    }
    
    setFormData({
      ...formData,
      providerEmails: [...formData.providerEmails, email],
      emailInput: '',
    });
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setFormData({
      ...formData,
      providerEmails: formData.providerEmails.filter(e => e !== emailToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showError('Please enter the bill name');
      return;
    }

    if (formData.autoPayEnabled && !formData.paymentMethodId) {
      showError('Please select a payment method for auto-pay');
      return;
    }

    if (formData.autoPayEnabled && formData.autoPayLimit) {
      const limit = parseFloat(formData.autoPayLimit);
      if (isNaN(limit) || limit <= 0) {
        showError('Please enter a valid auto-pay limit');
        return;
      }
    }

    // Parse amount and due date from form
    const amount = formData.amount ? parseFloat(formData.amount) : 0;
    const dueDate = formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newBill: Bill = {
      id: bill?.id || `bill-${Date.now()}`,
      name: formData.name,
      amount: amount,
      dueDate: dueDate,
      category: formData.category,
      recurrence: formData.recurrence,
      status: bill?.status || 'upcoming',
      reminderDays: bill?.reminderDays || [7, 3, 1], // Default reminders
      reminderEnabled: formData.autoPayEnabled ? false : formData.reminderEnabled, // Disable reminders if auto-pay enabled
      providerEmails: formData.providerEmails,
      attachmentPassword: formData.attachmentPassword || undefined,
      autoPayEnabled: formData.autoPayEnabled,
      autoPayLimit: formData.autoPayEnabled && formData.autoPayLimit ? parseFloat(formData.autoPayLimit) : undefined,
      paymentMethodId: formData.autoPayEnabled ? formData.paymentMethodId : undefined,
      retryCount: bill?.retryCount || 0,
      paymentHistory: bill?.paymentHistory || [],
      createdAt: bill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newBill);
    showSuccess(bill ? 'Bill updated successfully' : 'Bill added successfully. Forward bill emails to update details.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bill ? 'Edit Bill' : scannedData ? 'Review Scanned Bill' : 'Add New Bill'}</DialogTitle>
          <DialogDescription>
            {bill ? 'Update bill information' : scannedData ? 'Review and edit the scanned information' : 'Add a biller to track - details will be updated via email'}
          </DialogDescription>
        </DialogHeader>

        {scannedData && (
          <Alert className="bg-green-50 border-green-200">
            <Scan className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              Information extracted from your bill. Please review and edit if needed.
            </AlertDescription>
          </Alert>
        )}

        {!bill && !scannedData && (
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Email-First Workflow:</strong> Add the biller name and their billing email addresses. When you forward bills from these addresses, we'll automatically update amounts, due dates, and payment details.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Biller Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pacific Gas & Electric, Comcast, State Farm"
              />
              <p className="text-xs text-gray-500">
                Enter the company or service provider name
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as BillCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utilities">Utilities (Electricity, Water, Gas)</SelectItem>
                  <SelectItem value="telco-internet">Telco & Internet</SelectItem>
                  <SelectItem value="insurance">Insurance Premiums</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions (Netflix, Spotify, etc.)</SelectItem>
                  <SelectItem value="credit-loans">Credit Cards & Loans</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Helps organize your bills by type
              </p>
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <Label htmlFor="amount">Bill Amount (Optional)</Label>
              </div>
              {formData.autoPayEnabled && formData.providerEmails.length > 0 && !formData.amount ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">As Billed</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Amount will be automatically extracted from bill emails and paid accordingly
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g., 125.50"
                    disabled={formData.autoPayEnabled && formData.providerEmails.length > 0 && !bill}
                  />
                  <p className="text-xs text-gray-500">
                    {scannedData
                      ? 'Amount extracted from scan - you can edit if needed'
                      : formData.autoPayEnabled && formData.providerEmails.length > 0
                      ? 'Leave blank for "As Billed" - amount will be extracted from emails'
                      : 'Enter the bill amount if known, or leave blank to update via email'}
                  </p>
                </>
              )}
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
              </div>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              />
              <p className="text-xs text-gray-500">
                {scannedData ? 'Due date extracted from scan - you can edit if needed' : 'Enter the due date if known, or leave blank to update via email'}
              </p>
            </div>

            {/* Billing Frequency / Recurrence */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-gray-500" />
                <Label htmlFor="recurrence">Billing Frequency *</Label>
              </div>
              <Select
                value={formData.recurrence}
                onValueChange={(value) => setFormData({ ...formData, recurrence: value as BillRecurrence })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-Time Payment</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly / Annually</SelectItem>
                  <SelectItem value="as-billed">As Billed (Variable/Irregular)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                How often this bill occurs
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  <strong>Examples:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li><strong>Monthly:</strong> Utilities, rent, subscriptions</li>
                    <li><strong>Yearly:</strong> Insurance premiums, memberships</li>
                    <li><strong>One-Time:</strong> Medical bills, repairs</li>
                    <li><strong>As Billed:</strong> Credit cards, variable utilities, medical services (amounts and timing vary)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Service Provider Billing Email Addresses */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <Label>Service Provider Billing Emails (Recommended)</Label>
              </div>
              
              <p className="text-xs text-gray-600">
                Add the email addresses that send bills from this provider (e.g., bills@electric-company.com, noreply@provider.com)
              </p>

              {/* Email Input */}
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={formData.emailInput}
                  onChange={(e) => setFormData({ ...formData, emailInput: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  placeholder="bills@provider.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  disabled={!formData.emailInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Email List */}
              {formData.providerEmails.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Provider Email Addresses ({formData.providerEmails.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.providerEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        <Building2 className="h-3 w-3" />
                        <span className="text-xs">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-xs">
                  <strong>How it works:</strong> When you forward a bill email from any of these addresses, our system will automatically recognize it, extract the amount and due date, and update this bill with accurate information.
                </AlertDescription>
              </Alert>

              {formData.providerEmails.length === 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    <strong>Tip:</strong> Adding provider emails helps us automatically update your bill amounts and due dates. You can find these in the "From" field of your bill emails (e.g., bills@pge.com, noreply@comcast.com).
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Attachment Password */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <Label htmlFor="attachmentPassword">PDF Attachment Password (Optional)</Label>
              </div>
              
              <p className="text-xs text-gray-600">
                If this provider sends password-protected PDF bills, enter the password here
              </p>

              <div className="relative">
                <Input
                  id="attachmentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.attachmentPassword}
                  onChange={(e) => setFormData({ ...formData, attachmentPassword: e.target.value })}
                  placeholder="Enter PDF password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  <strong>Common use cases:</strong> Bank statements, credit card bills, and insurance documents often come as password-protected PDFs. The password is usually your date of birth, last 4 digits of account number, or a custom password set by the provider.
                </AlertDescription>
              </Alert>

              <Alert className="bg-amber-50 border-amber-200">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-xs">
                  <strong>Security Note:</strong> In demo mode, passwords are stored locally on your device. In production, passwords would be encrypted and stored securely.
                </AlertDescription>
              </Alert>
            </div>

            {/* Reminder Settings */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable Payment Reminders</Label>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked })}
                  disabled={formData.autoPayEnabled}
                />
              </div>

              {formData.reminderEnabled && !formData.autoPayEnabled && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    You'll receive reminders 7, 3, and 1 day(s) before the bill is due. This helps you stay on top of payments and avoid late fees.
                  </AlertDescription>
                </Alert>
              )}

              {!formData.reminderEnabled && !formData.autoPayEnabled && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Note:</strong> Without reminders or auto-pay, you'll need to manually check for bills. Consider enabling one of these options to avoid missing payments.
                  </AlertDescription>
                </Alert>
              )}

              {formData.autoPayEnabled && (
                <Alert className="bg-gray-50 border-gray-200">
                  <BellOff className="h-4 w-4 text-gray-600" />
                  <AlertDescription className="text-gray-700 text-sm">
                    Reminders are disabled when auto-pay is enabled. You'll receive payment confirmation notifications instead.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Auto-Pay Settings */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="autoPayEnabled" className="cursor-pointer">Enable Auto-Pay (Optional)</Label>
                </div>
                <Switch
                  id="autoPayEnabled"
                  checked={formData.autoPayEnabled}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    autoPayEnabled: checked,
                    reminderEnabled: checked ? false : formData.reminderEnabled // Disable reminders when auto-pay is enabled
                  })}
                />
              </div>

              {formData.autoPayEnabled && (
                <div className="space-y-3 pl-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Auto-pay will automatically process payments when bills arrive via email. Up to 3 retry attempts if payment fails.
                    </AlertDescription>
                  </Alert>

                  {/* Reminders Disabled Notice */}
                  <Alert className="bg-gray-50 border-gray-200">
                    <BellOff className="h-4 w-4 text-gray-600" />
                    <AlertDescription className="text-gray-700 text-sm">
                      <strong>Reminders Disabled:</strong> Since auto-pay is enabled, payment reminders are automatically turned off. You'll only receive payment confirmation notifications.
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

                  {/* Auto-Pay Limit */}
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <Label htmlFor="autoPayLimit">Auto-Pay Limit (Recommended)</Label>
                    </div>
                    <Input
                      id="autoPayLimit"
                      type="number"
                      step="0.01"
                      value={formData.autoPayLimit}
                      onChange={(e) => setFormData({ ...formData, autoPayLimit: e.target.value })}
                      placeholder="e.g., 150.00"
                    />
                    <p className="text-xs text-gray-600">
                      Maximum amount to auto-pay. Bills exceeding this limit will require manual approval.
                    </p>
                    <Alert className="bg-purple-50 border-purple-200">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800 text-xs">
                        <strong>Example:</strong> If your electric bill is usually $120, set limit to $150. If a bill arrives for $200, you'll be notified to review before payment.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </div>

            {/* Email Integration Info */}
            {!bill && (
              <Alert className="bg-purple-50 border-purple-200">
                <Mail className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-sm">
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                    <li>Save this bill to your account</li>
                    <li>Forward bill emails from the provider addresses you added</li>
                    <li>We'll automatically extract amounts, due dates{!formData.autoPayEnabled && ', and set up reminders'}</li>
                    <li>{formData.autoPayEnabled ? 'Bills will be paid automatically' : 'Get notified when bills arrive with quick payment options'}</li>
                    {formData.providerEmails.length > 0 && (
                      <li>System will recognize emails from: {formData.providerEmails.join(', ')}</li>
                    )}
                    {formData.attachmentPassword && (
                      <li>Password-protected PDFs will be automatically unlocked and processed</li>
                    )}
                    <li>Bill will recur {formData.recurrence === 'one-time' ? 'once' : formData.recurrence === 'as-billed' ? 'as billed' : formData.recurrence}</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {bill ? 'Update Bill' : 'Add Biller'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}