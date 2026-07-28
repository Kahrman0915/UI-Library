import { forwardRef, useContext, useMemo } from 'react';
import { AttachmentContext } from './Attachment.context';
import type {
  AttachmentActionProps,
  AttachmentActionsProps,
  AttachmentContentProps,
  AttachmentDescriptionProps,
  AttachmentGroupProps,
  AttachmentMediaProps,
  AttachmentProps,
  AttachmentTitleProps,
  AttachmentTriggerProps,
} from './Attachment.types';
import '../../styles/icon-button.scss';
import './Attachment.scss';
import '../../styles/stagger.scss';

const useAttachment = () => {
  const ctx = useContext(AttachmentContext);
  if (!ctx) {
    throw new Error(
      'Attachment subcomponents must be used inside <Attachment>.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(
  (
    {
      state = 'done',
      size = 'default',
      orientation = 'horizontal',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const ctxValue = useMemo(
      () => ({ state, size, orientation }),
      [state, size, orientation],
    );

    return (
      <AttachmentContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          data-state={state}
          data-size={size}
          data-orientation={orientation}
          className={`ui-attachment ui-attachment--${orientation} ui-attachment--sz-${size} ui-attachment--state-${state}${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </AttachmentContext.Provider>
    );
  },
);

Attachment.displayName = 'Attachment';

// ═════════════════════════════════════════════════════════════════════════════
// Media — the leading icon or thumbnail slot.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentMedia = forwardRef<HTMLDivElement, AttachmentMediaProps>(
  ({ variant = 'icon', className, children, ...rest }, ref) => {
    useAttachment(); // enforce nesting
    return (
      <div
        {...rest}
        ref={ref}
        data-variant={variant}
        className={`ui-attachment__media ui-attachment__media--${variant}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

AttachmentMedia.displayName = 'AttachmentMedia';

// ═════════════════════════════════════════════════════════════════════════════
// Content — title + description column.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentContent = forwardRef<HTMLDivElement, AttachmentContentProps>(
  ({ className, children, ...rest }, ref) => {
    useAttachment();
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-attachment__content${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

AttachmentContent.displayName = 'AttachmentContent';

// ═════════════════════════════════════════════════════════════════════════════
// Title — shimmers during uploading / processing states.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentTitle = forwardRef<HTMLDivElement, AttachmentTitleProps>(
  ({ className, children, ...rest }, ref) => {
    const ctx = useAttachment();
    const shimmer =
      ctx.state === 'uploading' || ctx.state === 'processing';
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-attachment__title${shimmer ? ' ui-attachment__title--shimmer' : ''}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

AttachmentTitle.displayName = 'AttachmentTitle';

// ═════════════════════════════════════════════════════════════════════════════
// Description — metadata (size, type, status message).
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentDescription = forwardRef<
  HTMLDivElement,
  AttachmentDescriptionProps
>(({ className, children, ...rest }, ref) => {
  useAttachment();
  return (
    <div
      {...rest}
      ref={ref}
      className={`ui-attachment__description${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  );
});

AttachmentDescription.displayName = 'AttachmentDescription';

// ═════════════════════════════════════════════════════════════════════════════
// Actions — trailing button row. Sits above AttachmentTrigger via z-index.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentActions = forwardRef<HTMLDivElement, AttachmentActionsProps>(
  ({ className, children, ...rest }, ref) => {
    useAttachment();
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-attachment__actions${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

AttachmentActions.displayName = 'AttachmentActions';

// ═════════════════════════════════════════════════════════════════════════════
// Action — a single icon button in the actions row. A plain <button> so it
// composes with any icon, and deliberately NOT CloseButton, which hard-codes
// an X and is only ever a dismissal. Both sit on the shared `.ui-icon-button`
// shell, so they cannot drift apart again.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentAction = forwardRef<HTMLButtonElement, AttachmentActionProps>(
  ({ className, children, type, ...rest }, ref) => {
    useAttachment();
    return (
      <button
        {...rest}
        ref={ref}
        type={type ?? 'button'}
        className={`ui-icon-button ui-icon-button--fill ui-attachment__action${className ? ' ' + className : ''}`}
      >
        {children}
      </button>
    );
  },
);

AttachmentAction.displayName = 'AttachmentAction';

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — absolutely positioned overlay. Renders as <a> if href given,
// otherwise <button>. Sits behind Actions so both are independently clickable.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentTrigger = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  AttachmentTriggerProps
>(({ className, children, href, ...rest }, ref) => {
  useAttachment();
  const commonClass = `ui-attachment__trigger${className ? ' ' + className : ''}`;
  if (href) {
    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={commonClass}
      >
        <span className="ui-attachment__trigger-label">{children}</span>
      </a>
    );
  }
  return (
    <button
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={commonClass}
    >
      <span className="ui-attachment__trigger-label">{children}</span>
    </button>
  );
});

AttachmentTrigger.displayName = 'AttachmentTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// Group — horizontally scrollable row of attachments.
// ═════════════════════════════════════════════════════════════════════════════

const AttachmentGroup = forwardRef<HTMLDivElement, AttachmentGroupProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      // The group scrolls horizontally (overflow-x: auto), and a row of plain
      // display attachments contains nothing focusable — so without a tab stop
      // a keyboard user cannot reach the overflow at all (WCAG 2.1.1). Same
      // fix ScrollArea and CodeBlock carry. It is unconditional because
      // whether the children happen to be focusable is a runtime question.
      tabIndex={0}
      className={`ui-attachment-group ui-stagger${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

AttachmentGroup.displayName = 'AttachmentGroup';

export default Attachment;
export {
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  AttachmentGroup,
};
