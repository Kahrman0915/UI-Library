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
        'Every flow in the Figma file as ONE clickable prototype: DART Central (home, My Requests, the request ' +
        'flow and the whole admin side), DartBoards (Browse, spaces, the Builder and the dashboard viewer) and ' +
        'Aiden on top of both.\n\n' +
        '**It is one application, not a gallery of screens.** The tab strip is the router: every page opens in a ' +
        'tab, the sidebar follows the active tab, and a single in-memory store connects the halves of every loop — ' +
        'a request you file appears in the admin queue, approving it changes what the requester sees, a dashboard ' +
        'you add to a space appears on that space.\n\n' +
        '**Switch who you are from the account menu** (Prototype · act as) to see the requester, overall-admin, ' +
        'sub-admin and Aiden-only admin sidebars. **Pick your theme there too** (Theme): one of the six built themes for ' +
        'the whole suite, every application and the rail included — not one per application. Indigo by default; the pick ' +
        'is remembered. All data is sample data and resets on reload.\n\n' +
        'Built only from `@ui/lib` components; anything Figma names `Pattern/*` is composed at the call site.',
      tags: ['prototype', 'end to end', 'dummy data'],
    },
  },
};

export default meta;
type Story = StoryObj;

function Suite({ start }: { start?: Route }) {
  return (
    <div style={{ height: '100vh' }}>
      <SuiteProvider>
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

/** Start on My Requests — the requester's home base (Request Flow R1.1). */
export const StartAtMyRequests: Story = { name: 'Start · My Requests', render: () => <Suite start={{ page: 'my-requests' }} /> };

/** Start on the admin overview (Admin Flow 1.1). */
export const StartAtAdmin: Story = { name: 'Start · Admin Overview', render: () => <Suite start={{ page: 'admin-overview' }} /> };

/** Start in DartBoards on Browse (Browse B1.1). */
export const StartAtBrowse: Story = { name: 'Start · Browse', render: () => <Suite start={{ page: 'browse' }} /> };

/** Start on What's New, where the Dartboards tour opens over the page (What's New W3.1). */
export const StartAtWhatsNew: Story = { name: "Start · What's New", render: () => <Suite start={{ page: 'whats-new' }} /> };
