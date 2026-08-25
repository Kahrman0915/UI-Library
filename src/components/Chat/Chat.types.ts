import type { LucideIcon } from 'lucide-react';
import type { StatusDotStatus } from '../StatusDot/StatusDot.types';
import type { Size } from '../../types/GlobalTypes';
import type { DrawerSide } from '../Drawer/Drawer.types';

/** Vertical rhythm between messages, provided by the Chat root via context. */
export type ChatDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Who a message is from — drives alignment and bubble treatment.
 *
 * The transcript is deliberately **asymmetric**, following the Claude
 * conversation UI: `assistant` turns are full-width, bubble-less prose;
 * `user` turns are a contained bubble on the trailing edge.
 */
export type ChatSender = 'user' | 'assistant' | 'system';

/**
 * Root of the chat family. Provides `density` to every descendant.
 *
 * Message content is **yours to render**. For rendered model markdown use
 * `ChatMarkdown` from the `@ui/lib/markdown` subpath — the one component
 * allowed the markdown dependencies, kept off the main entry so apps that
 * never render AI markdown never pay for a parser. For a full-page app shell
 * use `ChatLayout` instead; don't nest one inside the other, since both
 * provide the same context.
 */
export type ChatProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `balanced`. See {@link ChatDensity}. */
  density?: ChatDensity;
  className?: string;
};

/**
 * The scrolling transcript. Stays pinned to the newest message unless the user
 * scrolls up, in which case a jump-to-latest button appears.
 *
 * A `role="log"` region so replies are announced as they arrive, and a tab stop
 * so keyboard users can scroll it (WCAG 2.1.1).
 */
export type ChatMessageListProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Accessible label for the floating jump-to-latest button. */
  jumpLabel?: string;
  className?: string;
};

/** One turn in the transcript. Shares `from` with everything inside it. */
export type ChatMessageProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required — drives alignment and is inherited by descendants. */
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

/**
 * Row of per-message controls — copy, retry, thumbs. Revealed on hover or
 * focus-within, so it stays reachable by keyboard.
 */
export type ChatMessageActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/**
 * - `divider` — a labelled rule ("Today", "New messages").
 * - `system` — an inline system note.
 * - `status` — a note with a leading `StatusDot` (see `status`).
 */
export type ChatMarkerVariant = 'divider' | 'system' | 'status';

/** An inline note between messages — a date rule, a system line, a presence change. */
export type ChatMarkerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `divider`. See {@link ChatMarkerVariant}. */
  variant?: ChatMarkerVariant;
  /** Presence state for `variant="status"` (renders a leading StatusDot). */
  status?: StatusDotStatus;
  className?: string;
};

// ── Composer ────────────────────────────────────────────────────────────────

/**
 * The message input form. Renders a real `<form>`, so the send button submits
 * it — `onSubmit` is redefined to receive the value rather than an event, hence
 * the Omit.
 *
 * Enter sends, Shift+Enter inserts a newline.
 */
export type ChatComposerProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  /** Controlled input value. */
  value: string;
  onValueChange?: (value: string) => void;
  /** Fired on Enter or send-button click, with the current value. */
  onSubmit?: (value: string) => void;
  /** Blocks typing and sending — for a disconnected or rate-limited state. */
  disabled?: boolean;
  /** When true, the send button becomes a Stop button wired to `onStop`. */
  isStreaming?: boolean;
  /** Called when the user presses Stop. Pair with `isStreaming`. */
  onStop?: () => void;
  className?: string;
};

/**
 * The composer's textarea. It grows with its content up to `maxRows`, then
 * scrolls. Value and disabled state belong to the enclosing `ChatComposer`, so
 * those props are Omitted here.
 */
export type ChatComposerInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'disabled'
> & {
  /** Cap the autosize growth (rows) before the textarea scrolls. Default 8. */
  maxRows?: number;
  className?: string;
};

/** Toolbar row inside the composer — attach, dictate, expand, send. */
export type ChatComposerActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/**
 * The send button. Composes `Button variant="aiden"`, so it carries the
 * gradient under any brand theme. Becomes a Stop button while the composer is
 * streaming.
 */
export type ChatComposerSendProps = {
  id?: string;
  /** Accessible label / tooltip when idle. Default "Send message". */
  sendLabel?: string;
  /** Accessible label while streaming. Default "Stop generating". */
  stopLabel?: string;
  /** Button size. Accepts either size vocabulary — see `Size`. */
  size?: Size;
  className?: string;
};

// ── Tool calls ───────────────────────────────────────────────────────────────

/** Drives the tool card's leading indicator: Spinner, check, or alert icon. */
export type ChatToolStatus = 'running' | 'success' | 'error';

/** Groups consecutive `ChatToolCall` cards within one assistant turn. */
export type ChatToolCallsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/**
 * A collapsible card showing one agent action — the tool, its arguments and its
 * result. Composes `Collapsible`, so it inherits the CSS-only height animation.
 *
 * `title` is Omitted because the tool's own name is `name`.
 */
export type ChatToolCallProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** Seeds the collapsible's trigger/content ids. */
  id?: string;
  /** The tool name (rendered in mono). */
  name: React.ReactNode;
  /** Default `running`. See {@link ChatToolStatus}. */
  status?: ChatToolStatus;
  /** Leading tool icon; defaults to a wrench. */
  icon?: React.ReactNode;
  /** Overrides the status label text (default Running/Done/Error). */
  statusLabel?: React.ReactNode;
  /** Start expanded. Uncontrolled — the card owns its state after that. */
  defaultOpen?: boolean;
  className?: string;
};

// ── Suggestions ──────────────────────────────────────────────────────────────

/** Row of starter prompts, typically under a `ChatGreeting`. */
export type ChatSuggestionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/**
 * One prompt pill. **Deliberately not a `Chip`** — a Chip is an `aria-pressed`
 * toggle, whereas a suggestion fires once and disappears.
 */
export type ChatSuggestionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

// ── Composer extras: dictation + expand-to-drawer ────────────────────────────

/**
 * Mic toggle for the composer toolbar. **Presentational only** — `recording`
 * paints it red and pulses it; wiring actual speech recognition is yours.
 *
 * `aria-label` is Omitted because it swaps with `recording` — use `label` and
 * `activeLabel`.
 */
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

/**
 * Expands the composer into a `Drawer` for long-form input, bound to the **same
 * value** as the inline composer. Inside the drawer Enter inserts a newline —
 * the footer button sends.
 *
 * `aria-label` is Omitted in favour of `label`.
 */
export type ChatComposerDrawerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> & {
  /** Seeds the drawer's ids. */
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

/**
 * Full-height page shell: fixed header, scrolling body, docked composer footer.
 *
 * **An alternative root to `Chat`, not a wrapper for one** — it provides the
 * same `density` context, so don't nest them.
 */
export type ChatLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `balanced`. See {@link ChatDensity}. */
  density?: ChatDensity;
  className?: string;
};

/** Fixed top bar — title, model picker, conversation actions. */
export type ChatLayoutHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/** The scrolling middle. Put your `ChatMessageList` here. */
export type ChatLayoutBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/** Docked bottom bar. Put your `ChatComposer` here. */
export type ChatLayoutFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

// ── Editing + response versions ──────────────────────────────────────────────

/**
 * Inline editor swapped in for a message bubble. Enter saves, Shift+Enter adds a
 * newline, Escape cancels. You own the "is editing" boolean.
 */
export type ChatMessageEditProps = {
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Controlled value (pair with onValueChange). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Enter or the Save button. Receives the edited value. */
  onSave: (value: string) => void;
  /** Escape or the Cancel button. */
  onCancel: () => void;
  /** Save button text. Default `'Save'`. */
  saveLabel?: string;
  /** Cancel button text. Default `'Cancel'`. */
  cancelLabel?: string;
  /** Accessible name for the editor textarea. Default `'Edit message'`. */
  editLabel?: string;
  /** Placeholder for the empty editor. */
  placeholder?: string;
  /** Cap the autosize growth (rows) before the textarea scrolls. */
  maxRows?: number;
  className?: string;
};

/**
 * The `‹ 2/3 ›` pager for regenerated replies. Presentational — you hold the
 * versions array and decide what each arrow does.
 */
export type ChatMessageVersionsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 1-based index of the shown version. */
  index: number;
  /** Total versions. The arrows disable at each end. */
  count: number;
  /** Show the previous version. The arrow disables at index 1. */
  onPrevious?: () => void;
  /** Show the next version. The arrow disables at `count`. */
  onNext?: () => void;
  /** Accessible label for the back arrow. */
  previousLabel?: string;
  /** Accessible label for the forward arrow. */
  nextLabel?: string;
  className?: string;
};

// ── Reasoning ("thinking") ───────────────────────────────────────────────────

/**
 * The collapsible "thinking" block above a reply. Composes `Collapsible`.
 * `title` is Omitted in favour of `label`.
 */
export type ChatReasoningProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** Seeds the collapsible's trigger/content ids. */
  id?: string;
  /** Header label. Defaults to "Thinking…" while active, else "Reasoning". */
  label?: React.ReactNode;
  /** Active state — the label shimmers. */
  thinking?: boolean;
  /** Start expanded. Uncontrolled — the block owns its state after that. */
  defaultOpen?: boolean;
  className?: string;
};

// ── Citations + sources ──────────────────────────────────────────────────────

/**
 * An inline citation marker in running text. Renders an `<a>` when `href` is
 * given, otherwise a plain `<span>`.
 */
export type ChatCitationProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> & {
  /** The marker content (e.g. a number). Alternatively pass children. */
  index?: React.ReactNode;
  /** Makes the marker a link. Without it the marker is not interactive. */
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

/** The labelled group of source cards under a cited reply. */
export type ChatSourcesProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional heading above the cards (e.g. "Sources"). */
  label?: React.ReactNode;
  className?: string;
};

/**
 * One source card. `title` is redefined as the card's heading, so the native
 * tooltip-text `title` attribute is Omitted.
 */
export type ChatSourceProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'title'
> & {
  /** Makes the card a link. Without it the card is not interactive. */
  href?: string;
  /** Badge number, matching the inline `ChatCitation` that points here. */
  index?: React.ReactNode;
  /** The card's heading — the page or document name. */
  title: React.ReactNode;
  /** Secondary line, usually the host. */
  domain?: React.ReactNode;
  /** Leading favicon / thumbnail slot. */
  icon?: React.ReactNode;
  className?: string;
};

// ── Greeting / empty state ───────────────────────────────────────────────────

/**
 * The centred start screen for an empty conversation. A dedicated component
 * rather than a reuse of `Empty` — it slots `ChatSuggestions` underneath and
 * carries the assistant's own rhythm.
 *
 * `title` is redefined as the heading, so the native `title` attribute is Omitted.
 */
export type ChatGreetingProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** The greeting headline. */
  title: React.ReactNode;
  /** Supporting line under the title. */
  description?: React.ReactNode;
  /** Logo / brand-mark slot above the title. */
  icon?: React.ReactNode;
  className?: string;
};

export type ChatMessageActionProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  /**
   * The action's glyph. Sized by the button, not by itself — same contract as
   * `FeaturedIcon`.
   */
  icon: LucideIcon;
  /**
   * The accessible name AND the tooltip-less affordance. Required — an
   * icon-only button with no name is unusable to a screen reader.
   */
  label: string;
  /**
   * Pressed state for toggle-shaped actions (thumbs up / thumbs down).
   * Renders `aria-pressed` and the active tint; omit for momentary actions
   * (copy / regenerate), which then carry no `aria-pressed` at all.
   */
  active?: boolean;
  /**
   * Copy-to-clipboard convenience: pass the text and the button handles
   * `navigator.clipboard`, the icon↔check swap and the 2s reset itself —
   * `CodeBlock`'s exact pattern. `onClick` still fires afterwards if given.
   */
  copyValue?: string;
  className?: string;
};

export type ChatErrorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /** Seeds `${id}-retry` on the Retry button. Falls back to a generated id. */
  id?: string;
  /** What went wrong, in words a user can act on. */
  children: React.ReactNode;
  /** Renders the Retry button when given. The transport is yours. */
  onRetry?: () => void;
  /** Default `Retry`. */
  retryLabel?: string;
  className?: string;
};

export type ChatDisclaimerProps = Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  'children'
> & {
  /**
   * The disclaimer copy ("Aiden can make mistakes. Verify important
   * information."). Required and never baked in — the words are a product
   * decision, not a library one.
   */
  children: React.ReactNode;
  className?: string;
};

/** One choice in a `ChatModelPicker`. */
export type ChatModel = {
  value: string;
  label: string;
  /** Second line in the menu — speed/quality tradeoff, context size. */
  description?: string;
  /** Small outline `Badge` beside the label — "New", "Preview". */
  badge?: string;
  disabled?: boolean;
};

export type ChatModelPickerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> & {
  /** Seeds the DropdownMenu's `{id}-trigger` / `{id}-content` aria pair. */
  id: string;
  models: ChatModel[];
  /** The selected model's `value`. Controlled. */
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** Menu alignment against the trigger. Default `start`. */
  align?: 'start' | 'center' | 'end';
  className?: string;
};

/** One entry in a `ChatComposerMenu` — a slash command or an @mention target. */
export type ChatComposerMenuItem = {
  /** Matched against the typed query (with `label` and `keywords`). */
  value: string;
  label: string;
  /** Second line — what the command does, who the person is. */
  description?: string;
  /** Leading glyph — a lucide icon, an `Avatar` for a mention. */
  icon?: React.ReactNode;
  /**
   * What replaces the typed token on select. Defaults to the trigger char +
   * `value` + a trailing space (`/summarize ` · `@ada `).
   */
  insertText?: string;
  keywords?: string[];
};

export type ChatComposerMenuProps = {
  /** Seeds the listbox / option ids. */
  id?: string;
  /** Items offered when the token starts with `/` at position 0. */
  slashItems?: ChatComposerMenuItem[];
  /** Items offered when a token starts with `@`. */
  mentionItems?: ChatComposerMenuItem[];
  /**
   * Fired AFTER the token is replaced, with the chosen item and what was
   * typed. Wire command execution here; mentions usually need nothing.
   */
  onSelect?: (
    item: ChatComposerMenuItem,
    context: { trigger: '/' | '@'; query: string },
  ) => void;
  /** Shown when the query matches nothing. Default `No matches`. */
  emptyLabel?: React.ReactNode;
  className?: string;
};

export type ChatArtifactProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** Seeds `${id}-title` (labels the region) and the header action ids. */
  id: string;
  /** The document's name. */
  title: React.ReactNode;
  /** Filetype / kind tag beside the title — rendered as an outline `Badge`. */
  badge?: string;
  /** Copy payload for the header copy action. Omit to hide the action. */
  copyValue?: string;
  /** Renders a download action — a real `<a download>`. */
  downloadHref?: string;
  /** Suggested filename for `downloadHref`. */
  downloadName?: string;
  /** Renders an open-externally action. */
  onOpen?: () => void;
  /** Renders the close X. The aside's visibility is the consumer's state. */
  onClose?: () => void;
  /** The document itself — a `ChatMarkdown`, a `CodeBlock`, an iframe. */
  children: React.ReactNode;
  /** Optional pinned footer row (word count, version note). */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * The inline transcript affordance that opens an artifact — a momentary
 * button, like `ChatSuggestion` (not a `Chip`: nothing toggles).
 */
export type ChatArtifactCardProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'title'
> & {
  /** The document's name. */
  title: React.ReactNode;
  /** Small line under the title — filetype, size, "Click to open". */
  description?: React.ReactNode;
  /** Leading glyph. Defaults to a file icon. */
  icon?: React.ReactNode;
  className?: string;
};

/**
 * The split-view region beside the transcript — where an artifact renders.
 * A sibling of `ChatLayoutBody` inside `ChatLayout`; when present, the layout
 * becomes a two-column grid (transcript+composer left, aside right). Width via
 * `--ui-chat-aside-width` (default 40rem). Hidden under 768px — swap to a
 * `Drawer` there (the Sidebar precedent).
 */
export type ChatLayoutAsideProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
