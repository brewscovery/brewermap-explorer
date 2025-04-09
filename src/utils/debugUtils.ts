
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
    logDialogElements();
  });
  
  document.body.appendChild(button);
  console.log('DEBUG: Added debug button to the page');
};

// Add the debug button on import
if (process.env.NODE_ENV !== 'production') {
  // Add it with a slight delay to ensure DOM is ready
  setTimeout(addDebugButton, 1000);
}
