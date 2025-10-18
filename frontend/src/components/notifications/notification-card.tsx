import { Notification } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, ShoppingBag, CreditCard, Info, X, ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
}

export function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'bill':
        return <FileText className="h-5 w-5" />;
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'errand':
        return <ShoppingBag className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md cursor-pointer',
      !notification.isRead && 'border-l-4 border-l-blue-500',
      notification.isRead && 'opacity-75'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            getPriorityColor()
          )}>
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0" onClick={handleClick}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm">{notification.title}</h3>
              <Badge variant="outline" className="text-xs capitalize">
                {notification.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{formatDateTime(notification.timestamp)}</p>
              {notification.actionUrl && (
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  View <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification);
                }}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Mark as read</span>
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification);
              }}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}