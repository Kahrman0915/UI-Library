import { createContext } from 'react';

export type ProgressContextValue = {
  value: number;
  max: number;
  percent: number;
  indeterminate: boolean;
  valueFormatter: (
    percent: number,
    value: number,
    max: number,
  ) => React.ReactNode;
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);
