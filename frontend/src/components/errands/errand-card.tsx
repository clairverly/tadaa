import { Errand } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface ErrandCardProps {
  errand: Errand;
  onEdit: (errand: Errand) => void;
  onDelete: (errand: Errand) => void;
}

export function ErrandCard({ errand, onEdit, onDelete }: ErrandCardProps) {
  const canEdit = errand.status === 'pending';
  const canDelete = errand.status === 'pending';

  const getStatusColor = () => {
    switch (errand.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      errand.priority === 'urgent' && errand.status !== 'done' && 'border-orange-200 bg-orange-50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg capitalize">
                {errand.type.replace('-', ' ')}
              </h3>
              <Badge className={getStatusColor()}>
                {errand.status.replace('-', ' ')}
              </Badge>
              {errand.priority === 'urgent' && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{errand.description}</p>

            <div className="space-y-1 text-sm text-gray-600">
              <p>Preferred Date: <span className="font-medium">{formatDate(errand.preferredDate)}</span></p>
              <p className="capitalize">Priority: {errand.priority}</p>
            </div>

            {errand.adminNotes && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                <p className="font-medium text-blue-900">Admin Notes:</p>
                <p className="text-blue-800">{errand.adminNotes}</p>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(errand)}>
                <Edit className="h-4 w-4 mr-2" />
                {canEdit ? 'Edit' : 'View Details'}
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem onClick={() => onDelete(errand)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Errand
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}