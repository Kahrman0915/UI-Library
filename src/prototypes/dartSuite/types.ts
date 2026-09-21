/* ── DART Suite prototype · shared types ──────────────────────────────────────
   One prototype, two applications (DART Central and DartBoards) and Aiden on
   top of both. Every screen is addressed by a Route; the tab strip holds one
   Route per open tab, and the sidebar + rail follow the active tab's `app`.

   This file is the contract every screen folder builds against. Add a route
   here before adding a screen for it. */

export type AppId = 'central' | 'boards';

/* ── Routes ─────────────────────────────────────────────────────────────────── */

export type DashboardRequestMode = 'add' | 'edit' | 'promote' | 'remove';
export type RequestKind = 'dashboard' | 'banner' | 'general' | 'feature';

export type Route =
  // DART Central · requester (Figma: Request Flow)
  | { page: 'home' }
  | { page: 'my-requests' }
  | { page: 'request-detail'; id: string }
  | { page: 'new-request' }
  | { page: 'request-form'; kind: RequestKind; mode?: DashboardRequestMode }
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
  | { page: 'browse' }
  | { page: 'space'; id: string }
  | { page: 'shared' }
  | { page: 'builder'; spaceId?: string; seedDashboardId?: string }
  | { page: 'dashboard'; id: string; fromSpaceId?: string }
  // Aiden (Figma: Aiden)
  | { page: 'aiden-launcher' }
  | { page: 'aiden-chat'; chatId: string };

export type PageId = Route['page'];

/** Which application a route belongs to — drives the rail and the sidebar. */
export const appOf = (r: Route): AppId =>
  ['browse', 'space', 'shared', 'builder', 'dashboard'].includes(r.page) ? 'boards' : 'central';

/* ── Domain ─────────────────────────────────────────────────────────────────── */

export type Person = { id: string; name: string; initials: string; email: string };

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
};

export type SpaceCardLayout = 'card' | 'thumbnail';

export type SpaceItem = { dashboardId: string; layout: SpaceCardLayout; section?: string };

export type Space = {
  id: string;
  name: string;
  description: string;
  hue: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  items: SpaceItem[];
  pinned?: boolean;
  shared?: boolean;
  /** The Builder's layout preset (Builder BL4.7). Absent = auto. */
  layout?: 'auto' | 'two' | 'three' | 'kpis' | 'full';
  /** Space-level notices (Space S3.1/S3.2). */
  banners?: { id: string; variant: 'info' | 'warning'; title: string; text: string }[];
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

export type AdminWidget = 'queue' | 'activity' | 'kpi-pending' | 'kpi-approved' | 'kpi-dashboards' | 'usage';

export type AidenMessage = { id: string; from: 'user' | 'assistant'; text: string };

export type AidenChat = { id: string; title: string; messages: AidenMessage[]; updatedAt: string };
