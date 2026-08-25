import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { useMounted } from '#/hooks/useMounted';
import { AidenPanelContext, useAidenPanelContext } from './AidenPanel.context';
import type { AidenPanelProps, AidenPanelHeaderProps } from './AidenPanel.types';
import './AidenPanel.scss';

// Same machine as Drawer: closed → open → closing → closed, with `closing`
// keeping the panel mounted through its slide-out.
type PanelState = 'closed' | 'open' | 'closing';

/**
 * The Aiden side panel — the assistant riding along INSIDE a sub-application.
 *
 * Deliberately NON-MODAL, which is the whole design: no backdrop, no focus
 * trap, no scroll lock, no `aria-modal`. You ask Aiden about the screen you
 * are looking at, so the screen must stay readable, scrollable and clickable
 * while the panel is open. It is a `complementary` LANDMARK, not a dialog —
 * Drawer already exists for the modal case and this component will not grow
 * into it.
 *
 * Consequences of non-modality, each deliberate:
 * - Escape closes the panel only while focus is INSIDE it (the listener sits
 *   on the panel element, not on document). A non-modal panel must never
 *   steal a page-level Escape from the app behind it.
 * - Focus is restored to the opener on close only if focus was still inside
 *   the panel — if the user has moved on into the page, yanking focus back
 *   would be theft.
 * - Z-index is `--z-40`, deliberately BELOW the floating surfaces at --z-50:
 *   a Select or menu opened inside the panel portals to `document.body` and
 *   must paint above it. Above page content; below Tooltip (70), Toast/Fab
 *   (80). The Fab convention stands: hide the launcher while the panel is
 *   open — the story shows the wiring.
 *
 * Self-applies `data-surface="aiden"`, so everything inside renders on the
 * aiden surface with neutral surfaces re-pinned — the panel is a guest inside
 * a brand's page and refuses the host's tint (see tokens.scss).
 */
const AidenPanel = forwardRef<HTMLDivElement, AidenPanelProps>(
  ({ id, open, onClose, onExpand, label, children, className, ...rest }, ref) => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);
    const mounted = useMounted();
    const [state, setState] = useState<PanelState>(open ? 'open' : 'closed');

    // Drive the machine from the controlled prop; closing when already closed
    // is a no-op, everything else routes through the exit animation.
    useEffect(() => {
      setState((prev) => {
        if (open) return 'open';
        return prev === 'closed' ? 'closed' : 'closing';
      });
    }, [open]);

    // Remember the opener at open time so close can restore it — but ONLY if
    // focus is still inside the panel (see the header note).
    useEffect(() => {
      if (state !== 'open') return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      return () => {
        const panel = panelRef.current;
        if (panel && panel.contains(document.activeElement)) {
          previouslyFocused.current?.focus?.();
        }
      };
    }, [state]);

    // Safety net: force-close if animationend never fires (reduced motion,
    // backgrounded tab, interrupted animation). 400ms clears the ~300ms slide.
    useEffect(() => {
      if (state !== 'closing') return;
      const timer = window.setTimeout(() => {
        setState((prev) => (prev === 'closing' ? 'closed' : prev));
      }, 400);
      return () => window.clearTimeout(timer);
    }, [state]);

    const ctx = useMemo(
      () => ({ id, onClose, onExpand }),
      [id, onClose, onExpand],
    );

    if (state === 'closed' || !mounted) return null;

    const isClosing = state === 'closing';

    return createPortal(
      <AidenPanelContext.Provider value={ctx}>
        <div
          {...rest}
          id={id}
          ref={(node) => {
            panelRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref)
              (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                node;
          }}
          role="complementary"
          aria-label={label}
          aria-labelledby={label ? undefined : `${id}-title`}
          data-surface="aiden"
          data-state={state}
          className={`ui-aiden-panel${isClosing ? ' ui-aiden-panel--closing' : ''}${
            className ? ' ' + className : ''
          }`}
          // Panel-scoped Escape: React's onKeyDown only fires while focus is
          // within the subtree, which is exactly the non-modal contract.
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              onClose();
            }
          }}
          onAnimationEnd={(e) => {
            if (isClosing && e.animationName.startsWith('ui-aiden-panel-out')) {
              setState((prev) => (prev === 'closing' ? 'closed' : prev));
            }
          }}
        >
          {children}
        </div>
      </AidenPanelContext.Provider>,
      document.body,
    );
  },
);

AidenPanel.displayName = 'AidenPanel';

/**
 * Context-fed header, the FullScreenDialogHeader pattern:
 * `<AidenPanelHeader title="Aiden" />` is the whole correct usage. The expand
 * button appears only when the panel got an `onExpand`.
 */
const AidenPanelHeader = forwardRef<HTMLDivElement, AidenPanelHeaderProps>(
  (
    { title, description, icon, showCloseButton = true, children, className, ...rest },
    ref,
  ) => {
    const { id, onClose, onExpand } = useAidenPanelContext();
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-aiden-panel__header${className ? ' ' + className : ''}`}
      >
        {icon && <span className="ui-aiden-panel__header-icon">{icon}</span>}
        <div className="ui-aiden-panel__header-content">
          <h2 id={`${id}-title`} className="ui-aiden-panel__title">
            {title}
          </h2>
          {description && (
            <p className="ui-aiden-panel__description">{description}</p>
          )}
        </div>
        {children}
        <div className="ui-aiden-panel__header-actions">
          {onExpand && (
            <button
              type="button"
              className="ui-icon-button ui-icon-button--fill ui-aiden-panel__header-button"
              aria-label="Expand to full screen"
              onClick={onExpand}
            >
              <Maximize2 aria-hidden="true" />
            </button>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="ui-icon-button ui-icon-button--fill ui-aiden-panel__header-button"
              aria-label="Close panel"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  },
);

AidenPanelHeader.displayName = 'AidenPanelHeader';

export default AidenPanel;
export { AidenPanelHeader };
