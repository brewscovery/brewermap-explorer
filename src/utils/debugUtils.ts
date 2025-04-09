
/**
 * Utility functions for debugging purposes
 */

/**
 * Finds and logs all dialog-related elements in the DOM
 * This helps understand what might be causing issues with stacking and focus
 */
export const logDialogElements = () => {
  console.log('DEBUG: ----- Dialog Elements in DOM -----');
  
  // Find all dialog overlays
  const overlays = document.querySelectorAll('[role="dialog"]');
  console.log(`DEBUG: Found ${overlays.length} dialog elements`);
  
  overlays.forEach((overlay, index) => {
    console.log(`DEBUG: Dialog #${index + 1}:`);
    console.log('  - aria-modal:', overlay.getAttribute('aria-modal'));
    console.log('  - data-state:', overlay.getAttribute('data-state'));
    
    // Try to find any identifiable information
    const title = overlay.querySelector('[role="heading"]')?.textContent;
    if (title) {
      console.log(`  - title: "${title}"`);
    }
    
    // Check if it has inputs
    const inputs = overlay.querySelectorAll('input, select, textarea');
    if (inputs.length > 0) {
      console.log(`  - contains ${inputs.length} form elements`);
    }
    
    // Check z-index issues
    const style = window.getComputedStyle(overlay);
    console.log(`  - z-index: ${style.zIndex}`);
    console.log(`  - visibility: ${style.visibility}`);
    console.log(`  - display: ${style.display}`);
  });
  
  // Check for DialogContent elements
  const dialogContents = document.querySelectorAll('[role="dialog"] [data-radix-dialog-content]');
  console.log(`DEBUG: Found ${dialogContents.length} dialog content elements`);
  
  console.log('DEBUG: ----- End Dialog Elements -----');
};

/**
 * Logs the current focus state of the document
 * This can help identify issues with focus trapping/restoration
 */
export const logFocusState = () => {
  console.log('DEBUG: ----- Focus State -----');
  
  // Check what element currently has focus
  const activeElement = document.activeElement;
  console.log('DEBUG: Currently focused element:', activeElement?.tagName);
  
  if (activeElement) {
    console.log('  - id:', activeElement.id);
    console.log('  - className:', activeElement.className);
    
    // Get the path from the active element to the document body
    let focusPath = [];
    let currentElement = activeElement;
    
    while (currentElement && currentElement !== document.body) {
      focusPath.push({
        tagName: currentElement.tagName,
        id: currentElement.id,
        className: currentElement.className
      });
      currentElement = currentElement.parentElement;
    }
    
    console.log('  - Focus path:', focusPath);
  }
  
  // Check if body has any unusual styles that could affect focus
  const bodyStyle = window.getComputedStyle(document.body);
  console.log('DEBUG: Body state:');
  console.log('  - overflow:', bodyStyle.overflow);
  console.log('  - pointerEvents:', bodyStyle.pointerEvents);
  console.log('  - userSelect:', bodyStyle.userSelect);
  
  // Check for any pointer events none at top level
  const pointerNoneElements = document.querySelectorAll('body > [style*="pointer-events: none"]');
  console.log(`DEBUG: Found ${pointerNoneElements.length} top-level elements with pointer-events: none`);
  
  console.log('DEBUG: ----- End Focus State -----');
};

/**
 * Inspects Radix UI portals which might be causing issues
 */
export const logPortalState = () => {
  console.log('DEBUG: ----- Portal State -----');
  
  // Look for Radix portal elements
  const portals = document.querySelectorAll('[data-radix-portal]');
  console.log(`DEBUG: Found ${portals.length} Radix portals`);
  
  portals.forEach((portal, index) => {
    console.log(`DEBUG: Portal #${index + 1}:`);
    const style = window.getComputedStyle(portal);
    console.log('  - display:', style.display);
    console.log('  - visibility:', style.visibility);
    console.log('  - pointerEvents:', style.pointerEvents);
    
    // Check if it contains any dialog elements
    const hasDialog = portal.querySelector('[role="dialog"]') !== null;
    console.log('  - contains dialog:', hasDialog);
  });
  
  // Check for lingering backdrop elements
  const backdrops = document.querySelectorAll('[data-radix-popper-content-wrapper], .fixed-backdrop, [aria-hidden="true"]');
  console.log(`DEBUG: Found ${backdrops.length} potential backdrop/overlay elements`);
  
  backdrops.forEach((backdrop, index) => {
    const style = window.getComputedStyle(backdrop);
    console.log(`DEBUG: Potential overlay #${index + 1}:`);
    console.log('  - display:', style.display);
    console.log('  - visibility:', style.visibility);
    console.log('  - position:', style.position);
    console.log('  - inert:', backdrop.hasAttribute('inert'));
    console.log('  - aria-hidden:', backdrop.getAttribute('aria-hidden'));
  });
  
  console.log('DEBUG: ----- End Portal State -----');
};

/**
 * Comprehensive debug that runs all checks
 */
export const runComprehensiveDebug = () => {
  console.log('DEBUG: ======= RUNNING COMPREHENSIVE DEBUG =======');
  logDialogElements();
  logFocusState();
  logPortalState();
  console.log('DEBUG: ======= END COMPREHENSIVE DEBUG =======');
};

/**
 * Adds a button to the DOM that can be clicked to log dialog elements
 * This is useful during debugging to check modal state at specific times
 */
export const addDebugButton = () => {
  // Check if the button already exists
  if (document.getElementById('debug-dialog-button')) return;
  
  const button = document.createElement('button');
  button.id = 'debug-dialog-button';
  button.textContent = 'Debug Dialogs';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.background = 'red';
  button.style.color = 'white';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', () => {
    runComprehensiveDebug();
  });
  
  document.body.appendChild(button);
  console.log('DEBUG: Added debug button to the page');
};

/**
 * Update the admin brewery dialog to use our fixed version
 * This function injects a script to override the Radix UI dialog with our fixed version
 */
export const useFixedDialogForAdmin = () => {
  // This will run only in development mode
  if (process.env.NODE_ENV === 'production') return;
  
  console.log('DEBUG: Setting up fixed dialog for admin components');
  
  // Track dialog open/close for debugging
  let isDialogOpen = false;
  
  // Create a MutationObserver to detect when dialogs are added/removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if a dialog was added
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.querySelector('[role="dialog"]')) {
            console.log('DEBUG: Dialog was added to DOM');
            isDialogOpen = true;
            
            // Run a comprehensive debug to see the state when dialog opens
            setTimeout(runComprehensiveDebug, 100);
          }
        });
        
        // Check if a dialog was removed
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.querySelector('[role="dialog"]')) {
            console.log('DEBUG: Dialog was removed from DOM');
            isDialogOpen = false;
            
            // Run a comprehensive debug after dialog is closed
            setTimeout(() => {
              console.log('DEBUG: Checking state after dialog removal');
              runComprehensiveDebug();
              
              // And check again after a longer delay to see if state is consistent
              setTimeout(runComprehensiveDebug, 500);
            }, 100);
          }
        });
      }
    });
  });
  
  // Start observing the body for dialog additions/removals
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('DEBUG: Dialog observer set up');
};

// Add the debug button on import
if (process.env.NODE_ENV !== 'production') {
  // Add it with a slight delay to ensure DOM is ready
  setTimeout(() => {
    addDebugButton();
    useFixedDialogForAdmin();
  }, 1000);
}
