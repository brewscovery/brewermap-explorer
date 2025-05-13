
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Coffee,
  Calendar,
  Heart,
  CheckSquare,
  Lightbulb,
  CreditCard,
  MapPin,
} from 'lucide-react';

const UnifiedSidebar = () => {
  const { userType, logout } = useAuth(); // Change from signOut to logout to match AuthContextType
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderAdminLinks = () => (
    <>
      <NavLink
        to="/admin"
        className={`flex items-center p-2 rounded-md ${isActive('/admin') && !isActive('/admin/breweries') && !isActive('/admin/users') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Home className="mr-2 h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/admin/breweries"
        className={`flex items-center p-2 rounded-md ${isActive('/admin/breweries') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Coffee className="mr-2 h-5 w-5" />
        <span>Breweries</span>
      </NavLink>
      <NavLink
        to="/admin/users"
        className={`flex items-center p-2 rounded-md ${isActive('/admin/users') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Users className="mr-2 h-5 w-5" />
        <span>Users</span>
      </NavLink>
    </>
  );

  const renderBusinessLinks = () => (
    <>
      <NavLink
        to="/dashboard"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Home className="mr-2 h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/dashboard/venues"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/venues') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <MapPin className="mr-2 h-5 w-5" />
        <span>Venues</span>
      </NavLink>
      <NavLink
        to="/dashboard/events"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/events') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Calendar className="mr-2 h-5 w-5" />
        <span>Events</span>
      </NavLink>
    </>
  );

  const renderUserLinks = () => (
    <>
      <NavLink
        to="/dashboard"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Home className="mr-2 h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/dashboard/favorites"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/favorites') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Heart className="mr-2 h-5 w-5" />
        <span>Favorites</span>
      </NavLink>
      <NavLink
        to="/dashboard/check-ins"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/check-ins') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <CheckSquare className="mr-2 h-5 w-5" />
        <span>Check-ins</span>
      </NavLink>
      <NavLink
        to="/dashboard/todo-lists"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/todo-lists') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <CheckSquare className="mr-2 h-5 w-5" />
        <span>Todo Lists</span>
      </NavLink>
      <NavLink
        to="/dashboard/events"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/events') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Calendar className="mr-2 h-5 w-5" />
        <span>Events</span>
      </NavLink>
      <NavLink
        to="/dashboard/discoveries"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/discoveries') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Lightbulb className="mr-2 h-5 w-5" />
        <span>Discoveries</span>
      </NavLink>
    </>
  );

  const renderCommonFooterLinks = () => (
    <>
      <NavLink
        to="/dashboard/settings"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/settings') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <Settings className="mr-2 h-5 w-5" />
        <span>Settings</span>
      </NavLink>
      <NavLink
        to="/dashboard/subscription"
        className={`flex items-center p-2 rounded-md ${isActive('/dashboard/subscription') ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
      >
        <CreditCard className="mr-2 h-5 w-5" />
        <span>Subscription</span>
      </NavLink>
      <button
        onClick={() => logout()} // Changed from signOut to logout
        className="flex items-center p-2 rounded-md hover:bg-primary/5 w-full text-left"
      >
        <LogOut className="mr-2 h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </>
  );

  return (
    <aside className="w-64 bg-background border-r min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Brewery App</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {userType === 'admin' && renderAdminLinks()}
        {userType === 'business' && renderBusinessLinks()}
        {userType === 'regular' && renderUserLinks()}
      </nav>
      <div className="p-4 space-y-2 border-t">
        {renderCommonFooterLinks()}
      </div>
    </aside>
  );
};

export default UnifiedSidebar;
