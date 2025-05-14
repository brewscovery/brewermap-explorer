import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface FloatingSidebarToggleProps {
  position?: "top-left" | "bottom-left";
}

export function FloatingSidebarToggle({ position = "bottom-left" }: FloatingSidebarToggleProps) {
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  // Only hide the toggle on mobile when the mobile sidebar is open
  // On desktop, we keep the original behavior
  const isHidden = isMobile && openMobile;
  
  const handleClick = () => {
    console.log("FloatingSidebarToggle: handleClick called");
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      toggleSidebar();
    }
  };
  
  if (isHidden) {
    return null;
  }
  
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed z-[45] rounded-full shadow-md hover:shadow-lg transition-all duration-200",
        "bg-white/80 backdrop-blur-sm",
        position === "top-left" 
          ? "left-4 top-4"
          : "left-4 bottom-4"
      )}
      onClick={handleClick}
    >
      <PanelLeft className={cn(
        "h-4 w-4 transition-transform duration-200",
        !isMobile && state === "expanded" ? "rotate-0" : "rotate-180"
      )} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
