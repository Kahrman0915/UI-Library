import { createContext } from 'react';

export type PointerPosition = { x: number; y: number };

export type ContextMenuRootContextValue = {
  rootId: string;
  open: boolean;
  pointerPosition: PointerPosition | null;
  openAt: (x: number, y: number) => void;
  close: () => void;
  longPressDelay: number;
};

export const ContextMenuRootContext =
  createContext<ContextMenuRootContextValue | null>(null);

export type RadioGroupContextValue = {
  value: string | undefined;
  setValue: (v: string) => void;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);

export type ContextMenuSubContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openWithDelay: () => void;
  cancelOpen: () => void;
  triggerNode: HTMLElement | null;
  setTriggerNode: (n: HTMLElement | null) => void;
};

export const ContextMenuSubContext =
  createContext<ContextMenuSubContextValue | null>(null);
