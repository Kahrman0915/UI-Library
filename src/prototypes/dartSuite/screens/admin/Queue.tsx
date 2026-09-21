/* DART Central · Admin · 2 TRIAGE — the Approval Queue.

   Figma: Admin Flow 2.1 all products · 2.2 scoped admin (same screen, fewer
   rows: an application admin sees only Aiden) · 2.3 no matching requests ·
   2.4 status menu open · 2.6 rows selected. 2.5 is a reference sheet, not built.

   ONE flat table. Product is a filter, never a grouping. Sorted so anything
   needing a decision is on top (Needs review, New), then what waits on the
   requester, then what is decided. */

import { useMemo, useState } from 'react';
import { MoreHorizontal, SearchX, Search } from 'lucide-react';
import Button from '../../../../components/Button';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectionCell } from '../../../../components/Table';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { toast } from '../../../../components/Toast';
import { useNav } from '../../nav';
import { adminStatus, scopeProducts, typeLabel, useSuite } from '../../store';
import type { Request } from '../../types';
import { byQueueOrder, daysSince, DecisionDialog, Kpi, KpiRow, PRODUCT_LABEL, RefCode, requesterOf, StatusBadge } from './shared';
import type { Decision } from './shared';
import './Admin.scss';

export function AdminQueue() {
  const { state, approve, deny, replyAsAdmin } = useSuite();
  const { go } = useNav();
  const products = scopeProducts(state.adminScope);

  const [product, setProduct] = useState('all');
  const [phase, setPhase] = useState('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [dialog, setDialog] = useState<{ decision: Decision; ids: string[] } | null>(null);

  // Scope first: an application admin never sees another product's rows (2.2).
  const scoped = useMemo(() => state.requests.filter((r) => products.includes(r.product)), [state.requests, products]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped
      .filter((r) => product === 'all' || r.product === product)
      .filter((r) => phase === 'all' || (phase === 'active') === adminStatus(r.status).active)
      .filter(
        (r) =>
          !q ||
          [r.id, r.title, typeLabel[r.type], requesterOf(r).name, PRODUCT_LABEL[r.product]].some((s) => s.toLowerCase().includes(q)),
      )
      .sort(byQueueOrder);
  }, [scoped, product, phase, query]);

  const count = (s: Request['status']) => scoped.filter((r) => r.status === s).length;
  const waiting = scoped.filter((r) => r.status === 'new' || r.status === 'needs-review');
  const oldest = [...waiting].sort((a, b) => daysSince(b.submittedAt) - daysSince(a.submittedAt))[0];

  const selectable = rows.filter((r) => adminStatus(r.status).active);
  const pickedVisible = picked.filter((id) => selectable.some((r) => r.id === id));
  const all = selectable.length > 0 && pickedVisible.length === selectable.length;

  const byId = (ids: string[]) => ids.map((id) => state.requests.find((r) => r.id === id)).filter(Boolean) as Request[];
  const dialogRequests = dialog ? byId(dialog.ids) : [];

  const confirm = (text: string) => {
    if (!dialog) return;
    // A General request is a question: "Approve" is meaningless for it, so a batch skips them.
    const skipped = dialog.decision === 'approve' ? dialogRequests.filter((r) => r.type === 'general').map((r) => r.id) : [];
    const n = dialog.ids.length - skipped.length;
    if (skipped.length) toast.warning(`Skipped ${skipped.join(', ')}`, { description: 'General requests are answered or closed, never approved.' });
    for (const id of dialog.ids) {
      if (skipped.includes(id)) continue;
      if (dialog.decision === 'approve') approve(id, text || undefined);
      else if (dialog.decision === 'deny') deny(id, text);
      else replyAsAdmin(id, text);
    }
    const noun = n > 1 ? `${n} requests` : dialog.ids.find((id) => !skipped.includes(id)) ?? '';
    if (n === 0) {
      /* nothing left to decide */
    } else if (dialog.decision === 'approve') toast.success(`${noun} approved`, { description: 'The requester sees Approved on My requests.' });
    else if (dialog.decision === 'deny') toast(`${noun} denied`, { description: 'Your reason is in their activity thread.' });
    else toast(`Question sent on ${noun}`, { description: 'It leaves your queue until they answer.' });
    setPicked((p) => p.filter((id) => !dialog.ids.includes(id)));
    setDialog(null);
  };

  const clearFilters = () => {
    setQuery('');
    setProduct('all');
    setPhase('all');
  };

  const filters = (
    <Toolbar id="ds-aq-filters" label="Filter requests" justify="between">
      <ToolbarGroup>
        <ToggleGroup id="ds-aq-product" type="single" variant="plain" size="sm" value={product} onValueChange={(v) => setProduct(v || 'all')}>
          <ToggleGroupItem value="all" label="All" />
          {products.map((p) => (
            <ToggleGroupItem key={p} value={p} label={PRODUCT_LABEL[p]} />
          ))}
        </ToggleGroup>
        <ToggleGroup id="ds-aq-phase" type="single" variant="plain" size="sm" value={phase} onValueChange={(v) => setPhase(v || 'all')}>
          <ToggleGroupItem value="all" label="All" />
          <ToggleGroupItem value="active" label="Active" />
          <ToggleGroupItem value="inactive" label="Inactive" />
        </ToggleGroup>
      </ToolbarGroup>
      <ToolbarGroup>
        <Input
          id="ds-aq-search"
          size="sm"
          aria-label="Search requests"
          placeholder="Search by reference, request or requester…"
          IconLeft={Search}
          value={query}
          onValueChange={setQuery}
          className="ds-admin-search"
        />
      </ToolbarGroup>
    </Toolbar>
  );

  // 2.6 — while a selection is live the selection bar replaces the filter row.
  const selectionBar = (
    <Toolbar id="ds-aq-selection" label="Selected requests" justify="between" className="ds-admin-selbar">
      <ToolbarGroup>
        <span className="ds-text">
          {pickedVisible.length} request{pickedVisible.length === 1 ? '' : 's'} selected
        </span>
        <Button id="ds-aq-clear-sel" style="link" size="sm" label="Clear selection" onClick={() => setPicked([])} />
      </ToolbarGroup>
      <ToolbarGroup>
        <Button id="ds-aq-bulk-deny" style="outline" variant="error" size="sm" label="Deny" onClick={() => setDialog({ decision: 'deny', ids: pickedVisible })} />
        <Button id="ds-aq-bulk-approve" size="sm" label="Approve" onClick={() => setDialog({ decision: 'approve', ids: pickedVisible })} />
      </ToolbarGroup>
    </Toolbar>
  );

  return (
    <PageContainer>
      <PageHeader
        id="ds-aq-header"
        title="Approval Queue"
        description={
          state.adminScope === 'application'
            ? 'Every request for the product you administer. Returned answers come first, then new requests, then anything waiting on the requester.'
            : 'Every request across the products you administer. Returned answers come first, then new requests, then anything waiting on the requester.'
        }
      />
      <Stack level={2}>
        <KpiRow>
          <Kpi id="ds-aq-kpi-new" value={count('new')} label="New" hint="submitted, not opened yet" tone="info" />
          <Kpi id="ds-aq-kpi-pending" value={count('needs-review')} label="Pending" hint="in review, not yet decided" tone="error" />
          <Kpi id="ds-aq-kpi-awaiting" value={count('awaiting-reply')} label="Awaiting" hint="with the requester" tone="success" />
          <Kpi
            id="ds-aq-kpi-oldest"
            value={oldest ? `${daysSince(oldest.submittedAt)} days` : '—'}
            label="Oldest"
            hint={oldest ? `${oldest.id}, submitted ${oldest.submittedAt}` : 'nothing waiting'}
            tone="violet"
          />
        </KpiRow>

        <Stack level={4}>
          {pickedVisible.length > 0 ? selectionBar : filters}

          {rows.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No requests match these filters</EmptyTitle>
                <EmptyDescription>
                  {query.trim()
                    ? `Nothing matches “${query.trim()}”. Check the reference, or clear the search to see every request.`
                    : 'Nothing in this product and state. Clear the filters to see every request.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button id="ds-aq-clear" style="outline" label={query.trim() ? 'Clear search' : 'Clear filters'} onClick={clearFilters} />
              </EmptyContent>
            </Empty>
          ) : (
            <Table id="ds-aq-table" label="Approval queue">
              <TableHead>
                <TableRow>
                  <TableSelectionCell
                    id="ds-aq-all"
                    label="Select every open request"
                    checked={all}
                    indeterminate={pickedVisible.length > 0 && !all}
                    disabled={selectable.length === 0}
                    onCheckedChange={(c) => setPicked(c ? selectable.map((r) => r.id) : [])}
                  />
                  <TableHeaderCell>Request #</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Request</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell align="end">
                    <span className="ui-table__sr-only">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => {
                  const active = adminStatus(r.status).active;
                  const on = picked.includes(r.id);
                  const key = r.id.replace('#', '');
                  return (
                    <TableRow key={r.id} selected={on}>
                      <TableSelectionCell
                        id={`ds-aq-sel-${key}`}
                        label={active ? `Select ${r.id}` : `${r.id} is decided`}
                        checked={on}
                        disabled={!active}
                        onCheckedChange={(c) => setPicked((p) => (c ? [...p, r.id] : p.filter((x) => x !== r.id)))}
                      />
                      <TableCell>
                        <RefCode>{r.id}</RefCode>
                      </TableCell>
                      <TableCell>{typeLabel[r.type]}</TableCell>
                      <TableCell>
                        {/* The title is the link; no other cell in the row is. */}
                        <Button id={`ds-aq-open-${key}`} style="link" size="sm" label={r.title} className="ds-admin-rowlink" onClick={() => go({ page: 'admin-review', id: r.id })} />
                      </TableCell>
                      <TableCell>{PRODUCT_LABEL[r.product]}</TableCell>
                      <TableCell>{r.submittedAt}</TableCell>
                      <TableCell>
                        <StatusBadge id={`ds-aq-st-${key}`} request={r} />
                      </TableCell>
                      <TableCell actions>
                        <DropdownMenu id={`ds-aq-menu-${key}`}>
                          <DropdownMenuTrigger>
                            <Button id={`ds-aq-more-${key}`} style="ghost" size="sm" iconOnly IconCenter={MoreHorizontal} aria-label={`Actions for ${r.id}`} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => go({ page: 'admin-review', id: r.id })}>Open review</DropdownMenuItem>
                            {r.type !== 'general' && (
                              <DropdownMenuItem disabled={!active} onClick={() => setDialog({ decision: 'approve', ids: [r.id] })}>
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem disabled={!active} onClick={() => setDialog({ decision: 'ask', ids: [r.id] })}>
                              Request more information
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" disabled={!active} onClick={() => setDialog({ decision: 'deny', ids: [r.id] })}>
                              Deny
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Stack>

      <DecisionDialog id="ds-aq-dialog" decision={dialog?.decision ?? null} requests={dialogRequests} onClose={() => setDialog(null)} onConfirm={confirm} />
    </PageContainer>
  );
}
