import { forwardRef } from 'react';
import type { SkeletonProps } from './Skeleton.types';
import './Skeleton.scss';
// Loads the `.ui-reveal` content-reveal utility so consumers can crossfade real
// content in when it replaces a skeleton. See src/styles/reveal.scss.
import '../../styles/reveal.scss';

const toCssLength = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = 'default', width, height, className, style, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        aria-hidden="true"
        data-shape={shape}
        className={`ui-skeleton ui-skeleton--${shape}${className ? ' ' + className : ''}`}
        style={{
          width: toCssLength(width),
          height: toCssLength(height),
          ...style,
        }}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
