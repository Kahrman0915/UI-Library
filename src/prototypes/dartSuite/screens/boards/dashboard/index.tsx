/* DartBoards · the Dashboard viewer — Figma page "Dashboard" (3347:46210).

   D1.1 viewer (Pattern/DashboardViewerHeader: title + source badge, a Toolbar
   of ghost actions on the left, Share / Add to space on the right, then the
   embed region) · D1.2 loading · D1.3 no access · D1.4 with a notice · D1.5
   opened from a space (breadcrumb back to it) · D2.1 refresh · D2.2 add to space
   · D2.3 how to get access · D3.1–D3.5 export.

   The bar follows the page background in both modes (owner, 2026-09-20), and
   the page is not on PageContainer: it runs on one 24px inset rhythm so the
   embed can take the whole width. */

import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Download,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  FileText,
  Info,
  Link2,
  Lock,
  Plus,
  Presentation,
  RefreshCw,
  SearchX,
  Share2,
} from 'lucide-react';
import Alert from '../../../../../components/Alert';
import Badge from '../../../../../components/Badge';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/Breadcrumb';
import Button from '../../../../../components/Button';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import PageHeader from '../../../../../components/PageHeader';
import Skeleton from '../../../../../components/Skeleton';
import { toast } from '../../../../../components/Toast';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import { seriesFor } from '../../../data';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard } from '../../../types';
import { useUi } from '../../../ui';
import { addUnavailable, copyDashboardLink, updatedLabel } from '../shared/boardsShared';
import { ExportDialog } from './ExportDialog';
import type { ExportKind } from './ExportDialog';
import './Dashboard.scss';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const SEGMENTS = ['North', 'South', 'East', 'West', 'Central', 'Online'];

export function DashboardViewer({ id, fromSpaceId }: { id: string; fromSpaceId?: string }) {
  const { state, logActivity } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const d = state.dashboards.find((x) => x.id === id);
  const space = fromSpaceId ? state.spaces.find((s) => s.id === fromSpaceId) : undefined;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [requested, setRequested] = useState(false);
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const [lastExport, setLastExport] = useState<ExportKind>('pdf');

  // D1.2 — the embed loads on open.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (!d) {
    return (
      <div className="ds-dash">
        <div className="ds-dash-body">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>This dashboard is no longer available</EmptyTitle>
              <EmptyDescription>It may have been removed from the marketplace.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button id="ds-dash-missing-browse" label="Browse dashboards" onClick={() => go({ page: 'browse' })} />
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  // D2.1 — refresh shows the loading state again, then confirms.
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Data sources refreshed', { description: 'Last refreshed just now. Figures are current.' });
    }, 900);
  };

  const openExport = (k: ExportKind) => {
    setLastExport(k);
    setExporting(k);
  };

  const exportImage = () =>
    toast.success('Export started', { description: `${d.name} is being saved as a PNG image. It downloads when it is ready.` });

  const unavailable = addUnavailable(state, d.id);

  const toolbar = (
    <Toolbar id={`ds-dash-${d.id}-toolbar`} label="Dashboard actions" justify="between">
      <ToolbarGroup>
        <Button id={`ds-dash-${d.id}-access`} style="ghost" size="sm" label="How to get access" IconLeft={Info} onClick={() => ui.openGetAccess(d.id)} />
        <Button id={`ds-dash-${d.id}-link`} style="ghost" size="sm" label="Copy direct link" IconLeft={Link2} onClick={() => copyDashboardLink(d)} />
        <DropdownMenu id={`ds-dash-${d.id}-export-menu`}>
          <DropdownMenuTrigger>
            <Button id={`ds-dash-${d.id}-export`} style="ghost" size="sm" label="Export" IconLeft={Download} IconRight={ChevronDown} disabled={!d.hasAccess} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={exportImage}>
              <FileImage aria-hidden="true" />
              Image (PNG)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExport('pdf')}>
              <FileText aria-hidden="true" />
              PDF…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExport('ppt')}>
              <Presentation aria-hidden="true" />
              PowerPoint…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openExport('data')}>
              <FileSpreadsheet aria-hidden="true" />
              Data (CSV)…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          id={`ds-dash-${d.id}-refresh`}
          style="ghost"
          size="sm"
          label="Refresh data sources"
          IconLeft={RefreshCw}
          isLoading={refreshing}
          disabled={loading || refreshing || !d.hasAccess}
          onClick={refresh}
        />
      </ToolbarGroup>
      <ToolbarGroup>
        <Button
          id={`ds-dash-${d.id}-tableau`}
          style="ghost"
          size="sm"
          label={`Open in ${d.source}`}
          IconLeft={ExternalLink}
          disabled={!d.hasAccess}
          onClick={() => toast(`Opening in ${d.source}…`, { description: `${d.name} opens in a new browser tab.` })}
        />
        <Button id={`ds-dash-${d.id}-share`} style="outline" size="sm" label="Share" IconLeft={Share2} onClick={() => copyDashboardLink(d)} />
        <Button
          id={`ds-dash-${d.id}-add`}
          style="outline"
          size="sm"
          label="Add to space"
          IconLeft={Plus}
          disabled={unavailable}
          title={unavailable ? 'Already in every one of your spaces' : undefined}
          onClick={() => ui.openAddToSpace(d.id)}
        />
      </ToolbarGroup>
    </Toolbar>
  );

  let body;
  if (loading || refreshing) {
    body = <EmbedSkeleton />;
  } else if (!d.hasAccess) {
    // D1.3
    body = (
      <div className="ds-dash-embed ds-dash-embed--center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock />
            </EmptyMedia>
            <EmptyTitle>You do not have access to this dashboard</EmptyTitle>
            <EmptyDescription>
              {d.owner} owns it. {requested ? 'Your request is with them — you will be notified when it is approved.' : 'Request access and they will be notified.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id={`ds-dash-${d.id}-howto`} style="ghost" label="How to get access" onClick={() => ui.openGetAccess(d.id)} />
            <Button
              id={`ds-dash-${d.id}-request`}
              label={requested ? 'Access requested' : 'Request access'}
              disabled={requested}
              onClick={() => {
                setRequested(true);
                logActivity('requested access to', d.name);
                toast.success('Access requested', { description: `${d.owner} will be notified.` });
              }}
            />
          </EmptyContent>
        </Empty>
      </div>
    );
  } else {
    body = (
      <>
        {d.notice && noticeOpen && (
          // D1.4
          <Alert
            id={`ds-dash-${d.id}-notice`}
            variant="warning"
            title="This dashboard is running behind"
            description={d.notice}
            onClose={() => setNoticeOpen(false)}
          />
        )}
        <Embed d={d} />
      </>
    );
  }

  return (
    <div className="ds-dash">
      <div className="ds-dash-header">
        {space && (
          // D1.5 — opened from a space: the way back is the space, not Browse.
          <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go({ page: 'space', id: space.id });
                  }}
                >
                  {space.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{d.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <PageHeader
          id={`ds-dash-${d.id}-header`}
          size="sm"
          title={d.name}
          meta={<Badge id={`ds-dash-${d.id}-source`} label={d.source} color="info" appearance="solid" />}
          toolbar={toolbar}
        />
      </div>
      <div className="ds-dash-body">{body}</div>
      <ExportDialog open={exporting !== null} kind={exporting ?? lastExport} dashboard={d} onClose={() => setExporting(null)} />
    </div>
  );
}

/* ── The embed placeholder ──────────────────────────────────────────────────
   Tableau owns everything inside this region; we own the chrome around it. A
   believable dashboard drawn from the dashboard's own sample series. */

function Embed({ d }: { d: Dashboard }) {
  const s = seriesFor(d.id, 12);
  const seg = seriesFor(`${d.id}-seg`, SEGMENTS.length);
  const segMax = Math.max(...seg);
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  const change = Math.round(((last - prev) / prev) * 100);
  const kpis = [
    { label: 'This month', value: (last * 1240).toLocaleString('en-US') },
    { label: 'vs. last month', value: `${change > 0 ? '+' : ''}${change}%` },
    { label: '12-month average', value: Math.round((s.reduce((a, b) => a + b, 0) / s.length) * 1240).toLocaleString('en-US') },
    { label: 'Target attainment', value: `${Math.min(99, 60 + (s[3] % 40))}%` },
  ];

  return (
    <div className="ds-dash-embed" role="img" aria-label={`${d.name} — embedded ${d.source} dashboard (sample)`}>
      <div className="ds-dash-embed__bar">
        <span>{d.name}</span>
        <span className="ds-dash-embed__stamp">
          {d.source} · updated {updatedLabel(d)}
        </span>
      </div>
      <div className="ds-dash-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="ds-dash-kpi">
            <span className="ds-dash-kpi__label">{k.label}</span>
            <span className="ds-dash-kpi__value">{k.value}</span>
          </div>
        ))}
      </div>
      <div className="ds-dash-charts">
        <div className="ds-dash-panel">
          <span className="ds-dash-panel__title">Trend · last 12 months</span>
          <div className="ds-dash-columns">
            {s.map((v, i) => (
              <div key={MONTHS[i]} className="ds-dash-columns__col">
                <span className="ds-dash-columns__bar" style={{ height: `${v}%` }} />
                <span className="ds-dash-columns__label">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ds-dash-panel">
          <span className="ds-dash-panel__title">By segment</span>
          <ul className="ds-dash-hbars">
            {SEGMENTS.map((name, i) => (
              <li key={name} className="ds-dash-hbars__row">
                <span className="ds-dash-hbars__label">{name}</span>
                <span className="ds-dash-hbars__track">
                  <span className={`ds-dash-hbars__fill ds-dash-hbars__fill--${i + 1}`} style={{ width: `${Math.round((seg[i] / segMax) * 100)}%` }} />
                </span>
                <span className="ds-dash-hbars__value">{seg[i]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EmbedSkeleton() {
  return (
    <div className="ds-dash-embed" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton shape="text" width="30%" />
      <div className="ds-dash-kpis">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height="var(--h-20)" />
        ))}
      </div>
      <div className="ds-dash-charts">
        <Skeleton height="var(--h-72)" />
        <Skeleton height="var(--h-72)" />
      </div>
    </div>
  );
}
