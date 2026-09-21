/* ── DART Suite prototype · seed data ─────────────────────────────────────────
   Dummy data, lifted from the copy on the Figma screens so the prototype reads
   like the design. Everything here is sample data. The store copies it into
   state on mount; screens never import this file to render — they read the
   store, so an action on one screen shows up on every other. */

import type {
  ActivityEntry,
  Admin,
  AdminWidget,
  AidenChat,
  Banner,
  Dashboard,
  Person,
  Promotion,
  Redirect,
  Request,
  Space,
} from './types';

export const ME: Person = { id: 'u-km', name: 'Kahrman McKenzie', initials: 'KM', email: 'kahrman.mckenzie@gmail.com' };

export const PEOPLE: Person[] = [
  ME,
  { id: 'u-pr', name: 'Priya Raman', initials: 'PR', email: 'priya.raman@example.com' },
  { id: 'u-so', name: 'Sam Okafor', initials: 'SO', email: 'sam.okafor@example.com' },
  { id: 'u-dw', name: 'Dana Wu', initials: 'DW', email: 'dana.wu@example.com' },
  { id: 'u-jl', name: 'Jordan Lee', initials: 'JL', email: 'jordan.lee@example.com' },
  { id: 'u-mh', name: 'Maya Hart', initials: 'MH', email: 'maya.hart@example.com' },
];

export const personById = (id: string) => PEOPLE.find((p) => p.id === id) ?? ME;

/* ── Dashboards ───────────────────────────────────────────────────────────── */

const d = (
  id: string,
  name: string,
  description: string,
  extra: Partial<Dashboard> = {},
): Dashboard => ({
  id,
  name,
  description,
  owner: 'Priya Raman',
  source: 'Tableau',
  category: 'Operations',
  tags: [],
  updatedAt: 'Sep 18, 2026',
  views: 432,
  lifecycle: 'published',
  health: 'ok',
  hasAccess: true,
  hue: 'blue',
  ...extra,
});

export const DASHBOARDS: Dashboard[] = [
  d('revenue-by-region', 'Revenue by Region', 'Bookings, pipeline and win rate broken out by region and segment, refreshed every morning.', { category: 'Sales', views: 1284, hue: 'violet', tags: ['New'] }),
  d('pipeline-health', 'Pipeline Health', 'Stage ageing, conversion and slipped deals by owner, updated hourly from the CRM.', { category: 'Sales', views: 962, hue: 'blue', tags: ['New'] }),
  d('support-backlog', 'Support Backlog', 'Open tickets, age and first-response time across every queue and severity.', { category: 'Customer', views: 812, hue: 'emerald', owner: 'Sam Okafor' }),
  d('churn-risk', 'Churn Risk', 'Accounts scored by product usage, sentiment and renewal date for the next two quarters.', { category: 'Customer', views: 640, hue: 'rose', tags: ['New'], hasAccess: false }),
  d('marketing-funnel', 'Marketing Funnel', 'Sessions through to qualified lead, split by channel, campaign and landing page.', { category: 'Sales', views: 588, hue: 'amber', source: 'Power BI' }),
  d('headcount-plan', 'Headcount Plan', 'Approved roles, offers out and expected start dates against the approved budget.', { category: 'Finance', views: 301, hue: 'cyan', owner: 'Dana Wu', hasAccess: false }),
  d('nps-trends', 'NPS Trends', 'Rolling promoter score by segment and region, with verbatim themes.', { category: 'Customer', views: 455, hue: 'violet' }),
  d('delivery-sla', 'Delivery SLA', 'On-time delivery measured against commitment by lane and carrier.', { category: 'Operations', views: 377, hue: 'blue', notice: 'Carrier data for 09/19 is delayed; on-time rates for that day are provisional.' }),
  d('collections-performance', 'Collections Performance', 'Promise-to-pay rates, roll forward and agent outcomes by queue.', { category: 'Risk', views: 720, hue: 'emerald', owner: 'Jordan Lee' }),
  d('servicing-sla', 'Servicing SLA', 'First response, handle time and breach risk across servicing teams.', { category: 'Operations', views: 530, hue: 'amber' }),
  d('risk-exposure', 'Risk Exposure', 'Concentration, limits and watchlist movement, refreshed nightly.', { category: 'Risk', views: 264, hue: 'rose', source: 'DART' }),
  d('campaign-roi', 'Campaign ROI', 'Spend against pipeline and closed won, split by channel and region.', { category: 'Finance', views: 198, hue: 'cyan', source: 'Power BI' }),
  d('originations-volume', 'Originations Daily Volume', 'New originations by channel and product, with the daily target line.', { category: 'Operations', views: 0, hue: 'violet', lifecycle: 'draft' }),
  d('servicing-overview', 'Servicing Overview', 'Queues, handle time and backlog for every servicing team.', { category: 'Operations', views: 910, hue: 'blue', owner: 'Maya Hart' }),
  d('servicing-overview-legacy', 'Legacy Servicing Overview', 'The previous servicing dashboard, kept while teams migrate.', { category: 'Operations', views: 41, hue: 'amber', health: 'decommissioning' }),
  d('collateral-health', 'Collateral Health', 'Valuation age, coverage ratios and exceptions by portfolio.', { category: 'Risk', views: 344, hue: 'emerald' }),
];

/* ── Spaces ───────────────────────────────────────────────────────────────── */

export const SPACES: Space[] = [
  {
    id: 'weekly-ops',
    name: 'Weekly Ops Review',
    description: 'Everything the ops team checks on Monday morning.',
    hue: 'blue',
    pinned: true,
    items: [
      { dashboardId: 'revenue-by-region', layout: 'thumbnail' },
      { dashboardId: 'pipeline-health', layout: 'thumbnail' },
      { dashboardId: 'support-backlog', layout: 'card' },
      { dashboardId: 'churn-risk', layout: 'card' },
      { dashboardId: 'marketing-funnel', layout: 'card' },
      { dashboardId: 'nps-trends', layout: 'card' },
      { dashboardId: 'delivery-sla', layout: 'card' },
    ],
  },
  {
    id: 'servicing-ops',
    name: 'Servicing operations',
    description: 'Queues, SLAs and backlog across the servicing teams.',
    hue: 'emerald',
    items: [
      { dashboardId: 'servicing-overview', layout: 'thumbnail', section: 'Today' },
      { dashboardId: 'servicing-sla', layout: 'card', section: 'Today' },
      { dashboardId: 'support-backlog', layout: 'card', section: 'Backlog' },
      { dashboardId: 'delivery-sla', layout: 'card', section: 'Backlog' },
    ],
    banners: [
      { id: 'b-svc-1', variant: 'warning', title: 'Scheduled maintenance this Saturday', text: 'Servicing Overview will be unavailable 06:00–10:00 ET on 09/26.' },
    ],
  },
  {
    id: 'collections-desk',
    name: 'Collections desk',
    description: 'Promise-to-pay and roll forward for the collections team.',
    hue: 'amber',
    items: [],
  },
  {
    id: 'finance-close',
    name: 'Finance month-end close',
    description: 'Shared by Dana Wu with the finance group.',
    hue: 'violet',
    shared: true,
    items: [
      { dashboardId: 'campaign-roi', layout: 'card' },
      { dashboardId: 'headcount-plan', layout: 'card' },
    ],
  },
];

/* ── Requests ─────────────────────────────────────────────────────────────── */

const sys = (id: string, at: string, text: string) => ({ id, author: 'system' as const, name: 'DART Central', at, text });
const admin = (id: string, at: string, text: string) => ({ id, author: 'admin' as const, name: 'Priya Raman', at, text });
export const mine = (id: string, at: string, text: string) => ({ id, author: 'requester' as const, name: ME.name, at, text });

export const REQUESTS: Request[] = [
  {
    id: '#0416', type: 'banner', product: 'DARTBoards', title: 'Scheduled maintenance this Saturday',
    summary: 'Warning banner, 09/06/2026 – 09/07/2026.', requesterId: ME.id, submittedAt: '08/29/2026', updatedAt: '08/30/2026',
    status: 'awaiting-reply',
    fields: [
      { label: 'Banner type', value: 'Warning' },
      { label: 'Scope', value: 'Collections Performance, Servicing SLA, Delivery SLA' },
      { label: 'Message', value: 'Scheduled maintenance this Saturday. Dashboards may be slow to load.' },
      { label: 'Starts', value: '09/06/2026' },
      { label: 'Ends', value: '09/07/2026' },
    ],
    thread: [
      sys('t1', '08/29/2026', 'Request submitted.'),
      admin('t2', '08/30/2026', 'Should this run on Servicing Overview too? It shares the same maintenance window.'),
    ],
  },
  {
    id: '#0417', type: 'dashboard-add', product: 'DARTBoards', title: 'Add Originations Daily Volume to the library',
    summary: 'Request to add the Originations Daily Volume dashboard to the Dartboards library.', requesterId: ME.id,
    submittedAt: '09/01/2026', updatedAt: '09/01/2026', status: 'new',
    fields: [
      { label: 'Dashboard name', value: 'Originations Daily Volume' },
      { label: 'Tableau URL', value: 'https://tableau.example.com/views/OriginationsDaily' },
      { label: 'Category', value: 'Operations' },
      { label: 'Description', value: 'New originations by channel and product, with the daily target line.' },
    ],
    thread: [sys('t1', '09/01/2026', 'Request submitted.')],
  },
  {
    id: '#0425', type: 'feature', product: 'DARTBoards', title: 'Let me pin a dashboard to the top of Browse',
    summary: 'A pin control on each dashboard card that keeps my most-used boards at the top of the Browse page, per person rather than per team.',
    requesterId: ME.id, submittedAt: '09/02/2026', updatedAt: '09/02/2026', status: 'new',
    fields: [
      { label: 'Title', value: 'Let me pin a dashboard to the top of Browse' },
      { label: 'Problem', value: 'I scroll past the same twelve dashboards every morning to reach the three I use.' },
      { label: 'Proposal', value: 'A pin on each card, per person, that keeps pinned dashboards first.' },
    ],
    thread: [sys('t1', '09/02/2026', 'Request submitted.')],
  },
  {
    id: '#0412', type: 'dashboard-promote', product: 'DARTBoards', title: 'Promote Collateral Health Dashboard',
    summary: 'Highlighted on the browse page, 08/25/2026 – 10/31/2026.', requesterId: ME.id, submittedAt: '08/22/2026',
    updatedAt: '08/24/2026', status: 'applied',
    fields: [
      { label: 'Dashboard', value: 'Collateral Health' },
      { label: 'Placement', value: 'Browse · featured row' },
      { label: 'Starts', value: '08/25/2026' },
      { label: 'Ends', value: '10/31/2026' },
    ],
    thread: [
      sys('t1', '08/22/2026', 'Request submitted.'),
      admin('t2', '08/24/2026', 'Approved. Live on the browse page until 10/31/2026.'),
    ],
  },
  {
    id: '#0408', type: 'general', product: 'DARTBoards', title: 'Add a saved view for the Servicing team',
    summary: 'We check the same three filters every morning on the Servicing Overview dashboard.', requesterId: ME.id,
    submittedAt: '08/18/2026', updatedAt: '08/20/2026', status: 'closed',
    fields: [{ label: 'Question', value: 'We check the same three filters every morning on the Servicing Overview dashboard. Can we save them?' }],
    thread: [
      sys('t1', '08/18/2026', 'Request submitted.'),
      admin('t2', '08/20/2026', 'Saved views ship in the 10/12/2026 release. There are no per-team views before then.'),
    ],
  },
  {
    id: '#0402', type: 'banner', product: 'DARTBoards', title: 'Data isn’t loading right now',
    summary: 'Warning banner, 08/14/2026 – 08/16/2026.', requesterId: ME.id, submittedAt: '08/11/2026', updatedAt: '08/16/2026',
    status: 'applied',
    fields: [
      { label: 'Banner type', value: 'Warning' },
      { label: 'Scope', value: 'Servicing Overview' },
      { label: 'Message', value: 'Data isn’t loading right now. We’re working on it.' },
    ],
    thread: [
      sys('t1', '08/11/2026', 'Request submitted.'),
      admin('t2', '08/16/2026', 'The source system recovered, so the banner came down on schedule.'),
    ],
  },
  {
    id: '#0405', type: 'dashboard-remove', product: 'DARTBoards', title: 'Remove Legacy Servicing Overview',
    summary: 'Superseded by Servicing Overview v2.', requesterId: ME.id, submittedAt: '08/10/2026', updatedAt: '08/12/2026',
    status: 'denied',
    fields: [
      { label: 'Dashboard', value: 'Legacy Servicing Overview' },
      { label: 'Reason', value: 'Superseded by Servicing Overview v2.' },
      { label: 'Proposed removal date', value: '09/01/2026' },
    ],
    thread: [
      sys('t1', '08/10/2026', 'Request submitted.'),
      admin('t2', '08/12/2026', 'Three teams still have it in a space, so we’re keeping it until they migrate.'),
    ],
  },
  // ── Other people's requests — visible only in the admin queue ──
  {
    id: '#0419', type: 'general', product: 'Aiden', title: 'Can Aiden summarize a dashboard?',
    summary: 'I’d like a one-paragraph summary of what changed on a dashboard since last week.', requesterId: 'u-so',
    submittedAt: '08/30/2026', updatedAt: '09/03/2026', status: 'needs-review',
    fields: [{ label: 'Question', value: 'Can Aiden give me a one-paragraph summary of what changed on a dashboard since last week?' }],
    thread: [
      sys('t1', '08/30/2026', 'Request submitted.'),
      admin('t2', '09/01/2026', 'Which dashboards would you use this on first?'),
      { id: 't3', author: 'requester', name: 'Sam Okafor', at: '09/03/2026', text: 'Support Backlog and Servicing SLA, every Monday.' },
    ],
  },
  {
    id: '#0421', type: 'banner', product: 'DART Central', title: 'Scheduled maintenance this Saturday',
    summary: 'Info banner across DART Central, 09/26/2026.', requesterId: 'u-dw', submittedAt: '09/02/2026', updatedAt: '09/02/2026',
    status: 'new',
    fields: [
      { label: 'Banner type', value: 'Info' },
      { label: 'Scope', value: 'All of DART Central' },
      { label: 'Message', value: 'DART Central will be unavailable 06:00–08:00 ET on Saturday.' },
      { label: 'Starts', value: '09/26/2026' },
      { label: 'Ends', value: '09/26/2026' },
    ],
    thread: [sys('t1', '09/02/2026', 'Request submitted.')],
  },
  {
    id: '#0431', type: 'dashboard-edit', product: 'DARTBoards', title: 'Update Servicing SLA owner and description',
    summary: 'Ownership moved to the servicing platform team.', requesterId: 'u-mh', submittedAt: '09/04/2026', updatedAt: '09/04/2026',
    status: 'new', assetId: 'servicing-sla',
    fields: [{ label: 'Dashboard', value: 'Servicing SLA' }],
    changes: [
      { field: 'Owner', current: 'Priya Raman', proposed: 'Maya Hart' },
      { field: 'Description', current: 'First response, handle time and breach risk across servicing teams.', proposed: 'First response, handle time and breach risk, by team and channel.' },
    ],
    thread: [sys('t1', '09/04/2026', 'Request submitted.')],
  },
  {
    id: '#0410', type: 'dashboard-add', product: 'DARTBoards', title: 'Add Servicing Overview v2', summary: 'The rebuilt servicing dashboard.',
    requesterId: 'u-mh', submittedAt: '08/18/2026', updatedAt: '08/20/2026', status: 'approved',
    fields: [{ label: 'Dashboard name', value: 'Servicing Overview v2' }], thread: [sys('t1', '08/18/2026', 'Request submitted.'), admin('t2', '08/20/2026', 'Approved. Created as a draft.')],
  },
  {
    id: '#0398', type: 'banner', product: 'Aiden', title: 'Aiden summaries are in beta', summary: 'Info banner, 08/05/2026 – 09/30/2026.',
    requesterId: 'u-jl', submittedAt: '08/05/2026', updatedAt: '08/06/2026', status: 'applied',
    fields: [{ label: 'Message', value: 'Aiden summaries are in beta. Tell us what you think.' }], thread: [sys('t1', '08/05/2026', 'Request submitted.')],
  },
  {
    id: '#0391', type: 'general', product: 'DART Central', title: 'How do I request a project space?', summary: 'Asking how project spaces are provisioned.',
    requesterId: 'u-pr', submittedAt: '07/28/2026', updatedAt: '07/29/2026', status: 'closed',
    fields: [{ label: 'Question', value: 'How do I request a project space?' }], thread: [sys('t1', '07/28/2026', 'Request submitted.'), admin('t2', '07/29/2026', 'Use + New space in DartBoards; no request needed.')],
  },
];

/* ── Admin estate ─────────────────────────────────────────────────────────── */

export const BANNERS: Banner[] = [
  { id: 'bn-1', title: 'Scheduled maintenance this Saturday', message: 'Dashboards may be slow to load 06:00–10:00 ET.', variant: 'warning', scope: ['Servicing SLA', 'Delivery SLA'], starts: '09/26/2026', ends: '09/26/2026', state: 'scheduled', visible: true },
  { id: 'bn-2', title: 'Aiden summaries are in beta', message: 'Tell us what you think from the Aiden panel.', variant: 'info', scope: ['All of Aiden'], starts: '08/05/2026', ends: '09/30/2026', state: 'active', visible: true },
  { id: 'bn-3', title: 'New: Collateral Health', message: 'A new risk dashboard is in the library.', variant: 'success', scope: ['Browse'], starts: '09/15/2026', ends: '10/15/2026', state: 'draft', visible: false },
  { id: 'bn-4', title: 'Data isn’t loading right now', message: 'We’re working on it.', variant: 'error', scope: ['Servicing Overview'], starts: '08/14/2026', ends: '08/16/2026', state: 'expired', visible: true },
];

export const PROMOTIONS: Promotion[] = [
  { id: 'pr-1', dashboardId: 'collateral-health', placement: 'Browse · featured row', starts: '08/25/2026', ends: '10/31/2026', state: 'active' },
  { id: 'pr-2', dashboardId: 'revenue-by-region', placement: 'Home · pinned', starts: '10/01/2026', ends: '10/31/2026', state: 'scheduled' },
  { id: 'pr-3', dashboardId: 'nps-trends', placement: 'Browse · featured row', starts: '06/01/2026', ends: '07/31/2026', state: 'ended' },
];

export const REDIRECTS: Redirect[] = [
  { id: 'rd-1', from: '/dash/servicing', to: '/dash/servicing-overview', hits: 1204, updatedAt: '09/02/2026' },
  { id: 'rd-2', from: '/tableau/revenue', to: '/dash/revenue-by-region', hits: 388, updatedAt: '08/14/2026' },
  { id: 'rd-3', from: '/dash/legacy-servicing', to: '/dash/servicing-overview', hits: 57, updatedAt: '07/30/2026' },
];

export const ADMINS: Admin[] = [
  { personId: ME.id, role: 'overall', products: ['DART Central', 'DARTBoards', 'Aiden'], grantedAt: '01/12/2026' },
  { personId: 'u-pr', role: 'sub', products: ['DARTBoards', 'Aiden'], grantedAt: '03/04/2026' },
  { personId: 'u-jl', role: 'application', products: ['Aiden'], grantedAt: '06/18/2026' },
];

export const ACTIVITY: ActivityEntry[] = [
  { id: 'a1', at: '09/04/2026 09:12', who: 'Maya Hart', action: 'submitted', target: '#0431 Update Servicing SLA owner', product: 'DARTBoards' },
  { id: 'a2', at: '09/03/2026 16:40', who: 'Sam Okafor', action: 'replied on', target: '#0419 Can Aiden summarize a dashboard?', product: 'Aiden' },
  { id: 'a3', at: '09/02/2026 11:05', who: 'Dana Wu', action: 'submitted', target: '#0421 Scheduled maintenance this Saturday', product: 'DART Central' },
  { id: 'a4', at: '09/02/2026 10:20', who: 'Kahrman McKenzie', action: 'submitted', target: '#0425 Let me pin a dashboard to the top of Browse', product: 'DARTBoards' },
  { id: 'a5', at: '09/01/2026 14:02', who: 'Priya Raman', action: 'asked a question on', target: '#0419 Can Aiden summarize a dashboard?', product: 'Aiden' },
  { id: 'a6', at: '08/30/2026 08:55', who: 'Priya Raman', action: 'asked a question on', target: '#0416 Scheduled maintenance this Saturday', product: 'DARTBoards' },
  { id: 'a7', at: '08/24/2026 13:30', who: 'Priya Raman', action: 'approved', target: '#0412 Promote Collateral Health Dashboard', product: 'DARTBoards' },
  { id: 'a8', at: '08/20/2026 09:10', who: 'Priya Raman', action: 'closed', target: '#0408 Add a saved view for the Servicing team', product: 'DARTBoards' },
];

export const DEFAULT_WIDGETS: AdminWidget[] = ['kpi-pending', 'kpi-approved', 'kpi-dashboards', 'queue', 'activity'];

export const AIDEN_CHATS: AidenChat[] = [
  {
    id: 'chat-1',
    title: 'Which dashboards cover collections?',
    updatedAt: 'Yesterday',
    messages: [
      { id: 'm1', from: 'user', text: 'Which dashboards cover collections?' },
      { id: 'm2', from: 'assistant', text: 'Two in the library: Collections Performance (promise-to-pay, roll forward, agent outcomes) and Risk Exposure (watchlist movement). Collections Performance is not in any of your spaces yet.' },
    ],
  },
];

/** Deterministic sample series for a dashboard's embed placeholder chart. */
export const seriesFor = (id: string, n = 12): number[] => {
  let seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: n }, () => {
    seed = (seed * 9301 + 49297) % 233280;
    return 30 + Math.round((seed / 233280) * 70);
  });
};
