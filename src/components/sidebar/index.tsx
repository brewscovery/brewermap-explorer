
import UnifiedSidebar from './UnifiedSidebar';

// Add CSS for touch interactions
const style = document.createElement('style');
style.textContent = `
  .touch-action-none {
    touch-action: none;
  }
  
  [data-vaul-no-drag-propagation="true"] {
    overscroll-behavior: contain;
  }
  
  [data-drawer-content] {
    touch-action: pan-y;
  }
  
  [data-drawer-handle], [data-drawer-header] {
    touch-action: none;
  }
`;
document.head.appendChild(style);

export default UnifiedSidebar;
