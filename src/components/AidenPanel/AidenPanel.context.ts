import { createContext, useContext } from 'react';

export type AidenPanelContextValue = {
  id: string;
  onClose: () => void;
  onExpand?: () => void;
};

// Throwing context, the composer-family pattern: a panel header outside a
// panel has no id to seed and no close to ask for.
export const AidenPanelContext = createContext<AidenPanelContextValue | null>(null);

export function useAidenPanelContext(): AidenPanelContextValue {
  const ctx = useContext(AidenPanelContext);
  if (!ctx) {
    throw new Error('AidenPanel subcomponents must be used inside <AidenPanel>.');
  }
  return ctx;
}
