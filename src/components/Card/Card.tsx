import { forwardRef } from 'react';
import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
} from './Card.types';
import './Card.scss';

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ id, children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-card${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ id, title, description, action, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-card__header${className ? ' ' + className : ''}`}
      >
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
export { CardHeader, CardBody, CardFooter };
