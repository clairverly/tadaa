import { Home, FileText, ShoppingBag, Calendar, AlertCircle, CreditCard, Bell, User, Package } from 'lucide-react';
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
  { name: 'Subscriptions', href: '/subscriptions', icon: Package, badge: 'Soon' },
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
    <div className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-400">Tadaa</h1>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Tagline */}
          <div className="hidden xl:block">
            <p className="text-xs text-gray-400">Effortless accomplishment</p>
          </div>
        </div>
      </div>
    </div>
  );
}