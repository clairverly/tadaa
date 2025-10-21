import { Bill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Zap, Wifi, Shield, Play, CreditCard, DollarSign, Bell, BellOff, History, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDate, getDaysUntil, isOverdue, isUpcoming } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

const categoryIcons = {
  utilities: Zap,
  'telco-internet': Wifi,
  insurance: Shield,
  subscriptions: Play,
  'credit-loans': CreditCard,
  general: DollarSign,
};

const categoryStyles = {
  utilities: { bg: 'bg-amber-50', icon: 'text-amber-700', border: 'border-amber-200' },
  'telco-internet': { bg: 'bg-blue-50', icon: 'text-blue-700', border: 'border-blue-200' },
  insurance: { bg: 'bg-purple-50', icon: 'text-purple-700', border: 'border-purple-200' },
  subscriptions: { bg: 'bg-pink-50', icon: 'text-pink-700', border: 'border-pink-200' },
  'credit-loans': { bg: 'bg-indigo-50', icon: 'text-indigo-700', border: 'border-indigo-200' },
  general: { bg: 'bg-gray-50', icon: 'text-gray-700', border: 'border-gray-200' },
};

export function BillCard({ bill, onEdit, onDelete }: BillCardProps) {
  const daysUntil = getDaysUntil(bill.dueDate);
  const overdue = isOverdue(bill.dueDate);
  const upcoming = isUpcoming(bill.dueDate, 30);
  
  const CategoryIcon = categoryIcons[bill.category] || DollarSign;
  const styles = categoryStyles[bill.category] || categoryStyles.general;

  const handleSendReminder = () => {
    showSuccess(`Reminder sent for ${bill.name}`);
  };

  const getStatusBadge = () => {
    if (bill.status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    }
    if (overdue) {
      return <Badge variant="destructive">{Math.abs(daysUntil)} days overdue</Badge>;
    }
    if (daysUntil <= 3) {
      return <Badge variant="destructive">Due in {daysUntil} days</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Due in {daysUntil} days</Badge>;
    }
    if (upcoming) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Due in {daysUntil} days</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  // Get recent payment history (last 3 payments)
  const recentPayments = bill.paymentHistory.slice(-3).reverse();
  
  // Calculate outstanding amount
  const outstandingAmount = overdue && bill.status !== 'paid' ? bill.amount : 0;

  // Check if bill exceeds auto-pay limit
  const exceedsLimit = bill.autoPayEnabled && bill.autoPayLimit && bill.amount > bill.autoPayLimit;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md border-2',
      overdue && bill.status !== 'paid' && 'border-red-300',
      !overdue && 'border-gray-200',
      bill.status === 'paid' && 'opacity-75'
    )}>
      <CardContent className="p-0">
        {/* Simple Header */}
        <div className={cn('h-1', overdue && bill.status !== 'paid' ? 'bg-red-500' : 'bg-gray-200')}></div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-2.5 rounded-lg border', styles.bg, styles.border)}>
                <CategoryIcon className={cn('h-6 w-6', styles.icon)} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 text-gray-900">{bill.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge()}
                  {bill.autoPayEnabled ? (
                    <>
                      <Badge variant="outline" className="text-xs flex items-center gap-1 text-green-700 bg-green-50 border-green-200">
                        <CreditCard className="h-3 w-3" />
                        Auto-Pay
                      </Badge>
                      <Badge variant="outline" className="text-xs flex items-center gap-1 text-gray-500 bg-gray-50">
                        <BellOff className="h-3 w-3" />
                        No Reminders
                      </Badge>
                    </>
                  ) : (
                    <>
                      {bill.reminderEnabled ? (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Reminders
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 text-gray-400">
                          <BellOff className="h-3 w-3" />
                          No Reminders
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {bill.reminderEnabled && !bill.autoPayEnabled && (
                  <DropdownMenuItem onClick={handleSendReminder}>
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminder Now
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(bill)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(bill)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-3">
            {/* Current Bill Amount */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Current Amount</span>
              <span className="font-bold text-xl text-gray-900">${bill.amount.toFixed(2)}</span>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium text-gray-900">{formatDate(bill.dueDate)}</span>
            </div>

            {/* Auto-Pay Limit Warning */}
            {exceedsLimit && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border-2 border-amber-300">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Exceeds Auto-Pay Limit</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Bill amount (${bill.amount.toFixed(2)}) exceeds your limit of ${bill.autoPayLimit!.toFixed(2)}. Manual approval required.
                  </p>
                </div>
              </div>
            )}

            {/* Auto-Pay Limit Info */}
            {bill.autoPayEnabled && bill.autoPayLimit && !exceedsLimit && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Auto-Pay Limit</span>
                </div>
                <span className="text-sm font-semibold text-green-700">${bill.autoPayLimit.toFixed(2)}</span>
              </div>
            )}

            {/* Outstanding Amount */}
            {outstandingAmount > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Outstanding</span>
                </div>
                <span className="font-bold text-lg text-red-600">${outstandingAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Upcoming Payment (if within 30 days) */}
            {upcoming && !overdue && bill.status !== 'paid' && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {bill.autoPayEnabled ? 'Auto-Pay Scheduled' : 'Upcoming Payment'}
                  </span>
                </div>
                <span className="font-bold text-blue-600">${bill.amount.toFixed(2)}</span>
              </div>
            )}
            
            {/* Reminder Settings - Only show if auto-pay is disabled */}
            {!bill.autoPayEnabled && bill.reminderEnabled && bill.reminderDays.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-900 font-medium mb-1">Reminders set for:</p>
                <p className="text-xs text-blue-700">
                  {bill.reminderDays.sort((a, b) => b - a).map(d => `${d} day${d > 1 ? 's' : ''}`).join(', ')} before due date
                </p>
              </div>
            )}

            {/* Auto-Pay Info - Show when auto-pay is enabled */}
            {bill.autoPayEnabled && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-900 font-medium mb-1">Auto-Pay Active:</p>
                <p className="text-xs text-green-700">
                  Payment will be processed automatically when bill arrives. Reminders are disabled.
                </p>
              </div>
            )}

            {/* Payment History */}
            {recentPayments.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-700">Recent Payments</h4>
                </div>
                <div className="space-y-2">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">{formatDate(payment.date)}</p>
                        <p className={cn(
                          "text-xs font-medium",
                          payment.status === 'success' && "text-green-600",
                          payment.status === 'failed' && "text-red-600",
                          payment.status === 'pending' && "text-yellow-600"
                        )}>
                          {payment.status === 'success' && '✓ Paid'}
                          {payment.status === 'failed' && '✗ Failed'}
                          {payment.status === 'pending' && '⏳ Pending'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                {bill.paymentHistory.length > 3 && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    +{bill.paymentHistory.length - 3} more payment{bill.paymentHistory.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
            
            {/* Recurrence Info */}
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-gray-500 capitalize">{bill.category.replace('-', ' ')}</span>
              <span className="text-gray-500 capitalize">{bill.recurrence.replace('-', ' ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}