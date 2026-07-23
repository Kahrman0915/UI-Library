import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ArrowDown } from 'lucide-react';
import {
  ChatContext,
  ChatMessageContext,
  useChatContext,
  useChatMessageContext,
} from './Chat.context';
import { useStickToBottom } from '../../hooks/useStickToBottom';
import StatusDot from '../StatusDot/StatusDot';
import type {
  ChatBubbleProps,
  ChatMarkerProps,
  ChatMessageActionsProps,
  ChatMessageListProps,
  ChatMessageProps,
  ChatProps,
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
  ({ from: fromProp, pending = false, className, children, ...rest }, ref) => {
    const msgCtx = useChatMessageContext();
    const from = fromProp ?? msgCtx?.from ?? 'assistant';
    return (
      <div
        {...rest}
        ref={ref}
        data-from={from}
        aria-busy={pending || undefined}
        className={`ui-chat-bubble ui-chat-bubble--${from}${pending ? ' ui-chat-bubble--pending' : ''}${className ? ' ' + className : ''}`}
      >
        {pending ? (
          <span className="ui-chat-bubble__typing" aria-label="Assistant is typing">
            <span className="ui-chat-bubble__dot" />
            <span className="ui-chat-bubble__dot" />
            <span className="ui-chat-bubble__dot" />
          </span>
        ) : (
          children
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

export default Chat;
export {
  ChatMessageList,
  ChatMessage,
  ChatBubble,
  ChatMessageActions,
  ChatMarker,
};
