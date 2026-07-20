import { createContext } from 'react';
import type { ToggleVariant, ToggleSize } from '../Toggle/Toggle.types';

export type ToggleGroupContextValue = {
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
  variant: ToggleVariant;
  size: ToggleSize;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(
  null,
);
