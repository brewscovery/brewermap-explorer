
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function FloatingSidebarToggle() {
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      toggleSidebar();
    }
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed left-4 bottom-4 z-50 rounded-full shadow-md hover:shadow-lg transition-all duration-200",
        "bg-background/80 backdrop-blur-sm"
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
