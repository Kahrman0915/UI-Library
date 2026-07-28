import { forwardRef } from 'react';
import Button from '#components/Button/Button';
import CloseButton from '#components/CloseButton/CloseButton';
import Progress from '#components/Progress/Progress';
import type { ToastRecord } from './Toast.types';

type ToastCardProps = {
  toast: ToastRecord;
  onDismiss: () => void;
};

const ToastCard = forwardRef<HTMLDivElement, ToastCardProps>(
  ({ toast, onDismiss }, ref) => {
    const { title, variant, description, Icon, action, cancel, progress } =
      toast;
    const assertive = variant === 'error' || variant === 'warning';

    return (
      <div
        ref={ref}
        role={assertive ? 'alert' : 'status'}
        aria-live={assertive ? 'assertive' : 'polite'}
        data-variant={variant}
        className={`ui-toast ui-toast--${variant}${toast.leaving ? ' ui-toast--leaving' : ''}`}
      >
        {Icon && (
          <span className="ui-toast__icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <div className="ui-toast__body">
          <div className="ui-toast__title">{title}</div>
          {description && (
            <div className="ui-toast__description">{description}</div>
          )}
          {progress !== undefined && (
            <Progress
              className="ui-toast__progress"
              size="sm"
              value={progress}
            />
          )}
        </div>
        {(action || cancel) && (
          <div className="ui-toast__actions">
            {cancel && (
              <Button
                id={`${toast.id}-cancel`}
                className="ui-toast__cancel"
                size="xsmall"
                style="outline"
                label={cancel.label}
                onClick={() => {
                  cancel.onClick?.();
                  onDismiss();
                }}
              />
            )}
            {action && (
              <Button
                id={`${toast.id}-action`}
                className="ui-toast__action"
                size="xsmall"
                label={action.label}
                onClick={() => {
                  action.onClick();
                  onDismiss();
                }}
              />
            )}
          </div>
        )}
        <CloseButton
          id={`${toast.id}-close`}
          size="sm"
          className="ui-toast__close"
          onClick={onDismiss}
          ariaLabel="Dismiss"
        />
      </div>
    );
  },
);

ToastCard.displayName = 'ToastCard';

export default ToastCard;
