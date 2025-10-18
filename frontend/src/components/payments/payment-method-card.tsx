import { PaymentMethod } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Star, CreditCard, Smartphone, Building2 } from 'lucide-react';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
}

export function PaymentMethodCard({ method, onSetDefault, onDelete }: PaymentMethodCardProps) {
  const getIcon = () => {
    switch (method.type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'paynow':
        return <Smartphone className="h-5 w-5" />;
      case 'bank':
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getDisplayInfo = () => {
    switch (method.type) {
      case 'card':
        return {
          title: method.cardBrand?.toUpperCase() || 'Card',
          subtitle: `•••• ${method.cardLast4}`,
          detail: `Expires ${method.cardExpiryMonth}/${method.cardExpiryYear}`,
        };
      case 'paynow':
        return {
          title: 'PayNow',
          subtitle: method.payNowMobile || '',
          detail: 'Mobile number',
        };
      case 'bank':
        return {
          title: method.bankName || 'Bank Account',
          subtitle: `•••• ${method.bankAccountLast4}`,
          detail: 'Direct Debit',
        };
    }
  };

  const info = getDisplayInfo();

  return (
    <Card className={method.isDefault ? 'border-blue-500 border-2' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-gray-100 rounded-lg">
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{info.title}</h3>
                {method.isDefault && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600">{info.subtitle}</p>
              <p className="text-xs text-gray-500 mt-1">{info.detail}</p>
              
              {method.nickname && (
                <p className="text-xs text-gray-500 mt-1 italic">"{method.nickname}"</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!method.isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault(method)}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(method)} className="text-red-600">
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