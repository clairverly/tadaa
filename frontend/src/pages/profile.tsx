import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User as UserIcon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ContactFormDialog } from '@/components/profile/contact-form-dialog';
import { userStorage } from '@/lib/storage';
import { UserProfile, TrustedContact } from '@/types';
import { showSuccess } from '@/utils/toast';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<TrustedContact | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userProfile = userStorage.get();
    setProfile(userProfile);
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

  const handleEditContact = (contact: TrustedContact) => {
    setEditingContact(contact);
    setIsContactFormOpen(true);
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

  const handleAddNewContact = () => {
    setEditingContact(null);
    setIsContactFormOpen(true);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
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

      {/* Notification Preferences */}
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

      {/* Trusted Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trusted Contacts</CardTitle>
              <CardDescription>People who will receive your urgent alerts</CardDescription>
            </div>
            <Button onClick={handleAddNewContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profile.trustedContacts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No trusted contacts added yet</p>
              <Button onClick={handleAddNewContact} variant="outline">
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
                      onClick={() => handleEditContact(contact)}
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

      {/* Contact Form Dialog */}
      <ContactFormDialog
        open={isContactFormOpen}
        onOpenChange={setIsContactFormOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      {/* Delete Contact Confirmation */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingContact?.name}" from your trusted contacts? 
              They will no longer receive your urgent alerts.
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
    </div>
  );
}