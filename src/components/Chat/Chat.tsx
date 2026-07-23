import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  CircleAlert,
  Maximize2,
  Mic,
  Square,
  Wrench,
} from 'lucide-react';
import {
  ChatComposerContext,
  ChatContext,
  ChatMessageContext,
  useChatComposerContext,
  useChatContext,
  useChatMessageContext,
} from './Chat.context';
import { useStickToBottom } from '../../hooks/useStickToBottom';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import StatusDot from '../StatusDot/StatusDot';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import Collapsible, {
  CollapsibleContent,
  CollapsibleTrigger,
} from '../Collapsible/Collapsible';
import Drawer, {
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
} from '../Drawer/Drawer';
// The composer reuses `.ui-input-wrap` / `.ui-input` for its border, focus ring
// and native-control reset — those classes live in Input.scss.
import '../Input/Input.scss';
import type {
  ChatBubbleProps,
  ChatComposerActionsProps,
  ChatComposerInputProps,
  ChatComposerProps,
  ChatComposerSendProps,
  ChatMarkerProps,
  ChatMessageActionsProps,
  ChatMessageListProps,
  ChatMessageProps,
  ChatProps,
  ChatSuggestionProps,
  ChatSuggestionsProps,
  ChatToolCallProps,
  ChatToolCallsProps,
  ChatComposerDictationProps,
  ChatComposerDrawerProps,
  ChatLayoutProps,
  ChatLayoutHeaderProps,
  ChatLayoutBodyProps,
  ChatLayoutFooterProps,
} from './Chat.types';
import './Chat.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — column container that provides conversation-wide settings via context.
// ═════════════════════════════════════════════════════════════════════════════

const Chat = forwardRef<HTMLDivElement, ChatProps>(
  ({ density = 'balanced', className, children, ...rest }, ref) => {
    const ctx = useMemo(() => ({ density }), [density]);
    return (
      <ChatContext.Provider value={ctx}>
        <div
          {...rest}
          ref={ref}
          data-density={density}
          className={`ui-chat ui-chat--density-${density}${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </ChatContext.Provider>
    );
  },
);

Chat.displayName = 'Chat';

// ═════════════════════════════════════════════════════════════════════════════
// MessageList — the scroll region. Auto-sticks to the newest message and shows
// a jump-to-latest button when the user scrolls up. A ResizeObserver on the
// inner content feeds the stick hook so the follow fires on any growth (new
// message *or* streaming text), not just child-count changes.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ jumpLabel = 'Scroll to latest', className, children, ...rest }, ref) => {
    const { density } = useChatContext();
    const [tick, setTick] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const {
      ref: scrollRef,
      isPinned,
      scrollToBottom,
    } = useStickToBottom<HTMLDivElement>([tick]);

    // Merge the hook's scroll ref with the forwarded ref (both want the scroll
    // element, which is the most useful handle for a consumer).
    const setScrollNode = useCallback(
      (node: HTMLDivElement | null) => {
        scrollRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref, scrollRef],
    );

    useEffect(() => {
      const el = contentRef.current;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => setTick((t) => t + 1));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div className="ui-chat__list-wrap">
        <div
          {...rest}
          ref={setScrollNode}
          className={`ui-chat__list${className ? ' ' + className : ''}`}
        >
          <div
            ref={contentRef}
            className={`ui-chat__list-content ui-chat__list-content--density-${density}`}
          >
            {children}
          </div>
        </div>
        {!isPinned && (
          <button
            type="button"
            aria-label={jumpLabel}
            className="ui-chat__jump"
            onClick={() => scrollToBottom()}
          >
            <ArrowDown className="ui-chat__jump-icon" aria-hidden />
          </button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = 'ChatMessageList';

// ═════════════════════════════════════════════════════════════════════════════
// Message — one row. Provides its sender to descendants (bubble, actions) and
// drives alignment. `from="system"` renders a centered, bubble-less note.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ from, avatar, className, children, ...rest }, ref) => {
    const ctx = useMemo(() => ({ from }), [from]);
    return (
      <ChatMessageContext.Provider value={ctx}>
        <div
          {...rest}
          ref={ref}
          data-from={from}
          className={`ui-chat-message ui-chat-message--${from}${className ? ' ' + className : ''}`}
        >
          {avatar && from !== 'system' && (
            <div className="ui-chat-message__avatar">{avatar}</div>
          )}
          <div className="ui-chat-message__body">{children}</div>
        </div>
      </ChatMessageContext.Provider>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';

// ═════════════════════════════════════════════════════════════════════════════
// Bubble — the message surface. Inherits `from` from the enclosing message.
// `pending` swaps children for an animated typing indicator.
// ═════════════════════════════════════════════════════════════════════════════

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    {
      from: fromProp,
      pending = false,
      streaming = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const msgCtx = useChatMessageContext();
    const from = fromProp ?? msgCtx?.from ?? 'assistant';
    return (
      <div
        {...rest}
        ref={ref}
        data-from={from}
        aria-busy={pending || streaming || undefined}
        className={`ui-chat-bubble ui-chat-bubble--${from}${pending ? ' ui-chat-bubble--pending' : ''}${className ? ' ' + className : ''}`}
      >
        {pending ? (
          <span className="ui-chat-bubble__typing" aria-label="Assistant is typing">
            <span className="ui-chat-bubble__dot" />
            <span className="ui-chat-bubble__dot" />
            <span className="ui-chat-bubble__dot" />
          </span>
        ) : (
          <>
            {children}
            {streaming && (
              <span className="ui-chat-bubble__caret" aria-hidden />
            )}
          </>
        )}
      </div>
    );
  },
);

ChatBubble.displayName = 'ChatBubble';

// ═════════════════════════════════════════════════════════════════════════════
// MessageActions — trailing action row (copy / regenerate), revealed on hover.
// Aligns to the message's side via the inherited sender.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMessageActions = forwardRef<
  HTMLDivElement,
  ChatMessageActionsProps
>(({ className, children, ...rest }, ref) => {
  const msgCtx = useChatMessageContext();
  const from = msgCtx?.from ?? 'assistant';
  return (
    <div
      {...rest}
      ref={ref}
      data-from={from}
      className={`ui-chat-message__actions ui-chat-message__actions--${from}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  );
});

ChatMessageActions.displayName = 'ChatMessageActions';

// ═════════════════════════════════════════════════════════════════════════════
// Marker — inline non-message row: a labeled divider, a centered system note,
// or a status line (StatusDot + label). Full-width, centered.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMarker = forwardRef<HTMLDivElement, ChatMarkerProps>(
  (
    { variant = 'divider', status = 'neutral', className, children, ...rest },
    ref,
  ) => (
    <div
      {...rest}
      ref={ref}
      data-variant={variant}
      role={variant === 'divider' ? 'separator' : undefined}
      className={`ui-chat-marker ui-chat-marker--${variant}${className ? ' ' + className : ''}`}
    >
      {variant === 'status' && (
        <StatusDot status={status} className="ui-chat-marker__dot" />
      )}
      {children && <span className="ui-chat-marker__label">{children}</span>}
    </div>
  ),
);

ChatMarker.displayName = 'ChatMarker';

// ═════════════════════════════════════════════════════════════════════════════
// Composer — the input stack. A <form> whose box reuses `.ui-input-wrap` for
// border / focus-ring / disabled chrome, laid out as a column. Holds the
// controlled value so the input and send button share one source of truth.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposer = forwardRef<HTMLFormElement, ChatComposerProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      disabled = false,
      isStreaming = false,
      onStop,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const submit = useCallback(() => {
      if (disabled || isStreaming) return;
      if (!value.trim()) return;
      onSubmit?.(value);
    }, [disabled, isStreaming, value, onSubmit]);

    const ctx = useMemo(
      () => ({ value, onValueChange, submit, disabled, isStreaming, onStop }),
      [value, onValueChange, submit, disabled, isStreaming, onStop],
    );

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit();
    };

    return (
      <ChatComposerContext.Provider value={ctx}>
        <form
          {...rest}
          ref={ref}
          onSubmit={handleFormSubmit}
          className={`ui-chat-composer${className ? ' ' + className : ''}`}
        >
          <div
            className={`ui-input-wrap ui-chat-composer__box${disabled ? ' ui-input-wrap--disabled' : ''}`}
          >
            {children}
          </div>
        </form>
      </ChatComposerContext.Provider>
    );
  },
);

ChatComposer.displayName = 'ChatComposer';

// ═════════════════════════════════════════════════════════════════════════════
// ComposerInput — the autosizing textarea. Enter submits, Shift+Enter inserts a
// newline. Reads/writes the composer's controlled value via context.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposerInput = forwardRef<
  HTMLTextAreaElement,
  ChatComposerInputProps
>(({ maxRows = 8, rows = 1, className, onKeyDown, ...rest }, ref) => {
  const { value, onValueChange, submit, disabled } = useChatComposerContext();
  const autoRef = useAutosizeTextarea(value, { maxRows });

  const setNode = useCallback(
    (node: HTMLTextAreaElement | null) => {
      autoRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [autoRef, ref],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    // Enter submits; Shift+Enter is a newline. Ignore IME composition.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <textarea
      {...rest}
      ref={setNode}
      rows={rows}
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
      onKeyDown={handleKeyDown}
      className={`ui-input ui-chat-composer__input${className ? ' ' + className : ''}`}
    />
  );
});

ChatComposerInput.displayName = 'ChatComposerInput';

// ═════════════════════════════════════════════════════════════════════════════
// ComposerActions — the bottom toolbar row. Left-aligned by default; the send
// button pushes itself to the trailing edge.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposerActions = forwardRef<
  HTMLDivElement,
  ChatComposerActionsProps
>(({ className, children, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    className={`ui-chat-composer__actions${className ? ' ' + className : ''}`}
  >
    {children}
  </div>
));

ChatComposerActions.displayName = 'ChatComposerActions';

// ═════════════════════════════════════════════════════════════════════════════
// ComposerSend — the Aiden-gradient send button. Submits the form when idle;
// swaps to a Stop button (wired to onStop) while streaming. Auto-aligns right.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposerSend = forwardRef<HTMLButtonElement, ChatComposerSendProps>(
  (
    {
      id: idProp,
      sendLabel = 'Send message',
      stopLabel = 'Stop generating',
      size = 'small',
      className,
    },
    ref,
  ) => {
    const { disabled, isStreaming, onStop, value } =
      useChatComposerContext();
    const autoId = useId();
    const id = idProp ?? autoId;
    const canSend = value.trim().length > 0;

    return (
      <Button
        ref={ref}
        id={id}
        variant="aiden"
        size={size}
        iconOnly
        IconCenter={isStreaming ? Square : ArrowUp}
        type={isStreaming ? 'button' : 'submit'}
        aria-label={isStreaming ? stopLabel : sendLabel}
        aria-busy={isStreaming || undefined}
        disabled={disabled || (!isStreaming && !canSend)}
        // Idle: type=submit lets the form fire submit() (no onClick, else it
        // double-fires). Streaming: type=button + onStop.
        onClick={isStreaming ? onStop : undefined}
        className={`ui-chat-composer__send${className ? ' ' + className : ''}`}
      />
    );
  },
);

ChatComposerSend.displayName = 'ChatComposerSend';

// ═════════════════════════════════════════════════════════════════════════════
// ToolCalls — the agent's tool invocations. `ChatToolCalls` stacks them;
// `ChatToolCall` is a collapsible card (reuses Collapsible) whose body holds the
// args / result (consumer-provided, typically Code / CodeBlock).
// ═════════════════════════════════════════════════════════════════════════════

const ChatToolCalls = forwardRef<HTMLDivElement, ChatToolCallsProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-tools${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatToolCalls.displayName = 'ChatToolCalls';

const ChatToolCall = forwardRef<HTMLDivElement, ChatToolCallProps>(
  (
    {
      id: idProp,
      name,
      status = 'success',
      icon,
      statusLabel,
      defaultOpen = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

    const statusNode =
      status === 'running' ? (
        <>
          <Spinner id={`${id}-status`} size={14} />
          <span>{statusLabel ?? 'Running'}</span>
        </>
      ) : status === 'error' ? (
        <>
          <CircleAlert aria-hidden />
          <span>{statusLabel ?? 'Error'}</span>
        </>
      ) : (
        <>
          <Check aria-hidden />
          <span>{statusLabel ?? 'Done'}</span>
        </>
      );

    return (
      <Collapsible
        {...rest}
        ref={ref}
        id={id}
        defaultOpen={defaultOpen}
        data-status={status}
        className={`ui-chat-tool ui-chat-tool--${status}${className ? ' ' + className : ''}`}
      >
        <CollapsibleTrigger>
          <button type="button" className="ui-chat-tool__trigger">
            <ChevronRight className="ui-chat-tool__chevron" aria-hidden />
            <span className="ui-chat-tool__icon">
              {icon ?? <Wrench aria-hidden />}
            </span>
            <span className="ui-chat-tool__name">{name}</span>
            <span className="ui-chat-tool__status">{statusNode}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ui-chat-tool__body">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

ChatToolCall.displayName = 'ChatToolCall';

// ═════════════════════════════════════════════════════════════════════════════
// Suggestions — a wrapping row of one-shot prompt buttons (starters / follow-ups).
// Momentary buttons, not toggles (so not Chip); consumers wire onClick to send.
// ═════════════════════════════════════════════════════════════════════════════

const ChatSuggestions = forwardRef<HTMLDivElement, ChatSuggestionsProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-suggestions${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatSuggestions.displayName = 'ChatSuggestions';

const ChatSuggestion = forwardRef<HTMLButtonElement, ChatSuggestionProps>(
  ({ className, type, children, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type={type ?? 'button'}
      className={`ui-chat-suggestion${className ? ' ' + className : ''}`}
    >
      {children}
    </button>
  ),
);

ChatSuggestion.displayName = 'ChatSuggestion';

// ═════════════════════════════════════════════════════════════════════════════
// ComposerDictation — a mic toggle for the composer toolbar. Presentational:
// `recording` drives the visual (red + pulse); wire your own speech recognition.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposerDictation = forwardRef<
  HTMLButtonElement,
  ChatComposerDictationProps
>(
  (
    {
      recording = false,
      label = 'Start dictation',
      activeLabel = 'Stop dictation',
      className,
      type,
      ...rest
    },
    ref,
  ) => (
    <button
      {...rest}
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={recording}
      aria-label={recording ? activeLabel : label}
      className={`ui-chat-composer__tool ui-chat-dictation${recording ? ' ui-chat-dictation--recording' : ''}${className ? ' ' + className : ''}`}
    >
      <Mic aria-hidden />
    </button>
  ),
);

ChatComposerDictation.displayName = 'ChatComposerDictation';

// ═════════════════════════════════════════════════════════════════════════════
// ComposerDrawer — a trigger that opens an expanded writing surface (Drawer)
// bound to the same composer value. Enter is a newline here (roomy editor);
// send via the drawer footer.
// ═════════════════════════════════════════════════════════════════════════════

const ChatComposerDrawer = forwardRef<
  HTMLButtonElement,
  ChatComposerDrawerProps
>(
  (
    {
      id: idProp,
      side = 'bottom',
      label = 'Expand composer',
      title = 'Compose',
      sendLabel = 'Send',
      className,
      type,
      ...rest
    },
    ref,
  ) => {
    const { value, onValueChange, submit, disabled, isStreaming } =
      useChatComposerContext();
    const autoId = useId();
    const id = idProp ?? autoId;
    const [open, setOpen] = useState(false);
    const canSend = value.trim().length > 0;

    return (
      <>
        <button
          {...rest}
          ref={ref}
          type={type ?? 'button'}
          aria-label={label}
          onClick={() => setOpen(true)}
          className={`ui-chat-composer__tool ui-chat-composer__expand${className ? ' ' + className : ''}`}
        >
          <Maximize2 aria-hidden />
        </button>
        <Drawer
          id={`${id}-drawer`}
          open={open}
          onClose={() => setOpen(false)}
          side={side}
        >
          <DrawerHeader
            id={`${id}-title`}
            title={title}
            onClose={() => setOpen(false)}
          />
          <DrawerBody>
            <textarea
              value={value}
              disabled={disabled}
              onChange={(e) => onValueChange?.(e.target.value)}
              placeholder="Write your message…"
              aria-label={title}
              className="ui-chat-composer__drawer-input"
            />
          </DrawerBody>
          <DrawerFooter>
            <Button
              id={`${id}-send`}
              variant="aiden"
              label={sendLabel}
              disabled={disabled || isStreaming || !canSend}
              onClick={() => {
                submit();
                setOpen(false);
              }}
            />
          </DrawerFooter>
        </Drawer>
      </>
    );
  },
);

ChatComposerDrawer.displayName = 'ChatComposerDrawer';

// ═════════════════════════════════════════════════════════════════════════════
// Layout — a full-height page shell: fixed header, scrollable body (holds the
// message list), docked composer footer. Provides `density` like the Chat root.
// ═════════════════════════════════════════════════════════════════════════════

const ChatLayout = forwardRef<HTMLDivElement, ChatLayoutProps>(
  ({ density = 'balanced', className, children, ...rest }, ref) => {
    const ctx = useMemo(() => ({ density }), [density]);
    return (
      <ChatContext.Provider value={ctx}>
        <div
          {...rest}
          ref={ref}
          data-density={density}
          className={`ui-chat-layout${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </ChatContext.Provider>
    );
  },
);

ChatLayout.displayName = 'ChatLayout';

const ChatLayoutHeader = forwardRef<HTMLDivElement, ChatLayoutHeaderProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-layout__header${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatLayoutHeader.displayName = 'ChatLayoutHeader';

const ChatLayoutBody = forwardRef<HTMLDivElement, ChatLayoutBodyProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-layout__body${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatLayoutBody.displayName = 'ChatLayoutBody';

const ChatLayoutFooter = forwardRef<HTMLDivElement, ChatLayoutFooterProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-layout__footer${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatLayoutFooter.displayName = 'ChatLayoutFooter';

export default Chat;
export {
  ChatMessageList,
  ChatMessage,
  ChatBubble,
  ChatMessageActions,
  ChatMarker,
  ChatComposer,
  ChatComposerInput,
  ChatComposerActions,
  ChatComposerSend,
  ChatComposerDictation,
  ChatComposerDrawer,
  ChatToolCalls,
  ChatToolCall,
  ChatSuggestions,
  ChatSuggestion,
  ChatLayout,
  ChatLayoutHeader,
  ChatLayoutBody,
  ChatLayoutFooter,
};
