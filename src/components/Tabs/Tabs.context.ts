import { createContext } from 'react';
import type { TabsActivationMode, TabsOrientation } from './Tabs.types';

export type TabsContextValue = {
  id: string;
  value: string | undefined;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
};

export const TabsContext = createContext<TabsContextValue | null>(null);
