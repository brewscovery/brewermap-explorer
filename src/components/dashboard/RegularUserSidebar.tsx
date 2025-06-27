import React from "react";
import {
  Calendar,
  Heart,
  Search,
  CheckSquare,
  History,
  Settings,
  BarChart4,
  LayoutDashboard
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const RegularUserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const sidebarItems = [
    {
      title: "Events",
      url: "/dashboard/eventsExplorer",
      icon: Calendar,
      isActive: location.pathname === "/dashboard/eventsExplorer"
    },
    {
      title: "Favorites",
      url: "/dashboard/favorites", 
      icon: Heart,
      isActive: location.pathname === "/dashboard/favorites"
    },
    {
      title: "Brewscoveries",
      url: "/dashboard/discoveries",
      icon: Search,
      isActive: location.pathname === "/dashboard/discoveries"
    },
    {
      title: "Todo Lists",
      url: "/dashboard/todoLists",
      icon: CheckSquare,
      isActive: location.pathname === "/dashboard/todoLists"
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: location.pathname === "/dashboard/settings"
    }
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r h-screen fixed left-0 top-0 z-20 bg-white">
      {/* Top Section: Logo and User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg">Brewscovery</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable Section: Sidebar Items */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {sidebarItems.map((item) => (
            <div
              key={item.title}
              className={`px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 cursor-pointer ${item.isActive ? 'font-medium text-primary' : 'text-gray-600'}`}
              onClick={() => navigate(item.url)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Section: Subscription and Support (Optional) */}
      <div className="p-4 border-t text-center text-xs text-gray-500">
        <a href="/dashboard/subscription" className="hover:underline">Subscription</a> | <a href="#" className="hover:underline">Support</a>
      </div>
    </div>
  );
};

export default RegularUserSidebar;
