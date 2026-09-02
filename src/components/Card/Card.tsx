import { forwardRef } from 'react';
import AspectRatio from '../AspectRatio';
import type {
  CardActionsProps,
  CardBodyProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardOverlineProps,
  CardProps,
  CardTitleProps,
  CardVisualProps,
} from './Card.types';
import './Card.scss';

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      id,
      children,
      size = 'default',
      interactive = false,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        data-size={size}
        className={`ui-card ui-card--sz-${size}${interactive ? ' ui-card--interactive' : ''}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// ---------------------------------------------------------------------------
// PARTS
//
// The pieces `CardHeader` composes, exported so a card whose shape the header
// cannot express is still built from the system rather than hand-rolled. They
// carry the same BEM classes the header does, and the size cascade is written
// as descendant selectors (`.ui-card--sz-xl .ui-card__title`), so a part gets
// the right ramp wherever it sits — body slot included.
// ---------------------------------------------------------------------------

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: as_ = 'h3', scale, children, className, ...rest }, ref) => {
    const Tag = as_ as 'h3';
    return (
      <Tag
        {...rest}
        ref={ref}
        // Every rung is styled, `default` included — `scale="default"` is a
        // real request inside a 2xl card, so this is not a dead modifier.
        className={`ui-card__title${scale ? ` ui-card__title--scale-${scale}` : ''}${className ? ' ' + className : ''}`}
      >
        {children}
      </Tag>
    );
  },
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...rest }, ref) => (
    <p
      {...rest}
      ref={ref}
      className={`ui-card__description${className ? ' ' + className : ''}`}
    >
      {children}
    </p>
  ),
);

CardDescription.displayName = 'CardDescription';

const CardOverline = forwardRef<HTMLDivElement, CardOverlineProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-card__overline${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

CardOverline.displayName = 'CardOverline';

const CardVisual = forwardRef<HTMLDivElement, CardVisualProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-card__visual${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

CardVisual.displayName = 'CardVisual';

const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-card__actions${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

CardActions.displayName = 'CardActions';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      id,
      overline,
      title,
      description,
      media,
      action,
      mediaPlacement = 'leading',
      showDivider = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const stacked = mediaPlacement === 'above';
    // `--header-media` on top of `--visual` is the header-row-only floor that
    // stops a small mark pinning to the top of the title's line box. The
    // generic tile styling lives on `--visual` so a composed card gets it too.
    const mediaNode = media ? (
      <CardVisual className="ui-card__header-media">{media}</CardVisual>
    ) : null;
    const contentNode = (
      <div className="ui-card__header-content">
        {overline && <CardOverline>{overline}</CardOverline>}
        <CardTitle id={`${id}-title`}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    );

    return (
      <div
        {...rest}
        ref={ref}
        // The required id was destructured and then never applied — the DOM
        // node now carries it (it also seeds `${id}-title` on the heading).
        id={id}
        // No modifier in the default case — `--no-divider` is emitted only when
        // the rule is turned off, so existing markup is untouched.
        className={`ui-card__header${stacked ? ' ui-card__header--media-above' : ''}${showDivider ? '' : ' ui-card__header--no-divider'}${className ? ' ' + className : ''}`}
      >
        {/* The stack exists ONLY in the `above` case. Rendering it always —
            even layout-neutral via `display: contents` — would change the DOM
            under every card that already ships, and `leading` is the shape
            nothing needs to opt into. Same instinct as `--no-divider` below:
            no modifier, and here no wrapper, in the default case. */}
        {stacked ? (
          <div className="ui-card__header-stack">
            {mediaNode}
            {contentNode}
          </div>
        ) : (
          <>
            {mediaNode}
            {contentNode}
          </>
        )}
        {action && <div className="ui-card__header-action">{action}</div>}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

/**
 * A full-bleed cover — an image, a video, a chart — placed by the caller rather
 * than by a prop, so it can sit above the header, between header and body, or
 * under the footer.
 *
 * It needs no rounding of its own: `.ui-card` is `overflow: hidden`, so a media
 * block touching any edge inherits the card's radius for free. That is also why
 * this is a sibling part and not a `media` prop on `Card` — a prop would have to
 * pick an order, and the whole point is that the caller picks.
 *
 * Distinct from `CardHeader`'s `media`, which is a LEADING visual on the title's
 * own line — an avatar or a status dot beside the heading. This one is the cover.
 */
const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  ({ ratio = 16 / 9, className, children, ...rest }, ref) => {
    return (
      <AspectRatio
        {...rest}
        ref={ref}
        ratio={ratio}
        className={`ui-card__media${className ? ' ' + className : ''}`}
      >
        {children}
      </AspectRatio>
    );
  },
);

CardMedia.displayName = 'CardMedia';

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-card__body${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-card__footer${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = 'CardFooter';

export default Card;
export {
  CardHeader,
  CardMedia,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  CardOverline,
  CardVisual,
  CardActions,
};
