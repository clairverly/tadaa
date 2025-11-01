import { Sidebar } from './sidebar';
import { Sparkles, LogOut, Bell, User, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationCard } from '@/components/notifications/notification-card';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { useState, useEffect } from 'react';
import { billStorage, appointmentStorage, errandStorage, paymentStorage, notificationStorage } from '@/lib/storage';
import { generateAllNotifications } from '@/lib/notifications';
import { Notification } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const bills = billStorage.getAll();
    const appointments = appointmentStorage.getAll();
    const errands = errandStorage.getAll();
    const paymentMethods = paymentStorage.getAll();
    
    const generated = generateAllNotifications(bills, appointments, errands, paymentMethods);
    const stored = notificationStorage.getAll();
    const storedMap = new Map(stored.map(n => [n.id, n.isRead]));
    
    const merged = generated.map(n => ({
      ...n,
      isRead: storedMap.get(n.id) || false,
    }));
    
    setNotifications(merged);
  };

  const handleMarkAsRead = (notification: Notification) => {
    notificationStorage.markAsRead(notification.id);
    loadNotifications();
  };

  const handleDeleteNotification = (notification: Notification) => {
    notificationStorage.delete(notification.id);
    loadNotifications();
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Header Banner */}
      <header className="sticky top-0 z-50 relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg border-b-2 border-slate-500/30">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl"></div>
        
        <div className="container mx-auto px-6 py-5">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg backdrop-blur-sm border border-amber-400/30">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">Tadaa, Welcome {user?.firstName}</h1>
                <p className="text-slate-200 text-sm font-medium">Your Personal Concierge</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/15 relative h-9 w-9 p-0"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 border-2 border-slate-700">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 p-0">
                  <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-500">{unreadCount} unread</Badge>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No notifications</p>
                        <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {notifications.map(notification => (
                          <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDeleteNotification}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/15 h-9 px-3 gap-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium">{user?.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/urgent-help')}
                className="text-white hover:bg-white/15 h-9 w-9 p-0"
                title="Help"
              >
                <AlertCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      <Sidebar />
    </div>
  );
}