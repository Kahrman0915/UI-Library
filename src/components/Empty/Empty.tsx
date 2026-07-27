import { forwardRef } from 'react';
import type {
  EmptyProps,
  EmptyHeaderProps,
  EmptyMediaProps,
  EmptyTitleProps,
  EmptyDescriptionProps,
  EmptyContentProps,
} from './Empty.types';
import '../FeaturedIcon/FeaturedIcon.scss';
import './Empty.scss';

// Root — centered empty-state container wrapping EmptyHeader + EmptyContent.
const Empty = forwardRef<HTMLDivElement, EmptyProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-empty${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

Empty.displayName = 'Empty';

// Header — stacks the media, title, and description.
const EmptyHeader = forwardRef<HTMLDivElement, EmptyHeaderProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-empty__header${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

EmptyHeader.displayName = 'EmptyHeader';

// Media — icon / image / avatar slot. `icon` renders a boxed muted tile.
const EmptyMedia = forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ variant = 'default', children, className, ...rest }, ref) => {
    // The `icon` variant's tile is FeaturedIcon's lg/default/square, exactly —
    // 48px, --muted, --rounded-xl, --border, 24px glyph. Reuse those classes
    // rather than redeclare the tile, so the two never drift. (Prefer a real
    // <FeaturedIcon> in the `default` slot for new work; this variant stays for
    // back-compat and takes an icon element as children.)
    const iconTile =
      variant === 'icon'
        ? ' ui-featured-icon ui-featured-icon--sz-lg ui-featured-icon--default ui-featured-icon--shape-square'
        : '';
    return (
      <div
        {...rest}
        ref={ref}
        data-variant={variant}
        className={`ui-empty__media ui-empty__media--${variant}${iconTile}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

EmptyMedia.displayName = 'EmptyMedia';

// Title
const EmptyTitle = forwardRef<HTMLDivElement, EmptyTitleProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-empty__title${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

EmptyTitle.displayName = 'EmptyTitle';

// Description
const EmptyDescription = forwardRef<HTMLParagraphElement, EmptyDescriptionProps>(
  ({ children, className, ...rest }, ref) => (
    <p
      {...rest}
      ref={ref}
      className={`ui-empty__description${className ? ' ' + className : ''}`}
    >
      {children}
    </p>
  ),
);

EmptyDescription.displayName = 'EmptyDescription';

// Content — action area (buttons, inputs, links) below the header.
const EmptyContent = forwardRef<HTMLDivElement, EmptyContentProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-empty__content${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

EmptyContent.displayName = 'EmptyContent';

export default Empty;
export {
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
};
