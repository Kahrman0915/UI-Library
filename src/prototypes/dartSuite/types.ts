/* ── DART Suite prototype · shared types ──────────────────────────────────────
   One prototype, two applications (DART Central and DartBoards) and Aiden on
   top of both. Every screen is addressed by a Route; the tab strip holds one
   Route per open tab, and the sidebar + rail follow the active tab's `app`.

   This file is the contract every screen folder builds against. Add a route
   here before adding a screen for it. */

export type AppId = 'central' | 'boards' | 'irm';

/* ── Routes ─────────────────────────────────────────────────────────────────── */

export type DashboardRequestMode = 'add' | 'edit' | 'promote' | 'remove';
export type RequestKind = 'dashboard' | 'banner' | 'general' | 'feature';

export type Route =
  // DART Central · requester (Figma: Request Flow)
  | { page: 'home' }
  | { page: 'my-requests' }
  | { page: 'request-detail'; id: string }
  | { page: 'new-request' }
  // `dashboardId` preselects the dashboard ("Edit listing" from a dashboard's details).
  | { page: 'request-form'; kind: RequestKind; mode?: DashboardRequestMode; dashboardId?: string; record?: string; /** Banner only: on dashboards (default) or across applications. */ reach?: 'dashboards' | 'applications' }
  | { page: 'request-submitted'; id: string }
  // DART Central · What's New (Figma: Whats New)
  | { page: 'whats-new' }
  | { page: 'whats-new-story'; id: string }
  // DART Central · nav items with no designed screens
  | { page: 'placeholder'; title: string }
  // DART Central · admin (Figma: Admin Flow)
  | { page: 'admin-overview' }
  | { page: 'admin-queue' }
  | { page: 'admin-review'; id: string }
  | { page: 'admin-applied'; id: string }
  | { page: 'admin-activity' }
  | { page: 'admin-dashboards' }
  | { page: 'admin-banners' }
  | { page: 'admin-promotions' }
  | { page: 'admin-redirects' }
  | { page: 'admin-usage' }
  | { page: 'admin-access' }
  // DartBoards (Figma: Browse, Space, Builder, Dashboard)
  // `suite` scopes Browse to one team's suite; `section` narrows it to one of its sections.
  | { page: 'browse'; suite?: string; section?: string }
  // Marketplace › All: dashboards, metrics and web reports on one page.
  | { page: 'marketplace' }
  // Marketplace › Reports: web reports, which open outside DART Central in a new tab.
  | { page: 'reports' }
  | { page: 'report'; id: string }
  // Marketplace › Metrics: metrics live IN DART Central, so a metric opens its own page.
  | { page: 'metrics' }
  | { page: 'metric'; id: string }
  | { page: 'space'; id: string }
  | { page: 'shared' }
  // `seedAssetId` starts a new space from a report (or another asset) instead of a dashboard.
  | { page: 'builder'; spaceId?: string; seedDashboardId?: string; seedAssetId?: string }
  // `widget` deep-links to one chart on a native dashboard.
  | { page: 'dashboard'; id: string; fromSpaceId?: string; widget?: string }
  // IRM — the system of record for every report: inventory, change requests, controls.
  // What each person lands on depends on their IRM role (Person.irmRole), never a switcher.
  | { page: 'irm-home' }
  | { page: 'irm-records' }
  | { page: 'irm-record'; number: string }
  | { page: 'irm-changes' }
  | { page: 'irm-change'; id: string }
  | { page: 'irm-new-change'; type?: IrmChangeType; record?: string }
  | { page: 'irm-board' }
  | { page: 'irm-activity' }
  | { page: 'irm-governance' }
  | { page: 'irm-deployments' }
  | { page: 'irm-integrations' }
  | { page: 'irm-audit' }
  // A report request (IRM's form and page) hosted in DART Central, for business people.
  | { page: 'report-request'; type?: IrmChangeType; record?: string }
  | { page: 'report-request-detail'; id: string }
  | { page: 'irm-workflows' }
  // Aiden (Figma: Aiden)
  | { page: 'aiden-launcher' }
  | { page: 'aiden-chat'; chatId: string };

export type PageId = Route['page'];

/** Which application a route belongs to — drives the rail and the sidebar. */
export const appOf = (r: Route): AppId =>
  r.page.startsWith('irm-')
    ? 'irm'
    : ['browse', 'marketplace', 'reports', 'report', 'metrics', 'metric', 'space', 'shared', 'builder', 'dashboard'].includes(r.page) ? 'boards' : 'central';

/* ── Domain ─────────────────────────────────────────────────────────────────── */

/**
 * A person's job in IRM. It decides what IRM shows them first — there is no
 * switcher: a developer's home IS their queue, governance's IS the evergreen and
 * flagged lists. Absent = a business user, the default for anyone who owns reports.
 */
export type IrmRole = 'business' | 'developer' | 'dev-manager' | 'governance' | 'prod-support';

export type IrmChangeType = 'new' | 'break' | 'modification' | 'decommission';

export type Person = { id: string; name: string; initials: string; email: string; irmRole?: IrmRole };

export type Product = 'DART Central' | 'DARTBoards' | 'Aiden';

/**
 * A request's status. The two halves see different words for the same state
 * (Admin Flow ① READ FIRST): New and Needs review both read "Pending review" to
 * the requester; Awaiting reply reads "Needs your reply".
 */
export type RequestStatus =
  | 'new'
  | 'needs-review'
  | 'awaiting-reply'
  | 'approved'
  | 'approved-not-applied'
  | 'applied'
  | 'denied'
  | 'closed';

export type RequestType =
  | 'dashboard-add'
  | 'dashboard-edit'
  | 'dashboard-promote'
  | 'dashboard-remove'
  | 'banner'
  | 'banner-edit'
  | 'general'
  | 'feature';

export type ThreadEntry = {
  id: string;
  /** 'requester' | 'admin' | 'system' */
  author: 'requester' | 'admin' | 'system';
  name: string;
  at: string;
  text: string;
};

export type FieldChange = { field: string; current: string; proposed: string };

export type Request = {
  id: string; // "#0419"
  type: RequestType;
  product: Product;
  title: string;
  summary: string;
  requesterId: string;
  submittedAt: string;
  updatedAt: string;
  status: RequestStatus;
  /** Free-form form values, as submitted. Label → value, in form order. */
  fields: { label: string; value: string }[];
  /** Edit requests carry a diff (Admin Flow: "the review screen shows a DIFF"). */
  changes?: FieldChange[];
  thread: ThreadEntry[];
  /** Asset produced on approval (dashboard / banner id), when there is one. */
  assetId?: string;
};

export type DashboardLifecycle = 'draft' | 'under-review' | 'published' | 'archived';
export type DashboardHealth = 'ok' | 'decommissioning' | 'unreachable';

export type Dashboard = {
  id: string;
  name: string;
  description: string;
  owner: string;
  source: 'Tableau' | 'Power BI' | 'DART';
  category: 'Operations' | 'Finance' | 'Sales' | 'Customer' | 'Risk';
  tags: string[];
  updatedAt: string;
  views: number;
  lifecycle: DashboardLifecycle;
  health: DashboardHealth;
  /** false = the viewer has no access (Dashboard D1.3, Space S2.3). */
  hasAccess: boolean;
  /** A dashboard notice shown inline on the viewer (Dashboard D1.4). */
  notice?: string;
  hue: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  /**
   * Present = a NATIVE dashboard: built with @ui/lib and rendered by DartBoards
   * itself, instead of embedded from a BI tool. See `NativeSpec`.
   */
  native?: NativeSpec;
  /**
   * Present = an EXTERNAL chart: it lives in its BI tool (`source`) and opens
   * there, in a new browser tab. DartBoards keeps a details page for it — the
   * stable address to share — but cannot filter it, read it for Aiden, or
   * show it live in a space.
   */
  external?: { url: string };
  /**
   * The IRM record this listing shows (irm.ts). IRM owns the report — build,
   * access, controls; DartBoards owns only how it is listed. `name` and
   * `description` here are the DISPLAY title and description, which is why
   * they can differ from the IRM name. Absent on seed data = derived.
   */
  irm?: string;
  /** What it is about. Absent = derived from its suite section, else its category. */
  subject?: string;
  /*
   * ── Driven by IRM, never set by hand (irmEngine.ts `project`) ──
   * A listing follows its IRM record: these three are re-derived from the record
   * every time IRM changes, so DartBoards can never disagree with the system of record.
   */
  /** IRM has scheduled the report's retirement: a notice period, then it archives itself. ISO dates. */
  retiring?: { on: string; replacedBy?: string };
  /** IRM retired the report: the listing is archived and spaces show a placeholder pointing here. */
  retired?: { on: string; replacedBy?: string };
  /** What IRM says a viewer should know: controls overdue, or a known issue (an open break). */
  irmFlags?: { controlsOverdue?: boolean; incident?: string };
};

/* ── The native dashboard contract ─────────────────────────────────────────────
   What DartBoards needs to know to HOST a dashboard a team builds with the
   design system, rather than frame one from Tableau. Because DartBoards can
   see inside it, a native dashboard gets things an embed cannot: charts you
   can put in a space one at a time, links to a single chart, filters shared
   across its suite, and an Aiden that reads the numbers rather than a picture.

   In a real build a team would ship this as a manifest plus a render entry;
   here the prototype draws the widgets from generated data. */

/** The filters a suite shares across its native dashboards. */
export type NativeFilters = {
  period: '4w' | '13w' | '26w';
  product: 'all' | 'cards' | 'loans' | 'mortgages';
};

export type NativeWidget = {
  id: string;
  title: string;
  description: string;
  /** `kpis` = a row of headline numbers; `table` = rows that can lead somewhere. */
  kind: 'kpis' | 'line' | 'bar' | 'table';
  /** Key into the prototype's data generator. */
  metric: string;
  /** Columns of the dashboard's 2-column grid. */
  span?: 1 | 2;
};

export type NativeSpec = {
  /** The suite whose shared filters this dashboard follows. */
  suiteId: string;
  /** Which of the suite's filters it accepts. */
  accepts: (keyof NativeFilters)[];
  widgets: NativeWidget[];
};

export type SpaceCardLayout = 'card' | 'thumbnail';

/**
 * One thing on a space. Exactly one of three shapes:
 * - a whole dashboard            → `dashboardId`
 * - ONE chart from a native one  → `dashboardId` + `widgetId`
 * - a metric, workflow or report → `assetId` (and `dashboardId` is '')
 */
export type SpaceItem = {
  dashboardId: string;
  layout: SpaceCardLayout;
  section?: string;
  widgetId?: string;
  assetId?: string;
  /** A BLOCK the space owner adds to shape the space (Builder › Blocks). `dashboardId` is ''. */
  blockId?: string;
  block?: SpaceBlock;
  /** Several views of ONE metric can sit on a space; this tells them apart. */
  viewId?: string;
  /** How a metric is shown here — set on the card, not in the library. */
  metric?: MetricView;
};

/**
 * One metric, one way of looking at it. The same metric can be added several
 * times with different views (a daily number beside a monthly breakdown).
 * `timeframe: 'follow'` takes the space filter bar's period; any other value
 * PINS it, whatever the bar says. Product always follows the bar when there is one.
 */
export type MetricView = {
  display: 'number' | 'trend' | 'breakdown';
  timeframe: 'follow' | 'day' | 'week' | 'mtd';
  breakdown: 'org' | 'region' | 'product';
};

/**
 * Blocks — what a user adds to make a space theirs, as opposed to content from
 * the library. Each one is a full-width row.
 * - `filters`  one per space; when present, its filters drive every live chart in the space
 * - `links`    a titled list of links (an IRM record, a SharePoint folder, a runbook)
 * - `summary`  Aiden's "what changed", read from the space's own charts, metrics and workflows
 * - `kpis`     several metrics in one compact row
 * - `note`     the owner's words — context, caveats — in an Alert tone
 * - `divider`  a rule, optionally labelled, between two runs of cards
 * - `freshness` one per space; whether every source behind the space loaded on time
 */
export type SpaceBlock =
  | { type: 'filters' }
  | { type: 'links'; title: string; links: { id: string; label: string; url: string }[] }
  | { type: 'summary' }
  | { type: 'kpis'; metricIds: string[] }
  | { type: 'note'; title: string; text: string; tone: 'default' | 'info' | 'warning' }
  | { type: 'divider'; label: string }
  | { type: 'freshness' };

/**
 * The other things a space can hold besides dashboards — the kinds the
 * Builder's rail lists. Kept apart from `Dashboard` on purpose: Browse, the
 * request forms and the admin tables are all about DASHBOARDS, and a metric or a
 * workflow showing up there would be noise.
 */
export type AssetKind = 'metric' | 'workflow' | 'report';

export type Asset = {
  id: string;
  kind: AssetKind;
  name: string;
  description: string;
  owner: string;
  /** Where it lives: the metric's source, the workflow engine, the report's format. */
  source: string;
  /** The one line a card shows at a glance — a value, an open count, a cadence. */
  glance: string;
  updatedAt: string;
  /** What it is about — the filter that finds a metric, its dashboards and its workflow together. */
  subject: string;
  /* Kind-specific details, which become kind-specific library filters. */
  metric?: { grains: ('day' | 'week' | 'month')[]; breakdowns: MetricView['breakdown'][]; unit: '%' | 'time' | 'count'; certified: boolean };
  /**
   * Reports are WEB REPORTS that live outside DART Central for now — an external
   * link, opened in a new tab, until a storage solution is chosen. `url` is where.
   */
  report?: { format: string; cadence: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'; audience: string; url: string };
  workflow?: { assignedToMe: number; overdue: number };
};

export type Space = {
  id: string;
  name: string;
  description: string;
  hue: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  items: SpaceItem[];
  pinned?: boolean;
  /** Derived for the signed-in person: true when the space is someone else's, shared with them. */
  shared?: boolean;
  /** Whose space it is. A person sees their own spaces and the ones shared with them. */
  ownerId?: string;
  /** People it is shared with, besides its owner. */
  sharedWith?: string[];
  /** The Builder's layout preset (Builder BL4.7). Absent = auto. */
  layout?: 'auto' | 'two' | 'three' | 'kpis' | 'full';
  /** Space-level notices (Space S3.1/S3.2). */
  banners?: { id: string; variant: 'info' | 'warning'; title: string; text: string }[];
  /** The suite this space was started from. It is still the user's own space — nothing syncs back. */
  fromSuite?: string;
  /** The space's own filters, set by its filter bar block. Ignored unless the space has one. */
  filters?: NativeFilters;
  /**
   * What the space is ABOUT — any subjects in the library, as many as fit. The
   * Builder's library starts from it on every screen, so nobody filters each kind again.
   */
  focus?: string[];
};

/**
 * A SUITE — a set of dashboards a team curates for its own area, published to
 * the whole library. It is a scoped view of Browse, not a second app: every
 * dashboard in it is still an ordinary library dashboard, and the suite adds
 * only an owner, a description and its sections (the grouping a team used to
 * draw as its own left navigation).
 *
 * A suite is NOT a space. A space is yours and you edit it; a suite belongs to
 * its team and you follow it. You can start a space from one.
 */
export type SuiteSection = {
  id: string;
  name: string;
  dashboardIds: string[];
  /** The team's old second navigation level. Every topic's dashboards are also in `dashboardIds`. */
  topics?: { id: string; name: string; dashboardIds: string[] }[];
};

export type Suite = {
  id: string;
  name: string;
  /** The team that owns and curates it. */
  team: string;
  /** The person to ask about it. */
  owner: string;
  description: string;
  hue: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  /**
   * In order; a dashboard may appear in more than one section.
   *
   * A team whose own navigation was NESTED (Stage › Product › dashboard) keeps
   * its top level as sections and its second level as `topics` — shown as a
   * filter inside the section, never as a deeper sidebar. The DartBoards
   * sidebar goes one level below a suite and no further.
   */
  sections: SuiteSection[];
  /** The section the curator puts first for someone new to the suite. Always shown in full. */
  startSectionId?: string;
  updatedAt: string;
};

export type BannerState = 'draft' | 'scheduled' | 'active' | 'expired';

export type Banner = {
  id: string;
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'success' | 'error';
  scope: string[];
  starts: string;
  ends: string;
  state: BannerState;
  visible: boolean;
};

export type Promotion = {
  id: string;
  dashboardId: string;
  placement: string;
  starts: string;
  ends: string;
  state: 'scheduled' | 'active' | 'ended';
};

export type Redirect = { id: string; from: string; to: string; hits: number; updatedAt: string };

export type AdminScope = 'overall' | 'sub' | 'application';

export type Admin = { personId: string; role: AdminScope; products: Product[]; grantedAt: string };

export type ActivityEntry = { id: string; at: string; who: string; action: string; target: string; product: Product };

/** A widget on DART Central Home. `space`, `dashboard` and `quick` can each appear more than once. */
export type HomeTileId =
  | 'waiting'
  | 'aiden'
  | 'watchlist'
  | 'pulse'
  | 'metric'
  | 'reports'
  | 'irm-recert'
  | 'irm-controls'
  | 'irm-changes'
  | 'requests'
  | 'quick'
  | 'tabs'
  | 'whats-new'
  | 'jira'
  | 'heading'
  | 'divider'
  | 'space'
  | 'dashboard'
  | 'queue'
  | 'team'
  | 'deploys'
  | 'governance';
/**
 * A Home widget's size, Apple-style: a few fixed shapes in PIXELS, each with its own design.
 * S (one cell) is the compact glance — a number. M (two cells across) is the glance plus a
 * little more. L (two by two) is the detailed view, item by item. W and XL are full width.
 */
export type HomeSize = 'S' | 'M' | 'L' | 'W' | 'XL';
/** Where a widget sits on a Home grid (x in columns, y in rows) and which size it is there. */
export type HomeGridPos = { x: number; y: number; size: HomeSize };
/**
 * One placed widget. `key` is unique on the page; `ref` is the space or dashboard a pinned widget
 * shows; `actions` are the shortcuts a quick-actions widget holds, and `name` what its owner called it
 * (a quick-actions widget, or a section heading). A widget has TWO places, set by
 * its owner: `lg` on the four-column desktop board and `sm` on the two-column small-screen board.
 */
export type HomeTile = { key: string; id: HomeTileId; ref?: string; actions?: string[]; /** A name its owner gave it (quick-actions widgets). */ name?: string; lg: HomeGridPos; sm: HomeGridPos; /** The six-column board (wide screens): absent until the person arranges one, then kept. */ xl?: HomeGridPos };
/** A bento tile's span on the 12-column grid (Admin Overview). */
export type BentoSize = 3 | 4 | 6 | 8 | 12;

export type AdminWidget =
  | 'queue'
  | 'queue-5'
  | 'activity'
  | 'activity-10'
  | 'kpi-pending'
  | 'kpi-approved'
  | 'kpi-dashboards'
  | 'kpi-never-opened'
  | 'kpi-banners'
  | 'kpi-promoted'
  | 'usage'
  | 'views-by-product'
  | 'dash-most-opened'
  | 'banners-displaying'
  | 'promotions-live'
  | 'access-recent'
  | 'redirects-top'
  | 'irm-catalog';

export type AidenMessage = { id: string; from: 'user' | 'assistant'; text: string };

export type AidenChat = { id: string; title: string; messages: AidenMessage[]; updatedAt: string };
