import { forwardRef } from 'react';
import { usePointerTilt } from '../../hooks/usePointerTilt';
import type { MarkProps } from './Mark.types';
import './Mark.scss';

/**
 * The application mark — the brand's own gradient tile under a stack of glass,
 * optionally locked up with the application's name.
 *
 * The tile paints `--decorative-gradient`, so it is the one piece of chrome that
 * carries a brand's full three-anchor identity rather than just its `--primary`.
 * Wrap it in a `data-theme` and it becomes that application's mark; wrap it in
 * `data-surface='aiden'` and it becomes Aiden's. There is no `brand` prop, on
 * purpose — the mark reads the theme it is standing in, exactly like every other
 * themed component.
 */
const Mark = forwardRef<HTMLDivElement, MarkProps>(
  (
    {
      id,
      Icon,
      title,
      description,
      size = 'default',
      motion = 'ambient',
      label,
      className,
      ...rest
    },
    ref,
  ) => {
    /* Called unconditionally and gated by its argument. A hook behind a branch
       would change the hook count when a consumer toggles motion. */
    const tiltRef = usePointerTilt<HTMLSpanElement>(motion === 'tilt');

    const hasText = Boolean(title);
    /* The lockup names itself from the text it already renders, so the name
       cannot drift from what is on screen. */
    const labelledBy = hasText
      ? `${id}-title${description ? ` ${id}-description` : ''}`
      : undefined;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        /* `none` emits no modifier: it is the absence of the animation rules,
           not a state with styling of its own, and a class nothing selects is
           the dead-modifier noise the library scans for. */
        className={`ui-mark ui-mark--sz-${size}${
          motion === 'none' ? '' : ` ui-mark--motion-${motion}`
        }${className ? ' ' + className : ''}`}
        role={hasText ? 'img' : undefined}
        aria-labelledby={labelledBy}
      >
        <span
          ref={tiltRef}
          className="ui-mark__tile"
          /* Decorative whenever something else names the mark — the text beside
             it, or nothing at all. `label` is the standalone case. */
          role={!hasText && label ? 'img' : undefined}
          aria-label={!hasText && label ? label : undefined}
          aria-hidden={hasText || !label ? true : undefined}
        >
          <span className="ui-mark__bloom" />
          <span className="ui-mark__flare">
            <span className="ui-mark__spark" />
          </span>
          <span className="ui-mark__sweep" />
          <Icon aria-hidden="true" />
        </span>

        {hasText && (
          <span className="ui-mark__text">
            <span className="ui-mark__title" id={`${id}-title`}>
              {title}
            </span>
            {description && (
              <span className="ui-mark__description" id={`${id}-description`}>
                {description}
              </span>
            )}
          </span>
        )}
      </div>
    );
  },
);

Mark.displayName = 'Mark';

export default Mark;
