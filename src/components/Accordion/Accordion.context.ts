import { createContext } from 'react';

export type AccordionRootContextValue = {
  rootId: string;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
};

export const AccordionRootContext =
  createContext<AccordionRootContextValue | null>(null);

export type AccordionItemContextValue = {
  value: string;
  triggerId: string;
  contentId: string;
  open: boolean;
  disabled: boolean;
};

export const AccordionItemContext =
  createContext<AccordionItemContextValue | null>(null);
