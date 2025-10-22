import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types';
import { notificationStorage } from '@/lib/storage';

interface UrgentNotificationsProps {
  notifications: Notification[];
  onReload: () => void;
}

export function UrgentNotifications({ notifications, onReload }: UrgentNotificationsProps) {
  const navigate = useNavigate();
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const urgentNotifications = notifications.filter(n => !n.isRead && (n.priority === 'urgent' || n.priority === 'high')).slice(0, 3);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      notificationStorage.markAsRead(notification.id);
      onReload();
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (urgentNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-800 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <span>Urgent Notifications</span>
          </CardTitle>
          <Badge className="bg-red-600 text-white">
            {unreadNotifications.length} unread
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {urgentNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${
                notification.priority === 'urgent' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  notification.priority === 'urgent' ? 'text-red-600' : 'text-orange-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              <Badge variant={notification.priority === 'urgent' ? 'destructive' : 'default'}>
                {notification.priority}
              </Badge>
            </div>
          ))}
        </div>
        <Link to="/settings">
          <Button className="w-full mt-4" variant="outline">
            View All Notifications ({notifications.length})
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}