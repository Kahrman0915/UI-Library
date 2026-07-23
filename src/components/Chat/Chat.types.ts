import type { StatusDotStatus } from '../StatusDot/StatusDot.types';
import type { Size } from '../../types/GlobalTypes';
import type { DrawerSide } from '../Drawer/Drawer.types';

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
  /** Render an animated typing indicator instead of children (nothing yet). */
  pending?: boolean;
  /** Append a blinking caret after the content (tokens are still arriving). */
  streaming?: boolean;
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

// ── Tool calls ───────────────────────────────────────────────────────────────

export type ChatToolStatus = 'running' | 'success' | 'error';

export type ChatToolCallsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatToolCallProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  id?: string;
  /** The tool name (rendered in mono). */
  name: React.ReactNode;
  status?: ChatToolStatus;
  /** Leading tool icon; defaults to a wrench. */
  icon?: React.ReactNode;
  /** Overrides the status label text (default Running/Done/Error). */
  statusLabel?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

// ── Suggestions ──────────────────────────────────────────────────────────────

export type ChatSuggestionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatSuggestionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

// ── Composer extras: dictation + expand-to-drawer ────────────────────────────

export type ChatComposerDictationProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> & {
  /** Recording state (presentational — wire your own speech recognition). */
  recording?: boolean;
  /** Accessible label when idle. */
  label?: string;
  /** Accessible label while recording. */
  activeLabel?: string;
  className?: string;
};

export type ChatComposerDrawerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> & {
  id?: string;
  /** Which edge the expanded composer slides from. Default 'bottom'. */
  side?: DrawerSide;
  /** Trigger button accessible label. */
  label?: string;
  /** Drawer header title. */
  title?: string;
  /** Send button label inside the drawer. */
  sendLabel?: string;
  className?: string;
};

// ── Page-level layout shell ──────────────────────────────────────────────────

export type ChatLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  density?: ChatDensity;
  className?: string;
};

export type ChatLayoutHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatLayoutBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ChatLayoutFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
