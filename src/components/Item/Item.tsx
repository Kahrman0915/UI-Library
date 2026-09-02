import { createContext, forwardRef, useContext } from 'react';
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

// Set by ItemGroup so a row knows to render its own <li> wrapper. An <li> is
// only valid inside a list, so a standalone Item must stay bare — hence a flag
// rather than an unconditional wrapper.
const ItemGroupContext = createContext(false);

// ═════════════════════════════════════════════════════════════════════════════
// Root — dispatches to <a>, <button>, or <div> based on props.
//
// role="listitem" deliberately does NOT go on the root: with href or onClick the
// root IS the <a>/<button>, and an explicit role replaces the native one, so the
// row would stop being announced as a link. The <li> wraps it instead — the same
// shape Sidebar and Pagination already use.
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
    const inGroup = useContext(ItemGroupContext);

    const wrap = (row: React.ReactElement) =>
      inGroup ? <li className="ui-item-group__row">{row}</li> : row;

    const commonProps = {
      'data-variant': variant,
      'data-size': size,
      'data-disabled': disabled ? '' : undefined,
      className: `ui-item ui-item--${variant} ui-item--sz-${size}${href || onClick ? ' ui-item--interactive' : ''}${disabled ? ' ui-item--disabled' : ''}${className ? ' ' + className : ''}`,
    };

    if (href) {
      return wrap(
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
        </a>,
      );
    }

    if (onClick) {
      return wrap(
        <button
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          onClick={onClick}
          {...commonProps}
        >
          {children}
        </button>,
      );
    }

    return wrap(
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        ref={ref as React.Ref<HTMLDivElement>}
        {...commonProps}
      >
        {children}
      </div>,
    );
  },
);

Item.displayName = 'Item';

// ═════════════════════════════════════════════════════════════════════════════
// Group — vertical stack of items with dividers between siblings.
// ═════════════════════════════════════════════════════════════════════════════

const ItemGroup = forwardRef<HTMLUListElement, ItemGroupProps>(
  ({ className, children, ...rest }, ref) => (
    <ul
      {...rest}
      ref={ref}
      // Explicit role="list" on a <ul> looks redundant but is not: `list-style:
      // none` strips list semantics in Safari. Sidebar and Pagination both carry
      // it for the same reason.
      role="list"
      className={`ui-item-group${className ? ' ' + className : ''}`}
    >
      <ItemGroupContext.Provider value>{children}</ItemGroupContext.Provider>
    </ul>
  ),
);

ItemGroup.displayName = 'ItemGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Separator — hairline between grouped items.
// ═════════════════════════════════════════════════════════════════════════════

const ItemSeparator = forwardRef<HTMLElement, ItemSeparatorProps>(
  ({ className, ...rest }, ref) => {
    const inGroup = useContext(ItemGroupContext);
    const props = {
      ...rest,
      role: 'separator',
      'aria-orientation': 'horizontal' as const,
      className: `ui-item-separator${className ? ' ' + className : ''}`,
    };

    // Inside a group the parent is a <ul>, where a bare <div> is invalid.
    return inGroup ? (
      <li {...props} ref={ref as React.Ref<HTMLLIElement>} />
    ) : (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>} />
    );
  },
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
