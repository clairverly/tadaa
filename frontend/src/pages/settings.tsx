import { useState, useEffect } from 'react';
import { Bell, CreditCard, User, Shield, Plus, Edit, Trash2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            {unreadNotifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleUpdateProfile('name', e.target.value)}
                  placeholder="Your name"
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

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    All Notifications
                    {unreadNotifications.length > 0 && (
                      <Badge className="bg-red-500">
                        {unreadNotifications.length} unread
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Stay updated on bills, appointments, and errands</CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      notificationStorage.clearAll();
                      loadData();
                      showSuccess('All notifications cleared');
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No notifications</p>
                  <p className="text-sm text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
                </div>
              )}
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