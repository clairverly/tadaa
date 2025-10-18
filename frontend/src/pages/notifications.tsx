import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationCard } from '@/components/notifications/notification-card';
import { billStorage, appointmentStorage, errandStorage, paymentStorage, notificationStorage } from '@/lib/storage';
import { generateAllNotifications } from '@/lib/notifications';
import { Notification, NotificationType } from '@/types';
import { showSuccess } from '@/utils/toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Generate fresh notifications from current data
    const bills = billStorage.getAll();
    const appointments = appointmentStorage.getAll();
    const errands = errandStorage.getAll();
    const paymentMethods = paymentStorage.getAll();

    const generated = generateAllNotifications(bills, appointments, errands, paymentMethods);
    
    // Merge with stored read states
    const stored = notificationStorage.getAll();
    const storedMap = new Map(stored.map(n => [n.id, n.isRead]));
    
    const merged = generated.map(n => ({
      ...n,
      isRead: storedMap.get(n.id) || false,
    }));

    notificationStorage.save(merged);
    setNotifications(merged);
  };

  const handleMarkAsRead = (notification: Notification) => {
    notificationStorage.markAsRead(notification.id);
    showSuccess('Marked as read');
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationStorage.markAllAsRead();
    showSuccess('All notifications marked as read');
    loadNotifications();
  };

  const handleDelete = (notification: Notification) => {
    notificationStorage.delete(notification.id);
    showSuccess('Notification deleted');
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationStorage.clearAll();
    showSuccess('All notifications cleared');
    loadNotifications();
  };

  const filteredNotifications = typeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === typeFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Stay updated on bills, appointments, and errands</p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleClearAll} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="bill">Bills</SelectItem>
            <SelectItem value="appointment">Appointments</SelectItem>
            <SelectItem value="errand">Errands</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No notifications</p>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
            {unreadNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCheck className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-gray-500">No unread notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {unreadNotifications.filter(n => typeFilter === 'all' || n.type === typeFilter).map(notification => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-6">
            {readNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No read notifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {readNotifications.filter(n => typeFilter === 'all' || n.type === typeFilter).map(notification => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}