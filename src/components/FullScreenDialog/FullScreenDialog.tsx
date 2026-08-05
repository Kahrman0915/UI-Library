import { createContext, forwardRef, useContext, useEffect } from 'react';
import Dialog, {
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '#components/Dialog/Dialog';
import type {
  FullScreenDialogProps,
  FullScreenDialogHeaderProps,
  FullScreenDialogBodyProps,
  FullScreenDialogFooterProps,
} from './FullScreenDialog.types';
import './FullScreenDialog.scss';

/**
 * Floating surfaces that portal to `document.body` and own Escape while open.
 *
 * WHY THIS LIST EXISTS — and it is a workaround, in the wrong place.
 *
 * `Select`, `Combobox`, `DropdownMenu` and `Popover` each register a
 * bubble-phase `keydown` on `document` and none of them calls
 * `stopPropagation`, so one Escape reaches the surface AND every modal
 * containing it. On a small Dialog that is survivable; on a full-screen page
 * holding a half-filled feedback form it means one keystroke throws the form
 * away. The correct fix is capture-phase + `stopPropagation` in those four
 * components — which also fixes `Dialog` and `Drawer`, both of which still have
 * this bug. That is its own change; this guard only covers this component.
 *
 * MAINTENANCE COST, stated plainly: a new floating surface that is not added
 * here silently stops being covered, and nothing fails to tell you.
 *
 * `:not(.ui-overlay-exit)` matters — `usePresence` keeps these mounted through
 * their exit animation, so without it the Escape that dismissed a menu would
 * swallow the next one ~200ms later too.
 */
const NESTED_SURFACES = [
  '.ui-select__content',
  '.ui-combobox__content',
  '.ui-dropdown-menu__content',
  '.ui-popover__content',
  '.ui-hover-card__content',
  '.ui-context-menu__content',
]
  .map((s) => `${s}:not(.ui-overlay-exit):not(.ui-overlay-exit--center)`)
  .join(', ');

type FullScreenDialogContextValue = { id: string; onClose: () => void };

const FullScreenDialogContext =
  createContext<FullScreenDialogContextValue | null>(null);

/**
 * Non-throwing, like the Chat transcript parts and unlike Attachment's guard: a
 * header rendered on its own in an anatomy story should draw itself rather than
 * crash the page. Every consumer falls back to its own props.
 */
const useFullScreenDialogContext = () => useContext(FullScreenDialogContext);

/**
 * A page rendered over the one the user was on — Help, Feedback, settings,
 * anything that is a destination rather than a question.
 *
 * Covers the viewport edge to edge with no rounding, so nothing of the app shell
 * shows through. It is a **preset of `Dialog`**, not a reimplementation: the
 * portal, focus trap, scroll lock, focus restore, aria wiring and the
 * `closed → open → closing` exit machine are all Dialog's, and the header, body
 * and footer are Dialog's chrome. Only the geometry and the Escape handling are
 * new.
 *
 * Dismissal is the X or Escape. There is deliberately no click-outside — there
 * is no backdrop left to click, and a stray click must not discard a form.
 */
const FullScreenDialog = forwardRef<HTMLDivElement, FullScreenDialogProps>(
  (
    { id, open, onClose, contentWidth = 'lg', className, children, ...rest },
    ref,
  ) => {
    // Escape is handled here rather than by Dialog (`closeOnEscape={false}`)
    // because the decision needs to know what else is on screen. A
    // capture-phase listener that stopped propagation would not work: capture at
    // `document` is the first phase, so it would kill the nested surface's own
    // handler as well and the menu would never close.
    useEffect(() => {
      if (!open) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        // Something is floating above the page — that Escape was for it.
        if (document.querySelector(NESTED_SURFACES)) return;
        onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    return (
      <FullScreenDialogContext.Provider value={{ id, onClose }}>
        <Dialog
          {...rest}
          ref={ref}
          id={id}
          open={open}
          onClose={onClose}
          role="dialog"
          closeOnOutsideClick={false}
          closeOnEscape={false}
          className={`ui-full-screen-dialog ui-full-screen-dialog--content-${contentWidth}${className ? ' ' + className : ''}`}
        >
          {children}
        </Dialog>
      </FullScreenDialogContext.Provider>
    );
  },
);
FullScreenDialog.displayName = 'FullScreenDialog';

/**
 * The page's title bar. Renders Dialog's header chrome with `id` and `onClose`
 * filled in from the parent.
 *
 * THE X IS ON BY DEFAULT AND THAT IS DELIBERATE. This component has no
 * click-outside, so if a consumer composes a header without a close button the
 * only remaining exit is Escape — undiscoverable, and unavailable on touch. The
 * defaults make the safe composition the short one; removing the X takes an
 * explicit `showCloseButton={false}`, which is a decision rather than an
 * omission.
 *
 * `title` is required for the same reason it is on DialogHeader: it seeds
 * `{id}-title`, which is what Dialog's conditional `aria-labelledby` points at.
 * Without it the page announces as an unnamed dialog.
 */
const FullScreenDialogHeader = forwardRef<
  HTMLDivElement,
  FullScreenDialogHeaderProps
>(({ id, onClose, ...rest }, ref) => {
  const ctx = useFullScreenDialogContext();
  // No class of its own: the header is styled through
  // `.ui-dialog.ui-full-screen-dialog .ui-dialog__header`, which is both
  // specificity-safe and one fewer class to leave unstyled. An emitted class
  // that nothing styles is the drift this repo keeps at zero.
  return (
    <DialogHeader
      {...rest}
      ref={ref}
      id={id ?? ctx?.id ?? ''}
      onClose={onClose ?? ctx?.onClose}
    />
  );
});
FullScreenDialogHeader.displayName = 'FullScreenDialogHeader';

/**
 * The scrolling middle. Full-width scroll container with a centred content
 * column inside it — see the SCSS for why the column is a grid track rather
 * than a wrapper element.
 *
 * Note `alignment` behaves differently here than on `DialogBody`: this body is
 * a grid, so `alignment="center"` no longer centres the block, only its text.
 * Centre the column with `contentWidth` instead.
 */
const FullScreenDialogBody = forwardRef<
  HTMLDivElement,
  FullScreenDialogBodyProps
>((props, ref) => <DialogBody {...props} ref={ref} />);
FullScreenDialogBody.displayName = 'FullScreenDialogBody';

/** The action row, pinned to the bottom of the viewport. */
const FullScreenDialogFooter = forwardRef<
  HTMLDivElement,
  FullScreenDialogFooterProps
>((props, ref) => <DialogFooter {...props} ref={ref} />);
FullScreenDialogFooter.displayName = 'FullScreenDialogFooter';

export default FullScreenDialog;
export {
  FullScreenDialog,
  FullScreenDialogHeader,
  FullScreenDialogBody,
  FullScreenDialogFooter,
};
