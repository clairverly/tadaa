import { Bill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Zap, Home, Shield, CreditCard, Wifi, DollarSign, Bell, BellOff, History, TrendingUp, AlertCircle } from 'lucide-react';
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
  rent: Home,
  insurance: Shield,
  'credit-card': CreditCard,
  subscription: Wifi,
  other: DollarSign,
};

const categoryColors = {
  utilities: 'from-yellow-500 to-orange-500',
  rent: 'from-blue-500 to-indigo-500',
  insurance: 'from-green-500 to-emerald-500',
  'credit-card': 'from-purple-500 to-pink-500',
  subscription: 'from-cyan-500 to-blue-500',
  other: 'from-gray-500 to-slate-500',
};

export function BillCard({ bill, onEdit, onDelete }: BillCardProps) {
  const daysUntil = getDaysUntil(bill.dueDate);
  const overdue = isOverdue(bill.dueDate);
  const upcoming = isUpcoming(bill.dueDate, 30);
  
  const CategoryIcon = categoryIcons[bill.category] || DollarSign;
  const gradientColor = categoryColors[bill.category] || categoryColors.other;

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

  return (
    <Card className={cn(
      'transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md',
      overdue && bill.status !== 'paid' && 'ring-2 ring-red-200',
      bill.status === 'paid' && 'opacity-75'
    )}>
      <CardContent className="p-0">
        {/* Gradient Header */}
        <div className={cn('h-2 bg-gradient-to-r', gradientColor)}></div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-3 rounded-xl bg-gradient-to-br shadow-sm', gradientColor)}>
                <CategoryIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{bill.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge()}
                  {bill.reminderEnabled ? (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Reminders On
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex items-center gap-1 text-gray-400">
                      <BellOff className="h-3 w-3" />
                      No Reminders
                    </Badge>
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
                {bill.reminderEnabled && (
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Current Amount</span>
              <span className="font-bold text-xl text-gray-900">${bill.amount.toFixed(2)}</span>
            </div>
            
            {/* Due Date */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium text-gray-900">{formatDate(bill.dueDate)}</span>
            </div>

            {/* Outstanding Amount */}
            {outstandingAmount > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
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
                  <span className="text-sm font-medium text-blue-900">Upcoming Payment</span>
                </div>
                <span className="font-bold text-blue-600">${bill.amount.toFixed(2)}</span>
              </div>
            )}
            
            {/* Reminder Settings */}
            {bill.reminderEnabled && bill.reminderDays.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-900 font-medium mb-1">Reminders set for:</p>
                <p className="text-xs text-blue-700">
                  {bill.reminderDays.sort((a, b) => b - a).map(d => `${d} day${d > 1 ? 's' : ''}`).join(', ')} before due date
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
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 capitalize">{bill.category.replace('-', ' ')}</span>
              <span className="text-gray-500 capitalize">{bill.recurrence.replace('-', ' ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}