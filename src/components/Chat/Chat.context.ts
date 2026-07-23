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
