/* DartBoards · external charts — the one way out.

   An external chart lives in its BI tool. The rules, everywhere it appears:
   1. It is MARKED before the click — "Tableau ↗" on the card, "Open in Tableau"
      on the button, "(opens in a new tab)" to a screen reader.
   2. It opens in a NEW BROWSER TAB, never in place of DartBoards, so the way
      back is simply closing that tab: every DartBoards tab, filter and scroll
      position is where it was left.
   3. Leaving says so, and offers the one thing worth doing on the way out —
      keeping the chart in a space, so next time it is one click away.
   4. The CARD itself goes to the chart's DartBoards details page, not out. Only
      the explicit "Open in …" button leaves, so a stray click never does. */

import { ExternalLink } from 'lucide-react';
import Badge from '../../../../../components/Badge';
import { useSuite } from '../../../store';
import type { Dashboard } from '../../../types';
import { useUi } from '../../../ui';

export const isExternal = (d: Dashboard) => !!d.external;

/** "Open in Tableau" and its accessible name. */
export const openLabel = (d: Dashboard) => `Open in ${d.source}`;
export const openAriaLabel = (d: Dashboard) => `Open ${d.name} in ${d.source} (opens in a new tab)`;

export function useOpenExternal() {
  const ui = useUi();
  const { logActivity } = useSuite();
  // One message per BI tool — Tableau once, Power BI once — then straight through.
  return (d: Dashboard) => {
    logActivity(`opened in ${d.source}`, d.name);
    ui.leave({ dest: `external:${d.source}`, kindLabel: `${d.source} charts`, name: d.name, url: d.external?.url ?? 'https://example.com', site: d.source });
  };
}

/** The "Tableau ↗" tag. */
export function ExternalTag({ d, className }: { d: Dashboard; className?: string }) {
  return (
    <Badge
      id={`ds-external-tag-${d.id}`}
      className={className}
      label={d.source}
      IconLeft={ExternalLink}
      color="default"
      appearance="solid"
      title={`Opens in ${d.source}`}
    />
  );
}
