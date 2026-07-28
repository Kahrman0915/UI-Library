import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

// closed → open (slide in) → closing (slide out) → closed. The `closing` state
// keeps the panel mounted so its exit animation can play, mirroring Tooltip.
type DrawerState = 'closed' | 'open' | 'closing';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      id,
      open,
      onClose,
      children,
      side = 'right',
      closeOnOutsideClick = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);
    const mounted = useMounted();
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

    // Escape asks the consumer to close (which flips `open` → the exit anim).
    useEffect(() => {
      if (state === 'closed') return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [state, onClose]);

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
    }, [state]);

    // Scroll lock while mounted (open or animating out) — preserve scrollbar
    // space to avoid layout shift. Keyed on the mounted boolean so the lock is
    // applied once and only released on full close (not re-run on `closing`).
    const isMounted = state !== 'closed';
    useEffect(() => {
      if (!isMounted) return;
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
    }, [isMounted]);

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

    return createPortal(
      <div
        className={`ui-drawer-overlay${isClosing ? ' ui-drawer-overlay--closing' : ''}`}
        onClick={handleOverlayClick}
        role="presentation"
      >
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
          aria-modal="true"
          aria-labelledby={refIds.title ? `${id}-title` : undefined}
          aria-describedby={refIds.desc ? `${id}-description` : undefined}
          data-side={side}
          data-state={state}
          className={`ui-drawer ui-drawer--${side}${isClosing ? ' ui-drawer--closing' : ''}${className ? ' ' + className : ''}`}
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
