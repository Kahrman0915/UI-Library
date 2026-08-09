import { forwardRef, useId } from 'react';
import { CircleAlert } from 'lucide-react';
import Button from '../Button/Button';
import type { ChatErrorProps } from './Chat.types';

/**
 * A failed assistant turn — the reply that never arrived.
 *
 * Renders assistant-side (full width, bubble-less) per the transcript
 * asymmetry, on the `--error-light` tint with the message and an optional
 * Retry. `role="alert"` so the failure is announced when it appears; the
 * transport and the retry itself are the consumer's.
 */
const ChatError = forwardRef<HTMLDivElement, ChatErrorProps>(
  ({ id, children, onRetry, retryLabel = 'Retry', className, ...rest }, ref) => {
    // Same fallback the other Chat parts use (ChatToolCall, ChatMessageEdit):
    // an explicit id wins, useId covers the anonymous case so the retry
    // button still gets a real id rather than an empty attribute.
    const autoId = useId();
    const genId = id ?? `chat-error-${autoId}`;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role="alert"
        className={`ui-chat-error${className ? ' ' + className : ''}`}
      >
        <CircleAlert className="ui-chat-error__icon" aria-hidden="true" />
        <div className="ui-chat-error__body">
          <div className="ui-chat-error__message">{children}</div>
          {onRetry && (
            <Button
              id={`${genId}-retry`}
              label={retryLabel}
              variant="error"
              style="outline"
              size="sm"
              onClick={onRetry}
              className="ui-chat-error__retry"
            />
          )}
        </div>
      </div>
    );
  },
);

ChatError.displayName = 'ChatError';

export default ChatError;
