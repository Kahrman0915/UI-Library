/* ── Tab sets · the Notion tab-group model, as demo state ─────────────────────
   Story-only helper (not exported from src/index.ts). A tab GROUP is a named set
   of tabs, and the bar shows ONE set at a time: the window's ungrouped tabs, or
   one group. `TabBarMenu` is the switcher. This hook owns every set's tabs, the
   real recently-closed list and the group operations, and hands `TabBarMenu`
   everything it needs through `menuProps`.

   Shared by the TabBar and AppShell stories so both run the same model rather
   than two drifting copies. A set's own ordering and split view stay with
   `useTabLayout` in the frame that renders it; the frame reports its tabs back
   with `reportSet`, so the menu can search them from any other set. */

import { useState } from 'react';
import type { CategoryColor } from '../types/GlobalTypes';
import type { TabBarMenuItem, TabBarMenuProps, TabBarNewGroup } from '../components/TabBar/TabBar.types';

export const WINDOW = 'window';

/**
 * The "+" opens a blank "New tab", as a browser does — it always works, and
 * reopening a closed tab is the tab menu's job (Recently closed), not the "+".
 */
let newTabSeq = 0;
export const newTabValue = () => `new-${++newTabSeq}`;
export const isNewTab = (value: string) => value.startsWith('new-');

export type TabSetGroup = { value: string; label: string; color: CategoryColor };
export type TabSet = { tabs: string[]; active: string };

export type UseTabSetsOptions = {
  groups: TabSetGroup[];
  /** Keyed by group value; `WINDOW` is the ungrouped tabs. */
  sets: Record<string, TabSet>;
  /** A tab every set keeps (Home). Never moved into a group, never closed with one. */
  pinned?: string;
  /** How a tab value reads in the menu. */
  item: (value: string) => Omit<TabBarMenuItem, 'groupable'>;
  /** Called after a create or a move, e.g. to toast. */
  notify?: (title: string, description?: string) => void;
  /** Tabs already in Recently closed when the demo opens, newest first. */
  closed?: string[];
};

export function useTabSets({ groups: initialGroups, sets: initialSets, pinned, item, notify, closed: initialClosed = [] }: UseTabSetsOptions) {
  const [groups, setGroups] = useState<TabSetGroup[]>(initialGroups);
  const [sets, setSets] = useState<Record<string, TabSet>>(initialSets);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [closed, setClosed] = useState<string[]>(initialClosed);
  const key = activeGroup ?? WINDOW;

  const menuItem = (v: string): TabBarMenuItem => ({ ...item(v), groupable: v !== pinned });
  const groupName = (value: string | null) => (value ? groups.find((g) => g.value === value)?.label : 'Ungrouped tabs');

  /** A new group takes the chosen tabs OUT of the set on screen; the pinned tab stays in every set. */
  const createGroup = ({ label, color, tabs }: TabBarNewGroup) => {
    let n = groups.length + 1;
    while (groups.some((g) => g.value === `group-${n}`)) n++;
    const value = `group-${n}`;
    const moved = tabs.filter((t) => t !== pinned);
    setSets((all) => {
      const from = all[key];
      const rest = from.tabs.filter((t) => !moved.includes(t));
      return {
        ...all,
        [key]: { tabs: rest, active: rest.includes(from.active) ? from.active : rest[0] },
        [value]: { tabs: [...(pinned ? [pinned] : []), ...moved], active: moved[0] ?? pinned ?? '' },
      };
    });
    setGroups((gs) => [...gs, { value, label, color }]);
    setActiveGroup(value);
    notify?.(`Created ${label}`, moved.length ? `${moved.length} ${moved.length === 1 ? 'tab' : 'tabs'} moved into it.` : 'Open tabs here to fill it.');
  };

  /** Move one tab from the set on screen into another set (`null` = ungrouped). You stay put. */
  const moveTab = (tab: string, target: string | null) => {
    const to = target ?? WINDOW;
    setSets((all) => {
      const from = all[key];
      const rest = from.tabs.filter((t) => t !== tab);
      const dest = all[to];
      return {
        ...all,
        [key]: { tabs: rest, active: from.active === tab ? rest[0] : from.active },
        [to]: { ...dest, tabs: dest.tabs.includes(tab) ? dest.tabs : [...dest.tabs, tab] },
      };
    });
    notify?.(`Moved to ${groupName(target)}`, item(tab).label);
  };

  const removeGroup = (value: string, keepTabs: boolean) => {
    if (keepTabs) {
      // Ungroup: the group's tabs join the ungrouped tabs, without duplicates.
      setSets((all) => {
        const win = all[WINDOW];
        const moved = (all[value]?.tabs ?? []).filter((t) => !win.tabs.includes(t));
        const { [value]: _gone, ...rest } = all;
        return { ...rest, [WINDOW]: { ...win, tabs: [...win.tabs, ...moved] } };
      });
    } else {
      setClosed((c) => [...(sets[value]?.tabs ?? []).filter((t) => t !== pinned), ...c]);
      setSets(({ [value]: _gone, ...rest }) => rest);
    }
    setGroups((gs) => gs.filter((g) => g.value !== value));
    if (activeGroup === value) setActiveGroup(null);
  };

  const menuProps: Omit<TabBarMenuProps, 'tabs' | 'recentlyClosed' | 'onReopen'> = {
    groups: groups.map((g) => ({ value: g.value, label: g.label, color: g.color, tabs: (sets[g.value]?.tabs ?? []).map(menuItem) })),
    activeGroup,
    onSelectGroup: setActiveGroup,
    ungroupedTabs: sets[WINDOW].tabs.map(menuItem),
    onOpenTab: (tab, target) => {
      const setKey = target ?? WINDOW;
      setSets((all) => ({ ...all, [setKey]: { ...all[setKey], active: tab } }));
      setActiveGroup(target);
    },
    onCreateGroup: createGroup,
    onRecolorGroup: (value, color) => setGroups((gs) => gs.map((g) => (g.value === value ? { ...g, color } : g))),
    onRenameGroup: (value, label) => setGroups((gs) => gs.map((g) => (g.value === value ? { ...g, label } : g))),
    onUngroup: (value) => removeGroup(value, true),
    onDeleteGroup: (value) => removeGroup(value, false),
  };

  return {
    /** The set on screen: key it on the frame so switching remounts with that set's tabs. */
    key,
    set: sets[key],
    groups,
    activeGroup,
    closed,
    menuProps,
    menuItem,
    moveTab,
    /** The frame reports its tabs whenever they change (order, open, close). */
    reportSet: (next: TabSet) => setSets((all) => ({ ...all, [key]: next })),
    onClosed: (tab: string) => setClosed((c) => [tab, ...c.filter((x) => x !== tab)]),
    onReopened: (tab: string) => setClosed((c) => c.filter((x) => x !== tab)),
  };
}

export type TabSets = ReturnType<typeof useTabSets>;
