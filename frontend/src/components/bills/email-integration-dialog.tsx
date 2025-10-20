import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Copy, CheckCircle, ArrowRight, Zap, CreditCard, Bell } from 'lucide-react';
import { useState } from 'react';
import { showSuccess } from '@/utils/toast';

interface EmailIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailIntegrationDialog({ open, onOpenChange }: EmailIntegrationDialogProps) {
  const [copied, setCopied] = useState(false);
  
  // Mock email address for demonstration
  const billPayEmail = 'bills@snapbillpay.app';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(billPayEmail);
    setCopied(true);
    showSuccess('Email address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Bill Integration
          </DialogTitle>
          <DialogDescription>
            Forward your bills via email to automatically update amounts and enable quick payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Demo Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              <strong>Demo Feature:</strong> This shows how email bill forwarding would work. In a production app, this would require backend integration to process incoming emails.
            </AlertDescription>
          </Alert>

          {/* Email Address Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Your Unique Bill Email Address</h3>
            <div className="flex items-center gap-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <code className="flex-1 text-sm font-mono text-gray-900">{billPayEmail}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyEmail}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Forward your bill emails to this address to automatically process them
            </p>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">How It Works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Forward Your Bill Email</p>
                  <p className="text-sm text-gray-600">
                    When you receive a bill via email, simply forward it to your unique bill email address
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Automatic Processing</p>
                  <p className="text-sm text-gray-600">
                    Our system extracts bill details (amount, due date, biller name) using AI-powered OCR
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Bill Updated Automatically</p>
                  <p className="text-sm text-gray-600">
                    If the bill exists, we update the amount. If it's new, we create it for you
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Get Notified & Pay</p>
                  <p className="text-sm text-gray-600">
                    Receive a notification with payment options. Pay instantly or schedule for later
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Smart Features</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 text-sm">Automatic Amount Updates</p>
                  <p className="text-xs text-green-700">Variable bills (utilities, credit cards) are automatically updated with new amounts</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900 text-sm">Quick Payment Links</p>
                  <p className="text-xs text-purple-700">Get direct payment links in notifications for instant bill payment</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Smart Reminders</p>
                  <p className="text-xs text-blue-700">Automatically sets up reminders based on your preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Example Workflow</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">You receive:</span>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded border">bill@electric-company.com</span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Forward to:</span>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{billPayEmail}</span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">System extracts:</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">$127.45 due Mar 15</span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Bill updated & ready to pay!</span>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Setup Instructions</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Copy your unique bill email address above</li>
              <li>Add it to your email contacts as "My Bill Pay"</li>
              <li>Set up email forwarding rules for common billers (optional)</li>
              <li>Forward any bill email to start using the feature</li>
            </ol>
          </div>

          {/* Production Note */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-900 text-sm">
              <strong>Note:</strong> In a production environment, this feature would require:
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>Backend email processing server</li>
                <li>Email parsing and OCR integration</li>
                <li>Secure email authentication</li>
                <li>Database to store and match bills</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleCopyEmail}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Email Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}