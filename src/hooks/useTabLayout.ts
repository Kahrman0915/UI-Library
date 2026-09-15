import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CategoryColor } from '../types/GlobalTypes';

/** A tab group in a saved layout. */
export type TabLayoutGroup = {
  id: string;
  label: string;
  color: CategoryColor;
  collapsed: boolean;
};

/**
 * Everything about the tab strip that should survive a reload, and nothing that
 * cannot be written to storage: tab `value`s only. Labels and icons are the app's
 * data, looked up by value when rendering.
 */
export type TabLayoutState = {
  /** Every open tab, in bar order. */
  tabs: string[];
  /** The selected tab. */
  active: string | null;
  groups: TabLayoutGroup[];
  /** Tab value → group id, for grouped tabs only. */
  groupOf: Record<string, string>;
  /** The two tabs open side by side, start then end. One split at a time. */
  split: [string, string] | null;
};

/** A tab, or a split pair, as it renders inside or outside a group. */
export type TabLayoutItem =
  | { type: 'tab'; value: string }
  | { type: 'split'; values: [string, string] };

/** The bar in render order: loose items and groups of items. */
export type TabLayoutSegment =
  | TabLayoutItem
  | { type: 'group'; group: TabLayoutGroup; items: TabLayoutItem[] };

export type UseTabLayoutOptions = {
  /** The layout to start from when nothing is saved. `tabs` is required. */
  initial: Partial<TabLayoutState> & { tabs: string[] };
  /**
   * localStorage key. Omit it and the layout lives in memory only. Use one key per
   * application, so each app reopens with its own tabs.
   */
  storageKey?: string;
};

const STORAGE_VERSION = 1;

const EMPTY: TabLayoutState = { tabs: [], active: null, groups: [], groupOf: {}, split: null };

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

/** A saved layout is trusted only if every field has the right shape. */
const parse = (raw: string | null): TabLayoutState | null => {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { v?: number; state?: Partial<TabLayoutState> };
    const s = data?.state;
    if (data?.v !== STORAGE_VERSION || !s || !isStringArray(s.tabs)) return null;
    if (s.active !== null && typeof s.active !== 'string') return null;
    if (!Array.isArray(s.groups) || typeof s.groupOf !== 'object' || s.groupOf === null) return null;
    if (s.split !== null && !(isStringArray(s.split) && s.split.length === 2)) return null;
    return normalize({ ...EMPTY, ...s } as TabLayoutState);
  } catch {
    return null;
  }
};

/** The unit a tab moves as: its split pair if it has one, else itself. */
const unitOf = (state: TabLayoutState, value: string): string[] =>
  state.split?.includes(value) ? [...state.split] : [value];

/**
 * Restores the invariants every operation relies on, so each operation can be
 * written simply and still leave a valid layout:
 * - no duplicate or dangling values
 * - a group's tabs sit together, at the position of its first tab
 * - a split pair sits together, start before end, in one group or none
 * - groups with no tabs are dropped
 * - `active` is an open tab, or null when nothing is open
 */
const normalize = (input: TabLayoutState): TabLayoutState => {
  const tabs = Array.from(new Set(input.tabs));
  const open = new Set(tabs);

  let split = input.split;
  if (split && (!open.has(split[0]) || !open.has(split[1]) || split[0] === split[1])) split = null;

  const groupIds = new Set(input.groups.map((g) => g.id));
  const groupOf: Record<string, string> = {};
  for (const [tab, g] of Object.entries(input.groupOf)) {
    if (open.has(tab) && groupIds.has(g)) groupOf[tab] = g;
  }
  if (split) {
    const g = groupOf[split[0]];
    if (g) groupOf[split[1]] = g;
    else delete groupOf[split[1]];
  }

  // Rebuild the order: walk it, and on the first tab of a group or split emit the
  // whole group (with any pair kept together inside it).
  const ordered: string[] = [];
  const placed = new Set<string>();
  const emit = (v: string) => {
    if (placed.has(v)) return;
    const pair = split?.includes(v) ? split : null;
    for (const x of pair ?? [v]) {
      if (!placed.has(x)) {
        placed.add(x);
        ordered.push(x);
      }
    }
  };
  for (const tab of tabs) {
    if (placed.has(tab)) continue;
    const g = groupOf[tab];
    if (g) tabs.filter((t) => groupOf[t] === g).forEach(emit);
    else emit(tab);
  }

  const used = new Set(Object.values(groupOf));
  const groups = input.groups.filter((g) => used.has(g.id));
  const active = input.active && open.has(input.active) ? input.active : ordered[0] ?? null;

  return { tabs: ordered, active, groups, groupOf, split };
};

const toItems = (state: TabLayoutState, values: string[]): TabLayoutItem[] => {
  const items: TabLayoutItem[] = [];
  for (const v of values) {
    if (state.split && v === state.split[1]) continue;
    items.push(state.split && v === state.split[0] ? { type: 'split', values: state.split } : { type: 'tab', value: v });
  }
  return items;
};

let groupCounter = 0;

/**
 * The tab strip's layout — order, groups, the open tab and the split — held in one
 * serialisable object and saved to localStorage, so every application reopens where
 * its user left it. `TabBar` and `SplitView` report intent; this applies it.
 *
 * Render from `segments`: each is a loose tab, a split pair, or a group of those,
 * already in bar order.
 */
export function useTabLayout({ initial, storageKey }: UseTabLayoutOptions) {
  const [state, setState] = useState<TabLayoutState>(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = parse(window.localStorage.getItem(storageKey));
        if (saved) return saved;
      } catch {
        /* storage unavailable — fall through to the initial layout */
      }
    }
    return normalize({ ...EMPTY, ...initial });
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ v: STORAGE_VERSION, state }));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [state, storageKey]);

  const update = useCallback(
    (fn: (s: TabLayoutState) => TabLayoutState) => setState((s) => normalize(fn(s))),
    [],
  );

  /** Select a tab. */
  const select = useCallback((value: string) => update((s) => ({ ...s, active: value })), [update]);

  /** Open a tab (or select it if already open), after `after` or after the active tab. */
  const open = useCallback(
    (value: string, options: { after?: string; group?: string } = {}) =>
      update((s) => {
        if (s.tabs.includes(value)) return { ...s, active: value };
        const anchor = options.after ?? s.active;
        const unit = anchor ? unitOf(s, anchor) : [];
        const at = anchor ? s.tabs.indexOf(unit[unit.length - 1]) + 1 : s.tabs.length;
        const tabs = [...s.tabs];
        tabs.splice(at > 0 ? at : tabs.length, 0, value);
        const groupOf = { ...s.groupOf };
        const group = options.group ?? (anchor ? s.groupOf[anchor] : undefined);
        if (group) groupOf[value] = group;
        return { ...s, tabs, groupOf, active: value };
      }),
    [update],
  );

  /** Close a tab. The neighbour to its end is selected, or the one before it. */
  const close = useCallback(
    (value: string) =>
      update((s) => {
        const i = s.tabs.indexOf(value);
        if (i < 0) return s;
        const tabs = s.tabs.filter((t) => t !== value);
        const active = s.active === value ? tabs[i] ?? tabs[i - 1] ?? null : s.active;
        const split = s.split?.includes(value) ? null : s.split;
        return { ...s, tabs, active, split };
      }),
    [update],
  );

  /** Close every tab except `value`. */
  const closeOthers = useCallback(
    (value: string) => update((s) => ({ ...s, tabs: [value], active: value, split: null })),
    [update],
  );

  /**
   * Move a tab — the shape `TabBar`'s `onTabMove` reports. A tab in a split moves with
   * its partner; `group: null` takes it out of its group.
   */
  const move = useCallback(
    ({ value, before, group }: { value: string; before: string | null; group: string | null }) =>
      update((s) => {
        if (!s.tabs.includes(value)) return s;
        const unit = unitOf(s, value);
        let target = before;
        // Dropped between its own halves, or onto itself: stay put, change group only.
        if (target && unit.includes(target)) target = s.tabs[s.tabs.indexOf(unit[unit.length - 1]) + 1] ?? null;
        // Dropped between the halves of another split: land after that pair.
        if (target && s.split && target === s.split[1] && !unit.includes(s.split[0])) {
          target = s.tabs[s.tabs.indexOf(s.split[1]) + 1] ?? null;
        }
        const rest = s.tabs.filter((t) => !unit.includes(t));
        const at = target ? rest.indexOf(target) : rest.length;
        rest.splice(at < 0 ? rest.length : at, 0, ...unit);
        const groupOf = { ...s.groupOf };
        for (const t of unit) {
          if (group) groupOf[t] = group;
          else delete groupOf[t];
        }
        return { ...s, tabs: rest, groupOf };
      }),
    [update],
  );

  /** Move a tab one step toward the start (-1) or end (+1) — the keyboard route. */
  const shift = useCallback(
    (value: string, delta: -1 | 1) =>
      update((s) => {
        const unit = unitOf(s, value);
        const rest = s.tabs.filter((t) => !unit.includes(t));
        const from = s.tabs.indexOf(unit[0]);
        const at = Math.max(0, Math.min(rest.length, from + delta));
        rest.splice(at, 0, ...unit);
        return { ...s, tabs: rest };
      }),
    [update],
  );

  /** Put tabs in a new group. Returns the group's id. */
  const createGroup = useCallback(
    (values: string[], group: { label: string; color?: CategoryColor }) => {
      groupCounter += 1;
      const id = `group-${Date.now().toString(36)}-${groupCounter}`;
      update((s) => {
        const groupOf = { ...s.groupOf };
        for (const v of values.flatMap((v) => unitOf(s, v))) groupOf[v] = id;
        return {
          ...s,
          groupOf,
          groups: [...s.groups, { id, label: group.label, color: group.color ?? 'blue', collapsed: false }],
        };
      });
      return id;
    },
    [update],
  );

  /** Rename, recolour or collapse a group. */
  const updateGroup = useCallback(
    (id: string, patch: Partial<Omit<TabLayoutGroup, 'id'>>) =>
      update((s) => ({ ...s, groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
    [update],
  );

  /** Add a tab (and its split partner) to an existing group. */
  const addToGroup = useCallback(
    (value: string, groupId: string) =>
      update((s) => {
        const groupOf = { ...s.groupOf };
        for (const t of unitOf(s, value)) groupOf[t] = groupId;
        return { ...s, groupOf };
      }),
    [update],
  );

  /** Take a tab (and its split partner) out of its group. */
  const removeFromGroup = useCallback(
    (value: string) =>
      update((s) => {
        const groupOf = { ...s.groupOf };
        for (const t of unitOf(s, value)) delete groupOf[t];
        return { ...s, groupOf };
      }),
    [update],
  );

  /** Dissolve a group, keeping its tabs open. */
  const ungroup = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        groupOf: Object.fromEntries(Object.entries(s.groupOf).filter(([, g]) => g !== id)),
      })),
    [update],
  );

  /** Close a group and every tab in it. */
  const closeGroup = useCallback(
    (id: string) =>
      update((s) => {
        const closing = new Set(s.tabs.filter((t) => s.groupOf[t] === id));
        const tabs = s.tabs.filter((t) => !closing.has(t));
        const active = s.active && closing.has(s.active) ? tabs[0] ?? null : s.active;
        return { ...s, tabs, active };
      }),
    [update],
  );

  /**
   * Open two tabs side by side. `value` goes on `side` and the other open tab takes
   * the other half: the half it did not land on if a split is on screen, else the
   * selected tab.
   * Pass `other` to choose it. The tab that was dropped or chosen becomes selected.
   */
  const split = useCallback(
    (value: string, side: 'start' | 'end' = 'end', other?: string) =>
      update((s) => {
        let tabs = s.tabs.includes(value) ? s.tabs : [...s.tabs, value];
        // Only a split that is on screen donates its other half; otherwise the new pair
        // is the dropped tab and the tab being shown.
        const onScreen = s.split && s.active && s.split.includes(s.active) ? s.split : null;
        const keep =
          other ??
          (onScreen
            ? onScreen.includes(value)
              ? onScreen.find((v) => v !== value)
              : onScreen[side === 'start' ? 1 : 0]
            : s.active);
        if (!keep || keep === value) return { ...s, tabs, active: value };
        tabs = tabs.includes(keep) ? tabs : [...tabs, keep];
        const pair: [string, string] = side === 'start' ? [value, keep] : [keep, value];
        // The dropped tab joins whatever group the tab on screen is in.
        const groupOf = { ...s.groupOf };
        if (s.groupOf[keep]) groupOf[value] = s.groupOf[keep];
        else delete groupOf[value];
        // The pair lands where the tab that was already on screen sits.
        const rest = tabs.filter((t) => t !== value);
        rest.splice(rest.indexOf(keep) + (side === 'start' ? 0 : 1), 0, value);
        return { ...s, tabs: rest, groupOf, split: pair, active: value };
      }),
    [update],
  );

  /** Close the split view, keeping both tabs open. */
  const unsplit = useCallback(() => update((s) => ({ ...s, split: null })), [update]);

  /** Forget the saved layout and return to `initial`. */
  // `initial` is read once, like useState's initial value, so an inline object literal
  // does not recreate this callback on every render.
  const [initialLayout] = useState(initial);
  const reset = useCallback(() => setState(normalize({ ...EMPTY, ...initialLayout })), [initialLayout]);

  const segments = useMemo<TabLayoutSegment[]>(() => {
    const out: TabLayoutSegment[] = [];
    let i = 0;
    while (i < state.tabs.length) {
      const id = state.groupOf[state.tabs[i]];
      if (!id) {
        out.push(...toItems(state, [state.tabs[i]]));
        i += state.split && state.tabs[i] === state.split[0] ? 2 : 1;
        continue;
      }
      const run: string[] = [];
      while (i < state.tabs.length && state.groupOf[state.tabs[i]] === id) run.push(state.tabs[i++]);
      const group = state.groups.find((g) => g.id === id);
      if (group) out.push({ type: 'group', group, items: toItems(state, run) });
    }
    return out;
  }, [state]);

  return {
    state,
    segments,
    select,
    open,
    close,
    closeOthers,
    move,
    shift,
    createGroup,
    updateGroup,
    addToGroup,
    removeFromGroup,
    ungroup,
    closeGroup,
    split,
    unsplit,
    reset,
  };
}

export type UseTabLayoutResult = ReturnType<typeof useTabLayout>;
