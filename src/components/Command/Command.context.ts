import { createContext } from 'react';

export type CommandItemRegistration = {
  id: string;
  value: string;
  disabled: boolean;
  onSelect?: (value: string) => void;
};

export type CommandContextValue = {
  rootId: string;
  search: string;
  setSearch: (next: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  filter: (search: string, itemValue: string) => boolean;
  register: (item: CommandItemRegistration) => () => void;
  /** Returns true if the given item value matches the current search. */
  isVisible: (itemValue: string) => boolean;
  /**
   * Move active-item selection by delta (+1 / -1) or to bounds ("first" / "last").
   * Walks the visible items in DOM order.
   */
  move: (delta: number | 'first' | 'last') => void;
  /** Fire onSelect for the currently active item. */
  selectActive: () => void;
  /** Register the list container so keyboard navigation can walk its items. */
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  /**
   * Count of items that match the current search, updated after each render pass.
   * Used by CommandEmpty to decide whether to render.
   */
  visibleCount: number;
};

export const CommandContext = createContext<CommandContextValue | null>(null);
