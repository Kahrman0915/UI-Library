import { forwardRef } from 'react';
import AspectRatio from '../AspectRatio';
import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardProps,
} from './Card.types';
import './Card.scss';

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ id, children, interactive = false, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-card${interactive ? ' ui-card--interactive' : ''}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ id, title, description, media, action, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        // The required id was destructured and then never applied — the DOM
        // node now carries it (it also seeds `${id}-title` on the heading).
        id={id}
        className={`ui-card__header${className ? ' ' + className : ''}`}
      >
        {media && <div className="ui-card__header-media">{media}</div>}
        <div className="ui-card__header-content">
          <h3 id={`${id}-title`} className="ui-card__title">
            {title}
          </h3>
          {description && (
            <p className="ui-card__description">{description}</p>
          )}
        </div>
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
export { CardHeader, CardMedia, CardBody, CardFooter };
