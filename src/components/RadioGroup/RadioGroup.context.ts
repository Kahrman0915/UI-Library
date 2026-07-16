import { createContext } from 'react';

export type RadioGroupContextValue = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  groupDisabled: boolean;
  groupRequired: boolean;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);
