import { forwardRef } from 'react';
import { Check, CircleAlert, Wrench } from 'lucide-react';
import Spinner from '../Spinner';
import type { ChatActionCardProps, ChatActionStatus } from './Chat.types';
// Chat.scss (imported by Chat.tsx) owns this part's styles — the family
// convention is one stylesheet import at the root.

const DEFAULT_LABEL: Record<ChatActionStatus, string> = {
  proposed: 'Needs your OK',
  running: 'Working…',
  done: 'Done',
  failed: "Couldn't finish",
};

/**
 * An action the assistant wants to take, and then the record that it took it.
 *
 * See {@link ChatActionCardProps} for why this is not `ChatToolCall`.
 *
 * **It is never collapsible and carries no dismiss.** Both would let a decision
 * be waved away without being made, which is the one thing this card exists to
 * prevent — and after the fact a receipt you can hide is a receipt you cannot
 * audit.
 */
const ChatActionCard = forwardRef<HTMLDivElement, ChatActionCardProps>(
  (
    {
      id,
      title,
      description,
      status = 'proposed',
      icon,
      statusLabel,
      primaryAction,
      secondaryAction,
      className,
      ...rest
    },
    ref,
  ) => {
    // Only `proposed` shows the action's own glyph. Once it is moving the state
    // is what you need to read, so the state supplies the mark.
    const mark =
      status === 'running' ? (
        <Spinner id={`${id}-spinner`} size={20} />
      ) : status === 'done' ? (
        <Check aria-hidden="true" />
      ) : status === 'failed' ? (
        <CircleAlert aria-hidden="true" />
      ) : (
        icon ?? <Wrench aria-hidden="true" />
      );

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        // A group rather than a region: it is named by its own title and holds
        // the buttons, so a screen reader reaches the decision with its context.
        role="group"
        aria-labelledby={`${id}-title`}
        data-status={status}
        className={`ui-chat-action-card ui-chat-action-card--${status}${
          className ? ' ' + className : ''
        }`}
      >
        <div className="ui-chat-action-card__mark" aria-hidden={status !== 'running'}>
          {mark}
        </div>

        <div className="ui-chat-action-card__body">
          <p id={`${id}-title`} className="ui-chat-action-card__title">
            {title}
          </p>
          {description && (
            <p id={`${id}-description`} className="ui-chat-action-card__description">
              {description}
            </p>
          )}
          {/*
            The status line is the only thing that changes as the card advances,
            so it — not the card — carries the live region. Moving `role` from
            group to status on the root instead would re-announce the whole card
            and is not reliably spoken when a role changes in place.
          */}
          <p
            id={`${id}-status`}
            className="ui-chat-action-card__status"
            aria-live="polite"
          >
            {statusLabel ?? DEFAULT_LABEL[status]}
          </p>
        </div>

        {(secondaryAction || primaryAction) && (
          <div className="ui-chat-action-card__actions">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    );
  },
);

ChatActionCard.displayName = 'ChatActionCard';

export default ChatActionCard;
