import { useState, useEffect } from 'react';
import { Bell, CreditCard, User, Shield, Plus, Edit, Trash2, Mail, Lock, Eye, EyeOff, Smartphone, Copy, CheckCircle, QrCode, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { NotificationCard } from '@/components/notifications/notification-card';
import { PaymentMethodCard } from '@/components/payments/payment-method-card';
import { ContactFormDialog } from '@/components/profile/contact-form-dialog';
import { AddCardDialog } from '@/components/payments/add-card-dialog';
import { userStorage, notificationStorage, paymentStorage, billStorage, appointmentStorage, errandStorage } from '@/lib/storage';
import { generateAllNotifications } from '@/lib/notifications';
import { UserProfile, TrustedContact, Notification, PaymentMethod } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<TrustedContact | null>(null);
  const [deletingPaymentMethod, setDeletingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    showSetup: false,
    verificationCode: '',
    copiedCode: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userProfile = userStorage.get();
    setProfile(userProfile);

    // Load notifications
    const bills = billStorage.getAll();
    const appointments = appointmentStorage.getAll();
    const errands = errandStorage.getAll();
    const paymentMethodsList = paymentStorage.getAll();
    
    const generated = generateAllNotifications(bills, appointments, errands, paymentMethodsList);
    const stored = notificationStorage.getAll();
    const storedMap = new Map(stored.map(n => [n.id, n.isRead]));
    
    const merged = generated.map(n => ({
      ...n,
      isRead: storedMap.get(n.id) || false,
    }));
    
    setNotifications(merged);
    setPaymentMethods(paymentMethodsList);
  };

  const handleUpdateProfile = (field: keyof UserProfile, value: any) => {
    if (!profile) return;
    
    const updates = { [field]: value };
    userStorage.update(updates);
    setProfile({ ...profile, ...updates });
    showSuccess('Profile updated');
  };

  const handleSaveContact = (contact: TrustedContact) => {
    if (!profile) return;

    let updatedContacts: TrustedContact[];
    
    if (editingContact) {
      updatedContacts = profile.trustedContacts.map(c => 
        c.id === contact.id ? contact : c
      );
      showSuccess('Contact updated');
    } else {
      updatedContacts = [...profile.trustedContacts, contact];
      showSuccess('Contact added');
    }

    userStorage.update({ trustedContacts: updatedContacts });
    setProfile({ ...profile, trustedContacts: updatedContacts });
    setEditingContact(null);
  };

  const handleDeleteContact = (contact: TrustedContact) => {
    setDeletingContact(contact);
  };

  const confirmDeleteContact = () => {
    if (!profile || !deletingContact) return;

    const updatedContacts = profile.trustedContacts.filter(c => c.id !== deletingContact.id);
    userStorage.update({ trustedContacts: updatedContacts });
    setProfile({ ...profile, trustedContacts: updatedContacts });
    showSuccess('Contact removed');
    setDeletingContact(null);
  };

  const handleMarkAsRead = (notification: Notification) => {
    notificationStorage.markAsRead(notification.id);
    showSuccess('Marked as read');
    loadData();
  };

  const handleDeleteNotification = (notification: Notification) => {
    notificationStorage.delete(notification.id);
    showSuccess('Notification deleted');
    loadData();
  };

  const handleSavePaymentMethod = (method: PaymentMethod) => {
    paymentStorage.add(method);
    showSuccess('Payment method added successfully');
    loadData();
  };

  const handleSetDefaultPayment = (method: PaymentMethod) => {
    paymentStorage.setDefault(method.id);
    showSuccess('Default payment method updated');
    loadData();
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    setDeletingPaymentMethod(method);
  };

  const confirmDeletePaymentMethod = () => {
    if (deletingPaymentMethod) {
      paymentStorage.delete(deletingPaymentMethod.id);
      showSuccess('Payment method removed');
      loadData();
      setDeletingPaymentMethod(null);
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      showError('Please fill in all password fields');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    // In a real app, this would verify current password and update
    showSuccess('Password changed successfully');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleEnable2FA = () => {
    if (!profile) return;
    
    // Generate mock backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    const twoFactorAuth = {
      enabled: false, // Will be enabled after verification
      secret: 'JBSWY3DPEHPK3PXP', // Mock secret for demo
      backupCodes,
      lastVerified: new Date().toISOString(),
    };

    userStorage.update({ twoFactorAuth });
    setProfile({ ...profile, twoFactorAuth });
    setTwoFactorSetup({ ...twoFactorSetup, showSetup: true });
  };

  const handleVerify2FA = () => {
    if (!profile || !twoFactorSetup.verificationCode) {
      showError('Please enter the verification code');
      return;
    }

    if (twoFactorSetup.verificationCode.length !== 6) {
      showError('Verification code must be 6 digits');
      return;
    }

    // In a real app, this would verify the code with the server
    const twoFactorAuth = {
      ...profile.twoFactorAuth!,
      enabled: true,
      lastVerified: new Date().toISOString(),
    };

    userStorage.update({ twoFactorAuth });
    setProfile({ ...profile, twoFactorAuth });
    setTwoFactorSetup({ showSetup: false, verificationCode: '', copiedCode: false });
    showSuccess('Two-factor authentication enabled successfully!');
  };

  const handleDisable2FA = () => {
    if (!profile) return;

    userStorage.update({ twoFactorAuth: { enabled: false } });
    setProfile({ ...profile, twoFactorAuth: { enabled: false } });
    showSuccess('Two-factor authentication disabled');
  };

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('Backup code copied to clipboard');
  };

  const handleRegenerateBackupCodes = () => {
    if (!profile || !profile.twoFactorAuth) return;

    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    const twoFactorAuth = {
      ...profile.twoFactorAuth,
      backupCodes,
    };

    userStorage.update({ twoFactorAuth });
    setProfile({ ...profile, twoFactorAuth });
    showSuccess('Backup codes regenerated');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleUpdateProfile('firstName', e.target.value)}
                  placeholder="Your first name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleUpdateProfile('lastName', e.target.value)}
                  placeholder="Your last name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleUpdateProfile('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trusted Contacts</CardTitle>
                  <CardDescription>People who will receive your urgent alerts</CardDescription>
                </div>
                <Button onClick={() => { setEditingContact(null); setIsContactFormOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.trustedContacts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No trusted contacts added yet</p>
                  <Button onClick={() => { setEditingContact(null); setIsContactFormOpen(true); }} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.trustedContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingContact(contact); setIsContactFormOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bill Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about upcoming bills</p>
                </div>
                <Switch
                  checked={profile.notificationPreferences.billReminders}
                  onCheckedChange={(checked) => 
                    handleUpdateProfile('notificationPreferences', {
                      ...profile.notificationPreferences,
                      billReminders: checked
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about upcoming appointments</p>
                </div>
                <Switch
                  checked={profile.notificationPreferences.appointmentReminders}
                  onCheckedChange={(checked) => 
                    handleUpdateProfile('notificationPreferences', {
                      ...profile.notificationPreferences,
                      appointmentReminders: checked
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Errand Updates</p>
                  <p className="text-sm text-gray-500">Get notified about errand status changes</p>
                </div>
                <Switch
                  checked={profile.notificationPreferences.errandUpdates}
                  onCheckedChange={(checked) => 
                    handleUpdateProfile('notificationPreferences', {
                      ...profile.notificationPreferences,
                      errandUpdates: checked
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </div>
                <Button onClick={() => setIsCardDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No payment methods added yet</p>
                  <Button onClick={() => setIsCardDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Payment Method
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      onSetDefault={handleSetDefaultPayment}
                      onDelete={handleDeletePaymentMethod}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          {/* Two-Factor Authentication */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </div>
                {profile.twoFactorAuth?.enabled && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!profile.twoFactorAuth?.enabled && !twoFactorSetup.showSetup && (
                <>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Recommended:</strong> Enable 2FA to protect your account with an additional security code from your authenticator app.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleEnable2FA} className="w-full">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                </>
              )}

              {twoFactorSetup.showSetup && (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <QrCode className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Step 1:</strong> Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </AlertDescription>
                  </Alert>

                  {/* Mock QR Code */}
                  <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="px-4 py-2 bg-gray-100 rounded-md font-mono text-sm">
                        {profile.twoFactorAuth?.secret}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(profile.twoFactorAuth?.secret || '');
                          setTwoFactorSetup({ ...twoFactorSetup, copiedCode: true });
                          showSuccess('Secret code copied to clipboard');
                        }}
                      >
                        {twoFactorSetup.copiedCode ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Step 2:</strong> Enter the 6-digit code from your authenticator app to verify
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      maxLength={6}
                      value={twoFactorSetup.verificationCode}
                      onChange={(e) => setTwoFactorSetup({ ...twoFactorSetup, verificationCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setTwoFactorSetup({ showSetup: false, verificationCode: '', copiedCode: false })}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleVerify2FA} className="flex-1">
                      Verify & Enable
                    </Button>
                  </div>
                </div>
              )}

              {profile.twoFactorAuth?.enabled && (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">
                      Two-factor authentication is active. Your account is protected with an additional security layer.
                    </AlertDescription>
                  </Alert>

                  {/* Backup Codes */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Backup Codes</h4>
                      <Button variant="outline" size="sm" onClick={handleRegenerateBackupCodes}>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Save these codes in a safe place. You can use them to access your account if you lose your phone.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.twoFactorAuth.backupCodes?.map((code, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                          <code className="text-xs font-mono">{code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyBackupCode(code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="destructive" onClick={handleDisable2FA} className="w-full">
                    Disable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={handleChangePassword} className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Preferences
              </CardTitle>
              <CardDescription>Manage your email notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-500">Receive updates about new features</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-500">Get a weekly summary of your bills and tasks</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertDescription className="text-red-800 text-sm">
                  Deleting your account will permanently remove all your data including bills, errands, appointments, and payment methods. This action cannot be undone.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ContactFormDialog
        open={isContactFormOpen}
        onOpenChange={setIsContactFormOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      <AddCardDialog
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
        onSave={handleSavePaymentMethod}
      />

      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingContact?.name}" from your trusted contacts?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContact} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingPaymentMethod} onOpenChange={() => setDeletingPaymentMethod(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePaymentMethod} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}