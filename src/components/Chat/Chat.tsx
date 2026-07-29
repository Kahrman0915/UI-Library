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
  Brain,
  Check,
  ChevronLeft,
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
  ChatMessageEditProps,
  ChatMessageVersionsProps,
  ChatReasoningProps,
  ChatCitationProps,
  ChatSourcesProps,
  ChatSourceProps,
  ChatGreetingProps,
} from './Chat.types';
import '../../styles/icon-button.scss';
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
          // Overridable defaults sit BEFORE the spread. role="log" makes the
          // transcript a live region (implicit aria-live=polite), so incoming
          // assistant messages are actually announced; tabIndex makes the
          // scroll container keyboard-reachable (WCAG 2.1.1 — a scrollable
          // region with no tab stop can't be scrolled without a mouse); the
          // label names the region a keyboard user lands in.
          role="log"
          aria-label="Chat messages"
          tabIndex={0}
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
      typingLabel = 'Assistant is typing',
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
          <span className="ui-chat-bubble__typing" aria-label={typingLabel}>
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
      className={`ui-icon-button ui-icon-button--fill ui-chat-composer__tool ui-chat-dictation${recording ? ' ui-chat-dictation--recording' : ''}${className ? ' ' + className : ''}`}
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
          className={`ui-icon-button ui-icon-button--fill ui-chat-composer__tool ui-chat-composer__expand${className ? ' ' + className : ''}`}
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

// ═════════════════════════════════════════════════════════════════════════════
// MessageEdit — inline editor for a message (typically a user turn). Enter saves,
// Shift+Enter is a newline, Escape cancels. Reuses .ui-input-wrap + autosize.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMessageEdit = forwardRef<HTMLTextAreaElement, ChatMessageEditProps>(
  (
    {
      defaultValue = '',
      value: valueProp,
      onValueChange,
      onSave,
      onCancel,
      saveLabel = 'Save',
      cancelLabel = 'Cancel',
      editLabel = 'Edit message',
      placeholder,
      maxRows = 10,
      className,
    },
    ref,
  ) => {
    const controlled = valueProp !== undefined;
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ? valueProp : internal;
    const autoRef = useAutosizeTextarea(value, { maxRows });
    const genId = useId();

    const setValue = (v: string) => {
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    };

    const setNode = useCallback(
      (node: HTMLTextAreaElement | null) => {
        autoRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [autoRef, ref],
    );

    const save = () => {
      if (value.trim()) onSave(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (
        e.key === 'Enter' &&
        !e.shiftKey &&
        !e.nativeEvent.isComposing
      ) {
        e.preventDefault();
        save();
      }
    };

    return (
      <div className={`ui-chat-edit${className ? ' ' + className : ''}`}>
        <div className="ui-input-wrap ui-chat-edit__wrap">
          <textarea
            ref={setNode}
            rows={1}
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="ui-input ui-chat-edit__input"
            aria-label={editLabel}
          />
        </div>
        <div className="ui-chat-edit__actions">
          <Button
            id={`${genId}-cancel`}
            style="ghost"
            size="small"
            label={cancelLabel}
            onClick={onCancel}
          />
          <Button
            id={`${genId}-save`}
            variant="aiden"
            size="small"
            label={saveLabel}
            disabled={!value.trim()}
            onClick={save}
          />
        </div>
      </div>
    );
  },
);

ChatMessageEdit.displayName = 'ChatMessageEdit';

// ═════════════════════════════════════════════════════════════════════════════
// MessageVersions — a ‹ 2 / 3 › pager for stepping through regenerated
// responses. Presentational: the consumer owns the versions array.
// ═════════════════════════════════════════════════════════════════════════════

const ChatMessageVersions = forwardRef<
  HTMLDivElement,
  ChatMessageVersionsProps
>(
  (
    {
      index,
      count,
      onPrevious,
      onNext,
      previousLabel = 'Previous version',
      nextLabel = 'Next version',
      className,
      ...rest
    },
    ref,
  ) => (
    <div
      // Default label sits BEFORE {...rest} so a consumer can localize it.
      aria-label="Response versions"
      {...rest}
      ref={ref}
      role="group"
      className={`ui-chat-versions${className ? ' ' + className : ''}`}
    >
      <button
        type="button"
        className="ui-chat-versions__nav"
        aria-label={previousLabel}
        disabled={index <= 1}
        onClick={onPrevious}
      >
        <ChevronLeft aria-hidden />
      </button>
      <span className="ui-chat-versions__count">
        {index} / {count}
      </span>
      <button
        type="button"
        className="ui-chat-versions__nav"
        aria-label={nextLabel}
        disabled={index >= count}
        onClick={onNext}
      >
        <ChevronRight aria-hidden />
      </button>
    </div>
  ),
);

ChatMessageVersions.displayName = 'ChatMessageVersions';

// ═════════════════════════════════════════════════════════════════════════════
// Reasoning — a collapsible "thinking" block (composes Collapsible). `thinking`
// shimmers the label while the model is still reasoning.
// ═════════════════════════════════════════════════════════════════════════════

const ChatReasoning = forwardRef<HTMLDivElement, ChatReasoningProps>(
  (
    {
      id: idProp,
      label,
      thinking = false,
      defaultOpen = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const text = label ?? (thinking ? 'Thinking…' : 'Reasoning');

    return (
      <Collapsible
        {...rest}
        ref={ref}
        id={id}
        defaultOpen={defaultOpen}
        data-thinking={thinking ? '' : undefined}
        className={`ui-chat-reasoning${className ? ' ' + className : ''}`}
      >
        <CollapsibleTrigger>
          <button type="button" className="ui-chat-reasoning__trigger">
            <Brain className="ui-chat-reasoning__icon" aria-hidden />
            <span
              className={`ui-chat-reasoning__label${thinking ? ' ui-chat-reasoning__label--thinking' : ''}`}
            >
              {text}
            </span>
            <ChevronRight className="ui-chat-reasoning__chevron" aria-hidden />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ui-chat-reasoning__body">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

ChatReasoning.displayName = 'ChatReasoning';

// ═════════════════════════════════════════════════════════════════════════════
// Citation — an inline source marker. Renders an <a> when href is given.
// ═════════════════════════════════════════════════════════════════════════════

const ChatCitation = forwardRef<
  HTMLAnchorElement | HTMLSpanElement,
  ChatCitationProps
>(({ index, href, className, children, ...rest }, ref) => {
  const content = children ?? index;
  const cls = `ui-chat-citation${className ? ' ' + className : ''}`;
  if (href) {
    return (
      <a
        {...rest}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
      >
        {content}
      </a>
    );
  }
  return (
    <span
      {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cls}
    >
      {content}
    </span>
  );
});

ChatCitation.displayName = 'ChatCitation';

// ═════════════════════════════════════════════════════════════════════════════
// Sources — a labeled group of source cards.
// ═════════════════════════════════════════════════════════════════════════════

const ChatSources = forwardRef<HTMLDivElement, ChatSourcesProps>(
  ({ label, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-sources${className ? ' ' + className : ''}`}
    >
      {label && <div className="ui-chat-sources__label">{label}</div>}
      <div className="ui-chat-sources__list">{children}</div>
    </div>
  ),
);

ChatSources.displayName = 'ChatSources';

const ChatSource = forwardRef<
  HTMLAnchorElement | HTMLDivElement,
  ChatSourceProps
>(({ href, index, title, domain, icon, className, ...rest }, ref) => {
  const cls = `ui-chat-source${className ? ' ' + className : ''}`;
  const body = (
    <>
      {index != null && <span className="ui-chat-source__index">{index}</span>}
      {icon && <span className="ui-chat-source__icon">{icon}</span>}
      <span className="ui-chat-source__body">
        <span className="ui-chat-source__title">{title}</span>
        {domain && <span className="ui-chat-source__domain">{domain}</span>}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        {...rest}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
      >
        {body}
      </a>
    );
  }
  return (
    <div
      {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      ref={ref as React.Ref<HTMLDivElement>}
      className={cls}
    >
      {body}
    </div>
  );
});

ChatSource.displayName = 'ChatSource';

// ═════════════════════════════════════════════════════════════════════════════
// Greeting — a centered conversation-start screen (title + subtitle + slot for
// a suggestions grid). Drop it in the message list when there are no messages.
// ═════════════════════════════════════════════════════════════════════════════

const ChatGreeting = forwardRef<HTMLDivElement, ChatGreetingProps>(
  ({ title, description, icon, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-greeting${className ? ' ' + className : ''}`}
    >
      {icon && <div className="ui-chat-greeting__icon">{icon}</div>}
      <h2 className="ui-chat-greeting__title">{title}</h2>
      {description && (
        <p className="ui-chat-greeting__description">{description}</p>
      )}
      {children && <div className="ui-chat-greeting__content">{children}</div>}
    </div>
  ),
);

ChatGreeting.displayName = 'ChatGreeting';

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
  ChatMessageEdit,
  ChatMessageVersions,
  ChatReasoning,
  ChatCitation,
  ChatSources,
  ChatSource,
  ChatGreeting,
};
