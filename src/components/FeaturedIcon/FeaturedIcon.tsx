import { forwardRef } from 'react';
import type { FeaturedIconProps } from './FeaturedIcon.types';
import './FeaturedIcon.scss';

// A boxed icon tile — the "featured icon" of empty states, feature callouts and
// dialogs. Presentational: it renders one lucide glyph inside a coloured tile,
// sized by the tile rather than the icon. Decorative by default (aria-hidden);
// pass `label` to name it when it stands alone.
const FeaturedIcon = forwardRef<HTMLSpanElement, FeaturedIconProps>(
  (
    {
      Icon,
      size = 'default',
      shape = 'square',
      variant = 'default',
      label,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <span
        {...rest}
        ref={ref}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={`ui-featured-icon ui-featured-icon--sz-${size} ui-featured-icon--shape-${shape} ui-featured-icon--${variant}${className ? ' ' + className : ''}`}
      >
        <Icon />
      </span>
    );
  },
);

FeaturedIcon.displayName = 'FeaturedIcon';

export default FeaturedIcon;
