import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import type {
  AvatarGroupProps,
  AvatarProps,
} from './Avatar.types';
import './Avatar.scss';

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      id,
      src,
      alt,
      fallback,
      size = 'default',
      shape = 'circle',
      badge,
      className,
      ...rest
    },
    ref,
  ) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [src]);

    const showImage = Boolean(src) && !imageError;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-avatar ui-avatar--sz-${size} ui-avatar--${shape}${className ? ' ' + className : ''}`}
      >
        <div className="ui-avatar__inner">
          <span className="ui-avatar__fallback" aria-hidden={showImage}>
            {fallback}
          </span>
          {showImage && (
            <img
              className="ui-avatar__image"
              src={src}
              alt={alt ?? ''}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        {badge !== undefined && badge !== null && (
          <span className="ui-avatar__badge">{badge}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      id,
      children,
      max,
      spacing = 'default',
      size = 'default',
      className,
      ...rest
    },
    ref,
  ) => {
    const childArray = Children.toArray(children);
    const visible = typeof max === 'number' ? childArray.slice(0, max) : childArray;
    const hiddenCount =
      typeof max === 'number' ? Math.max(0, childArray.length - max) : 0;

    // Push the group's size onto direct Avatar children that haven't picked one,
    // so the generated +N chip can't end up the only large avatar in the row.
    // Only Avatars are touched — a child wrapping one (a Tooltip, a link) would
    // receive `size` as an unknown prop — and an explicit child size still wins.
    const sized = visible.map((child) =>
      isValidElement<AvatarProps>(child) &&
      child.type === Avatar &&
      child.props.size === undefined
        ? cloneElement(child, { size })
        : child,
    );

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-avatar-group ui-avatar-group--sp-${spacing}${className ? ' ' + className : ''}`}
      >
        {sized}
        {hiddenCount > 0 && (
          <Avatar
            id={`${id}-count`}
            size={size}
            fallback={`+${hiddenCount}`}
          />
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;
export { AvatarGroup };
