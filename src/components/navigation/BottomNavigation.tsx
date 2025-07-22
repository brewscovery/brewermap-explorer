
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWADetection } from '@/hooks/usePWADetection';
import { useVenueSidebar } from '@/contexts/VenueSidebarContext';
import { 
  Map, 
  Heart, 
  Calendar, 
  User, 
  BarChart3, 
  MapPin,
  Settings,
  Search,
  MoreHorizontal,
  ListTodo
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiresAuth?: boolean;
  userTypes?: ('regular' | 'business' | 'admin')[];
}

interface MoreMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuth();
  const isMobile = useIsMobile();
  const { isPWA } = usePWADetection();
  const { isVenueSidebarOpen } = useVenueSidebar();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
          id: 'events',
          label: 'Events',
          icon: Calendar,
          path: '/dashboard/events',
          requiresAuth: true,
          userTypes: ['business']
        },
        {
          id: 'settings',
          label: 'Settings',
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
          id: 'settings',
          label: 'Settings',
          icon: User,
          path: '/dashboard/settings',
          requiresAuth: true
        }
      ];
    }

    // Regular user items - new structure
    return [
      {
        id: 'map',
        label: 'Map',
        icon: Map,
        path: '/'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        path: '/dashboard',
        requiresAuth: true,
        userTypes: ['regular']
      },
      {
        id: 'brewscoveries',
        label: 'Brewscoveries',
        icon: MapPin,
        path: '/dashboard/discoveries',
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
      }
    ];
  };

  const getMoreMenuItems = (): MoreMenuItem[] => {
    if (userType !== 'regular') return [];
    
    return [
      {
        id: 'todoLists',
        label: 'ToDo Lists',
        icon: ListTodo,
        path: '/dashboard/todoLists'
      },
      {
        id: 'favorites',
        label: 'Favourites',
        icon: Heart,
        path: '/dashboard/favorites'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/dashboard/settings'
      }
    ];
  };

  const navItems = getNavItems();
  const moreMenuItems = getMoreMenuItems();

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.search.includes('search=true');
    }
    if (path.includes('search=true')) {
      return location.search.includes('search=true');
    }
    // For exact dashboard route, only match exactly '/dashboard'
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isMoreMenuActive = () => {
    return moreMenuItems.some(item => isActiveRoute(item.path));
  };

  const handleNavigation = (item: NavItem) => {
    if (item.path.includes('?')) {
      const [path, search] = item.path.split('?');
      navigate(`${path}?${search}`);
    } else {
      navigate(item.path);
    }
  };

  const handleMoreMenuNavigation = (item: MoreMenuItem) => {
    navigate(item.path);
    setIsMoreMenuOpen(false);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brewscovery-teal/20 px-2 py-1 z-50 safe-area-padding-bottom shadow-lg transition-transform duration-300 ease-in-out ${isVenueSidebarOpen ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-brewscovery-teal bg-brewscovery-cream shadow-sm'
                  : 'text-gray-500 hover:text-brewscovery-teal active:bg-brewscovery-cream/50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-brewscovery-teal' : ''}`} />
              <span className={`text-xs font-medium truncate ${isActive ? 'text-brewscovery-teal' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More menu for regular users */}
        {userType === 'regular' && moreMenuItems.length > 0 && (
          <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                  isMoreMenuActive()
                    ? 'text-brewscovery-teal bg-brewscovery-cream shadow-sm'
                    : 'text-gray-500 hover:text-brewscovery-teal active:bg-brewscovery-cream/50'
                }`}
              >
                <MoreHorizontal className={`w-5 h-5 mb-1 ${isMoreMenuActive() ? 'text-brewscovery-teal' : ''}`} />
                <span className={`text-xs font-medium truncate ${isMoreMenuActive() ? 'text-brewscovery-teal' : ''}`}>
                  More
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top" 
              className="w-48 mb-2 bg-white border shadow-lg z-[200]"
              sideOffset={8}
            >
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleMoreMenuNavigation(item)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                      isActive ? 'bg-brewscovery-cream text-brewscovery-teal' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brewscovery-teal' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isActive ? 'text-brewscovery-teal font-medium' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;
