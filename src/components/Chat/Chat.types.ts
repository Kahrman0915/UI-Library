import type { StatusDotStatus } from '../StatusDot/StatusDot.types';

// Vertical rhythm between messages, provided by the Chat root via context.
export type ChatDensity = 'compact' | 'balanced' | 'spacious';

// Who a message is from — drives alignment and bubble colour.
export type ChatSender = 'user' | 'assistant' | 'system';

export type ChatProps = React.HTMLAttributes<HTMLDivElement> & {
  density?: ChatDensity;
  className?: string;
};

export type ChatMessageListProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Accessible label for the floating jump-to-latest button. */
  jumpLabel?: string;
  className?: string;
};

export type ChatMessageProps = React.HTMLAttributes<HTMLDivElement> & {
  from: ChatSender;
  /** Leading avatar node (e.g. an `<Avatar>`). Omit for a bubble-only row. */
  avatar?: React.ReactNode;
  className?: string;
};

export type ChatBubbleProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Overrides the sender inherited from the enclosing `ChatMessage`. */
  from?: ChatSender;
  /** Render an animated typing indicator instead of children. */
  pending?: boolean;
  className?: string;
};

export type ChatMessageActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatMarkerVariant = 'divider' | 'system' | 'status';

export type ChatMarkerProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ChatMarkerVariant;
  /** Presence state for `variant="status"` (renders a leading StatusDot). */
  status?: StatusDotStatus;
  className?: string;
};
