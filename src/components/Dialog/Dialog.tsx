import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseButton from '#components/CloseButton/CloseButton';
import { useMounted } from '#/hooks/useMounted';
import type {
  DialogProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
} from './Dialog.types';
import './Dialog.scss';
import '../../styles/overlay-entrance.scss';

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

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      id,
      open,
      onClose,
      children,
      closeOnOutsideClick = false,
      role = 'dialog',
      inline = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const mounted = useMounted();

    // Exit-animation state machine (mirrors Drawer): the panel stays mounted
    // through `closing` so it can play its exit keyframes before unmount. React
    // would otherwise remove it instantly and the close would have no motion.
    const [state, setState] = useState<'closed' | 'open' | 'closing'>(
      open ? 'open' : 'closed',
    );
    useEffect(() => {
      if (open) setState('open');
      else setState((prev) => (prev === 'closed' ? 'closed' : 'closing'));
    }, [open]);
    // Safety net: animationend doesn't fire on a backgrounded/occluded tab or an
    // interrupted animation. A duration-based timer guarantees the unmount; both
    // paths are idempotent (whichever fires first wins).
    useEffect(() => {
      if (state !== 'closing') return;
      const t = setTimeout(() => setState('closed'), 400);
      return () => clearTimeout(t);
    }, [state]);

    // Escape to close (both inline and overlay modes)
    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    // Focus trap + scroll lock (overlay mode only)
    useEffect(() => {
      if (!open || inline) return;
      const panel = panelRef.current;
      if (!panel) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;

      // Focus first focusable, or the panel itself as a fallback
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

      // Scroll lock — preserve scrollbar space to avoid layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
        previouslyFocused?.focus?.();
      };
    }, [open, inline]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOutsideClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    if (state === 'closed') return null;

    const closing = state === 'closing';

    const dialogPanel = (
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
        className={`ui-dialog ${closing ? 'ui-overlay-exit--center' : 'ui-overlay-enter--center'}${className ? ' ' + className : ''}`}
        onAnimationEnd={(e) => {
          if (e.animationName === 'ui-overlay-out-center') setState('closed');
        }}
        role={role}
        aria-modal={!inline}
        aria-labelledby={`${id}-title`}
      >
        {children}
      </div>
    );

    if (inline) return dialogPanel;

    if (!mounted) return null;

    return createPortal(
      <div
        className={`ui-dialog-overlay ${closing ? 'ui-overlay-backdrop-out' : 'ui-overlay-backdrop'}`}
        onClick={handleOverlayClick}
        role="presentation"
      >
        {dialogPanel}
      </div>,
      document.body,
    );
  },
);

Dialog.displayName = 'Dialog';

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  (
    {
      id,
      title,
      description,
      alignment = 'left',
      showCloseButton = true,
      onClose,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-dialog__header${className ? ' ' + className : ''}`}
      >
        <div
          className={`ui-dialog__header-content ui-dialog__header-content--${alignment}`}
        >
          <h2 id={`${id}-title`} className="ui-dialog__title">
            {title}
          </h2>
          {description && (
            <p className="ui-dialog__description">{description}</p>
          )}
        </div>
        {showCloseButton && onClose && (
          <CloseButton
            id={`${id}-close-btn`}
            variant="background"
            onClick={onClose}
            ariaLabel="Close dialog"
          />
        )}
      </div>
    );
  },
);

DialogHeader.displayName = 'DialogHeader';

const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, alignment = 'left', className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-dialog__body ui-dialog__body--${alignment}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DialogBody.displayName = 'DialogBody';

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-dialog__footer${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DialogFooter.displayName = 'DialogFooter';

export default Dialog;
export { DialogHeader, DialogBody, DialogFooter };
