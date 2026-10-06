/* DART Central · Home — the widget catalog, the sizes, and every widget's design.

   Apple's model, in fixed pixels. A widget comes in a few sizes and each size is
   DESIGNED — it never stretches with the screen:

     S   one cell, 240 × 160   the glance: one number, what it counts, one line
     M   two cells, 504 × 160  the number, plus the first few items
     L   2 × 2, 504 × 344      the detail: item by item, each with its action
     W   full row, 1032 × 160  (wide content: the pinned space)
     XL  full width, 2 rows    (the chat, the watchlist, a big space)

   Everything is a door. The header opens the widget's own page; the glance opens
   the list behind the number; every row opens that one item. Lists show as many
   rows as fit and say "N more" only when something is cut off. */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AppWindow,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  Heading1,
  SeparatorHorizontal,
  Clock,
  ChartColumn,
  FolderCheck,
  Gauge,
  FileClock,
  GitPullRequest,
  Inbox,
  LayoutGrid,
  ListChecks,
  ListTodo,
  Megaphone,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from 'lucide-react';
import { Sparkline } from '../../../../charts';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import Progress from '../../../../components/Progress';
import Stack from '../../../../components/Stack';
import Stat from '../../../../components/Stat';
import Text from '../../../../components/Text';
import { toast } from '../../../../components/Toast';
import { PEOPLE } from '../../data';
import { APP_NAME, audienceOf, myIrmChanges, reportChangeRoute, waitingOn } from '../../hub';
import type { Audience, WaitingItem } from '../../hub';
import { CHANGE_STATUS, CHANGE_TYPE, CONTROL_STATE, EVERGREEN, PRIORITY, WORK_STATUSES, evergreenState, fmtIso, isAged, recordName } from '../../irm';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import { openItems } from '../../openItems';
import type { SuiteState } from '../../store';
import type { Dashboard, HomeGridPos, HomeSize, HomeTile, HomeTileId, Route } from '../../types';
import { WHATS_NEW } from '../whatsNew/entries';
import { tabMeta } from '../../Shell';
import { APP_ICON } from '../../appIcons';
import { Conversation } from '../aiden/Conversation';
import { STARTERS } from '../aiden/engine';
import { AttestDialog } from '../irm/Evidence';
import { useIrm } from '../irm/shared';
import { metricNumber, metricTrend } from '../boards/space/MetricViewCard';
import { DEFAULT_NATIVE_FILTERS } from '../boards/native/nativeData';
import { useWaitingActions } from './RoleWork';
import { BigStat, FitFrame, KpiGrid, KpiTile, useBox, useFit } from './fit';
import { WEEKS, change4, glanceTrend, controlsDue, flagOf, ownedReports, recertsDue, sumSeries, viewsOf, watched } from './homeData';
import { JIRA_STATUS_TONE, isUrgent, myJiraTickets, openInJira } from './jira';
import { QUICK_CAPACITY, availableActions, defaultActions, isTabSetAction, quickAction, quickTitle, tabSetActionId } from './quickActions';

/* ── The catalog ─────────────────────────────────────────────────────────── */

export const WIDGET_GROUPS = ['Everyday', 'Aiden', 'DartBoards', 'IRM', 'Jira', 'Blocks'] as const;
export type WidgetGroup = (typeof WIDGET_GROUPS)[number];

/** Which application a widget speaks for — tagged in its header, so nobody has to guess. */
export type WidgetApp = 'all' | 'central' | 'boards' | 'irm' | 'aiden' | 'jira';
export const APP_LABEL: Record<WidgetApp, string> = { all: 'All your apps', central: 'DART Central', boards: 'DartBoards', irm: 'IRM', aiden: 'Aiden', jira: 'Jira' };

/**
 * The tag a widget from one application carries: its name, its colour, and the SAME icon the app rail
 * shows for it — so the mark on Home is the mark you click to open the app. A widget's own icon is
 * then free to say what the widget is, and is never the app's mark.
 */
export const APP_TAG: Partial<Record<WidgetApp, { label: string; color: 'blue' | 'violet' | 'sky'; Icon: LucideIcon }>> = {
  boards: { label: 'DartBoards', color: 'blue', Icon: APP_ICON.boards },
  irm: { label: 'IRM', color: 'violet', Icon: APP_ICON.irm },
  jira: { label: 'Jira', color: 'sky', Icon: APP_ICON.jira },
};

export type WidgetDef = {
  title: string;
  /** What the widget is, in the Add to Home list. */
  description: string;
  app: WidgetApp;
  group: WidgetGroup;
  Icon: LucideIcon;
  /** Pins one space or dashboard (`space`, `dashboard`), or holds the actions its owner picked (`actions`). */
  pick?: 'space' | 'dashboard' | 'metric' | 'actions';
  /** Only these people can add it (absent = everyone). */
  for?: Audience[];
  /** Admins only: numbers about how the APPLICATIONS are used, which business users have no use for. */
  admin?: boolean;
  /** The sizes it has a design for, and the one it starts at. */
  sizes: HomeSize[];
  size: HomeSize;
  /** Where the header goes. Absent = the header is not a link. */
  to?: (t: HomeTile, audience: Audience) => Route;
  /** For a widget whose home is OUTSIDE DART Central (Jira): the header opens it in a new tab. */
  open?: () => void;
  /** Not a widget but a piece of the board's structure — a section heading or a separator. Full width, no card. */
  block?: boolean;
};


export const WIDGETS: Record<HomeTileId, WidgetDef> = {
  waiting: { title: 'Needs your attention', description: 'Approvals, replies, reviews and recertifications from every application — done right here.', app: 'all', group: 'Everyday', Icon: Inbox, sizes: ['S', 'M', 'L'], size: 'L', to: () => ({ page: 'my-requests' }) },
  requests: { title: 'Open items', description: 'Everything that needs you or is waiting on someone — your requests, your IRM work and your Jira tickets.', app: 'all', group: 'Everyday', Icon: ListChecks, sizes: ['S', 'M', 'L'], size: 'M', to: () => ({ page: 'my-requests' }) },
  quick: { title: 'Quick actions', description: 'Shortcuts you choose — New IRM request, Browse, New space… Add one per application if you like.', app: 'central', group: 'Everyday', Icon: Zap, pick: 'actions', sizes: ['S', 'M', 'L'], size: 'S' },
  tabs: { title: 'Jump back in', description: 'The pages you have open, one click away.', app: 'all', group: 'Everyday', Icon: Clock, sizes: ['M', 'L'], size: 'M' },
  'whats-new': { title: 'What’s new', description: 'The latest releases across DART Central.', app: 'central', group: 'Everyday', Icon: Megaphone, sizes: ['M', 'L'], size: 'M', to: () => ({ page: 'whats-new' }) },
  aiden: { title: 'Ask Aiden', description: 'A chat with Aiden, always open on your home.', app: 'aiden', group: 'Aiden', Icon: Sparkles, sizes: ['L', 'XL'], size: 'L', to: () => ({ page: 'aiden-launcher' }) },
  watchlist: { title: 'Your dashboards', description: 'Every dashboard on your spaces, one click away, with any notices.', app: 'boards', group: 'DartBoards', Icon: Activity, sizes: ['M', 'L'], size: 'L', to: () => ({ page: 'browse' }) },
  metric: { title: 'Metric', description: 'Pin one business metric from DartBoards — its value, its change, and who owns it.', app: 'boards', group: 'DartBoards', Icon: Gauge, pick: 'metric', sizes: ['S', 'M'], size: 'S', to: (t) => ({ page: 'metric', id: t.ref ?? '' }) },
  pulse: { title: 'DartBoards views', description: 'How much the dashboards you watch are used — views this week, for admins.', app: 'boards', group: 'DartBoards', Icon: BarChart3, admin: true, sizes: ['S', 'M'], size: 'S', to: () => ({ page: 'browse' }) },
  space: { title: 'Space', description: 'Pin one of your spaces: its metrics with their values, and its dashboards one click away.', app: 'boards', group: 'DartBoards', Icon: LayoutGrid, pick: 'space', sizes: ['M', 'L', 'W', 'XL'], size: 'L', to: (t) => ({ page: 'space', id: t.ref ?? '' }) },
  dashboard: { title: 'Dashboard', description: 'Pin one dashboard as a one-click way into it.', app: 'boards', group: 'DartBoards', Icon: ChartColumn, pick: 'dashboard', sizes: ['S', 'M'], size: 'S', to: (t) => ({ page: 'dashboard', id: t.ref ?? '' }) },
  reports: { title: 'IRM reports you own', description: 'Your reports in IRM: controls, recertification and DartBoards listings, report by report.', app: 'irm', group: 'IRM', Icon: FolderCheck, for: ['owner'], sizes: ['S', 'M', 'L'], size: 'M', to: () => ({ page: 'irm-records' }) },
  'irm-recert': { title: 'Recertifications', description: 'Reports you own that are due to be recertified — certify them right here.', app: 'irm', group: 'IRM', Icon: FileClock, for: ['owner'], sizes: ['S', 'M', 'L'], size: 'S', to: () => ({ page: 'irm-records' }) },
  'irm-controls': { title: 'Controls to attest', description: 'IRM controls you answer for that are overdue or coming due — attest them right here.', app: 'irm', group: 'IRM', Icon: ClipboardCheck, sizes: ['S', 'M', 'L'], size: 'S', to: () => ({ page: 'irm-records' }) },
  'irm-changes': { title: 'Your IRM requests', description: 'The report requests you filed in IRM — new, break, change, retire — and where each one is.', app: 'irm', group: 'IRM', Icon: GitPullRequest, sizes: ['S', 'M', 'L'], size: 'M', to: (_t, a) => (a === 'owner' || a === 'reader' ? { page: 'my-requests' } : { page: 'irm-changes' }) },
  queue: { title: 'Your queue', description: 'IRM requests assigned to you, by priority.', app: 'irm', group: 'IRM', Icon: ListTodo, for: ['developer'], sizes: ['S', 'M', 'L'], size: 'L', to: () => ({ page: 'irm-home' }) },
  team: { title: 'Team load', description: 'Work in progress per developer, and what nobody has yet.', app: 'irm', group: 'IRM', Icon: Users, for: ['dev-manager'], sizes: ['M', 'L'], size: 'L', to: () => ({ page: 'irm-board' }) },
  deploys: { title: 'Deployments', description: 'What’s waiting to go out — take it or deploy it here.', app: 'irm', group: 'IRM', Icon: Rocket, for: ['prod-support', 'dev-manager'], sizes: ['S', 'M', 'L'], size: 'L', to: () => ({ page: 'irm-deployments' }) },
  jira: { title: 'Jira tickets', description: 'Tickets assigned to you in Jira — blocked and high priority first. Each one opens in Jira.', app: 'jira', group: 'Jira', Icon: Ticket, sizes: ['S', 'M', 'L'], size: 'M', open: () => openInJira() },
  heading: { title: 'Section heading', description: 'A title across the board, to start a section of your own — name it anything.', app: 'all', group: 'Blocks', Icon: Heading1, sizes: ['W'], size: 'W', block: true },
  divider: { title: 'Separator', description: 'A line across the board, to set one group of widgets apart from the next.', app: 'all', group: 'Blocks', Icon: SeparatorHorizontal, sizes: ['W'], size: 'W', block: true },
  governance: { title: 'Governance', description: 'Evidence to review, recertifications past due, requests past SLA.', app: 'irm', group: 'IRM', Icon: ShieldCheck, for: ['governance'], sizes: ['S', 'M', 'L'], size: 'M', to: () => ({ page: 'irm-governance' }) },
};

/** Each group keeps one color — the same the journey map uses for its application. */
export const GROUP_COLOR: Record<WidgetGroup, FeaturedIconColor> = { Everyday: 'default', Aiden: 'purple', DartBoards: 'blue', IRM: 'violet', Jira: 'sky', Blocks: 'default' };
/** The color group a placed widget's application takes. */
export const appGroup = (app: WidgetApp): WidgetGroup => (app === 'irm' ? 'IRM' : app === 'boards' ? 'DartBoards' : app === 'aiden' ? 'Aiden' : app === 'jira' ? 'Jira' : 'Everyday');

export const tileKey = (id: HomeTileId, ref?: string) => (ref ? `${id}:${ref}` : id);

/* ── The board and the sizes ── */

/** One cell, in pixels: --w-60 × --h-40, with a --p-6 gap. Home.scss builds the board from the same tokens. */
export const CELL = { w: 240, h: 160, gap: 24 } as const;
/**
 * The board's column count follows the page: it fills the narrow reading column (Open items, My IRM) with as many cells as
 * fit, 4 at 1440 and 6 at 1920, 2 on a phone. Always an EVEN count — most widgets are two columns wide,
 * so an odd count leaves a column only Smalls can fill and the board reads as gappy (tried: 3 and 5).
 * Cells are at most 240 and give down to 190 to keep a count. Each count keeps its own arrangement,
 * first reflowed in reading order from the four-column one.
 */
export type BoardBp = 'sm' | 'lg' | 'xl';
export const BOARD_COLS: Record<BoardBp, number> = { sm: 2, lg: 4, xl: 6 };
/** The smallest a cell gets before the board drops to fewer columns. */
export const CELL_MIN = 190;
/** The most columns that fit `width` at the minimum cell, as a breakpoint. */
export const boardBp = (width: number): BoardBp => {
  const fits = (n: number) => n * CELL_MIN + (n - 1) * CELL.gap <= width;
  return fits(6) ? 'xl' : fits(4) ? 'lg' : 'sm';
};
export const SIZE_LABEL: Record<HomeSize, string> = { S: 'Small', M: 'Medium', L: 'Large', W: 'Wide', XL: 'Extra large' };
export const SIZE_HINT: Record<HomeSize, string> = {
  S: 'The number at a glance',
  M: 'The number and the first few items',
  L: 'Item by item, with actions',
  W: 'Across the whole row',
  XL: 'The whole width, twice as tall',
};
// Wide and Extra large span the whole row, whatever the row holds.
const sizes = (cols: number): Record<HomeSize, { w: number; h: number }> => ({ S: { w: 1, h: 1 }, M: { w: 2, h: 1 }, L: { w: 2, h: 2 }, W: { w: cols, h: 1 }, XL: { w: cols, h: 2 } });
export const SIZE_GEOMETRY: Record<BoardBp, Record<HomeSize, { w: number; h: number }>> = { sm: sizes(2), lg: sizes(4), xl: sizes(6) };
/**
 * The board's rows are 8px, so a thin block (a heading, a separator) can sit between widgets.
 * A widget cell is 23 of them: its 160px plus the 24px gap under it, which its slot pads in.
 */
export const ROW = 8;
export const CELL_ROWS = (CELL.h + CELL.gap) / ROW;
/** A block's height in rows: a heading is its line of type and 12px under it; a separator is 24px with the line on top. */
const BLOCK_ROWS: Partial<Record<HomeTileId, number>> = { heading: 5, divider: 3 };

/** A placed widget's box on a board, in columns and 8px rows. Blocks always span the board. */
export const geometry = (bp: BoardBp, p: HomeGridPos, id: HomeTileId) =>
  WIDGETS[id].block ? { w: BOARD_COLS[bp], h: BLOCK_ROWS[id] ?? 3 } : { w: SIZE_GEOMETRY[bp][p.size].w, h: SIZE_GEOMETRY[bp][p.size].h * CELL_ROWS };

/** First free spot for a widget on a board already holding `taken`: top row first, then leftmost. */
function firstFit(bp: BoardBp, taken: HomeTile[], id: HomeTileId, size: HomeSize): HomeGridPos {
  const { w, h } = geometry(bp, { x: 0, y: 0, size }, id);
  const cols = BOARD_COLS[bp];
  const boxes = taken.filter((t) => t[bp]).map((t) => ({ ...t[bp]!, ...geometry(bp, t[bp]!, t.id) }));
  const clash = (x: number, y: number) => boxes.some((p) => x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y);
  // A block goes under everything; a widget takes the first hole it fits.
  const start = WIDGETS[id].block ? Math.max(0, ...boxes.map((b) => b.y + b.h)) : 0;
  for (let y = start; ; y++) for (let x = 0; x + w <= cols; x++) if (!clash(x, y)) return { x, y, size };
}

/** A new widget, at the size asked for (or its default), in the first free spot on both boards. */
export function placeTile(id: HomeTileId, ref: string | undefined, existing: HomeTile[], size: HomeSize = WIDGETS[id].size, actions?: string[], name?: string): HomeTile {
  return {
    key: tileKey(id, ref),
    id,
    ref,
    actions,
    name,
    lg: firstFit('lg', existing, id, size),
    sm: firstFit('sm', existing, id, size),
    xl: firstFit('xl', onBoard(existing, 'xl'), id, size),
  };
}

/**
 * Every tile placed on the `bp` board. A board the person has never arranged is reflowed from the
 * four-column one in reading order (top to bottom, left to right), each widget into the first hole
 * it fits — so the same widgets come in the same order, packed to the new width.
 */
export function onBoard(layout: HomeTile[], bp: BoardBp): HomeTile[] {
  if (layout.every((t) => t[bp])) return layout;
  const order = [...layout].sort((a, b) => a.lg.y - b.lg.y || a.lg.x - b.lg.x);
  // Tiles already arranged here keep their places; the rest fill in around them.
  const placed = order.filter((t) => t[bp]);
  for (const t of order) if (!t[bp]) placed.push({ ...t, [bp]: firstFit(bp, placed, t.id, t.lg.size) });
  return layout.map((t) => placed.find((p) => p.key === t.key)!);
}

/** A saved layout from before the current board (12 columns, Today as a widget, whole-cell rows) cannot be placed on it. */
export const layoutFits = (layout: HomeTile[]) =>
  layout.every((t) => WIDGETS[t.id] && WIDGETS[t.id].sizes.includes(t.lg.size) && t.lg.x + geometry('lg', t.lg, t.id).w <= BOARD_COLS.lg);

type Pick = { id: HomeTileId; ref?: string; actions?: string[] };

/**
 * A role's starting home, DESIGNED rather than packed: the person's main work and Aiden, both
 * Large, side by side; then the numbers they check, as Mediums and Smalls. Four columns, no holes.
 */
export function defaultLayout(audience: Audience, state: SuiteState, personId: string): HomeTile[] {
  const ownSpace = state.spaces.find((s) => s.ownerId === personId);
  const numbers: Pick = ownSpace ? { id: 'space', ref: ownSpace.id } : watched(state).length ? { id: 'watchlist' } : { id: 'whats-new' };
  const irmActions: Pick = { id: 'quick', ref: 'irm', actions: defaultActions(audience) };
  /*
   * Each role's home, designed (owner, 2026-10-06). The same three rules for every role:
   *   1. Next up (above Today) already names the first thing to do, so the board does not repeat it.
   *   2. Row one is the role's two main tools, Large and side by side — the whole first screen at 1440.
   *   3. No card says what another card, Today or Next up already says. Aiden is the floating button on
   *      every page, so it is not a card here; anyone can add it back.
   * Below the first screen: the supporting cards, Medium.
   */
  const plan: [Pick, number, number, HomeSize][] =
    audience === 'owner'
      ? // Business owner: decide what is asked of them, and keep the reports they own healthy — then their numbers.
        [
          [{ id: 'waiting' }, 0, 0, 'L'], // approvals, replies, recertifications — the job
          [numbers, 2, 0, 'L'], // the business they answer for
          // Their reports' recertification and controls are Today's numbers, so no reports card repeats them.
          [{ id: 'requests' }, 0, 2, 'M'], // Open items: what they are waiting on (Needs you is above)
          [{ id: 'jira' }, 2, 2, 'M'], // UAT sign-off tickets on their requests
          [irmActions, 0, 3, 'M'],
        ]
      : audience === 'reader'
        ? // Report reader: the numbers are the job. Nothing is usually waiting on them, so no inbox card.
          // Their metrics are Today's numbers; their space (or, with none, the dashboards they watch) is the
          // board's anchor. A watchlist beside their own space would list the same dashboards twice.
          // A space with metrics gets the room to show them (Large); one holding only dashboards is a row
          // of links and starts Medium, so the first screen is not half empty.
          ownSpace && !spaceMetrics(state, ownSpace.id).length
            ? [
                [numbers, 0, 0, 'M'],
                [{ id: 'requests' }, 2, 0, 'M'], // what they asked for
                [{ id: 'whats-new' }, 0, 1, 'M'],
                [{ id: 'quick', ref: 'start', actions: ['new-request', 'browse'] }, 2, 1, 'M'],
              ]
            : [
                [numbers, 0, 0, 'L'],
                [{ id: 'requests' }, 2, 0, 'M'],
                [{ id: 'whats-new' }, 2, 1, 'M'],
                [{ id: 'quick', ref: 'start', actions: ['new-request', 'browse'] }, 0, 2, 'M'],
              ]
        : audience === 'developer'
          ? // Developer: ship what is assigned. The IRM queue and the Jira tickets it breaks into, side by side.
            [
              [{ id: 'queue' }, 0, 0, 'L'],
              [{ id: 'jira' }, 2, 0, 'L'],
              [{ id: 'requests' }, 0, 2, 'M'], // what they raised and are waiting on
              [irmActions, 2, 2, 'M'],
            ]
          : audience === 'dev-manager'
            ? // Development manager: keep work flowing — assign what nobody has, see the load, see what ships.
              [
                [{ id: 'waiting' }, 0, 0, 'L'], // unassigned work, each with Assign
                [{ id: 'team' }, 2, 0, 'L'], // load per developer
                [{ id: 'deploys' }, 0, 2, 'M'],
                [{ id: 'jira' }, 2, 2, 'M'],
                [irmActions, 0, 3, 'M'],
              ]
            : audience === 'governance'
              ? // Governance: evidence to review, recertifications past due, requests past SLA.
                [
                  [{ id: 'waiting' }, 0, 0, 'L'], // evidence to review, each with Review
                  [{ id: 'governance' }, 2, 0, 'L'],
                  [{ id: 'jira' }, 0, 2, 'M'],
                  [irmActions, 2, 2, 'M'],
                ]
              : // Production support: what is waiting to go out, and the tickets around it.
                [
                  [{ id: 'deploys' }, 0, 0, 'L'],
                  [{ id: 'jira' }, 2, 0, 'L'],
                  [{ id: 'requests' }, 0, 2, 'M'],
                  [irmActions, 2, 2, 'M'],
                ];
  const seen = new Set<string>();
  const placed: HomeTile[] = [];
  for (const [p, x, y, size] of plan) {
    const key = tileKey(p.id, p.ref);
    if (seen.has(key) || (WIDGETS[p.id].for && !WIDGETS[p.id].for!.includes(audience)) || (WIDGETS[p.id].admin && !state.adminScope)) continue;
    seen.add(key);
    placed.push({ key, id: p.id, ref: p.ref, actions: p.actions, lg: { x, y: y * CELL_ROWS, size }, sm: { x: 0, y: 0, size } });
  }
  // Small screens: the same widgets in reading order; two Smalls share a row.
  const sm: HomeTile[] = [];
  for (const t of placed) sm.push({ ...t, sm: firstFit('sm', sm, t.id, t.lg.size) });
  return sm;
}

/** What Home shares with its widgets: the Aiden chat stays open across re-renders and customizing. */
export const HomeCtx = createContext<{ aidenChat: string | null; setAidenChat: (id: string | null) => void }>({ aidenChat: null, setAidenChat: () => {} });

/* ── Titles and links ── */

/** The title a placed widget shows: a pinned one takes the name of what it pins. */
export function widgetTitle(t: HomeTile, state: SuiteState) {
  if (t.id === 'space') return state.spaces.find((s) => s.id === t.ref)?.name ?? 'Space';
  if (t.id === 'dashboard') return state.dashboards.find((d) => d.id === t.ref)?.name ?? 'Dashboard';
  if (t.id === 'metric') return state.assets.find((a) => a.id === t.ref)?.name ?? 'Metric';
  if (t.id === 'quick') return t.name?.trim() || quickTitle(t.actions ?? []);
  return WIDGETS[t.id].title;
}

/**
 * The line under a widget's title: what it shows, in a few words — so a board of widgets reads at a glance
 * without opening any of them. Shown from Medium up; a Small has room for its number and nothing more.
 */
const SUBTITLE: Record<HomeTileId, string> = {
  waiting: 'From every app',
  requests: 'Your work and what you’re waiting on',
  quick: 'Your shortcuts',
  tabs: 'The pages you have open',
  'whats-new': 'The latest releases',
  aiden: 'Ask anything about your reports',
  watchlist: 'Every dashboard on your spaces',
  metric: 'A metric you pinned',
  pulse: 'How much your dashboards are used',
  space: 'A space you pinned',
  dashboard: 'A dashboard you pinned',
  reports: 'Reports where you are the business owner',
  'irm-recert': 'Reports due to be recertified',
  'irm-controls': 'Overdue or coming due',
  'irm-changes': 'The requests you filed in IRM',
  queue: 'Highest priority first',
  team: 'What each developer has in progress',
  deploys: 'Waiting to go out',
  jira: 'Blocked and high priority first',
  heading: '',
  divider: '',
  governance: 'Evidence, recertifications and SLAs',
};

export function widgetSubtitle(t: HomeTile, state: SuiteState) {
  if (t.id === 'space') {
    const sp = state.spaces.find((x) => x.id === t.ref);
    const n = sp?.items.filter((i) => i.dashboardId).length ?? 0;
    return sp ? `Your space · ${n} ${n === 1 ? 'dashboard' : 'dashboards'}` : SUBTITLE.space;
  }
  if (t.id === 'dashboard') {
    const d = state.dashboards.find((x) => x.id === t.ref);
    return d ? `Pinned dashboard · ${d.category}` : SUBTITLE.dashboard;
  }
  if (t.id === 'metric') {
    const a = state.assets.find((x) => x.id === t.ref);
    return a ? `Pinned metric · ${a.owner}` : SUBTITLE.metric;
  }
  return SUBTITLE[t.id];
}

/**
 * How loud a widget should be right now, judged from the same data it shows:
 *   urgent — it holds something overdue, blocked or past its SLA. The card lifts and its header says
 *            what (a Badge — never a coloured edge on the card).
 *   quiet  — it holds nothing for you. The card recedes and says "All caught up" instead of an empty list.
 *   normal — everything else, including widgets that are not lists (spaces, metrics, shortcuts, Aiden).
 * So the page looks different on a bad day than on a calm one, and the eye goes to the loud card.
 */
export type WidgetPulse = { level: 'urgent' | 'quiet' | 'normal'; label?: string; caughtUp?: string };

export function widgetPulse(t: HomeTile, state: SuiteState, personId: string): WidgetPulse {
  const today = state.irm.today;
  const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
  switch (t.id) {
    case 'requests': {
      const open = openItems(state, personId).filter((m) => m.section === 'progress' || m.section === 'waiting');
      return open.length ? { level: 'normal' } : { level: 'quiet', caughtUp: 'Nothing in progress or waiting on anyone.' };
    }
    case 'waiting': {
      const items = waitingOn(state, personId);
      const urgent = items.filter((w) => w.urgent).length;
      if (!items.length) return { level: 'quiet', caughtUp: 'Nothing needs you in any app.' };
      return urgent ? { level: 'urgent', label: `${urgent} can’t wait` } : { level: 'normal' };
    }
    case 'jira': {
      const tickets = myJiraTickets(personId);
      const blocked = tickets.filter((x) => x.status === 'Blocked').length;
      if (!tickets.length) return { level: 'quiet', caughtUp: 'No Jira tickets assigned.' };
      return blocked ? { level: 'urgent', label: `${blocked} blocked` } : { level: 'normal' };
    }
    case 'irm-recert': {
      const due = recertsDue(state, personId);
      const past = due.filter((r) => evergreenState(r, today) === 'past-due').length;
      if (!due.length) return { level: 'quiet', caughtUp: 'Every report you own is recertified.' };
      return past ? { level: 'urgent', label: `${past} past due` } : { level: 'normal' };
    }
    case 'irm-controls': {
      const due = controlsDue(state, personId);
      const over = due.filter((c) => c.state === 'overdue').length;
      if (!due.length) return { level: 'quiet', caughtUp: 'No controls coming due.' };
      return over ? { level: 'urgent', label: `${over} overdue` } : { level: 'normal' };
    }
    case 'queue': {
      const mine = state.irm.changes.filter((c) => c.assigneeId === personId && WORK_STATUSES.includes(c.status));
      const late = mine.filter((c) => isAged(c, today, state.irm.workflows)).length;
      if (!mine.length) return { level: 'quiet', caughtUp: 'Nothing assigned to you.' };
      return late ? { level: 'urgent', label: `${late} past SLA` } : { level: 'normal' };
    }
    case 'team': {
      const late = state.irm.changes.filter((c) => CHANGE_STATUS[c.status].active && isAged(c, today, state.irm.workflows)).length;
      return late ? { level: 'urgent', label: `${late} past SLA` } : { level: 'normal' };
    }
    case 'deploys': {
      const ship = state.irm.changes.filter((c) => c.status === 'awaiting-deployment');
      const late = ship.filter((c) => isAged(c, today, state.irm.workflows)).length;
      if (!ship.length) return { level: 'quiet', caughtUp: 'Nothing waiting to go out.' };
      return late ? { level: 'urgent', label: `${late} past SLA` } : { level: 'normal' };
    }
    case 'governance': {
      const live = state.irm.records.filter((r) => r.lifecycle === 'production' || r.lifecycle === 'retiring');
      const past = live.filter((r) => evergreenState(r, today) === 'past-due').length;
      return past ? { level: 'urgent', label: `${n(past, 'recert')} past due` } : { level: 'normal' };
    }
    case 'reports': {
      const owned = ownedReports(state, personId);
      const past = owned.filter((r) => evergreenState(r, today) === 'past-due').length;
      const over = controlsDue(state, personId).filter((c) => c.state === 'overdue').length;
      if (past || over) return { level: 'urgent', label: past ? `${past} past due` : `${over} overdue` };
      return { level: 'normal' };
    }
    default:
      return { level: 'normal' };
  }
}

/** The application a placed widget speaks for. A quick-actions widget takes its actions' app. */
export function widgetApp(t: HomeTile): WidgetApp {
  if (t.id !== 'quick') return WIDGETS[t.id].app;
  const apps = [...new Set((t.actions ?? []).map((id) => quickAction(id)?.app))];
  return apps.length === 1 && (apps[0] === 'irm' || apps[0] === 'boards' || apps[0] === 'aiden') ? apps[0] : 'central';
}

/* ── Building blocks: one look for every widget ── */

type Tone = 'default' | 'success' | 'warning' | 'error';
const tone = (t: string): Tone => (t === 'success' || t === 'warning' || t === 'error' ? t : 'default');

/** One item a widget can list. The row opens `route`; `action` does the thing in place. */
type Row = { key: string; title: string; detail?: string; meta?: string; metaTone?: Tone; Icon?: LucideIcon; route?: Route; onOpen?: () => void; action?: { label: string; run: () => void } };

/** Everything a list widget needs to draw itself at any size. */
type ListSpec = {
  value: number | string;
  /** What the number counts, said as a phrase: "things need your attention". */
  label: string;
  tone?: Tone;
  context: string;
  progress?: number;
  route?: Route;
  /** Instead of `route`, for a list whose home is outside DART Central. */
  onOpen?: () => void;
  rows: Row[];
  empty: string;
  more: { label: (n: number) => string; route?: Route };
  /** Dialogs an action opens. */
  extra?: ReactNode;
  /** Numbers to show above the rows at Medium and Large, in place of the single glance. */
  kpis?: Parameters<typeof KpiTile>[0][];
};

/** Fit props for a list item: the measuring mark, and hidden once it no longer fits. */
const fitProps = (fit: ReturnType<typeof useFit>, i: number, cls: string) => {
  const f = fit.row(i);
  return { 'data-fit': '', className: `${cls}${f.className ? ' ' + f.className : ''}`, 'aria-hidden': f['aria-hidden'] };
};

function useOpen() {
  const { go } = useNav();
  return (r: Row) => (r.onOpen ? r.onOpen() : r.route && go(r.route));
}

/** Medium: one line per item — what it is on the left, where it stands on the right. */
function Lines({ id, spec, counted = false }: { id: string; spec: ListSpec; counted?: boolean }) {
  const open = useOpen();
  // Beside its own number (`counted`) the list needs no "N more": the total is already on screen.
  const fit = useFit(spec.rows.length, !counted);
  if (!spec.rows.length) return <Text size="sm" tone="muted">{spec.empty}</Text>;
  return (
    <FitFrame fit={fit} more={counted ? undefined : { id: `${id}-more`, label: spec.more.label, route: spec.more.route, onClick: spec.more.route ? undefined : spec.onOpen }}>
      <ul className="ds-home-lines">
        {spec.rows.map((r, i) => (
          <li key={r.key} {...fitProps(fit, i, '')}>
            <button type="button" className="ds-home-line" onClick={() => open(r)}>
              {r.Icon && <r.Icon aria-hidden="true" className="ds-home-line__icon" />}
              <span className="ds-home-line__title">{r.title}</span>
              {r.meta && <span className={`ds-home-line__meta ds-tone--${r.metaTone ?? 'muted'}`}>{r.meta}</span>}
            </button>
          </li>
        ))}
      </ul>
    </FitFrame>
  );
}

/** Large: two lines per item and its action — the detailed view. */
function Rows({ id, spec }: { id: string; spec: ListSpec }) {
  const open = useOpen();
  const fit = useFit(spec.rows.length);
  if (!spec.rows.length) return <Text size="sm" tone="muted">{spec.empty}</Text>;
  return (
    <FitFrame fit={fit} more={{ id: `${id}-more`, label: spec.more.label, route: spec.more.route, onClick: spec.more.route ? undefined : spec.onOpen }}>
      <ul className="ds-rows">
        {spec.rows.map((r, i) => (
          <li key={r.key} {...fitProps(fit, i, 'ds-row')}>
            <button type="button" className="ds-row__main" onClick={() => open(r)}>
              {r.Icon && <r.Icon aria-hidden="true" className="ds-row__icon" />}
              <span className="ds-row__text">
                <span className="ds-row__title">{r.title}</span>
                {r.detail && <span className="ds-row__detail">{r.detail}</span>}
              </span>
            </button>
            {r.meta && <Badge id={`${id}-${r.key}-meta`} label={r.meta} color={r.metaTone && r.metaTone !== 'default' ? r.metaTone : 'default'} appearance="soft" className="ds-row__meta" />}
            {r.action && <Button id={`${id}-${r.key}-act`} size="xs" style="outline" label={r.action.label} onClick={r.action.run} />}
          </li>
        ))}
      </ul>
    </FitFrame>
  );
}

/** Medium, for a list: the number on the left, the first items beside it. */
function Glance({ id, spec }: { id: string; spec: ListSpec }) {
  const openSpec = useOpenSpec();
  return (
    <div className="ds-glance">
      <button type="button" className="ds-glance__stat" onClick={() => openSpec(spec)}>
        <span className="ds-glance__value">{spec.value}</span>
        <span className="ds-glance__label">{spec.label}</span>
        {spec.tone && spec.tone !== 'default' && <span className={`ds-glance__context ds-tone--${spec.tone}`}>{spec.context}</span>}
      </button>
      <div className="ds-glance__list">
        <Lines id={id} spec={spec} counted />
      </div>
    </div>
  );
}

/** Draw a list widget in the design for its size. */
/** Open what a list widget's number stands for: a page in DART Central, or (`onOpen`) somewhere outside it. */
function useOpenSpec() {
  const { go } = useNav();
  return (spec: ListSpec) => (spec.onOpen ? spec.onOpen() : spec.route && go(spec.route));
}

function ListWidget({ id, spec, size }: { id: string; spec: ListSpec; size: HomeSize }) {
  const openSpec = useOpenSpec();
  let body: ReactNode;
  if (size === 'S') body = <BigStat id={`${id}-glance`} label={spec.label} value={spec.value} tone={spec.tone} progress={spec.progress} context={spec.context} onClick={() => openSpec(spec)} />;
  else if (size === 'M') body = spec.kpis ? <Kpis spec={spec} oneRow /> : <Glance id={id} spec={spec} />;
  else
    body = (
      <>
        {spec.kpis && <Kpis spec={spec} oneRow />}
        <Rows id={id} spec={spec} />
      </>
    );
  return (
    <>
      {body}
      {spec.extra}
    </>
  );
}

function Kpis({ spec, oneRow }: { spec: ListSpec; oneRow?: boolean }) {
  return (
    <KpiGrid oneRow={oneRow}>
      {spec.kpis!.map((k) => (
        <KpiTile key={k.id} {...k} />
      ))}
    </KpiGrid>
  );
}

/* ── The widgets ─────────────────────────────────────────────────────────── */

/** The widget's content, in the design for its size. */
export function WidgetBody({ tile: t, size }: { tile: HomeTile; size: HomeSize }) {
  const id = `ds-home-${t.key.replace(/[^a-z0-9-]/gi, '-')}`;
  switch (t.id) {
    case 'waiting':
      return <NeedsYou id={id} size={size} />;
    case 'requests':
      return <Requests id={id} size={size} />;
    case 'quick':
      return <Quick id={id} actions={t.actions ?? []} size={size} />;
    case 'tabs':
      return <JumpBackIn id={id} size={size} />;
    case 'whats-new':
      return <WhatsNew id={id} size={size} />;
    case 'aiden':
      return <AidenChat size={size} />;
    case 'watchlist':
      return <Watchlist id={id} size={size} />;
    case 'pulse':
      return <Pulse size={size} />;
    case 'space':
      return <PinnedSpace id={id} spaceId={t.ref ?? ''} size={size} />;
    case 'dashboard':
      return <PinnedDashboard id={t.ref ?? ''} size={size} />;
    case 'metric':
      return <PinnedMetric id={t.ref ?? ''} size={size} />;
    case 'reports':
      return <Reports id={id} size={size} />;
    case 'irm-recert':
      return <Recerts id={id} size={size} />;
    case 'irm-controls':
      return <Controls id={id} size={size} />;
    case 'irm-changes':
      return <IrmChanges id={id} size={size} />;
    case 'queue':
      return <Queue id={id} size={size} />;
    case 'team':
      return <Team size={size} />;
    case 'deploys':
      return <Deploys id={id} size={size} />;
    case 'governance':
      return <Governance id={id} size={size} />;
    case 'jira':
      return <Jira id={id} size={size} />;
    case 'heading':
    case 'divider':
      // Blocks are drawn by Home itself: they are structure, not cards.
      return null;
  }
}

/** Everything any application is waiting on this person for — and each one can be done from here. */
function NeedsYou({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { act, dialogs } = useWaitingActions();
  const items = waitingOn(state, person.id);
  const urgent = items.filter((w) => w.urgent).length;
  const spec: ListSpec = {
    value: items.length,
    label: items.length === 1 ? 'thing needs your attention' : 'things need your attention',
    tone: urgent ? 'warning' : 'default',
    context: urgent ? `${urgent} can’t wait` : items.length ? (items[0]?.title ?? '') : 'All caught up',
    route: { page: 'my-requests' },
    rows: items.map((w) => ({ key: w.key, title: w.title, detail: `${APP_NAME[w.app]} · ${w.detail}`, meta: w.urgent ?? w.action, metaTone: w.urgent ? 'warning' : undefined, route: w.route, action: { label: w.action, run: () => act(w) } })),
    empty: 'You’re all caught up — nothing is waiting on you.',
    more: { label: (n) => `${n} more waiting`, route: { page: 'my-requests' } },
    extra: dialogs,
  };
  // In the detailed view the button says what to do; the badge only flags what can't wait.
  if (size === 'L') spec.rows = spec.rows.map((r, i) => ({ ...r, meta: items[i].urgent }));
  return <ListWidget id={id} spec={spec} size={size} />;
}

/**
 * Open items at a glance — the part Next up and Needs your attention do not show: your work in progress and
 * what you are waiting on. (It led with the same items as Needs your attention, so the two cards repeated.)
 */
function Requests({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const all = openItems(state, person.id);
  const needs = all.filter((m) => m.section === 'needs').length;
  const items = all.filter((m) => m.section === 'progress' || m.section === 'waiting');
  const rank = { needs: 0, progress: 1, waiting: 2, closed: 3 } as const;
  const rows = [...items].sort((a, b) => rank[a.section] - rank[b.section]);
  const spec: ListSpec = {
    value: items.length,
    label: items.length === 1 ? 'in progress or waiting' : 'in progress or waiting',
    tone: 'default',
    context: needs ? `${needs} more need${needs === 1 ? 's' : ''} you` : 'Nothing waiting on you',
    route: { page: 'my-requests' },
    rows: rows.map((m) => ({
      key: m.key,
      title: m.title,
      detail: m.line.split(' · ').slice(0, 2).join(' · '),
      meta: m.status.label,
      metaTone: undefined,
      route: m.route,
      onOpen: m.jira ? () => openInJira(m.jira!.key) : undefined,
    })),
    empty: 'Nothing open. Ask for something from New request.',
    more: { label: (n) => `${n} more in Open items`, route: { page: 'my-requests' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/**
 * Quick actions: shortcuts the person chose. Small holds two, Medium four, Large eight —
 * a widget with more actions than its size holds shows the first ones.
 */
function Quick({ id, actions, size }: { id: string; actions: string[]; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  const audience = audienceOf(state, person.id);
  const allowed = availableActions(audience, !!state.adminScope).map((a) => a.id);
  const nav = useNav();
  const sets = state.tabSets[person.id] ?? [];
  // One list of buttons: the built-in shortcuts this person may use, and their saved tab sets.
  const list = actions
    .map((a) => {
      if (isTabSetAction(a)) {
        const set = sets.find((x) => tabSetActionId(x.id) === a);
        return set ? { id: a, label: set.name, hint: `Opens ${set.routes.length} ${set.routes.length === 1 ? 'tab' : 'tabs'}`, Icon: AppWindow, run: () => nav.openTabSet(set) } : null;
      }
      const q = allowed.includes(a) ? quickAction(a) : undefined;
      return q ? { id: q.id, label: q.label, hint: q.hint, Icon: q.Icon, run: () => go(q.route(audience)) } : null;
    })
    .filter((a): a is NonNullable<typeof a> => !!a)
    .slice(0, QUICK_CAPACITY[size]);
  if (!list.length) return <Text size="sm" tone="muted">No actions yet. Customize › this widget’s menu › Choose actions.</Text>;
  return (
    <div className={`ds-quick ds-quick--${size}${list.length === 1 ? ' ds-quick--one' : ''}`}>
      {list.map((a) => (
        <button key={a.id} id={`${id}-${a.id.replace(/[^a-z0-9-]/gi, '-')}`} type="button" className="ds-quick__action" onClick={a.run}>
          <span className="ds-quick__icon">
            <a.Icon aria-hidden="true" />
          </span>
          <span className="ds-quick__text">
            <span className="ds-quick__label">{a.label}</span>
            {(size !== 'S' || list.length === 1) && <span className="ds-quick__hint">{a.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function JumpBackIn({ id, size }: { id: string; size: HomeSize }) {
  const nav = useNav();
  const { state } = useSuite();
  const open = nav.tabs.filter((t) => t.id !== 'home');
  // Nothing open yet: the person's own spaces are where they usually go next.
  const rows: Row[] = open.length
    ? open.map((t) => {
        const m = tabMeta(t.route, state);
        return { key: t.id, title: m.label, Icon: m.Icon, detail: 'Open in a tab', onOpen: () => nav.activate(t.id) };
      })
    : state.spaces.filter((s) => !s.shared).map((s) => ({ key: s.id, title: s.name, Icon: LayoutGrid, detail: `Your space · ${s.items.length} items`, route: { page: 'space', id: s.id } as Route }));
  const spec: ListSpec = { value: rows.length, label: 'open', context: '', route: { page: 'browse' }, rows, empty: 'Nothing else is open.', more: { label: (n) => `${n} more`, route: { page: 'browse' } } };
  return size === 'M' ? <Lines id={id} spec={spec} /> : <Rows id={id} spec={spec} />;
}

/** The latest releases, newest first. */
function WhatsNew({ id, size }: { id: string; size: HomeSize }) {
  const spec: ListSpec = {
    value: WHATS_NEW.length,
    label: 'updates',
    context: '',
    route: { page: 'whats-new' },
    rows: WHATS_NEW.map((e) => ({ key: e.id, title: e.title, detail: `${e.product} · ${e.summary}`, meta: e.date, route: { page: 'whats-new-story', id: e.id } })),
    empty: 'Nothing new yet.',
    more: { label: (n) => `${n} more updates`, route: { page: 'whats-new' } },
  };
  return size === 'M' ? <Lines id={id} spec={spec} /> : <Rows id={id} spec={spec} />;
}

/** Aiden as a chat window, always open. The conversation is a real chat: it carries on in Aiden’s own tab. */
function AidenChat({ size }: { size: HomeSize }) {
  const { aidenChat, setAidenChat } = useContext(HomeCtx);
  const { state } = useSuite();
  // What is worth asking about is what moved most on the dashboards this person watches.
  const movers = watched(state)
    .map((d) => ({ d, c: change4(viewsOf(d)) }))
    .filter((m) => m.c !== 0)
    .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
    .slice(0, 2)
    .map(({ d, c }) => `Why is ${d.name} ${c > 0 ? 'up' : 'down'} ${Math.abs(c)}%?`);
  // Large: two questions and the two most recent conversations to pick up; Extra large: three of each.
  const big = size === 'XL';
  const recent = [...state.aidenChats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, big ? 3 : 2);
  return (
    <div className={`ds-home-aiden ds-home-aiden--${size}`} data-surface="aiden">
      <Conversation
        idPrefix="ds-home-aiden"
        chatId={aidenChat}
        onChatId={setAidenChat}
        compact
        greeting="Ask about your numbers, find a dashboard, or check on a request."
        follow="open"
        suggestions={[...(movers.length ? movers : STARTERS.slice(0, 2)), 'What’s happening with my requests?'].slice(0, big ? 3 : 2)}
        extra={
          recent.length > 0 && (
            <div className="ds-home-aiden-recent">
              <span className="ds-home-aiden-recent__label">Pick up where you left off</span>
              {recent.map((c) => (
                <button key={c.id} type="button" className="ds-home-aiden-recent__item" onClick={() => setAidenChat(c.id)}>
                  <MessageSquare aria-hidden="true" />
                  <span>{c.title}</span>
                </button>
              ))}
            </div>
          )
        }
      />
    </div>
  );
}

/** A trend that takes all the height its widget gives it. */
function FillTrend({ id, label, data }: { id: string; label: string; data: number[] }) {
  const [ref, box] = useBox<HTMLDivElement>();
  return (
    <div ref={ref} className="ds-fill-trend">
      {box.h >= 16 && <Sparkline id={id} label={label} data={data} categories={WEEKS} variant="area" height={Math.floor(box.h)} />}
    </div>
  );
}

/** Views across everything this person watches. Small: the number. Medium: the number beside its trend. */
function Pulse({ size }: { size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const dash = watched(state);
  const total = sumSeries(dash.map(viewsOf));
  const c = change4(total);
  const value = (total[total.length - 1] ?? 0).toLocaleString();
  if (size === 'S')
    return <BigStat id="ds-home-pulse" label="views this week" value={value} tone={c < 0 ? 'error' : c > 0 ? 'success' : 'default'} context={`${c > 0 ? '▲' : c < 0 ? '▼' : ''} ${Math.abs(c)}% · ${dash.length} dashboards`} onClick={() => go({ page: 'browse' })} />;
  return (
    <div className="ds-fill ds-fill--row">
      <Stat id="ds-home-pulse-stat" label={`Views across ${dash.length} dashboards`} value={value} change={c} changeLabel="vs prior 4 weeks" />
      <FillTrend id="ds-home-pulse-trend" label="Views per week, last 12 weeks" data={total} />
    </div>
  );
}

/* ── DartBoards: dashboards are doors, metrics carry the numbers ──
   A dashboard is a Tableau or Power BI report; DART Central cannot read the numbers inside it, so
   Home never shows one as if it could. A dashboard is a one-click way in. A METRIC is held in DART
   Central with its value, so a metric — on its own or on a space — shows its number. */

const SOURCE_NOTE = (d: Dashboard) => `${d.source} · ${d.category}`;

/** The dashboards on your spaces, each one click away, with any notice. */
function Watchlist({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const dashes = watched(state).sort((a, b) => Number(!!flagOf(b)) - Number(!!flagOf(a)));
  const spec: ListSpec = {
    value: dashes.length,
    label: 'dashboards',
    context: '',
    route: { page: 'browse' },
    rows: dashes.map((d) => ({ key: d.id, title: d.name, Icon: ChartColumn, detail: SOURCE_NOTE(d), meta: flagOf(d), metaTone: d.retiring ? 'warning' : 'error', route: { page: 'dashboard', id: d.id } })),
    empty: 'Add dashboards to a space and they show up here.',
    more: { label: (n) => `${n} more dashboards`, route: { page: 'browse' } },
  };
  return size === 'M' ? <Lines id={id} spec={spec} /> : <Rows id={id} spec={spec} />;
}

/** One dashboard, pinned: a door into it — its name, where it lives, any notice. The whole widget opens it. */
function PinnedDashboard({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const d = state.dashboards.find((x) => x.id === id);
  if (!d) return <Text size="sm" tone="muted">This dashboard is no longer available.</Text>;
  const flag = flagOf(d);
  return (
    <button type="button" className={`ds-dash-door ds-dash-door--${size}`} onClick={() => go({ page: 'dashboard', id })}>
      <span className="ds-dash-door__top">
        <Text as="span" size="xs" tone="muted">
          {SOURCE_NOTE(d)}
        </Text>
        {flag && <span className={`ds-home-flag${d.retiring ? ' ds-home-flag--warning' : ''}`}>{flag}</span>}
      </span>
      {size !== 'S' && (
        <Text as="span" size="sm" tone="muted" lines={2}>
          {d.description}
        </Text>
      )}
      <span className="ds-dash-door__open">
        Open dashboard
        <ChevronRight aria-hidden="true" />
      </span>
    </button>
  );
}

const spaceOf = (state: SuiteState, id: string) => state.spaces.find((s) => s.id === id);
/**
 * The metrics on a space, once each, in the space's order — each with the number the SPACE shows for it
 * (its own view, under the space's filters), so the cell on Home matches the card you land on.
 */
const spaceMetrics = (state: SuiteState, id: string) => {
  const space = spaceOf(state, id);
  const items = space?.items ?? [];
  const hasBar = items.some((i) => i.block?.type === 'filters');
  const seen = new Set<string>();
  return items.flatMap((i) => {
    const a = i.assetId ? state.assets.find((x) => x.id === i.assetId && x.kind === 'metric') : undefined;
    if (!a || seen.has(a.id)) return [];
    seen.add(a.id);
    const filters = hasBar ? (space?.filters ?? DEFAULT_NATIVE_FILTERS) : null;
    const asSpace = i.metric?.display === 'number' ? i.metric : null;
    const n = asSpace ? metricNumber(a, asSpace, filters) : readMetric(a.glance);
    const trend = asSpace ? metricTrend(a, asSpace, filters) : glanceTrend(a.glance, a.id);
    return [{ asset: a, value: n.value, change: n.change, trend }];
  });
};
/** The dashboards on a space, once each, in the space's order. */
const spaceDashes = (state: SuiteState, id: string) =>
  [...new Set((spaceOf(state, id)?.items ?? []).map((i) => i.dashboardId).filter(Boolean))]
    .map((did) => state.dashboards.find((d) => d.id === did))
    .filter((d): d is Dashboard => !!d && d.lifecycle === 'published');

/** A metric's value and the change its owner reports, from the one line the library holds for it. */
const readMetric = (glance: string) => {
  const [value, ...rest] = glance.split(' · ');
  return { value, change: rest.join(' · ') };
};

/** The smallest a metric cell gets before fewer fit across. */
const METRIC_MIN_W = 140;

/** A row (or two) of a space's metrics: name, value, change. Each opens its metric; "N more" opens the space. */
function MetricCells({ spaceId, rows }: { spaceId: string; rows: number }) {
  const { state } = useSuite();
  const { go } = useNav();
  const [ref, box] = useBox<HTMLDivElement>();
  const metrics = spaceMetrics(state, spaceId);
  const cols = Math.max(1, Math.floor((box.w + 12) / (METRIC_MIN_W + 12)));
  const room = cols * rows;
  // When some are cut off, the last cell says how many and opens the space.
  const shown = metrics.length > room ? metrics.slice(0, room - 1) : metrics;
  const hidden = metrics.length - shown.length;
  const cells = shown.length + (hidden ? 1 : 0);
  // Fill the rows evenly — four metrics read as 2 + 2, not 3 + a lonely 1.
  const useCols = cells > cols ? cols : rows > 1 && cells > 2 && cells <= cols ? cells : Math.max(1, Math.min(cols, cells));
  const balanced = cells > cols ? Math.ceil(cells / Math.ceil(cells / cols)) : useCols;
  return (
    <div ref={ref} className="ds-metric-cells" style={{ gridTemplateColumns: `repeat(${balanced}, minmax(0, 1fr))` }}>
      {box.w > 0 &&
        shown.map(({ asset: a, value, change, trend }) => (
          <button key={a.id} type="button" className="ds-home-cell ds-metric-cell" title={a.name} onClick={() => go({ page: 'metric', id: a.id })}>
            <Text as="span" size="xs" tone="muted" lines={1}>
              {a.name}
            </Text>
            <span className="ds-home-cell__num">
              <span className="ds-home-cell__value">{value}</span>
              {change && (
                <Text as="span" size="xs" tone="muted" lines={1}>
                  {change}
                </Text>
              )}
            </span>
            {/* The shape behind the number; it ends on the value shown. */}
            <FillTrend id={`ds-home-mc-${spaceId}-${a.id}`} label={`${a.name}, last 12 periods`} data={trend} />
          </button>
        ))}
      {box.w > 0 && hidden > 0 && (
        <button type="button" className="ds-home-cell ds-metric-cell ds-metric-cell--more" onClick={() => go({ page: 'space', id: spaceId })}>
          <span className="ds-home-cell__value">{`+${hidden}`}</span>
          <Text as="span" size="xs" tone="muted">
            more on this space
          </Text>
        </button>
      )}
    </div>
  );
}

/** A space's dashboards as one-click links; as many as fit, then "N more" into the space. */
function DashboardLinks({ id, spaceId }: { id: string; spaceId: string }) {
  const { state } = useSuite();
  const { go } = useNav();
  const dashes = spaceDashes(state, spaceId);
  const fit = useFit(dashes.length);
  return (
    <FitFrame fit={fit} more={{ id: `${id}-dash-more`, label: (n) => `${n} more dashboards`, route: { page: 'space', id: spaceId } }}>
      <div className="ds-dash-links">
        {dashes.map((d, i) => {
          const flag = flagOf(d);
          return (
            <button key={d.id} type="button" {...fitProps(fit, i, 'ds-dash-link')} onClick={() => go({ page: 'dashboard', id: d.id, fromSpaceId: spaceId })}>
              <ChartColumn aria-hidden="true" />
              <span className="ds-dash-link__name">{d.name}</span>
              {flag && <span className={`ds-home-flag${d.retiring ? ' ds-home-flag--warning' : ''}`}>{flag}</span>}
            </button>
          );
        })}
      </div>
    </FitFrame>
  );
}

/**
 * One space, pinned. Its METRICS carry the numbers — value and change, each opening its metric. Its
 * DASHBOARDS are links, each opening the dashboard. Medium and Wide: one row (the metrics, or the
 * dashboards when it has none). Large: two rows of metrics and a link to its dashboards. Extra large: the
 * metrics and the dashboards. A space with no metrics lists its dashboards at every size.
 */
function PinnedSpace({ id, spaceId, size }: { id: string; spaceId: string; size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const space = spaceOf(state, spaceId);
  if (!space) return <Text size="sm" tone="muted">This space is no longer shared with you.</Text>;
  const metrics = spaceMetrics(state, spaceId);
  const dashes = spaceDashes(state, spaceId);
  if (!metrics.length && !dashes.length) return <Text size="sm" tone="muted">Nothing on this space yet.</Text>;
  const oneRow = size === 'M' || size === 'W';
  if (oneRow) return metrics.length ? <MetricCells spaceId={spaceId} rows={1} /> : <DashboardLinks id={id} spaceId={spaceId} />;
  if (!metrics.length) return <DashboardLinks id={id} spaceId={spaceId} />;
  return (
    <div className="ds-space-body">
      <MetricCells spaceId={spaceId} rows={2} />
      {dashes.length > 0 &&
        (size === 'XL' ? (
          <div className="ds-space-part ds-space-part--grow">
            <span className="ds-space-part__label">Dashboards</span>
            <DashboardLinks id={id} spaceId={spaceId} />
          </div>
        ) : (
          // Large has room for the numbers; its dashboards are one click further, in the space.
          <Button
            id={`${id}-dashboards`}
            style="link"
            size="sm"
            className="ds-space-body__more"
            label={`${dashes.length} ${dashes.length === 1 ? 'dashboard' : 'dashboards'} on this space`}
            IconLeft={ChartColumn}
            onClick={() => go({ page: 'space', id: spaceId })}
          />
        ))}
    </div>
  );
}

/* ── IRM ── */

const CONTROLS_LABEL = { complete: ['Controls complete', 'default'], pending: ['Controls pending', 'warning'], overdue: ['Controls overdue', 'error'] } as const;

/** The reports this person owns in IRM. Small: controls complete. Medium: two KPIs. Large: the KPIs, then report by report. */
function Reports({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  const today = state.irm.today;
  const owned = ownedReports(state, person.id);
  const rank = (r: (typeof owned)[number]) => (evergreenState(r, today) === 'past-due' ? 0 : r.controls === 'overdue' ? 1 : r.controls === 'pending' ? 2 : evergreenState(r, today) === 'due-soon' ? 3 : 4);
  const complete = owned.filter((r) => r.controls === 'complete').length;
  const pct = owned.length ? Math.round((complete / owned.length) * 100) : 100;
  const due = recertsDue(state, person.id);
  const pastDue = due.filter((r) => evergreenState(r, today) === 'past-due').length;
  const listed = owned.filter((r) => state.dashboards.some((d) => d.irm === r.number && d.lifecycle === 'published')).length;
  const overdue = owned.filter((r) => r.controls === 'overdue').length;
  const pctTone: Tone = overdue ? 'error' : 'default';
  const toIrm = () => go({ page: 'irm-records' });
  const spec: ListSpec = {
    value: `${pct}%`,
    label: 'controls complete',
    tone: pctTone,
    progress: pct,
    context: `${complete} of ${owned.length} reports · ${due.length} to recertify`,
    route: { page: 'irm-records' },
    kpis: [
      { id: `${id}-recert`, label: 'To recertify', value: due.length, tone: pastDue ? 'error' : 'default', context: pastDue ? `${pastDue} past due` : due.length ? `Next ${fmtIso(due[0].evergreen.due)}` : 'All current', onClick: toIrm },
      { id: `${id}-controls`, label: 'Controls complete', value: `${pct}%`, tone: pctTone, context: overdue ? `${overdue} with overdue controls` : `${complete} of ${owned.length} reports`, onClick: toIrm },
      { id: `${id}-listed`, label: 'In DartBoards', value: listed, context: `of ${owned.length} listed`, onClick: () => go({ page: 'browse' }) },
    ],
    rows: [...owned]
      .sort((a, b) => rank(a) - rank(b))
      .map((r) => {
        const ever = evergreenState(r, today);
        const [label, t] = CONTROLS_LABEL[r.controls];
        return { key: r.number, title: recordName(r), detail: `${r.number} · ${ever === 'past-due' ? 'Recertification past due' : `Recertify by ${fmtIso(r.evergreen.due)}`}`, meta: label, metaTone: t, route: { page: 'irm-record', number: r.number } };
      }),
    empty: 'You don’t own a report in IRM.',
    more: { label: (n) => `${n} more in IRM`, route: { page: 'irm-records' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** Owned reports due for recertification — certify each one right here. */
function Recerts({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const irm = useIrm();
  const due = recertsDue(state, person.id);
  const past = due.filter((r) => evergreenState(r, state.irm.today) === 'past-due').length;
  const spec: ListSpec = {
    value: due.length,
    label: due.length === 1 ? 'report to recertify' : 'reports to recertify',
    tone: past ? 'error' : 'default',
    context: past ? `${past} past due` : due.length ? `Next due ${fmtIso(due[0].evergreen.due)}` : 'All current',
    route: { page: 'irm-records' },
    rows: due.map((r) => {
      const st = evergreenState(r, state.irm.today);
      return {
        key: r.number,
        title: recordName(r),
        detail: `${r.number} · ${r.evergreen.cadence} · due ${fmtIso(r.evergreen.due)}`,
        meta: EVERGREEN[st].label,
        metaTone: tone(EVERGREEN[st].tone),
        route: { page: 'irm-record', number: r.number },
        action: { label: 'Certify', run: () => (irm.certify(r.number), toast(`${recordName(r)} recertified`)) },
      };
    }),
    empty: 'Every report you own is recertified.',
    more: { label: (n) => `${n} more to recertify`, route: { page: 'irm-records' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** Controls this person attests for that are overdue or coming due — attest each one right here. */
function Controls({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const [attesting, setAttesting] = useState<{ record: string; control: string } | null>(null);
  const due = controlsDue(state, person.id);
  const over = due.filter((d) => d.state === 'overdue').length;
  const openRecord = attesting && state.irm.records.find((r) => r.number === attesting.record);
  const openControl = openRecord?.controlItems.find((c) => c.id === attesting?.control);
  const spec: ListSpec = {
    value: due.length,
    label: due.length === 1 ? 'control to attest' : 'controls to attest',
    tone: over ? 'error' : 'default',
    context: over ? `${over} overdue` : due.length ? `Next due ${fmtIso(due[0].control.due)}` : 'Nothing due',
    route: { page: 'irm-records' },
    rows: due.map(({ record, control, state: st }) => ({
      key: control.id,
      title: control.name,
      detail: `${recordName(record)} · due ${fmtIso(control.due)}`,
      meta: CONTROL_STATE[st].label,
      metaTone: tone(CONTROL_STATE[st].tone),
      route: { page: 'irm-record', number: record.number },
      action: st === 'in-review' ? undefined : { label: 'Attest', run: () => setAttesting({ record: record.number, control: control.id }) },
    })),
    empty: 'Every control you answer for is attested.',
    more: { label: (n) => `${n} more controls`, route: { page: 'irm-records' } },
    extra: openRecord && openControl ? <AttestDialog record={openRecord} control={openControl} open onClose={() => setAttesting(null)} /> : null,
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** The report requests this person filed in IRM, and where each one is. */
function IrmChanges({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const audience = audienceOf(state, person.id);
  const mine = myIrmChanges(state, person.id).filter((c) => CHANGE_STATUS[c.status].active);
  const waiting = mine.filter((c) => c.status === 'pending-approval').length;
  const spec: ListSpec = {
    value: mine.length,
    label: mine.length === 1 ? 'IRM request open' : 'IRM requests open',
    tone: 'default',
    context: waiting ? `${waiting} waiting for approval` : mine.length ? 'All being worked' : 'Nothing open',
    route: WIDGETS['irm-changes'].to!({ key: '', id: 'irm-changes', lg: { x: 0, y: 0, size }, sm: { x: 0, y: 0, size } }, audience),
    rows: mine.map((c) => ({
      key: c.id,
      title: c.title,
      detail: `${c.id} · ${CHANGE_TYPE[c.type].label} · since ${fmtIso(c.statusSince)}`,
      meta: CHANGE_STATUS[c.status].label,
      metaTone: tone(CHANGE_STATUS[c.status].tone),
      route: reportChangeRoute(audience, c.id),
    })),
    empty: 'You have no IRM requests open.',
    more: { label: (n) => `${n} more requests`, route: { page: 'my-requests' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** A developer's queue: what is assigned to them and not yet shipped, by priority. */
function Queue({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const mine = state.irm.changes
    // Awaiting deployment is production support's, not the developer's.
    .filter((c) => c.assigneeId === person.id && WORK_STATUSES.includes(c.status))
    .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank);
  const late = mine.filter((c) => isAged(c, state.irm.today, state.irm.workflows));
  const spec: ListSpec = {
    value: mine.length,
    // It is on your home, so "to you" goes without saying.
    label: mine.length === 1 ? 'assigned request' : 'assigned requests',
    tone: late.length ? 'warning' : 'default',
    context: late.length ? `${late.length} past SLA` : 'All within SLA',
    route: { page: 'irm-home' },
    rows: mine.map((c) => ({
      key: c.id,
      title: c.title,
      detail: `${c.id} · ${c.priority} · ${CHANGE_TYPE[c.type].label}`,
      meta: late.includes(c) ? 'Past SLA' : CHANGE_STATUS[c.status].label,
      metaTone: late.includes(c) ? 'warning' : undefined,
      route: { page: 'irm-change', id: c.id },
    })),
    empty: 'Nothing assigned to you right now.',
    more: { label: (n) => `${n} more in your queue`, route: { page: 'irm-home' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** A dev manager's team. Medium: three numbers. Large: work in progress per developer. */
function Team({ size }: { size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const devs = PEOPLE.filter((p) => p.irmRole === 'developer');
  const active = state.irm.changes.filter((c) => WORK_STATUSES.includes(c.status));
  const unassigned = active.filter((c) => !c.assigneeId).length;
  // The same "past SLA" Today counts — every open request, not only those in development — so the two never disagree.
  const late = state.irm.changes.filter((c) => CHANGE_STATUS[c.status].active && isAged(c, state.irm.today, state.irm.workflows)).length;
  const kpis = (
    // One compact row at every size: at Large the developers' bars are the detail, the numbers a glance.
    <KpiGrid oneRow>
      <KpiTile id="ds-home-team-free" label="Unassigned" value={unassigned} tone="default" context="Ready for a developer" onClick={() => go({ page: 'irm-board' })} />
      <KpiTile id="ds-home-team-active" label="In progress" value={active.length} context={`Across ${devs.length} developers`} onClick={() => go({ page: 'irm-board' })} />
      <KpiTile id="ds-home-team-late" label="Past SLA" value={late} tone={late ? 'error' : 'default'} context="Running late" onClick={() => go({ page: 'irm-activity' })} />
    </KpiGrid>
  );
  if (size === 'M') return kpis;
  const max = Math.max(4, ...devs.map((p) => active.filter((c) => c.assigneeId === p.id).length));
  // Large is the load per developer. Its three numbers are a dev manager's Today, right above, so they are
  // not repeated here; someone without them in Today can size the card Medium for the numbers alone.
  return (
    <Stack level={4}>
      <Stack level={4}>
        {devs.map((p) => {
          const n = active.filter((c) => c.assigneeId === p.id).length;
          return <Progress key={p.id} id={`ds-home-team-${p.id}`} size="sm" value={n} max={max} label={p.name} showValue valueFormatter={() => `${n} in progress`} />;
        })}
      </Stack>
    </Stack>
  );
}

/** Production support: what is waiting to ship — take it or deploy it here. */
function Deploys({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { act, dialogs } = useWaitingActions();
  const ship = state.irm.changes.filter((c) => c.status === 'awaiting-deployment');
  const free = ship.filter((c) => !c.deployerId).length;
  const spec: ListSpec = {
    value: ship.length,
    label: 'awaiting deployment',
    tone: 'default',
    context: free ? `${free} nobody has taken` : 'Every one has an owner',
    route: { page: 'irm-deployments' },
    rows: ship.map((c) => {
      const mine = c.deployerId === person.id;
      const w: WaitingItem = { key: c.id, kind: mine ? 'deploy' : 'take', ref: c.id, title: c.title, detail: c.id, app: 'irm', action: mine ? 'Deploy' : 'Take', route: { page: 'irm-change', id: c.id } };
      return {
        key: c.id,
        title: c.title,
        detail: `${c.id} · ${c.priority} · ${c.deployerId ? (mine ? 'yours to deploy' : 'taken') : 'unassigned'}`,
        meta: c.deployerId ? undefined : 'Unassigned',
        metaTone: 'warning' as Tone,
        route: { page: 'irm-change', id: c.id },
        action: !c.deployerId || mine ? { label: w.action, run: () => act(w) } : undefined,
      };
    }),
    empty: 'Nothing waiting to ship.',
    more: { label: (n) => `${n} more to deploy`, route: { page: 'irm-deployments' } },
    extra: dialogs,
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/** Governance: the numbers the team answers for, and the reports behind them. */
function Governance({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const today = state.irm.today;
  const live = state.irm.records.filter((r) => r.lifecycle === 'production' || r.lifecycle === 'retiring');
  const pastDue = live.filter((r) => evergreenState(r, today) === 'past-due');
  const evidence = state.irm.attestations.filter((a) => a.outcome === 'pending').length;
  const aged = state.irm.changes.filter((c) => CHANGE_STATUS[c.status].active && isAged(c, today, state.irm.workflows)).length;
  const toGov = () => go({ page: 'irm-governance' });
  const flagged = live.filter((r) => r.flagged || evergreenState(r, today) === 'past-due' || r.controls === 'overdue');
  const spec: ListSpec = {
    value: evidence,
    label: 'evidence to review',
    tone: 'default',
    context: `${pastDue.length} recertifications past due`,
    route: { page: 'irm-governance' },
    // Large is the flagged reports, one by one. Its three numbers are governance's Today, right above, so
    // they are not repeated here; Medium (no list) keeps them.
    kpis: size === 'L' ? undefined : [
      { id: `${id}-evidence`, label: 'Evidence to review', value: evidence, context: 'Waiting on the team', onClick: toGov },
      { id: `${id}-pastdue`, label: 'Past due', value: pastDue.length, tone: pastDue.length ? 'error' : 'default', context: `of ${live.length} live reports`, onClick: toGov },
      { id: `${id}-aged`, label: 'Past SLA', value: aged, tone: aged ? 'warning' : 'default', context: 'Requests running late', onClick: toGov },
    ],
    rows: flagged.map((r) => ({
      key: r.number,
      title: recordName(r),
      detail: `${r.number} · ${r.flagged ? `Flagged: ${r.flagged.reason}` : evergreenState(r, today) === 'past-due' ? 'Recertification past due' : 'Controls overdue'}`,
      meta: r.flagged ? 'Flagged' : evergreenState(r, today) === 'past-due' ? 'Past due' : 'Overdue',
      metaTone: 'error' as Tone,
      route: { page: 'irm-record', number: r.number },
    })),
    empty: 'No report needs governance attention.',
    more: { label: (n) => `${n} more reports`, route: { page: 'irm-governance' } },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/* ── Jira ── */

/** Tickets assigned to this person in Jira. Every row, and the header, opens Jira in a new tab. */
function Jira({ id, size }: { id: string; size: HomeSize }) {
  const { person } = useSignedIn();
  const tickets = myJiraTickets(person.id);
  const blocked = tickets.filter((t) => t.status === 'Blocked').length;
  const urgent = tickets.filter(isUrgent).length;
  const spec: ListSpec = {
    value: tickets.length,
    label: tickets.length === 1 ? 'assigned ticket' : 'assigned tickets',
    tone: blocked ? 'error' : 'default',
    // One short line: it sits under the number in a narrow column.
    context: blocked ? `${blocked} blocked` : urgent ? `${urgent} high priority` : 'Nothing urgent',
    onOpen: () => openInJira(),
    rows: tickets.map((t) => ({
      key: t.key,
      title: `${t.key}  ${t.summary}`,
      detail: `${t.type} · ${t.priority} priority · ${t.project}${t.due ? ` · due ${fmtIso(t.due)}` : ''}`,
      meta: t.status,
      metaTone: JIRA_STATUS_TONE[t.status],
      onOpen: () => openInJira(t.key),
    })),
    empty: 'Nothing assigned to you in Jira.',
    more: { label: (n) => `${n} more in Jira` },
  };
  return <ListWidget id={id} spec={spec} size={size} />;
}

/**
 * One business metric, pinned. Small: its value and the change its owner reports. Medium: also what it
 * measures and who owns it. The change is not coloured — whether "down" is good depends on the metric.
 */
function PinnedMetric({ id, size }: { id: string; size: HomeSize }) {
  const { state } = useSuite();
  const { go } = useNav();
  const a = state.assets.find((x) => x.id === id && x.kind === 'metric');
  if (!a) return <Text size="sm" tone="muted">This metric is no longer available.</Text>;
  const { value, change } = readMetric(a.glance);
  const trend = glanceTrend(a.glance, a.id);
  return (
    <button type="button" className={`ds-metric ds-metric--${size}`} onClick={() => go({ page: 'metric', id })}>
      <span className="ds-metric__num">
        <span className="ds-glance__value">{value}</span>
        {change && <span className="ds-glance__label">{change}</span>}
        {size !== 'S' && <Text as="span" size="xs" tone="muted" lines={2}>{`${a.owner} · ${a.source}${a.metric?.certified ? ' · Certified' : ''}`}</Text>}
      </span>
      {/* Every metric carries its shape: the line ends on the value beside it. */}
      <FillTrend id={`ds-home-metric-${id}-trend`} label={`${a.name}, last 12 periods`} data={trend} />
    </button>
  );
}
