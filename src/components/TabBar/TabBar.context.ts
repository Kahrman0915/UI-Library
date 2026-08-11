import { createContext } from 'react';
import type { TabBarActivationMode } from './TabBar.types';

export type TabBarContextValue = {
  id: string;
  value: string | undefined;
  setValue: (value: string) => void;
  activationMode: TabBarActivationMode;
};

export const TabBarContext = createContext<TabBarContextValue | null>(null);
