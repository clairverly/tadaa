import { Bill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, CheckCircle } from 'lucide-react';
import { formatDate, getDaysUntil, isOverdue } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  onMarkPaid: (bill: Bill) => void;
}

export function BillCard({ bill, onEdit, onDelete, onMarkPaid }: BillCardProps) {
  const daysUntil = getDaysUntil(bill.dueDate);
  const overdue = isOverdue(bill.dueDate);
  const isPaid = bill.status === 'paid';

  const getStatusBadge = () => {
    if (isPaid) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
    }
    if (overdue) {
      return <Badge variant="destructive">{Math.abs(daysUntil)} days overdue</Badge>;
    }
    if (daysUntil <= 3) {
      return <Badge variant="destructive">Due in {daysUntil} days</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due in {daysUntil} days</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      overdue && !isPaid && 'border-red-200 bg-red-50',
      isPaid && 'opacity-75'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{bill.name}</h3>
              {getStatusBadge()}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Amount: <span className="font-semibold text-gray-900">${bill.amount.toFixed(2)}</span></p>
              <p>Due: <span className="font-medium">{formatDate(bill.dueDate)}</span></p>
              <p className="capitalize">Category: {bill.category.replace('-', ' ')}</p>
              <p className="capitalize">Recurrence: {bill.recurrence.replace('-', ' ')}</p>
            </div>

            {bill.paymentHistory.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Last paid: {formatDate(bill.paymentHistory[bill.paymentHistory.length - 1].date)}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
      </CardContent>
    </Card>
  );
}