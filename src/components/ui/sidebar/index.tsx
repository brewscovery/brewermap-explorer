
// This file re-exports all sidebar components
import { SidebarContext, SidebarProvider, useSidebar } from "./sidebar-context";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger
} from "./sidebar-main";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "./sidebar-menu";

export {
  // Context and Provider
  SidebarContext,
  SidebarProvider,
  useSidebar,
  
  // Main Sidebar Components
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader, 
  SidebarInput,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  
  // Menu Components
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
};
