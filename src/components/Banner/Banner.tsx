import { forwardRef } from 'react';
import CloseButton from '#components/CloseButton/CloseButton';
import type { BannerProps } from './Banner.types';
import './Banner.scss';

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      id,
      variant = 'default',
      title,
      Icon,
      action,
      onClose,
      centered = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const roleAttr =
      variant === 'error' || variant === 'warning' ? 'alert' : 'status';
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role={roleAttr}
        className={`ui-banner ui-banner--${variant}${centered ? ' ui-banner--centered' : ''}${className ? ' ' + className : ''}`}
      >
        <div className="ui-banner__inner">
          {Icon && (
            <span className="ui-banner__icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          <div className="ui-banner__body">
            {title && <span className="ui-banner__title">{title}</span>}
            {children}
          </div>
          {action && <div className="ui-banner__action">{action}</div>}
        </div>
        {onClose && (
          <CloseButton
            id={`${id}-close`}
            className="ui-banner__close"
            onClick={onClose}
            ariaLabel="Dismiss"
          />
        )}
      </div>
    );
  },
);

Banner.displayName = 'Banner';

export default Banner;
