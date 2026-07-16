import { forwardRef } from 'react';
import CloseButton from '#components/CloseButton/CloseButton';
import type { AlertProps } from './Alert.types';
import './Alert.scss';

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      id,
      variant = 'default',
      style = 'default',
      title,
      description,
      Icon,
      action,
      onClose,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const roleAttr = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role={roleAttr}
        className={`ui-alert ui-alert--${variant} ui-alert--${style}${className ? ' ' + className : ''}`}
      >
        {Icon && (
          <span className="ui-alert__icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <div className="ui-alert__body">
          {title && (
            <div id={`${id}-title`} className="ui-alert__title">
              {title}
            </div>
          )}
          {description && (
            <div
              id={`${id}-description`}
              className="ui-alert__description"
            >
              {description}
            </div>
          )}
          {children && <div className="ui-alert__content">{children}</div>}
        </div>
        {action && <div className="ui-alert__action">{action}</div>}
        {onClose && (
          <CloseButton
            id={`${id}-close`}
            className="ui-alert__close"
            onClick={onClose}
            ariaLabel="Close"
          />
        )}
      </div>
    );
  },
);

Alert.displayName = 'Alert';

export default Alert;
