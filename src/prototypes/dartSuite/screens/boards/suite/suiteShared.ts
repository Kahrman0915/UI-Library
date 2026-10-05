/* DartBoards · Suites — shared helpers.

   A suite is a team's curated set of library dashboards (see `Suite` in
   types.ts). Nothing here owns a dashboard: a suite only points at them, so the
   same dashboard still shows in Browse, in spaces and in other suites. */

import { HandCoins, Headset, Layers, ShieldAlert, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from '../../../../../components/Toast';
import type { SuiteState } from '../../../store';
import { useSuite } from '../../../store';
import type { Suite } from '../../../types';

/** The one mark a suite carries — its glyph, on a tile in its hue. That is the whole identity. */
const ICONS: Record<string, LucideIcon> = { servicing: Headset, risk: ShieldAlert, growth: TrendingUp, collections: HandCoins };
export const suiteIcon = (id: string): LucideIcon => ICONS[id] ?? Layers;

/** Every dashboard in a suite, once each, in section order. */
export const suiteDashboardIds = (suite: Suite): string[] => [...new Set(suite.sections.flatMap((s) => s.dashboardIds))];

/** Sections in reading order: the curator's "start here" section first, then the rest as authored. */
export const orderedSections = (suite: Suite) => {
  const start = suite.sections.find((s) => s.id === suite.startSectionId);
  return start ? [start, ...suite.sections.filter((s) => s !== start)] : suite.sections;
};

/* The size rules. Tuned against the 42-dashboard Collections suite:
   - past INLINE_SECTIONS, the section filter stops being a row and becomes a searchable picker;
   - past SIDEBAR_SECTIONS, the sidebar shows the first few and an "All sections" row;
   - past LIST_VIEW_AT dashboards, the suite opens in the list view (people scan a big suite);
   - the overview shows PREVIEW dashboards per section, then "View all" — but never
     to hide just one: a "View all" that reveals a single card costs more than the card. */
export const INLINE_SECTIONS = 6;
export const SIDEBAR_SECTIONS = 8;
export const LIST_VIEW_AT = 20;
export const PREVIEW = { grid: 4, rows: 3 } as const;

/** The suites a dashboard belongs to. */
export const suitesWith = (state: SuiteState, dashboardId: string): Suite[] =>
  state.suites.filter((s) => s.sections.some((sec) => sec.dashboardIds.includes(dashboardId)));

export const countLabel = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Following puts a suite in the DartBoards sidebar. It copies nothing. */
export function useFollowSuite(suite: Suite | undefined) {
  const { state, update } = useSuite();
  const following = !!suite && state.followedSuites.includes(suite.id);
  const toggle = () => {
    if (!suite) return;
    update((d) => {
      d.followedSuites = following ? d.followedSuites.filter((id) => id !== suite.id) : [...d.followedSuites, suite.id];
    });
    toast(following ? `Unfollowed ${suite.name}` : `Following ${suite.name}`, {
      description: following ? 'It is no longer in your sidebar.' : 'It is in your sidebar under Suites.',
    });
  };
  return { following, toggle };
}
