import { createContext, useContext } from 'react';
import type { ChatDensity, ChatSender } from './Chat.types';

// Root-level context: shared conversation settings that flow down to the list.
export type ChatContextValue = {
  density: ChatDensity;
};

export const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Reads the Chat root context. Non-throwing on purpose — chat parts are often
 * composed loosely (and in isolation in stories), so a missing provider falls
 * back to sensible defaults rather than erroring.
 */
export const useChatContext = (): ChatContextValue =>
  useContext(ChatContext) ?? { density: 'balanced' };

// Per-message context: lets ChatBubble / ChatMessageActions inherit the sender
// from their enclosing ChatMessage without re-passing it.
export type ChatMessageContextValue = {
  from: ChatSender;
};

export const ChatMessageContext =
  createContext<ChatMessageContextValue | null>(null);

export const useChatMessageContext = (): ChatMessageContextValue | null =>
  useContext(ChatMessageContext);

/**
 * A key interceptor sees the composer textarea's keydown BEFORE the built-in
 * Enter-sends handling. Return `true` to swallow the key (the input calls
 * preventDefault and stops). Registered by parts like `ChatComposerMenu`, so
 * ArrowUp/Down/Enter can drive an open menu instead of the transcript.
 */
export type ComposerKeyInterceptor = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
) => boolean;

// Composer context: the input state, shared to ChatComposerInput / …Send so
// they stay a single controlled source. Sub-parts require the provider.
export type ChatComposerContextValue = {
  value: string;
  onValueChange?: (value: string) => void;
  submit: () => void;
  disabled: boolean;
  isStreaming: boolean;
  onStop?: () => void;
  /**
   * Register a key interceptor; returns its unregister. Interceptors run in
   * registration order and the first `true` wins.
   */
  registerKeyInterceptor: (fn: ComposerKeyInterceptor) => () => void;
  /**
   * The live textarea element, populated by `ChatComposerInput`. Anchors
   * floating parts (`ChatComposerMenu`) and carries the caret for token
   * detection and insert-and-restore.
   */
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
};

export const ChatComposerContext =
  createContext<ChatComposerContextValue | null>(null);

export const useChatComposerContext = (): ChatComposerContextValue => {
  const ctx = useContext(ChatComposerContext);
  if (!ctx) {
    throw new Error(
      'ChatComposer subcomponents must be used inside <ChatComposer>.',
    );
  }
  return ctx;
};
