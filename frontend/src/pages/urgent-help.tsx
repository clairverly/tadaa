import { useState, useEffect } from 'react';
import { AlertCircle, Send, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { userStorage, alertStorage } from '@/lib/storage';
import { UrgentAlert, TrustedContact } from '@/types';
import { showSuccess, showError } from '@/utils/toast';
import { formatDateTime } from '@/lib/utils/date';

export default function UrgentHelp() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [alerts, setAlerts] = useState<UrgentAlert[]>([]);
  const [message, setMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const profile = userStorage.get();
    if (profile) {
      setContacts(profile.trustedContacts);
    }
    setAlerts(alertStorage.getAll());
  };

  const handleSendAlert = () => {
    if (contacts.length === 0) {
      showError('Please add trusted contacts in your profile first');
      return;
    }

    const alert: UrgentAlert = {
      id: `alert-${Date.now()}`,
      message: message || 'I need urgent help!',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    alertStorage.add(alert);
    setAlerts([alert, ...alerts]);
    setMessage('');
    setShowConfirmDialog(false);
    
    showSuccess(`Alert sent to ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`);
  };

  const triggerAlert = () => {
    if (contacts.length === 0) {
      showError('Please add trusted contacts in your profile first');
      return;
    }
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Urgent Help</h1>
        <p className="text-gray-500 mt-1">Send immediate alerts to your trusted contacts</p>
      </div>

      {/* Alert Trigger Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Alert
          </CardTitle>
          <CardDescription>
            Click the button below to immediately notify all your trusted contacts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Optional Message
            </label>
            <Textarea
              placeholder="Add a message (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>

          <Button
            onClick={triggerAlert}
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={contacts.length === 0}
          >
            <Send className="h-5 w-5 mr-2" />
            Send Urgent Alert
          </Button>

          {contacts.length === 0 && (
            <p className="text-sm text-red-700 text-center">
              Please add trusted contacts in your profile to use this feature
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trusted Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Contacts</CardTitle>
          <CardDescription>
            These people will receive your urgent alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">No trusted contacts added yet</p>
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                Add Contacts in Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                    {contact.phone && (
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    )}
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Your recent urgent help requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No alerts sent yet</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {alert.acknowledged ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {alert.message || 'I need urgent help!'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(alert.timestamp)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Sent to {contacts.length} contact{contacts.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant={alert.acknowledged ? 'secondary' : 'default'}>
                    {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Send Urgent Alert?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately notify all {contacts.length} of your trusted contacts via in-app notification and email.
              {message && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">Your message:</p>
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendAlert} className="bg-red-600 hover:bg-red-700">
              Send Alert Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}