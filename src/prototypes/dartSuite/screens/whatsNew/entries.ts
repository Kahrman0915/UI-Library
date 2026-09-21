/* What's New · the release entries (sample data).

   Figma's W1.1 repeats one placeholder card ("Spaces: Your Personal Dashboard
   Collections") in every slot; these are varied so the product filter, the
   topic menu and search have something to act on. Only "Introducing
   Dartboards" has a full release story page (W2.1). */

export type WnProduct = 'DART Central' | 'Aiden' | 'Dartboards';
export type WnTopic = 'launch' | 'feature' | 'resource' | 'coming-soon';

export type WnEntry = {
  id: string;
  date: string;
  product: WnProduct;
  version?: string;
  title: string;
  summary: string;
  topic: WnTopic;
  bullets?: string[];
  /** The one hero entry at the top of the page. */
  featured?: boolean;
  /** Has a full release story page (only the DartBoards launch). */
  story?: boolean;
  /** Which demo clip illustrates it, when it has one. */
  clip?: 'library' | 'spaces' | 'edit';
};

export const TOPIC_LABEL: Record<WnTopic, string> = {
  launch: 'Launch',
  feature: 'New feature',
  resource: 'Resource',
  'coming-soon': 'Coming soon',
};

export const WHATS_NEW: WnEntry[] = [
  {
    id: 'introducing-dartboards',
    date: 'July 7, 2026',
    product: 'Dartboards',
    version: 'v1.0.0',
    title: 'Introducing Dartboards',
    summary:
      'Dartboards is here — a focused, dashboard-first experience built into DART Central. Browse your organization’s dashboard library, build personal or team spaces, and pin the views that matter most.',
    topic: 'launch',
    featured: true,
    story: true,
    clip: 'library',
    bullets: [
      'Dashboard library with org-wide browse and search',
      'Spaces — curate collections of dashboards for any workflow',
      'Dashboards-only scope: no noise, just the data views you need',
      'Pin any dashboard to a space with a single click',
    ],
  },
  {
    id: 'spaces',
    date: 'July 7, 2026',
    product: 'Dartboards',
    title: 'Spaces: your personal dashboard collections',
    summary:
      'Spaces let you group dashboards around any theme — a project, a team, a reporting cadence. Create as many as you need, and keep them private or share them with your team.',
    topic: 'feature',
    story: true,
    clip: 'spaces',
  },
  {
    id: 'edit-mode',
    date: 'July 7, 2026',
    product: 'Dartboards',
    title: 'Edit mode for every space',
    summary:
      'Drag and drop to rearrange, switch dashboards between thumbnail and compact view, and rename your space. Undo reverses your last change.',
    topic: 'feature',
    story: true,
    clip: 'edit',
  },
  {
    id: 'aiden-summaries',
    date: 'August 5, 2026',
    product: 'Aiden',
    title: 'Aiden can summarize a dashboard',
    summary: 'Ask Aiden what changed on a dashboard since last week and get a one-paragraph answer with links to the views it read.',
    topic: 'feature',
  },
  {
    id: 'my-requests',
    date: 'August 18, 2026',
    product: 'DART Central',
    title: 'Track every request in My Requests',
    summary:
      'Every request you file with the admin team now lives in one place. Answer questions from the admins, follow the status, and see the decision without waiting for an email.',
    topic: 'feature',
  },
  {
    id: 'getting-started-guide',
    date: 'August 20, 2026',
    product: 'Dartboards',
    title: 'Guide: building your first space',
    summary: 'A five-minute walkthrough from the Dashboard Library to a space your team opens every Monday.',
    topic: 'resource',
  },
  {
    id: 'aiden-panel',
    date: 'September 2, 2026',
    product: 'Aiden',
    title: 'Aiden follows you across every app',
    summary: 'Open Aiden from any screen as a small window, pin it to the side of the page, or give it a tab of its own.',
    topic: 'launch',
  },
  {
    id: 'request-flow-guide',
    date: 'September 4, 2026',
    product: 'DART Central',
    title: 'Guide: which request should I file?',
    summary: 'Dashboard, banner, general question or feature request — how to pick, and what happens after you submit.',
    topic: 'resource',
  },
  {
    id: 'share-space',
    date: 'Coming in October',
    product: 'Dartboards',
    title: 'Share a copy of a space',
    summary: 'Send a teammate a copy of a space you built. They get their own version to rename, rearrange and make their own.',
    topic: 'coming-soon',
  },
  {
    id: 'metrics-library',
    date: 'Coming in November',
    product: 'Dartboards',
    title: 'Metrics library',
    summary: 'Browse metrics the same way you browse dashboards, then add any metric to your space as the chart type you prefer.',
    topic: 'coming-soon',
  },
];
