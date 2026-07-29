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
  /**
   * Accessible name for the `pending` typing indicator. Default
   * `'Assistant is typing'`. A prop because the dots are an internal element
   * `...rest` can't reach, so the English was otherwise unreachable.
   */
  typingLabel?: string;
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

// ── Editing + response versions ──────────────────────────────────────────────

export type ChatMessageEditProps = {
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Controlled value (pair with onValueChange). */
  value?: string;
  onValueChange?: (value: string) => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  /** Accessible name for the editor textarea. Default `'Edit message'`. */
  editLabel?: string;
  placeholder?: string;
  maxRows?: number;
  className?: string;
};

export type ChatMessageVersionsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 1-based index of the shown version. */
  index: number;
  count: number;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

// ── Reasoning ("thinking") ───────────────────────────────────────────────────

export type ChatReasoningProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  id?: string;
  /** Header label. Defaults to "Thinking…" while active, else "Reasoning". */
  label?: React.ReactNode;
  /** Active state — the label shimmers. */
  thinking?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

// ── Citations + sources ──────────────────────────────────────────────────────

export type ChatCitationProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> & {
  /** The marker content (e.g. a number). Alternatively pass children. */
  index?: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

export type ChatSourcesProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional heading above the cards (e.g. "Sources"). */
  label?: React.ReactNode;
  className?: string;
};

export type ChatSourceProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'title'
> & {
  href?: string;
  index?: React.ReactNode;
  title: React.ReactNode;
  domain?: React.ReactNode;
  /** Leading favicon / thumbnail slot. */
  icon?: React.ReactNode;
  className?: string;
};

// ── Greeting / empty state ───────────────────────────────────────────────────

export type ChatGreetingProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Logo / brand-mark slot above the title. */
  icon?: React.ReactNode;
  className?: string;
};
