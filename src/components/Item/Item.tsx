import { forwardRef } from 'react';
import type {
  ItemActionsProps,
  ItemContentProps,
  ItemDescriptionProps,
  ItemFooterProps,
  ItemGroupProps,
  ItemHeaderProps,
  ItemMediaProps,
  ItemProps,
  ItemSeparatorProps,
  ItemTitleProps,
} from './Item.types';
import './Item.scss';
import '../../styles/stagger.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — dispatches to <a>, <button>, or <div> based on props.
// ═════════════════════════════════════════════════════════════════════════════

const Item = forwardRef<HTMLElement, ItemProps>(
  (
    {
      variant = 'default',
      size = 'default',
      href,
      target,
      rel,
      onClick,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const commonProps = {
      'data-variant': variant,
      'data-size': size,
      'data-disabled': disabled ? '' : undefined,
      className: `ui-item ui-item--${variant} ui-item--sz-${size}${href || onClick ? ' ui-item--interactive' : ''}${disabled ? ' ui-item--disabled' : ''}${className ? ' ' + className : ''}`,
    };

    if (href) {
      return (
        <a
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          onClick={(e) => {
            if (disabled) e.preventDefault();
            onClick?.(e);
          }}
          {...commonProps}
        >
          {children}
        </a>
      );
    }

    if (onClick) {
      return (
        <button
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          onClick={onClick}
          {...commonProps}
        >
          {children}
        </button>
      );
    }

    return (
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        ref={ref as React.Ref<HTMLDivElement>}
        {...commonProps}
      >
        {children}
      </div>
    );
  },
);

Item.displayName = 'Item';

// ═════════════════════════════════════════════════════════════════════════════
// Group — vertical stack of items with dividers between siblings.
// ═════════════════════════════════════════════════════════════════════════════

const ItemGroup = forwardRef<HTMLDivElement, ItemGroupProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="list"
      className={`ui-item-group ui-stagger${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemGroup.displayName = 'ItemGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Separator — hairline between grouped items.
// ═════════════════════════════════════════════════════════════════════════════

const ItemSeparator = forwardRef<HTMLDivElement, ItemSeparatorProps>(
  ({ className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={`ui-item-separator${className ? ' ' + className : ''}`}
    />
  ),
);

ItemSeparator.displayName = 'ItemSeparator';

// ═════════════════════════════════════════════════════════════════════════════
// Media — leading icon / image / avatar slot.
// ═════════════════════════════════════════════════════════════════════════════

const ItemMedia = forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ variant = 'default', className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      data-variant={variant}
      className={`ui-item__media ui-item__media--${variant}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemMedia.displayName = 'ItemMedia';

// ═════════════════════════════════════════════════════════════════════════════
// Content — title + description column.
// ═════════════════════════════════════════════════════════════════════════════

const ItemContent = forwardRef<HTMLDivElement, ItemContentProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__content${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemContent.displayName = 'ItemContent';

// ═════════════════════════════════════════════════════════════════════════════
// Title
// ═════════════════════════════════════════════════════════════════════════════

const ItemTitle = forwardRef<HTMLDivElement, ItemTitleProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__title${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemTitle.displayName = 'ItemTitle';

// ═════════════════════════════════════════════════════════════════════════════
// Description
// ═════════════════════════════════════════════════════════════════════════════

const ItemDescription = forwardRef<HTMLDivElement, ItemDescriptionProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__description${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemDescription.displayName = 'ItemDescription';

// ═════════════════════════════════════════════════════════════════════════════
// Actions — trailing button row.
// ═════════════════════════════════════════════════════════════════════════════

const ItemActions = forwardRef<HTMLDivElement, ItemActionsProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__actions${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemActions.displayName = 'ItemActions';

// ═════════════════════════════════════════════════════════════════════════════
// Header — full-width row above the media/content/actions row.
// ═════════════════════════════════════════════════════════════════════════════

const ItemHeader = forwardRef<HTMLDivElement, ItemHeaderProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__header${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemHeader.displayName = 'ItemHeader';

// ═════════════════════════════════════════════════════════════════════════════
// Footer — full-width row below the media/content/actions row.
// ═════════════════════════════════════════════════════════════════════════════

const ItemFooter = forwardRef<HTMLDivElement, ItemFooterProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-item__footer${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ItemFooter.displayName = 'ItemFooter';

export default Item;
export {
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
};
