import type { StatusDotStatus } from '../StatusDot/StatusDot.types';
import type { Size } from '../../types/GlobalTypes';

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

// ── Composer ────────────────────────────────────────────────────────────────

export type ChatComposerProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  /** Controlled input value. */
  value: string;
  onValueChange?: (value: string) => void;
  /** Fired on Enter or send-button click, with the current value. */
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  /** When true, the send button becomes a Stop button wired to `onStop`. */
  isStreaming?: boolean;
  onStop?: () => void;
  className?: string;
};

export type ChatComposerInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'disabled'
> & {
  /** Cap the autosize growth (rows) before the textarea scrolls. Default 8. */
  maxRows?: number;
  className?: string;
};

export type ChatComposerActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatComposerSendProps = {
  id?: string;
  /** Accessible label / tooltip when idle. Default "Send message". */
  sendLabel?: string;
  /** Accessible label while streaming. Default "Stop generating". */
  stopLabel?: string;
  size?: Size;
  className?: string;
};
