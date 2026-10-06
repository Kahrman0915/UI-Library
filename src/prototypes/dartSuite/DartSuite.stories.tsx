import type { Meta, StoryObj } from '@storybook/react';
import { NavProvider } from './nav';
import { SuiteProvider } from './store';
import { UiProvider } from './ui';
import { Shell } from './Shell';
import { Router } from './screens/Router';
import { AidenHost } from './screens/aiden/AidenHost';
import type { Route } from './types';
import './DartSuite.scss';

const meta: Meta = {
  title: 'Prototypes/Prototype',
  // The theme is a Storybook global, not a wrapper attribute: dialogs, menus and
  // toasts portal to <body>, and a wrapper's data-theme never reaches them. The
  // preview decorator writes this onto <html>, so portals are themed too. The
  // user's own pick (account menu → Theme, see ui.tsx) then takes over.
  globals: { theme: 'db' },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Every flow in the Figma file as ONE clickable prototype: DART Central (home, Open items, the request ' +
        'flow and the whole admin side), DartBoards (Browse, spaces, the Builder and the dashboard viewer) and ' +
        'Aiden on top of both.\n\n' +
        '**It is one application, not a gallery of screens.** The tab strip is the router: every page opens in a ' +
        'tab, the sidebar follows the active tab, and a single in-memory store connects the halves of every loop — ' +
        'a request you file appears in the admin queue, approving it changes what the requester sees, a dashboard ' +
        'you add to a space appears on that space.\n\n' +
        '**Switch who you are from the account menu** (Prototype · act as) to see the requester, overall-admin, ' +
        'sub-admin and Aiden-only admin sidebars. **Pick your theme there too** (Theme): one of the six built themes for ' +
        'the whole suite, every application and the rail included — not one per application. Indigo by default; the pick ' +
        'is remembered, and every chart follows it. **A single chart can be set to another color** from the palette ' +
        'button on its card (Usage Analytics has two) — that pick is saved with the content, so every reader sees the ' +
        'same chart in the same color. All data is sample data and resets on reload.\n\n' +
        'Built only from `@ui/lib` components; anything Figma names `Pattern/*` is composed at the call site.',
      tags: ['prototype', 'end to end', 'dummy data'],
    },
  },
};

export default meta;
type Story = StoryObj;

function Suite({ start, signedInAs }: { start?: Route; signedInAs?: string }) {
  return (
    <div style={{ height: '100vh' }}>
      <SuiteProvider signedInAs={signedInAs}>
        <NavProvider initial={start}>
          <UiProvider>
            <Shell aiden={<AidenHost />}>
              <Router />
            </Shell>
          </UiProvider>
        </NavProvider>
      </SuiteProvider>
    </div>
  );
}

/** Start at DART Central Home, the fixed first tab. */
export const App: Story = { render: () => <Suite /> };

/** Start on Open items — everything a person is working on or waiting on, every app (Request Flow R1.1). */
export const StartAtMyRequests: Story = { name: 'Start · Open items', render: () => <Suite start={{ page: 'my-requests' }} /> };

/** Start on the admin overview (Admin Flow 1.1). */
export const StartAtAdmin: Story = { name: 'Start · Admin Overview', render: () => <Suite start={{ page: 'admin-overview' }} /> };

/** Start in DartBoards on Browse (Browse B1.1). */
export const StartAtBrowse: Story = { name: 'Start · Browse', render: () => <Suite start={{ page: 'browse' }} /> };

/** Start on What's New, where the DartBoards tour opens over the page (What's New W3.1). */
/** Start inside a team suite — Browse scoped to the Servicing team's dashboards. */
export const StartAtSuite: Story = { name: 'Start · Suite', render: () => <Suite start={{ page: 'browse', suite: 'servicing' }} /> };

/** A LARGE suite — 42 dashboards in 11 sections, from a team whose own navigation was nested. */
export const StartAtLargeSuite: Story = { name: 'Start · Large suite', render: () => <Suite start={{ page: 'browse', suite: 'collections' }} /> };

/** A NATIVE dashboard — built with the design system, rendered by DartBoards, following the suite's filters. */
export const StartAtNativeDashboard: Story = {
  name: 'Start · Native dashboard',
  render: () => <Suite start={{ page: 'dashboard', id: 'col-daily-summary' }} />,
};

/** An EXTERNAL chart's details page — it lives in Tableau and opens there, in a new tab. */
export const StartAtExternalChart: Story = {
  name: 'Start · External chart',
  render: () => <Suite start={{ page: 'dashboard', id: 'col-delinquency-region' }} />,
};

/** Publish a finished IRM report to DartBoards — pick the IRM record, then set how it is listed. */
export const StartAtPublishRequest: Story = {
  name: 'Start · Publish to DartBoards',
  render: () => <Suite start={{ page: 'request-form', kind: 'dashboard', mode: 'add' }} />,
};

/** The Builder on a new space — it lands on ALL: dashboards, widgets, metrics, workflows and reports. */
export const StartAtBuilder: Story = { name: 'Start · Builder', render: () => <Suite start={{ page: 'builder' }} /> };

/** Marketplace › Reports — web reports, which open outside DART Central in a new tab. */
export const StartAtReports: Story = { name: 'Start · Reports', render: () => <Suite start={{ page: 'reports' }} /> };

/** Marketplace › Metrics — consistent with Dashboards: one Add to space button, the card opens the metric. */
export const StartAtMetrics: Story = { name: 'Start · Metrics', render: () => <Suite start={{ page: 'metrics' }} /> };

/** Marketplace › All — dashboards, metrics and web reports on one page, one search across them. */
export const StartAtMarketplace: Story = { name: 'Start · Marketplace (All)', render: () => <Suite start={{ page: 'marketplace' }} /> };

export const StartAtWhatsNew: Story = { name: "Start · What's New", render: () => <Suite start={{ page: 'whats-new' }} /> };

/* ── IRM, one story per persona ───────────────────────────────────────────
   IRM is the system of record for every report; DartBoards lists what IRM
   has in production and reacts to what IRM tells it. There is no role switch
   in the UI: who is signed in decides IRM's home and sidebar. Use the sidebar's
   Simulate menu to move IRM's clock on and watch a decommission's notice
   period end in DartBoards. */

/** Business user — request progress, approvals waiting on you, evergreen due, the reports you own. */
export const IrmBusiness: Story = { name: 'IRM · Business user', render: () => <Suite signedInAs="u-km" start={{ page: 'irm-home' }} /> };

/** Developer — requests assigned to you and ones you created; your queue by priority and age in status. */
export const IrmDeveloper: Story = { name: 'IRM · Developer', render: () => <Suite signedInAs="u-jm" start={{ page: 'irm-home' }} /> };

/** Dev manager — the team board (assigned and unassigned, drag to balance) and month over month. */
export const IrmDevManager: Story = { name: 'IRM · Dev manager', render: () => <Suite signedInAs="u-ar" start={{ page: 'irm-home' }} /> };

/** Governance — evergreens, flags, decommission approvals, SLA and performance monitoring. */
export const IrmGovernance: Story = { name: 'IRM · Governance', render: () => <Suite signedInAs="u-np" start={{ page: 'irm-home' }} /> };

/** Production support — everything awaiting deployment, unassigned first, by age in status. */
export const IrmProdSupport: Story = { name: 'IRM · Production support', render: () => <Suite signedInAs="u-cb" start={{ page: 'irm-home' }} /> };
