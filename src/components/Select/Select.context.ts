import { createContext } from 'react';
import type { SelectSize } from './Select.types';

export type SelectContextValue = {
  id: string;
  triggerId: string;
  contentId: string;
  open: boolean;
  toggle: () => void;
  close: () => void;
  value: string | undefined;
  setValue: (value: string) => void;
  placeholder?: React.ReactNode;
  disabled: boolean;
  required: boolean;
  size: SelectSize;
  error: boolean;
  /** Space-joined description/error ids for the trigger's aria-describedby. */
  describedBy: string | undefined;
  triggerNode: HTMLElement | null;
  setTriggerNode: (n: HTMLElement | null) => void;
  registerItem: (value: string, label: React.ReactNode) => () => void;
  getItemLabel: (value: string) => React.ReactNode;
};

export const SelectContext = createContext<SelectContextValue | null>(null);
