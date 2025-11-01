import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bill } from '@/types';
import { formatDate, getDaysUntil } from '@/lib/utils/date';

interface OverdueBillsAlertProps {
  bills: Bill[];
}

export function OverdueBillsAlert({ bills }: OverdueBillsAlertProps) {
  if (bills.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <span>Overdue Bills Require Attention</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.slice(0, 3).map(bill => (
            <div key={bill.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{bill.name}</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                  </div>
                  {bill.autoPayEnabled && (
                    <div className="p-1.5 rounded-lg border-2 border-green-500 bg-green-50 flex-shrink-0">
                      <Repeat className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-lg">${bill.amount.toFixed(2)}</p>
                <Badge variant="destructive" className="text-xs">
                  {Math.abs(getDaysUntil(bill.dueDate))} days overdue
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Link to="/bills">
          <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 shadow-lg">
            View All Overdue Bills
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}