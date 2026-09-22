import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseButton from '#components/CloseButton/CloseButton';
import { useMounted } from '#/hooks/useMounted';
import type {
  DrawerProps,
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerFooterProps,
} from './Drawer.types';
import './Drawer.scss';
import { getFocusable } from '#/utils/focus';

/**
 * Internal: `true` inside `AppShell`. A drawer opened there starts below the tab strip
 * instead of covering it — the strip stays visible and usable, and the overlay covers the
 * rail, the sidebar and the page (owner, 2026-09-19). Context passes through the portal,
 * so the shell reaches a drawer rendered into `document.body`. Not exported from the
 * package.
 */
export const DrawerBelowStripContext = createContext(false);

// closed → open (slide in) → closing (slide out) → closed. The `closing` state
// keeps the panel mounted so its exit animation can play, mirroring Tooltip.
type DrawerState = 'closed' | 'open' | 'closing';

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      id,
      open,
      onClose,
      children,
      side = 'right',
      closeOnOutsideClick = true,
      modal = true,
      className,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);
    const mounted = useMounted();
    const belowStrip = useContext(DrawerBelowStripContext);
    const [state, setState] = useState<DrawerState>(open ? 'open' : 'closed');

    // Only reference ids that exist (same fix as Dialog): the unconditional
    // `${id}-title` dangled when DrawerHeader was omitted, leaving the drawer
    // with no accessible name. Layout effect so it resolves before focus.
    const [refIds, setRefIds] = useState<{ title: boolean; desc: boolean }>({
      title: false,
      desc: false,
    });
    useLayoutEffect(() => {
      const panel = panelRef.current;
      // Keyed on the machine's `state` — the panel mounts a commit after
      // `open` flips, so keying on `open` would query a null panel.
      if (state !== 'open' || !panel) return;
      const esc =
        typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
      setRefIds({
        title: !!panel.querySelector(`#${esc}-title`),
        desc: !!panel.querySelector(`#${esc}-description`),
      });
    }, [state, id, children]);

    // Drive the state machine from the controlled `open` prop. Closing an
    // already-closed drawer is a no-op; otherwise we route through `closing`
    // so the slide-out animation runs before unmount.
    useEffect(() => {
      setState((prev) => {
        if (open) return 'open';
        return prev === 'closed' ? 'closed' : 'closing';
      });
    }, [open]);

    // Inside AppShell the tab strip stays live above the drawer, so using the tab bar —
    // a tab, the "+", the tab menu — means the user is moving to another document: ask
    // the consumer to close. Pointer only; the focus trap keeps the keyboard in here.
    // Capture phase, so it runs before the tab's own handler switches the document.
    useEffect(() => {
      if (!modal || !belowStrip || state !== 'open') return;
      const handlePointerDown = (e: PointerEvent) => {
        if (e.target instanceof Element && e.target.closest('.ui-tab-bar')) onClose();
      };
      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [modal, belowStrip, state, onClose]);

    // Escape asks the consumer to close (which flips `open` → the exit anim). A docked
    // (non-modal) panel only answers an Escape pressed inside it — the canvas beside it
    // stays live, and an Escape meant for a menu there must not close the panel too.
    useEffect(() => {
      if (state === 'closed') return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        if (!modal && !(e.target instanceof Node && panelRef.current?.contains(e.target))) return;
        onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [state, onClose, modal]);

    // Focus trap while fully open; restore focus to the opener on the way out.
    useEffect(() => {
      if (state !== 'open') return;
      const panel = panelRef.current;
      if (!panel) return;

      previouslyFocused.current = document.activeElement as HTMLElement | null;

      const focusables = getFocusable(panel);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // A docked panel moves focus in and back out, but does not trap it: Tab leaves
      // for the canvas beside it, which is the point of a non-modal panel.
      if (!modal)
        return () => {
          previouslyFocused.current?.focus?.();
        };

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const nodes = getFocusable(panel);
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && (active === first || !panel.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', handleTab);

      return () => {
        document.removeEventListener('keydown', handleTab);
        previouslyFocused.current?.focus?.();
      };
    }, [state, modal]);

    // Scroll lock while mounted (open or animating out) — preserve scrollbar
    // space to avoid layout shift. Keyed on the mounted boolean so the lock is
    // applied once and only released on full close (not re-run on `closing`).
    const isMounted = state !== 'closed';
    useEffect(() => {
      if (!isMounted || !modal) return;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      };
    }, [isMounted, modal]);

    // Safety net: finish the close after the exit animation's duration even if
    // `animationend` never fires (reduced-motion, a backgrounded tab, or an
    // interrupted animation). Guarantees a modal drawer can never get stuck open.
    // 400ms comfortably clears the ~300ms (--duration-slow) slide-out.
    useEffect(() => {
      if (state !== 'closing') return;
      const timer = window.setTimeout(() => {
        setState((prev) => (prev === 'closing' ? 'closed' : prev));
      }, 400);
      return () => window.clearTimeout(timer);
    }, [state]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOutsideClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    if (state === 'closed' || !mounted) return null;

    const isClosing = state === 'closing';

    const panel = (
      <div
        {...rest}
        id={id}
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (
              ref as unknown as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
        }}
        role="dialog"
        aria-modal={modal ? 'true' : undefined}
        // DrawerHeader's ids win; a header composed from something else (a PageHeader in a
        // docked panel) names the panel through the consumer's own aria attributes.
        aria-labelledby={refIds.title ? `${id}-title` : ariaLabelledBy}
        aria-describedby={refIds.desc ? `${id}-description` : ariaDescribedBy}
        data-side={side}
        data-state={state}
        className={`ui-drawer ui-drawer--${side}${modal ? '' : ' ui-drawer--docked'}${isClosing ? ' ui-drawer--closing' : ''}${className ? ' ' + className : ''}`}
        onAnimationEnd={(e) => {
          // Unmount only after the slide-out finishes. Enter/child animations
          // (which also bubble here) are ignored via the name check.
          if (isClosing && e.animationName.startsWith('ui-drawer-out')) {
            setState((prev) => (prev === 'closing' ? 'closed' : prev));
          }
        }}
      >
        {children}
      </div>
    );

    // Docked: in place, beside the work — no portal, no overlay.
    if (!modal) return panel;

    return createPortal(
      <div
        className={`ui-drawer-overlay${belowStrip ? ' ui-drawer-overlay--below-strip' : ''}${isClosing ? ' ui-drawer-overlay--closing' : ''}`}
        onClick={handleOverlayClick}
        role="presentation"
      >
        {panel}
      </div>,
      document.body,
    );
  },
);

Drawer.displayName = 'Drawer';

const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  (
    { id, title, description, showCloseButton = true, onClose, className, ...rest },
    ref,
  ) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-drawer__header${className ? ' ' + className : ''}`}
      >
        <div className="ui-drawer__header-content">
          <h2 id={`${id}-title`} className="ui-drawer__title">
            {title}
          </h2>
          {description && (
            <p id={`${id}-description`} className="ui-drawer__description">
              {description}
            </p>
          )}
        </div>
        {showCloseButton && onClose && (
          <CloseButton
            id={`${id}-close-btn`}
            variant="background"
            onClick={onClose}
            ariaLabel="Close drawer"
          />
        )}
      </div>
    );
  },
);

DrawerHeader.displayName = 'DrawerHeader';

const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-drawer__body${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DrawerBody.displayName = 'DrawerBody';

const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-drawer__footer${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DrawerFooter.displayName = 'DrawerFooter';

export default Drawer;
export { DrawerHeader, DrawerBody, DrawerFooter };
