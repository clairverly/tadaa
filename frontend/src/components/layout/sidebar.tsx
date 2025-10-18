import { Home, FileText, ShoppingBag, Calendar, AlertCircle, CreditCard, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { billStorage, appointmentStorage, errandStorage, paymentStorage, notificationStorage } from '@/lib/storage';
import { generateAllNotifications } from '@/lib/notifications';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Bills', href: '/bills', icon: FileText },
  { name: 'Errands', href: '/errands', icon: ShoppingBag },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Urgent Help', href: '/urgent-help', icon: AlertCircle },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Notifications', href: '/notifications', icon: Bell, showBadge: true },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const bills = billStorage.getAll();
      const appointments = appointmentStorage.getAll();
      const errands = errandStorage.getAll();
      const paymentMethods = paymentStorage.getAll();

      const generated = generateAllNotifications(bills, appointments, errands, paymentMethods);
      const stored = notificationStorage.getAll();
      const storedMap = new Map(stored.map(n => [n.id, n.isRead]));
      
      const unread = generated.filter(n => !storedMap.get(n.id)).length;
      setUnreadCount(unread);
    };

    updateUnreadCount();
    
    // Update every minute
    const interval = setInterval(updateUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-400">Tadaa</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.showBadge && unreadCount > 0 && (
                <span className="absolute right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-400 text-center">
          Effortless accomplishment
        </p>
      </div>
    </div>
  );
}