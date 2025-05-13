import React from 'react';
import {
  Home,
  Compass,
  List,
  Settings,
  User,
  Building2,
  Plus,
  Star,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarTrigger, SidebarContent, SidebarItem, SidebarGroup, } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';

const UnifiedSidebar = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useSidebar();

  const isAdminRoute = location.pathname.includes('/admin');
  const isDashboardRoute = location.pathname.includes('/dashboard');

  const handleSignOut = async () => {
    await signOut();
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
  } else if (userType === 'user' && isDashboardRoute) {
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
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SidebarTrigger>
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          {navigationItems.map((item, index) => (
            <SidebarItem
              key={index}
              title={item.title}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </SidebarGroup>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </SidebarContent>
    </Sidebar>
  );
};

export default UnifiedSidebar;

