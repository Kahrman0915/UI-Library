import { createContext } from 'react';
import type { TabBarActivationMode, TabBarMove } from './TabBar.types';

export type TabBarContextValue = {
  id: string;
  value: string | undefined;
  setValue: (value: string) => void;
  activationMode: TabBarActivationMode;
  onTabMove?: (move: TabBarMove) => void;
  /**
   * Set by `TabBarMenu` while it is mounted: opens the menu on its "New group"
   * form with these tabs checked. `TabBarNewGroupItem` (a tab's right-click menu)
   * calls it, which is how a group can start from the tab itself.
   */
  groupForm: { current: ((tabs?: string[]) => void) | null };
};

export const TabBarContext = createContext<TabBarContextValue | null>(null);

/** Set by `TabBarGroup` for the tabs it holds. */
export type TabBarGroupContextValue = {
  value: string;
  collapsed: boolean;
};

export const TabBarGroupContext = createContext<TabBarGroupContextValue | null>(null);

/** Set by `TabBarSplit`: whether either half is the open tab. */
export type TabBarSplitContextValue = {
  active: boolean;
};

export const TabBarSplitContext = createContext<TabBarSplitContextValue | null>(null);
