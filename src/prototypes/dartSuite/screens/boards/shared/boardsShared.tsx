/* DartBoards · small shared parts for Browse, the Dashboard viewer and the
   three dialogs they open (Add to space, Dashboard info, How to get access). */

import { toast } from '../../../../../components/Toast';
import { seriesFor } from '../../../data';
import type { SuiteState } from '../../../store';
import type { Dashboard, Space } from '../../../types';
import './BoardsShared.scss';

/** The person's own spaces — shared spaces are read-only and never take an add. */
export const ownSpaces = (state: SuiteState): Space[] => state.spaces.filter((s) => !s.shared);

/** Own spaces that already hold this dashboard. */
export const spacesWith = (state: SuiteState, dashboardId: string): Space[] =>
  ownSpaces(state).filter((s) => s.items.some((i) => i.dashboardId === dashboardId));

/**
 * B1.4: "Add to space" is unavailable ONLY when every space you can add to
 * already holds the dashboard. Being in several spaces is fine.
 */
export const addUnavailable = (state: SuiteState, dashboardId: string): boolean => {
  const own = ownSpaces(state);
  return own.length > 0 && own.every((s) => s.items.some((i) => i.dashboardId === dashboardId));
};

/** Sample audience line for a space row ("Shared with 4 people" / "Only you"). */
export const spaceAudience = (space: Space): string => {
  const n = seriesFor(space.id, 1)[0] % 32;
  return n < 6 ? 'Only you' : `Shared with ${n} people`;
};

/**
 * When a dashboard was last updated. The seed data carries one date for all of
 * them, so each is offset by a stable number of days — enough for "Recently
 * updated" to be a real sort. Shown everywhere a date is shown.
 */
export const updatedOn = (d: Dashboard): Date => {
  const base = new Date(d.updatedAt);
  const t = Number.isNaN(base.getTime()) ? new Date(2026, 8, 18) : base;
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() - (seriesFor(d.id, 1)[0] % 45));
};

export const updatedLabel = (d: Dashboard) =>
  updatedOn(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** The link a dashboard is shared by. Sample only. */
export const dashboardLink = (d: Dashboard) => `https://dartcentral.example.com/boards/dashboards/${d.id}`;

/** Copy a dashboard's link and confirm it. Clipboard can be refused; the toast still says where it points. */
export const copyDashboardLink = (d: Dashboard) => {
  const url = dashboardLink(d);
  try {
    void navigator.clipboard?.writeText(url).catch(() => undefined);
  } catch {
    /* clipboard unavailable in this frame — the toast still names the link */
  }
  toast.success('Link copied', { description: url });
};

/** A dashboard's thumbnail — a tinted tile with a small bar chart drawn from its series. */
export function DashboardThumb({ dashboard, size = 'card' }: { dashboard: Dashboard; size?: 'card' | 'row' }) {
  const series = seriesFor(dashboard.id, size === 'card' ? 10 : 7);
  return (
    <div className={`ds-boards-thumb ds-boards-thumb--${size} ds-boards-hue--${dashboard.hue}`} aria-hidden="true">
      <div className="ds-boards-thumb__bars">
        {series.map((v, i) => (
          <span key={i} className="ds-boards-thumb__bar" style={{ height: `${v}%` }} />
        ))}
      </div>
    </div>
  );
}
