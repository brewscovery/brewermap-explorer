
import React from 'react';
import {
  Home,
  Compass,
  List,
  Settings,
  User,
  Building2,
  Star,
  CheckCircle,
  Calendar,
  Menu,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarTrigger, SidebarContent, SidebarGroup } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';

const UnifiedSidebar = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebar();

  const isAdminRoute = location.pathname.includes('/admin');
  const isDashboardRoute = location.pathname.includes('/dashboard');

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  // Admin navigation items
  const adminItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Breweries',
      href: '/admin/breweries',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <User className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Business user navigation items
  const businessUserItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Venues',
      href: '/dashboard/venues',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      title: 'Events',
      href: '/dashboard/events',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Subscription',
      href: '/dashboard/subscription',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Regular user navigation items
  const regularUserItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Favorites',
      href: '/dashboard/favorites',
      icon: <Star className="h-5 w-5" />,
    },
    {
      title: "Events",
      href: "/dashboard/events",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Check-ins',
      href: '/dashboard/check-ins',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: 'To-do Lists',
      href: '/dashboard/todo-lists',
      icon: <List className="h-5 w-5" />,
    },
    {
      title: 'Discoveries',
      href: '/dashboard/discoveries',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  let navigationItems;
  if (userType === 'admin' && isAdminRoute) {
    navigationItems = adminItems;
  } else if (userType === 'business' && isDashboardRoute) {
    navigationItems = businessUserItems;
  } else if (userType === 'regular' && isDashboardRoute) {
    navigationItems = regularUserItems;
  } else {
    navigationItems = [];
  }

  if (!user) {
    return null;
  }

  return (
    <Sidebar className="md:block hidden">
      <SidebarTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 p-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarTrigger>
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </SidebarGroup>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarContent>
    </Sidebar>
  );
};

export default UnifiedSidebar;
