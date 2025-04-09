
/**
 * Modified Dialog component that fixes issues with stacking and cleanup
 * This is a drop-in replacement for the original Dialog component
 */
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { logFocusState, logDialogElements, logPortalState } from "@/utils/debugUtils"

// Define a component-specific version of Dialog that adds debugging
const Dialog = ({ 
  children, 
  open, 
  onOpenChange,
  ...props 
}: DialogPrimitive.DialogProps) => {
  // Add debug logging for open state changes
  React.useEffect(() => {
    console.log('DEBUG: Dialog-fixed Root component open state:', open);
    
    if (open) {
      console.log('DEBUG: Dialog-fixed opened');
      // Check state on open
      setTimeout(() => {
        logDialogElements();
        logFocusState();
      }, 100);
    } else if (open === false) { // explicitly check for false to avoid undefined
      console.log('DEBUG: Dialog-fixed closed');
      // Check state on close and ensure document body is reset
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        logDialogElements();
        logFocusState();
        logPortalState();
      }, 100);
    }

    return () => {
      // Clean up on unmount
      if (open) {
        console.log('DEBUG: Dialog-fixed unmounted while open - ensuring cleanup');
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }
    }
  }, [open]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(newOpen) => {
        console.log('DEBUG: Dialog-fixed onOpenChange called with value:', newOpen);
        
        // Explicitly ensure we're resetting any stale state
        if (!newOpen) {
          // Force document.body to be scrollable again when closing
          setTimeout(() => {
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }, 50);
        }
        
        if (onOpenChange) {
          onOpenChange(newOpen);
        }
      }}
      {...props}
    >
      {children}
    </DialogPrimitive.Root>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  // Add debug logging for overlay rendering
  React.useEffect(() => {
    console.log('DEBUG: Dialog Overlay mounted');
    return () => {
      console.log('DEBUG: Dialog Overlay unmounted');
    };
  }, []);

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Add debug logging for content rendering
  React.useEffect(() => {
    console.log('DEBUG: Dialog Content mounted');
    return () => {
      console.log('DEBUG: Dialog Content unmounted');
      
      // Ensure focus trapping is cleaned up
      // This runs on unmount to ensure we're not leaving stale state
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      
      // Extra check for lingering inert or aria-hidden attributes
      document.querySelectorAll('[inert], [aria-hidden="true"]').forEach(el => {
        if (el instanceof HTMLElement && el.getAttribute('data-radix-focus-guard') === null) {
          console.log('DEBUG: Removing potential stale attribute from:', el.tagName, el.id, el.className);
          el.removeAttribute('inert');
          el.removeAttribute('aria-hidden');
        }
      });
    };
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        onCloseAutoFocus={(event) => {
          // Log closing events
          console.log('DEBUG: Dialog Content onCloseAutoFocus triggered');
          
          // Prevent the default focus behavior to avoid potential issues
          event.preventDefault();
          
          // Force document.body to be interactive again
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
          
          // Log the focus state after closing
          setTimeout(logFocusState, 50);
        }}
        onEscapeKeyDown={() => {
          console.log('DEBUG: Dialog escape key pressed');
        }}
        onInteractOutside={(event) => {
          console.log('DEBUG: Dialog interaction outside content');
        }}
        onOpenAutoFocus={(event) => {
          console.log('DEBUG: Dialog Content onOpenAutoFocus triggered');
          // Allow default focus behavior when opening
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
