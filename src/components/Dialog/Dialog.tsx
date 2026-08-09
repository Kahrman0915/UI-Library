import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { getFocusable } from '#/utils/focus';

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      id,
      open,
      onClose,
      children,
      closeOnOutsideClick = false,
      closeOnEscape = true,
      role = 'dialog',
      inline = false,
      initialFocusRef,
      className,
      ...rest
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const mounted = useMounted();

    // aria-labelledby/-describedby must only reference ids that EXIST — the
    // old unconditional `${id}-title` dangled whenever DialogHeader was
    // omitted (or given a mismatched id), leaving the dialog with no
    // accessible name at all. Detect what the consumer actually rendered.
    // Layout effect: resolves before the focus-trap effect focuses the panel,
    // so the name/description are correct when the dialog is announced.
    const [refIds, setRefIds] = useState<{ title: boolean; desc: boolean }>({
      title: false,
      desc: false,
    });

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

    // Detect what the consumer actually rendered, AFTER the panel is mounted —
    // keyed on the machine's `state` (the panel mounts a commit after `open`
    // flips, so keying on `open` would query a null panel and never re-run).
    // Layout effect: resolves before the focus-trap effect announces the dialog.
    useLayoutEffect(() => {
      const panel = panelRef.current;
      if (state !== 'open' || !panel) return;
      const esc =
        typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
      setRefIds({
        title: !!panel.querySelector(`#${esc}-title`),
        desc: !!panel.querySelector(`#${esc}-description`),
      });
    }, [state, id, children]);

    // Escape to close (both inline and overlay modes).
    //
    // Opt-out rather than opt-in: every dialog wants this, and a panel with no
    // keyboard exit is a trap. `closeOnEscape={false}` is for the caller who is
    // taking Escape over — see the prop's JSDoc.
    useEffect(() => {
      if (!open || !closeOnEscape) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, closeOnEscape, onClose]);

    // Focus trap + scroll lock (overlay mode only).
    //
    // Keyed on the machine's `state`, NOT on `open` — the same trap the refIds
    // effect above documents. `state` is still 'closed' on the commit where
    // `open` flips true, so the panel isn't in the DOM yet; keyed on `open`
    // this effect ran once against a null panel, bailed, and never re-ran
    // because its deps hadn't changed. The result was a dialog with no initial
    // focus, no Tab containment, no scroll lock and no focus restore.
    useEffect(() => {
      if (state !== 'open' || inline) return;
      const panel = panelRef.current;
      if (!panel) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;

      // Consumer's choice first (an alert dialog should open on the least
      // destructive action, which is rarely the first in source order), then the
      // first focusable, then the panel itself.
      const requested = initialFocusRef?.current;
      const focusables = getFocusable(panel);
      if (requested && panel.contains(requested)) {
        requested.focus();
      } else if (focusables.length > 0) {
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
        previouslyFocused?.focus?.();
      };
    }, [state, inline, initialFocusRef]);

    // Scroll lock — its OWN effect, held for as long as the panel is mounted
    // rather than only while it is `open`. Mirrors Drawer, which already did it
    // this way; Dialog used to release the lock inside the focus-trap cleanup
    // above, i.e. at the START of the exit animation.
    //
    // Releasing early does NOT shift the page — the `padding-right` swap below
    // is symmetric with the returning scrollbar. What it did do was let the page
    // behind move during the ~200ms exit: `previouslyFocused.focus()` in that
    // same cleanup scrolls its target into view, so restoring focus to an
    // off-screen trigger scroll-jumped the page while the panel was still
    // painted over it. Holding the lock through `closing` prevents the scroll,
    // which is why that call can stay where it is.
    //
    // The dep MUST be this boolean, not `state`. Keyed on `state`, the effect
    // tears down and re-runs on `open → closing`, releasing and re-applying the
    // lock — a one-frame scrollbar flash, exactly what this is meant to remove.
    const isLocked = state !== 'closed' && !inline;
    useEffect(() => {
      if (!isLocked) return;
      // Preserve the scrollbar's width as padding so the page does not shift.
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
    }, [isLocked]);

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
        // `e.target === e.currentTarget` is load-bearing, not defensive noise.
        // Animation events bubble, and an `inline` Dialog rendered INSIDE this
        // one carries the very same `ui-overlay-exit--center` class — so closing
        // the inner panel fired `ui-overlay-out-center` up here and unmounted
        // the outer one too. Matching the name alone is not enough when the name
        // can legitimately come from a descendant.
        onAnimationEnd={(e) => {
          if (
            e.target === e.currentTarget &&
            e.animationName === 'ui-overlay-out-center'
          ) {
            setState('closed');
          }
        }}
        role={role}
        aria-modal={!inline}
        aria-labelledby={refIds.title ? `${id}-title` : undefined}
        aria-describedby={refIds.desc ? `${id}-description` : undefined}
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
      actions,
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
            <p id={`${id}-description`} className="ui-dialog__description">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="ui-dialog__header-actions">{actions}</div>}
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
