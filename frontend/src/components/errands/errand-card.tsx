import { Errand } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, AlertCircle, Wrench, Sparkles, Leaf, ShoppingCart, Package, Pill } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface ErrandCardProps {
  errand: Errand;
  onEdit: (errand: Errand) => void;
  onDelete: (errand: Errand) => void;
}

const categoryIcons = {
  'home-maintenance': Wrench,
  'cleaning': Sparkles,
  'gardening': Leaf,
  'groceries': ShoppingCart,
  'delivery': Package,
  'pharmacy': Pill,
};

const categoryGradients = {
  'home-maintenance': 'from-orange-500 to-red-500',
  'cleaning': 'from-blue-500 to-cyan-500',
  'gardening': 'from-green-500 to-emerald-500',
  'groceries': 'from-purple-500 to-pink-500',
  'delivery': 'from-indigo-500 to-blue-500',
  'pharmacy': 'from-red-500 to-pink-500',
};

export function ErrandCard({ errand, onEdit, onDelete }: ErrandCardProps) {
  const canEdit = errand.status === 'pending';
  const canDelete = errand.status === 'pending';
  
  const CategoryIcon = categoryIcons[errand.type] || Package;
  const gradientColor = categoryGradients[errand.type] || 'from-gray-500 to-slate-500';

  const getStatusColor = () => {
    switch (errand.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md',
      errand.priority === 'urgent' && errand.status !== 'done' && 'ring-2 ring-orange-200'
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
                <h3 className="font-bold text-lg capitalize mb-2">
                  {errand.type.replace('-', ' ')}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
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
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{errand.description}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Preferred Date</span>
              <span className="font-medium text-gray-900">{formatDate(errand.preferredDate)}</span>
            </div>

            {errand.adminNotes && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-900 text-sm mb-1">Admin Notes:</p>
                <p className="text-blue-800 text-sm">{errand.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}