
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft, Map, User, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSidebar } from '@/components/ui/sidebar';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AppLogo from '@/components/ui/AppLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  displayName: string;
}

const DashboardHeader = ({ displayName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between sticky top-0 z-10">
      <div className="cursor-pointer" onClick={toggleSidebar}>
        <AppLogo size="small" />
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4 ml-4">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default DashboardHeader;
