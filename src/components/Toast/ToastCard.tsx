import { forwardRef } from 'react';
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
        className={`ui-toast ui-toast--${variant}`}
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
              <button
                type="button"
                className="ui-toast__cancel"
                onClick={() => {
                  cancel.onClick?.();
                  onDismiss();
                }}
              >
                {cancel.label}
              </button>
            )}
            {action && (
              <button
                type="button"
                className="ui-toast__action"
                onClick={() => {
                  action.onClick();
                  onDismiss();
                }}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
        <CloseButton
          id={`${toast.id}-close`}
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
