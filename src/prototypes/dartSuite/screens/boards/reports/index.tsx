/* DartBoards · Marketplace › Reports.

   Browse's twin for WEB REPORTS. For now a report lives outside DART Central — an
   external link, opened in a new tab, until a storage solution is chosen — so the
   page follows the external-chart rules exactly:

   - MARKED before the click: a "Web report ↗" tag on the tile, "Open report ↗" on
     the button, "(opens in a new tab)" to a screen reader. No "you are leaving"
     dialog: these are the company's own reports, and a warning on every click only
     teaches people to dismiss it.
   - The CARD goes to the report's details page in DartBoards; only the explicit
     "Open report" button leaves. A stray click never takes anyone away.
   - Opening says so once, quietly, and offers to keep the report in a space.

   Header: search · Subject · Sort · layout — the Browse row's shape, with Subject
   where Browse has Filter (owner, 2026-10-02). */

import { ArrowLeft, ChevronDown, Clock, ExternalLink, FileText, LayoutGrid, Link2, List, Plus, Search, SearchX } from 'lucide-react';
import { useState } from 'react';
import Alert from '../../../../../components/Alert';
import Badge from '../../../../../components/Badge';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/Breadcrumb';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardDescription, CardMedia, CardOverline, CardTitle } from '../../../../../components/Card';
import Combobox from '../../../../../components/Combobox';
import DropdownMenu, { DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../../../components/Item';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import { toast } from '../../../../../components/Toast';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Grid from '../../../../../components/Grid';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Asset } from '../../../types';
import { useUi } from '../../../ui';
import { KindLabel } from '../shared/boardsShared';
import '../browse/Browse.scss';
import './Reports.scss';

export type Report = Asset & { report: NonNullable<Asset['report']> };
export const isReport = (a: Asset): a is Report => a.kind === 'report' && !!a.report;

const HUES = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan'] as const;
const hueOf = (id: string) => HUES[[...id].reduce((h, c) => h + c.charCodeAt(0), 0) % HUES.length];

/** "Opened in a new tab" — the one notice a report gets, with the one thing worth doing next. */
export function useOpenReport() {
  const ui = useUi();
  const { logActivity } = useSuite();
  // No toast after: the browser switches to the new tab, so one here plays to an empty room.
  return (r: Report) => {
    logActivity('opened report', r.name);
    ui.leave({ dest: 'report', kindLabel: 'Web reports', name: r.name, url: r.report.url, site: 'the report store' });
  };
}

/** A report's tile: a tinted page, so it never reads as a live chart. */
function ReportThumb({ r }: { r: Report }) {
  return (
    <div className={`ds-report-thumb ds-boards-hue--${hueOf(r.id)}`} aria-hidden="true">
      <div className="ds-report-thumb__page">
        <FileText />
        <span className="ds-report-thumb__line" />
        <span className="ds-report-thumb__line ds-report-thumb__line--short" />
        <span className="ds-report-thumb__line" />
      </div>
    </div>
  );
}

function WebTag({ r }: { r: Report }) {
  return <Badge id={`ds-report-tag-${r.id}`} className="ds-browse-flag ds-browse-flag--start ds-report-tag" label="Web report" IconLeft={ExternalLink} color="default" appearance="solid" />;
}

const openLabel = (r: Report) => `Open ${r.name} (opens in a new tab)`;

/** One web report as a card — shared by Reports and Marketplace › All, so both read the same. */
export function ReportCard({ r, showKind = false }: { r: Report; showKind?: boolean }) {
  const { state } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const open = useOpenReport();
  const own = state.spaces.filter((s) => !s.shared);
  const n = own.filter((s) => s.items.some((i) => i.assetId === r.id)).length;
  const full = own.length > 0 && n === own.length;
  const details = () => go({ page: 'report', id: r.id });
  return (
              <Card id={`ds-report-card-${r.id}`} interactive className="ds-browse-card" onClick={details}>
                <CardMedia
                  ratio={8 / 3}
                  overlay={
                    <>
                      <WebTag r={r} />
                      {n > 0 && <Badge id={`ds-report-in-${r.id}`} className="ds-browse-flag ds-browse-flag--end" label={`In ${n} ${n === 1 ? 'space' : 'spaces'}`} color="info" appearance="soft" />}
                    </>
                  }
                >
                  <ReportThumb r={r} />
                </CardMedia>
                <CardBody>
                  <div className="ds-browse-card__text">
                    {showKind && <KindLabel kind="report" />}
                    <CardOverline>{r.subject}</CardOverline>
                    <CardTitle>
                      <Button id={`ds-report-title-${r.id}`} style="link" className="ds-browse-title-link" label={r.name} onClick={details} />
                    </CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </div>
                  <span className="ds-browse-meta">
                    <span className="ds-browse-meta__item">
                      <Clock aria-hidden="true" />
                      {r.report.cadence} · updated {r.updatedAt}
                    </span>
                  </span>
                  <div className="ds-browse-card__actions" onClick={(e) => e.stopPropagation()}>
                    <Button
                      id={`ds-report-add-${r.id}`}
                      label="Add to space"
                      disabled={full}
                      title={full ? 'Already in every one of your spaces' : undefined}
                      onClick={() => ui.openAddAssetToSpace(r.id)}
                    />
                    <Button id={`ds-report-open-${r.id}`} style="outline" label="Open report" IconRight={ExternalLink} aria-label={openLabel(r)} onClick={() => open(r)} />
                    <Button id={`ds-report-info-${r.id}`} style="link" size="sm" label="View report details" onClick={details} />
                  </div>
                </CardBody>
              </Card>
  );
}

/** Browse's sort control, with only the orders a report or a metric has data for:
    no view count (no "Most used") and no publish date (no newest / oldest). Shared
    with Metrics, whose header is the same row. */
export const ASSET_SORTS = [
  { id: 'name-asc', label: 'Name (A-Z)', short: 'Name A–Z' },
  { id: 'name-desc', label: 'Name (Z-A)', short: 'Name Z–A' },
  { id: 'recently-updated', label: 'Recently Updated', short: 'Recently updated' },
] as const;
export type AssetSort = (typeof ASSET_SORTS)[number]['id'];
export const sortAssets = <T extends Asset>(list: T[], sort: AssetSort) =>
  [...list].sort((a, b) =>
    sort === 'recently-updated' ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt) : sort === 'name-desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
  );

/* ── Marketplace › Reports ─────────────────────────────────────────────────── */

export function ReportsBrowse() {
  const { state } = useSuite();
  const { go } = useNav();
  const open = useOpenReport();
  const reports = state.assets.filter(isReport);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'rows'>('grid');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState<AssetSort>('name-asc');

  const q = query.trim().toLowerCase();
  const subjects = [...new Set(reports.map((r) => r.subject))].sort();
  const list = reports.filter((r) => (!q || `${r.name} ${r.description} ${r.owner} ${r.subject}`.toLowerCase().includes(q)) && (!subject || r.subject === subject));
  const sorted = sortAssets(list, sort);
  const own = state.spaces.filter((s) => !s.shared);
  const inSpaces = (id: string) => own.filter((s) => s.items.some((i) => i.assetId === id)).length;
  /** Like a dashboard: nothing left to add it to only when every one of your spaces already has it. */
  const unavailable = (id: string) => own.length > 0 && inSpaces(id) === own.length;
  const ui = useUi();
  const narrowed = !!q || !!subject;
  const details = (r: Report) => go({ page: 'report', id: r.id });

  return (
    <PageContainer className="ds-browse ds-reports">
      <PageHeader
        id="ds-reports-header"
        title="Reports"
        description={narrowed ? `${list.length} of ${reports.length} reports match.` : 'Web reports from across the teams. For now they open in a new tab.'}
        showDivider
        actions={
          <div className="ds-browse-actions">
            <Input id="ds-reports-search" size="sm" type="search" className="ds-browse-search" placeholder="Search reports…" IconLeft={Search} value={query} onValueChange={setQuery} aria-label="Search reports" />
            {/* Subject only, between search and layout (owner, 2026-10-02) — no cadence filter, no visible label. */}
            <Combobox
              id="ds-reports-subject"
              size="sm"
              options={subjects.map((s) => ({ value: s, label: s }))}
              value={subject || undefined}
              onValueChange={(v) => setSubject(v)}
              placeholder="Any subject"
              searchPlaceholder="Search subjects…"
              clearable
              clearLabel="Clear subject"
              // No visible title (owner), but the field keeps its name for screen readers.
              label="Subject"
              className="ds-reports-subject ds-reports-subject--bare"
            />
            <DropdownMenu id="ds-reports-sort">
              <DropdownMenuTrigger>
                <Button id="ds-reports-sort-trigger" style="outline" size="sm" label={`Sort: ${ASSET_SORTS.find((x) => x.id === sort)!.short}`} IconRight={ChevronDown} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as AssetSort)}>
                  {ASSET_SORTS.map((x) => (
                    <DropdownMenuRadioItem key={x.id} value={x.id}>
                      {x.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ToggleGroup id="ds-reports-view" type="single" size="sm" variant="outline" value={view} onValueChange={(v) => v && setView(v as 'grid' | 'rows')} aria-label="View">
              <ToggleGroupItem value="grid" IconCenter={LayoutGrid} aria-label="Grid view" />
              <ToggleGroupItem value="rows" IconCenter={List} aria-label="List view" />
            </ToggleGroup>
          </div>
        }
      />

      {!list.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No reports match</EmptyTitle>
            <EmptyDescription>Try a shorter search, or clear the filters.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              id="ds-reports-clear"
              style="outline"
              label="Clear search and filters"
              onClick={() => {
                setQuery('');
                setSubject('');
              }}
            />
          </EmptyContent>
        </Empty>
      ) : view === 'grid' ? (
        <Grid level={3} minItemWidth="var(--w-64)">
          {sorted.map((r) => (
            <ReportCard key={r.id} r={r} />
          ))}
        </Grid>
      ) : (
        <div className="ds-browse-rows">
          {sorted.map((r) => (
            <div key={r.id} className="ds-browse-row" onClick={() => details(r)}>
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <FileText />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <Button id={`ds-report-row-title-${r.id}`} style="link" className="ds-browse-title-link" label={r.name} onClick={() => details(r)} />
                    <Badge id={`ds-report-row-tag-${r.id}`} label="Web report" IconLeft={ExternalLink} color="default" appearance="outline" />
                  </ItemTitle>
                  <ItemDescription>{r.description}</ItemDescription>
                  <span className="ds-browse-meta">
                    <span className="ds-browse-meta__item">
                      <Clock aria-hidden="true" />
                      {r.report.cadence} · {r.subject}
                    </span>
                  </span>
                </ItemContent>
                <ItemActions className="ds-browse-row__actions" onClick={(e) => e.stopPropagation()}>
                  <Button
                    id={`ds-report-row-add-${r.id}`}
                    size="sm"
                    label="Add to space"
                    disabled={unavailable(r.id)}
                    title={unavailable(r.id) ? 'Already in every one of your spaces' : undefined}
                    onClick={() => ui.openAddAssetToSpace(r.id)}
                  />
                  <Button id={`ds-report-row-open-${r.id}`} size="sm" style="outline" label="Open report" IconRight={ExternalLink} aria-label={openLabel(r)} onClick={() => open(r)} />
                  <Button id={`ds-report-row-info-${r.id}`} style="link" size="sm" label="View report details" onClick={() => details(r)} />
                </ItemActions>
              </Item>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

/* ── A report's page in DartBoards ─────────────────────────────────────────── */

export function ReportDetails({ id }: { id: string }) {
  const { state } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const open = useOpenReport();
  const r = state.assets.find((a) => a.id === id);

  if (!r || !isReport(r)) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>This report is no longer listed</EmptyTitle>
            <EmptyDescription>It may have been retired. Other reports are still in the Marketplace.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-report-gone" style="outline" label="Back to reports" IconLeft={ArrowLeft} onClick={() => go({ page: 'reports' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const related = state.assets.filter((a): a is Report => isReport(a) && a.id !== r.id && a.subject === r.subject).slice(0, 3);
  const base = `ds-report-${r.id}`;
  const copy = () => {
    try {
      void navigator.clipboard?.writeText(`https://dartcentral.example.com/boards/reports/${r.id}`);
    } catch {
      /* clipboard blocked */
    }
    toast.success('Link copied', { description: 'It opens this page in DART Central, not the report itself.' });
  };

  return (
    <PageContainer width="narrow" className="ds-report">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go({ page: 'reports' });
              }}
            >
              Reports
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{r.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        id={`${base}-header`}
        overline="Web report · opens in a new tab"
        title={r.name}
        description={r.description}
        actions={
          <>
            <Button id={`${base}-add`} style="outline" label="Add to space" IconLeft={Plus} onClick={() => ui.openAddAssetToSpace(r.id)} />
            <Button id={`${base}-open`} label="Open report" IconRight={ExternalLink} aria-label={openLabel(r)} onClick={() => open(r)} />
          </>
        }
      />

      <div className="ds-report-body">
        <Card id={`${base}-preview`} className="ds-report-preview">
          <CardMedia ratio={16 / 9}>
            <div className="ds-report-preview__media">
              <ReportThumb r={r} />
              <span className="ds-report-preview__stamp">Preview · the report opens in a new tab</span>
            </div>
          </CardMedia>
        </Card>
        <div className="ds-report-side">
          <dl className="ds-report-facts">
            <div>
              <dt>Owner</dt>
              <dd>{r.owner}</dd>
            </div>
            <div>
              <dt>Cadence</dt>
              <dd>{r.report.cadence}</dd>
            </div>
            <div>
              <dt>Subject</dt>
              <dd>{r.subject}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>{r.report.audience}</dd>
            </div>
            <div>
              <dt>Latest</dt>
              <dd>{r.glance}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{r.updatedAt}</dd>
            </div>
          </dl>
          <Alert
            id={`${base}-where`}
            variant="info"
            title="For now, this report opens in a new tab"
            description="Web reports are stored where DART Central can’t show them yet. Once that changes they’ll open right here. To share it, share this page — it always points at the latest edition."
          />
          <Button id={`${base}-copy`} style="ghost" size="sm" label="Copy link to this page" IconLeft={Link2} onClick={copy} />
        </div>
      </div>

      {related.length > 0 && (
        <Section id={`${base}-related`} heading={`More on ${r.subject}`}>
          <div className="ds-browse-rows">
            {related.map((x) => (
              <div key={x.id} className="ds-browse-row" onClick={() => go({ page: 'report', id: x.id })}>
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <FileText />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{x.name}</ItemTitle>
                    <ItemDescription>
                      {x.report.cadence} · {x.description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="ds-browse-row__actions" onClick={(e) => e.stopPropagation()}>
                    <Button id={`${base}-rel-open-${x.id}`} size="sm" style="outline" label="Open report" IconRight={ExternalLink} aria-label={openLabel(x)} onClick={() => open(x)} />
                  </ItemActions>
                </Item>
              </div>
            ))}
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
