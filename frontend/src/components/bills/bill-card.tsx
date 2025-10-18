import { Bill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, CheckCircle, Zap, Home, Shield, CreditCard, Wifi, DollarSign } from 'lucide-react';
import { formatDate, getDaysUntil, isOverdue } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  onMarkPaid: (bill: Bill) => void;
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

export function BillCard({ bill, onEdit, onDelete, onMarkPaid }: BillCardProps) {
  const daysUntil = getDaysUntil(bill.dueDate);
  const overdue = isOverdue(bill.dueDate);
  const isPaid = bill.status === 'paid';
  
  const CategoryIcon = categoryIcons[bill.category] || DollarSign;
  const gradientColor = categoryColors[bill.category] || categoryColors.other;

  const getStatusBadge = () => {
    if (isPaid) {
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
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md',
      overdue && !isPaid && 'ring-2 ring-red-200',
      isPaid && 'opacity-75'
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
                {getStatusBadge()}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isPaid && (
                  <DropdownMenuItem onClick={() => onMarkPaid(bill)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="font-bold text-xl text-gray-900">${bill.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-medium text-gray-900">{formatDate(bill.dueDate)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 capitalize">{bill.category.replace('-', ' ')}</span>
              <span className="text-gray-500 capitalize">{bill.recurrence.replace('-', ' ')}</span>
            </div>

            {bill.paymentHistory.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Last paid: {formatDate(bill.paymentHistory[bill.paymentHistory.length - 1].date)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}