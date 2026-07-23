import { createContext, useContext } from 'react';

export type MenubarContextValue = {
  id: string;
  /** Ordered list of registered menu values (DOM order). */
  values: string[];
  /** The value of the currently open menu, or null. */
  openValue: string | null;
  setOpenValue: (value: string | null) => void;
  /** The roving-tabindex focus target. */
  focusedValue: string | null;
  setFocusedValue: (value: string) => void;
  register: (value: string) => () => void;
  setNode: (value: string, node: HTMLElement | null) => void;
  /** Move the roving focus (and, if a menu is open, the open menu) by delta. */
  moveFocus: (delta: number) => void;
};

export const MenubarContext = createContext<MenubarContextValue | null>(null);

export const useMenubar = (): MenubarContextValue => {
  const ctx = useContext(MenubarContext);
  if (!ctx) {
    throw new Error('Menubar subcomponents must be used inside <Menubar>.');
  }
  return ctx;
};

export const MenubarMenuContext = createContext<{ value: string } | null>(null);

export const useMenubarMenu = (): { value: string } => {
  const ctx = useContext(MenubarMenuContext);
  if (!ctx) {
    throw new Error('MenubarTrigger/Content must be used inside <MenubarMenu>.');
  }
  return ctx;
};
