/* ── DART Suite prototype · seed data ─────────────────────────────────────────
   Dummy data, lifted from the copy on the Figma screens so the prototype reads
   like the design. Everything here is sample data. The store copies it into
   state on mount; screens never import this file to render — they read the
   store, so an action on one screen shows up on every other. */

import type {
  ActivityEntry,
  Asset,
  Admin,
  AdminWidget,
  AidenChat,
  Banner,
  Dashboard,
  NativeSpec,
  Person,
  Promotion,
  Redirect,
  Request,
  Space,
  Suite,
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
  // The Servicing team's suite — dashboards they used to keep behind their own left navigation.
  d('servicing-queue-depth', 'Queue Depth by Hour', 'Work waiting in each servicing queue, hour by hour, against staffed capacity.', { category: 'Operations', views: 486, hue: 'cyan', owner: 'Maya Hart' }),
  d('servicing-handle-time', 'Handle Time', 'Average and 90th-percentile handle time by team, channel and work type.', { category: 'Operations', views: 402, hue: 'violet', owner: 'Maya Hart' }),
  d('servicing-quality', 'Quality Scores', 'Call and case quality reviews by agent and team, with the calibration trend.', { category: 'Operations', views: 233, hue: 'rose', owner: 'Maya Hart', tags: ['New'] }),
  d('servicing-escalations', 'Escalations', 'Complaints and escalations by reason, age and the team that owns them.', { category: 'Customer', views: 318, hue: 'amber', owner: 'Maya Hart' }),
  d('servicing-staffing', 'Staffing vs Forecast', 'Scheduled agents against the volume forecast, by interval and site.', { category: 'Operations', views: 276, hue: 'blue', owner: 'Maya Hart', hasAccess: false }),
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
      // One chart from a NATIVE dashboard, not the whole dashboard.
      { dashboardId: 'col-daily-summary', widgetId: 'arrears-trend', layout: 'card' },
      // An EXTERNAL chart: a link card, never drawn as if it were live.
      { dashboardId: 'col-delinquency-region', layout: 'card' },
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

/* ── Metrics, workflows and reports ───────────────────────────────────────────
   What a space can hold besides dashboards (the Builder's rail). */

const EARLY = 'Collections › Early stage';
const SERVICING = 'Servicing › Service levels';
const RISK = 'Credit risk › Portfolio';

export const ASSETS: Asset[] = [
  { id: 'm-roll-rate', kind: 'metric', name: 'Roll rate into 1–30 days', description: 'Share of current balances that missed a payment.', owner: 'Jordan Lee', source: 'DART', glance: '3.4% · down 0.4 pts', updatedAt: 'Sep 26, 2026', subject: EARLY,
    metric: { grains: ['day', 'week', 'month'], breakdowns: ['org', 'region', 'product'], unit: '%', certified: true } },
  { id: 'm-cure-rate', kind: 'metric', name: 'Cure rate', description: 'Share of 1–30 day balances back to current within 30 days.', owner: 'Jordan Lee', source: 'DART', glance: '41.2% · up 1.2 pts', updatedAt: 'Sep 26, 2026', subject: EARLY,
    metric: { grains: ['week', 'month'], breakdowns: ['org', 'product'], unit: '%', certified: true } },
  { id: 'm-ptp-kept', kind: 'metric', name: 'Promise kept rate', description: 'Promises to pay that were kept, across every queue.', owner: 'Maya Hart', source: 'DART', glance: '68% · flat', updatedAt: 'Sep 25, 2026', subject: 'Collections › Promises & payments',
    metric: { grains: ['day', 'week', 'month'], breakdowns: ['org'], unit: '%', certified: false } },
  { id: 'm-first-response', kind: 'metric', name: 'First response time', description: 'Median time to first response on servicing cases.', owner: 'Maya Hart', source: 'Power BI', glance: '2h 14m · down 9m', updatedAt: 'Sep 25, 2026', subject: SERVICING,
    metric: { grains: ['day', 'week'], breakdowns: ['org', 'region'], unit: 'time', certified: true } },
  { id: 'w-hardship', kind: 'workflow', name: 'Hardship plan approval', description: 'Review and approve hardship plans submitted by agents.', owner: 'Sam Okafor', source: 'DART workflows', glance: '12 open · 3 waiting on you', updatedAt: 'Sep 26, 2026', subject: EARLY,
    workflow: { assignedToMe: 3, overdue: 1 } },
  { id: 'w-agency', kind: 'workflow', name: 'Agency placement review', description: 'Accounts proposed for outside agencies, for sign-off.', owner: 'Jordan Lee', source: 'DART workflows', glance: '28 open', updatedAt: 'Sep 24, 2026', subject: 'Collections › Late stage & recoveries',
    workflow: { assignedToMe: 0, overdue: 0 } },
  { id: 'w-access', kind: 'workflow', name: 'Dashboard access requests', description: 'Access requests waiting on you as a dashboard owner.', owner: 'Priya Raman', source: 'DART workflows', glance: '4 open · 1 overdue', updatedAt: 'Sep 26, 2026', subject: 'DartBoards › Administration',
    workflow: { assignedToMe: 4, overdue: 1 } },
  { id: 'r-monthly-pack', kind: 'report', name: 'Monthly Collections Pack', description: 'The committee pack: arrears, cures, roll rates and recoveries.', owner: 'Jordan Lee', source: 'Report server', glance: 'Monthly · Sep 2026 ready', updatedAt: 'Sep 2, 2026', subject: EARLY,
    report: { format: 'Web report', cadence: 'Monthly', audience: 'Collections committee', url: 'https://reports.example.com/collections/monthly-pack' } },
  { id: 'r-risk-deck', kind: 'report', name: 'Quarterly Risk Committee Pack', description: 'Exposure, limits and watchlist movement for the quarter.', owner: 'Jordan Lee', source: 'Report server', glance: 'Quarterly · Q3 ready', updatedAt: 'Sep 30, 2026', subject: RISK,
    report: { format: 'Web report', cadence: 'Quarterly', audience: 'Risk committee', url: 'https://reports.example.com/risk/quarterly-committee' } },
  { id: 'r-sla-weekly', kind: 'report', name: 'Servicing SLA Weekly', description: 'Service levels by team, with breaches explained.', owner: 'Maya Hart', source: 'Report server', glance: 'Weekly · every Monday', updatedAt: 'Sep 28, 2026', subject: SERVICING,
    report: { format: 'Web report', cadence: 'Weekly', audience: 'Servicing leads', url: 'https://reports.example.com/servicing/sla-weekly' } },
  { id: 'r-daily-flash', kind: 'report', name: 'Collections Daily Flash', description: 'Yesterday in one page: dollars collected, cures, promises and queue health.', owner: 'Jordan Lee', source: 'Report server', glance: 'Daily · 7:00 AM ET', updatedAt: 'Oct 2, 2026', subject: EARLY,
    report: { format: 'Web report', cadence: 'Daily', audience: 'Collections managers', url: 'https://reports.example.com/collections/daily-flash' } },
  { id: 'r-hardship-monthly', kind: 'report', name: 'Hardship Program Review', description: 'Plans opened, kept and broken, and what the program cost this month.', owner: 'Sam Okafor', source: 'Report server', glance: 'Monthly · Sep 2026 ready', updatedAt: 'Sep 5, 2026', subject: 'Collections › Promises & payments',
    report: { format: 'Web report', cadence: 'Monthly', audience: 'Hardship program team', url: 'https://reports.example.com/collections/hardship-review' } },
  { id: 'r-agency-quarterly', kind: 'report', name: 'Agency Performance Review', description: 'Recovery rate, fees and complaints for every outside agency.', owner: 'Jordan Lee', source: 'Report server', glance: 'Quarterly · Q3 ready', updatedAt: 'Oct 1, 2026', subject: 'Collections › Late stage & recoveries',
    report: { format: 'Web report', cadence: 'Quarterly', audience: 'Vendor management', url: 'https://reports.example.com/collections/agency-review' } },
  { id: 'r-quality-weekly', kind: 'report', name: 'Call Quality Weekly', description: 'Calibrated quality scores by team, with the lowest-scoring calls to review.', owner: 'Maya Hart', source: 'Report server', glance: 'Weekly · every Tuesday', updatedAt: 'Sep 30, 2026', subject: SERVICING,
    report: { format: 'Web report', cadence: 'Weekly', audience: 'Team leads', url: 'https://reports.example.com/servicing/quality-weekly' } },
  { id: 'r-pipeline-weekly', kind: 'report', name: 'Pipeline Review', description: 'Stage movement, slipped deals and the forecast, for the Monday pipeline call.', owner: 'Priya Raman', source: 'Report server', glance: 'Weekly · every Monday', updatedAt: 'Sep 29, 2026', subject: 'Revenue › Pipeline',
    report: { format: 'Web report', cadence: 'Weekly', audience: 'Sales leadership', url: 'https://reports.example.com/sales/pipeline-review' } },
  { id: 'r-month-end', kind: 'report', name: 'Month-End Close Summary', description: 'Accruals, adjustments and variances signed off at close.', owner: 'Dana Wu', source: 'Report server', glance: 'Monthly · Sep close ready', updatedAt: 'Oct 2, 2026', subject: 'Finance › Close',
    report: { format: 'Web report', cadence: 'Monthly', audience: 'Finance', url: 'https://reports.example.com/finance/month-end' } },
  { id: 'r-collateral-monthly', kind: 'report', name: 'Collateral Coverage Report', description: 'Valuation age, coverage ratios and exceptions by portfolio.', owner: 'Jordan Lee', source: 'Report server', glance: 'Monthly · Sep 2026 ready', updatedAt: 'Sep 8, 2026', subject: RISK,
    report: { format: 'Web report', cadence: 'Monthly', audience: 'Credit risk', url: 'https://reports.example.com/risk/collateral-coverage' } },
];

/* ── Suites ───────────────────────────────────────────────────────────────── */

/* The Collections team's suite is the LARGE one — 42 dashboards behind a nested
   left navigation (stage › product › dashboard) before it came into DartBoards.
   It exists so the suite page can be seen at the size that breaks naive layouts. */
const COL: [string, string, string, Dashboard['hue'], number][] = [
  ['daily-summary', 'Collections Daily Summary', 'Balances in arrears, cures and roll rates for yesterday, against plan.', 'amber', 1840],
  ['portfolio-roll', 'Portfolio Roll Rates', 'How balances move between delinquency buckets month over month.', 'violet', 1422],
  ['kpi-scorecard', 'Collections KPI Scorecard', 'The twelve measures the collections committee reviews every week.', 'blue', 1310],
  ['queue-status', 'Queue Status', 'Accounts waiting in each work queue, oldest first, refreshed every 15 minutes.', 'cyan', 980],
  ['dialer-pacing', 'Dialer Pacing', 'Calls placed, abandoned and connected by campaign, against the pacing target.', 'emerald', 744],
  ['work-assignment', 'Work Assignment', 'Accounts assigned to each team and agent, and what is still unworked.', 'blue', 512],
  ['right-party-contact', 'Right-Party Contact', 'The share of attempts that reached the customer, by time of day and channel.', 'violet', 690],
  ['contact-attempts', 'Contact Attempts', 'Attempts per account per week, checked against the contact policy.', 'rose', 431],
  ['channel-mix', 'Channel Mix', 'Calls, texts, email and letters, and which of them led to a payment.', 'amber', 388],
  ['early-cards-roll', 'Early Stage · Cards Roll', 'Card balances rolling from current into 1–30 days, by segment.', 'violet', 602],
  ['early-cards-cure', 'Early Stage · Cards Cure', 'Card accounts that paid back to current inside 30 days.', 'emerald', 544],
  ['early-loans-roll', 'Early Stage · Loans Roll', 'Personal loan balances rolling into 1–30 days, by vintage.', 'blue', 470],
  ['early-loans-cure', 'Early Stage · Loans Cure', 'Personal loan accounts that cured inside 30 days.', 'cyan', 402],
  ['early-mortgage-roll', 'Early Stage · Mortgage Roll', 'Mortgage payments missed for the first time, by region.', 'amber', 355],
  ['mid-cards-roll', 'Mid Stage · Cards Roll', 'Card balances moving from 31–60 into 61–90 days.', 'rose', 330],
  ['mid-cards-ptp', 'Mid Stage · Cards Promises', 'Promises to pay taken on mid-stage card accounts, and how many were kept.', 'violet', 298],
  ['mid-loans-roll', 'Mid Stage · Loans Roll', 'Personal loan balances moving from 31–60 into 61–90 days.', 'blue', 276],
  ['mid-loans-ptp', 'Mid Stage · Loans Promises', 'Promises to pay taken on mid-stage loans, and how many were kept.', 'emerald', 240],
  ['mid-mortgage-loss-mit', 'Mortgage Loss Mitigation', 'Forbearance, modification and repayment plans in progress.', 'cyan', 312],
  ['chargeoff-forecast', 'Charge-off Forecast', 'Expected charge-offs for the next six months, by product.', 'rose', 520],
  ['chargeoff-actuals', 'Charge-off Actuals', 'Balances charged off this month against the forecast.', 'amber', 466],
  ['agency-placement', 'Agency Placement', 'Accounts placed with each outside agency, and when they come back.', 'blue', 214],
  ['agency-performance', 'Agency Performance', 'Recovery rate and fees by agency and placement cycle.', 'violet', 262],
  ['legal-pipeline', 'Legal Pipeline', 'Accounts referred for legal action, by stage and age.', 'emerald', 150],
  ['team-leaderboard', 'Team Leaderboard', 'Dollars collected and promises kept by team, this week and last.', 'amber', 890],
  ['team-quality', 'Team Quality', 'Call quality scores by team, with the calibration trend.', 'cyan', 310],
  ['agent-scorecard', 'Agent Scorecard', 'Each agent against their targets for contacts, promises and dollars.', 'blue', 1020],
  ['agent-coaching', 'Agent Coaching', 'Coaching sessions held, open actions and the change that followed.', 'rose', 286],
  ['agent-attendance', 'Agent Attendance', 'Schedule adherence and absence by team.', 'emerald', 240],
  ['ptp-kept', 'Promise Kept Rate', 'Promises to pay made and kept, by stage, channel and agent.', 'violet', 760],
  ['payment-plans', 'Payment Plans', 'Plans set up, active and broken, with the balances they cover.', 'amber', 522],
  ['settlements', 'Settlements', 'Settlement offers made and accepted, and the discount given.', 'blue', 344],
  ['champion-challenger', 'Champion–Challenger', 'Live strategy tests and how each challenger is doing against the champion.', 'cyan', 204],
  ['treatment-tests', 'Treatment Tests', 'Letter, text and call-timing experiments and their results.', 'rose', 176],
  ['segment-migration', 'Segment Migration', 'How accounts move between risk segments month to month.', 'emerald', 190],
  ['call-frequency', 'Call Frequency Limits', 'Accounts near or over the weekly contact limit.', 'amber', 402],
  ['complaints', 'Collections Complaints', 'Complaints about collections activity by reason and outcome.', 'rose', 318],
  ['regulatory-flags', 'Regulatory Flags', 'Accounts carrying a hardship, bankruptcy or military flag.', 'violet', 260],
  ['volume-forecast', 'Volume Forecast', 'Accounts entering collections over the next 13 weeks.', 'blue', 280],
  ['liquidation-forecast', 'Liquidation Forecast', 'Expected dollars collected by month and stage.', 'cyan', 244],
  ['definitions', 'Collections Definitions', 'What every measure in this suite means and how it is calculated.', 'emerald', 612],
  ['data-freshness', 'Data Freshness', 'When each source last loaded, and anything running late.', 'amber', 199],
];
const col = (...ids: string[]) => ids.map((id) => `col-${id}`);

/* Two of them are NATIVE — built by the Collections team with the design system
   (the pilot for "reports as React dashboards"). They share the suite's filters. */
const NATIVE: Record<string, NativeSpec> = {
  'col-daily-summary': {
    suiteId: 'collections',
    accepts: ['period', 'product'],
    widgets: [
      { id: 'headline', title: 'Headline', description: 'Where the book stands at the end of the period.', kind: 'kpis', metric: 'headline', span: 2 },
      { id: 'arrears-trend', title: 'Balance in arrears', description: 'Weekly balance 1+ days past due, by product.', kind: 'line', metric: 'arrears' },
      { id: 'collected-vs-plan', title: 'Collected against plan', description: 'Dollars collected by stage, against the plan.', kind: 'bar', metric: 'collected' },
      { id: 'queues', title: 'Queues past service level', description: 'Work queues with accounts waiting longer than the target.', kind: 'table', metric: 'queues', span: 2 },
    ],
  },
  'col-portfolio-roll': {
    suiteId: 'collections',
    accepts: ['period', 'product'],
    widgets: [
      { id: 'roll-early', title: 'Roll rate into 1–30 days', description: 'Share of current balances missing a payment, by product.', kind: 'line', metric: 'roll' },
      { id: 'cure-rate', title: 'Cure rate', description: 'Share of 1–30 day balances back to current within the period.', kind: 'line', metric: 'cure' },
      { id: 'bucket-balances', title: 'Balance by bucket', description: 'Where arrears sit today, by days past due.', kind: 'bar', metric: 'buckets', span: 2 },
    ],
  },
};

/* And three are EXTERNAL — single charts that stay in their BI tool and open there. */
const EXTERNAL: Dashboard[] = [
  d('col-delinquency-region', 'Delinquency by Region', 'Balances 30+ days past due on a regional map, with the month-on-month change.', {
    category: 'Risk', owner: 'Jordan Lee', hue: 'rose', views: 1180, source: 'Tableau',
    external: { url: 'https://tableau.example.com/views/Collections/DelinquencyByRegion' },
  }),
  d('col-vintage-curves', 'Recovery Vintage Curves', 'Cumulative recovery by charge-off month, one curve per vintage.', {
    category: 'Risk', owner: 'Jordan Lee', hue: 'violet', views: 342, source: 'Tableau',
    external: { url: 'https://tableau.example.com/views/Collections/RecoveryVintages' },
  }),
  d('col-agency-scorecard', 'Agency Scorecard', 'Each outside agency ranked on recovery rate, fees and complaints.', {
    category: 'Risk', owner: 'Jordan Lee', hue: 'cyan', views: 205, source: 'Power BI',
    external: { url: 'https://app.powerbi.example.com/reports/agency-scorecard' },
  }),
];

export const COLLECTIONS_DASHBOARDS: Dashboard[] = [
  ...COL.map(([id, name, desc, hue, views]) =>
    d(`col-${id}`, name, desc, {
      category: 'Risk', owner: 'Jordan Lee', hue, views, source: 'DART', native: NATIVE[`col-${id}`],
      // Filed under "Start here" in its suite, but it is about early stage — and subject is what the Builder finds by.
      ...(id === 'portfolio-roll' ? { subject: 'Collections › Early stage' } : {}),
    }),
  ),
  ...EXTERNAL,
];

export const SUITES: Suite[] = [
  {
    id: 'servicing',
    name: 'Servicing Operations',
    team: 'Servicing team',
    owner: 'Maya Hart',
    description: 'Queues, service levels, quality and staffing for every servicing team, in the order the floor uses them.',
    hue: 'emerald',
    updatedAt: 'Sep 24, 2026',
    sections: [
      { id: 'today', name: 'Today', dashboardIds: ['servicing-overview', 'servicing-queue-depth', 'servicing-sla'] },
      { id: 'performance', name: 'Performance', dashboardIds: ['servicing-handle-time', 'servicing-quality', 'delivery-sla'] },
      { id: 'backlog', name: 'Backlog & escalations', dashboardIds: ['support-backlog', 'servicing-escalations'] },
      { id: 'planning', name: 'Planning', dashboardIds: ['servicing-staffing', 'headcount-plan'] },
    ],
  },
  {
    id: 'risk',
    name: 'Credit Risk',
    team: 'Risk team',
    owner: 'Jordan Lee',
    description: 'Exposure, collateral and early-warning signals, reviewed at the weekly risk committee.',
    hue: 'rose',
    updatedAt: 'Sep 21, 2026',
    sections: [
      { id: 'portfolio', name: 'Portfolio', dashboardIds: ['risk-exposure', 'collateral-health'] },
      { id: 'early-warning', name: 'Early warning', dashboardIds: ['churn-risk', 'collections-performance'] },
    ],
  },
  {
    id: 'collections',
    name: 'Collections & Recoveries',
    team: 'Collections team',
    owner: 'Jordan Lee',
    description: 'Every stage from the first missed payment to recovery — the Collections team’s whole reporting estate.',
    hue: 'amber',
    updatedAt: 'Sep 26, 2026',
    startSectionId: 'start',
    sections: [
      { id: 'start', name: 'Start here', dashboardIds: col('daily-summary', 'portfolio-roll', 'delinquency-region', 'kpi-scorecard', 'definitions') },
      {
        id: 'daily', name: 'Daily operations',
        dashboardIds: col('queue-status', 'dialer-pacing', 'work-assignment', 'right-party-contact', 'contact-attempts', 'channel-mix'),
        topics: [
          { id: 'queues', name: 'Queues', dashboardIds: col('queue-status', 'dialer-pacing', 'work-assignment') },
          { id: 'contact', name: 'Contact', dashboardIds: col('right-party-contact', 'contact-attempts', 'channel-mix') },
        ],
      },
      {
        id: 'early', name: 'Early stage (1–30 days)',
        dashboardIds: col('early-cards-roll', 'early-cards-cure', 'early-loans-roll', 'early-loans-cure', 'early-mortgage-roll'),
        topics: [
          { id: 'cards', name: 'Cards', dashboardIds: col('early-cards-roll', 'early-cards-cure') },
          { id: 'loans', name: 'Loans', dashboardIds: col('early-loans-roll', 'early-loans-cure') },
          { id: 'mortgages', name: 'Mortgages', dashboardIds: col('early-mortgage-roll') },
        ],
      },
      {
        id: 'mid', name: 'Mid stage (31–90 days)',
        dashboardIds: col('mid-cards-roll', 'mid-cards-ptp', 'mid-loans-roll', 'mid-loans-ptp', 'mid-mortgage-loss-mit'),
        topics: [
          { id: 'cards', name: 'Cards', dashboardIds: col('mid-cards-roll', 'mid-cards-ptp') },
          { id: 'loans', name: 'Loans', dashboardIds: col('mid-loans-roll', 'mid-loans-ptp') },
          { id: 'mortgages', name: 'Mortgages', dashboardIds: col('mid-mortgage-loss-mit') },
        ],
      },
      {
        id: 'late', name: 'Late stage & recoveries',
        dashboardIds: col('chargeoff-forecast', 'chargeoff-actuals', 'vintage-curves', 'agency-placement', 'agency-performance', 'agency-scorecard', 'legal-pipeline'),
        topics: [
          { id: 'chargeoff', name: 'Charge-off', dashboardIds: col('chargeoff-forecast', 'chargeoff-actuals', 'vintage-curves') },
          { id: 'agencies', name: 'Agencies', dashboardIds: col('agency-placement', 'agency-performance', 'agency-scorecard') },
          { id: 'legal', name: 'Legal', dashboardIds: col('legal-pipeline') },
        ],
      },
      {
        id: 'agents', name: 'Agent performance',
        dashboardIds: col('team-leaderboard', 'team-quality', 'agent-scorecard', 'agent-coaching', 'agent-attendance'),
        topics: [
          { id: 'teams', name: 'Teams', dashboardIds: col('team-leaderboard', 'team-quality') },
          { id: 'individuals', name: 'Individuals', dashboardIds: col('agent-scorecard', 'agent-coaching', 'agent-attendance') },
        ],
      },
      { id: 'promises', name: 'Promises & payments', dashboardIds: [...col('ptp-kept', 'payment-plans', 'settlements'), 'collections-performance'] },
      { id: 'strategy', name: 'Strategy & tests', dashboardIds: col('champion-challenger', 'treatment-tests', 'segment-migration') },
      { id: 'compliance', name: 'Compliance', dashboardIds: col('call-frequency', 'complaints', 'regulatory-flags') },
      { id: 'forecasting', name: 'Forecasting & capacity', dashboardIds: [...col('volume-forecast', 'liquidation-forecast'), 'servicing-staffing'] },
      { id: 'reference', name: 'Reference', dashboardIds: col('definitions', 'data-freshness') },
    ],
  },
  {
    id: 'growth',
    name: 'Revenue & Growth',
    team: 'Sales operations',
    owner: 'Priya Raman',
    description: 'Pipeline to bookings, and what marketing spend returned along the way.',
    hue: 'violet',
    updatedAt: 'Sep 18, 2026',
    sections: [
      { id: 'pipeline', name: 'Pipeline', dashboardIds: ['pipeline-health', 'revenue-by-region'] },
      { id: 'marketing', name: 'Marketing', dashboardIds: ['marketing-funnel', 'campaign-roi'] },
    ],
  },
];

/** Suites the prototype user already follows — they sit in the DartBoards sidebar. */
export const FOLLOWED_SUITES = ['servicing', 'collections'];

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
    id: '#0417', type: 'dashboard-add', product: 'DARTBoards', title: 'Publish Originations Daily Volume to DartBoards',
    summary: 'Request to add the Originations Daily Volume dashboard to the Dartboards library.', requesterId: ME.id,
    submittedAt: '09/01/2026', updatedAt: '09/01/2026', status: 'new',
    fields: [
      { label: 'IRM record', value: 'IRM-20512' },
      { label: 'IRM report name', value: 'IRM-20512 Originations Daily Volume v1' },
      { label: 'Display title', value: 'Originations Daily Volume' },
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
    id: '#0405', type: 'dashboard-remove', product: 'DARTBoards', title: 'Unpublish Legacy Servicing Overview',
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
    id: '#0431', type: 'dashboard-edit', product: 'DARTBoards', title: 'Update the Servicing SLA listing',
    summary: 'Ownership moved to the servicing platform team.', requesterId: 'u-mh', submittedAt: '09/04/2026', updatedAt: '09/04/2026',
    status: 'new', assetId: 'servicing-sla',
    fields: [{ label: 'Dashboard', value: 'Servicing SLA' }],
    changes: [
      { field: 'Display title', current: 'Servicing SLA', proposed: 'Servicing SLA by Team' },
      { field: 'Description', current: 'First response, handle time and breach risk across servicing teams.', proposed: 'First response, handle time and breach risk, by team and channel.' },
    ],
    thread: [sys('t1', '09/04/2026', 'Request submitted.')],
  },
  {
    id: '#0410', type: 'dashboard-add', product: 'DARTBoards', title: 'Publish Servicing Overview v2 to DartBoards', summary: 'The rebuilt servicing dashboard.',
    requesterId: 'u-mh', submittedAt: '08/18/2026', updatedAt: '08/20/2026', status: 'approved',
    fields: [{ label: 'IRM record', value: 'IRM-20240' }, { label: 'Display title', value: 'Servicing Overview v2' }], thread: [sys('t1', '08/18/2026', 'Request submitted.'), admin('t2', '08/20/2026', 'Approved. Created as a draft.')],
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
  { id: 'a1', at: '09/04/2026 09:12', who: 'Maya Hart', action: 'submitted', target: '#0431 Update the Servicing SLA listing', product: 'DARTBoards' },
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
