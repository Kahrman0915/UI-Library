// Toggle shortcut: ⌘B (mac) / Ctrl+B. Matches the `key` on a keydown event.
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

// Persisted open/closed state (desktop). localStorage rather than a cookie so
// the library stays framework-agnostic.
export const SIDEBAR_STORAGE_KEY = 'ui-sidebar:state';

// Viewport width below which the sidebar renders as a Drawer overlay.
export const SIDEBAR_MOBILE_BREAKPOINT = 768;
