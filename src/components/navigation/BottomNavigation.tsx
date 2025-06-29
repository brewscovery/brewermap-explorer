
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWADetection } from '@/hooks/usePWADetection';
import { 
  Map, 
  Heart, 
  Calendar, 
  User, 
  BarChart3, 
  MapPin,
  Settings,
  Search
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiresAuth?: boolean;
  userTypes?: ('regular' | 'business' | 'admin')[];
}

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuth();
  const isMobile = useIsMobile();
  const { isPWA } = usePWADetection();

  // Don't render if not on mobile or not in PWA mode
  if (!isMobile || !isPWA) {
    return null;
  }

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        id: 'map',
        label: 'Map',
        icon: Map,
        path: '/'
      },
      {
        id: 'search',
        label: 'Search',
        icon: Search,
        path: '/?search=true'
      }
    ];

    if (!user) {
      return [
        ...baseItems,
        {
          id: 'auth',
          label: 'Login',
          icon: User,
          path: '/auth'
        }
      ];
    }

    // Authenticated user items based on user type
    if (userType === 'business') {
      return [
        ...baseItems,
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          path: '/dashboard',
          requiresAuth: true,
          userTypes: ['business']
        },
        {
          id: 'venues',
          label: 'Venues',
          icon: MapPin,
          path: '/dashboard/venues',
          requiresAuth: true,
          userTypes: ['business']
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/dashboard/settings',
          requiresAuth: true
        }
      ];
    }

    if (userType === 'admin') {
      return [
        ...baseItems,
        {
          id: 'admin',
          label: 'Admin',
          icon: Settings,
          path: '/admin',
          requiresAuth: true,
          userTypes: ['admin']
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/dashboard/settings',
          requiresAuth: true
        }
      ];
    }

    // Regular user items
    return [
      ...baseItems,
      {
        id: 'favorites',
        label: 'Favorites',
        icon: Heart,
        path: '/dashboard/favorites',
        requiresAuth: true,
        userTypes: ['regular']
      },
      {
        id: 'events',
        label: 'Events',
        icon: Calendar,
        path: '/dashboard/eventsExplorer',
        requiresAuth: true,
        userTypes: ['regular']
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        path: '/dashboard/settings',
        requiresAuth: true
      }
    ];
  };

  const navItems = getNavItems();

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.search.includes('search=true');
    }
    if (path.includes('search=true')) {
      return location.search.includes('search=true');
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: NavItem) => {
    if (item.path.includes('?')) {
      const [path, search] = item.path.split('?');
      navigate(`${path}?${search}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 safe-area-padding-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
