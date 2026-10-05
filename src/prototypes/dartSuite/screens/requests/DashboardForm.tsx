/* R3 · DASHBOARD REQUEST — about a dashboard's place in DARTBOARDS, never the
   report itself. Four modes behind Tabs (R3.1 Publish · R3.2 Update listing ·
   R3.3 Promote · R3.4 Unpublish). Each tab is a different form, so switching
   with anything entered asks "Discard your changes?" first.

   THE SPLIT THIS FORM IS BUILT ON (owner, 2026-10-01): IRM is where a report is
   built and controlled — requirements, development, access, controls, for its
   whole life, under its IRM number. This form only asks for a finished report
   to be SHOWN in DartBoards, and owns only what DartBoards shows: the display
   title (IRM names start with the number), the description, the category and
   tags, and display options. Everything else is read from the IRM record and
   shown read-only, labelled "Managed in IRM", so nobody tries to change it here.

   Update listing, Promote and Unpublish are GATED: nothing below the picker
   exists until a dashboard is chosen. */

import { useState } from 'react';
import { CirclePlus, ExternalLink, EyeOff, LayoutGrid, Pencil, Upload } from 'lucide-react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../components/AlertDialog';
import Alert from '../../../../components/Alert';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody, CardDescription, CardMedia, CardTitle } from '../../../../components/Card';
import Combobox from '../../../../components/Combobox';
import DatePicker from '../../../../components/DatePicker';
import Input from '../../../../components/Input';
import Select, { SelectContent, SelectItem, SelectTrigger } from '../../../../components/Select';
import Separator from '../../../../components/Separator';
import Switch from '../../../../components/Switch';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../../../../components/Tabs';
import Textarea from '../../../../components/Textarea';
import { toast } from '../../../../components/Toast';
import Text from '../../../../components/Text';
import { CONTROLS, IRM_UNPUBLISHED, displayTitleFrom, irmFor } from '../../irm';
import type { IrmRecord } from '../../irm';
import { useSuite } from '../../store';
import type { Dashboard, DashboardRequestMode, FieldChange } from '../../types';
import { DashboardThumb } from '../boards/shared/boardsShared';
import { FormShell, Row, fmtDate, useSubmission } from './shared';

const CATEGORIES = ['Operations', 'Finance', 'Sales', 'Customer', 'Risk'];

/** What DartBoards owns about a listing — and nothing else. */
type Listing = { title: string; description: string; category: string; tags: string };
const EMPTY_LISTING: Listing = { title: '', description: '', category: '', tags: '' };
const LISTING_LABELS: Record<keyof Listing, string> = { title: 'Display title', description: 'Description', category: 'Category', tags: 'Tags' };
const listingOf = (d: Dashboard): Listing => ({ title: d.name, description: d.description, category: d.category, tags: d.tags.join(', ') });

type Display = { toolbar: boolean; tabs: boolean; beta: boolean };

type Gated = { dashboardId: string; start: Date | null; end: Date | null; reason: string };

const MODES: { value: DashboardRequestMode; label: string; Icon: typeof Upload }[] = [
  { value: 'add', label: 'Publish', Icon: Upload },
  { value: 'edit', label: 'Update listing', Icon: Pencil },
  { value: 'promote', label: 'Promote', Icon: CirclePlus },
  { value: 'remove', label: 'Unpublish', Icon: EyeOff },
];

const openIrm = (number: string) =>
  toast(`Opening ${number} in IRM`, { description: 'IRM opens in a new tab. Report details, access and controls are changed there.' });

/* ── The IRM record, read-only ─────────────────────────────────────────────── */

function IrmRecordPanel({ id, record }: { id: string; record: IrmRecord }) {
  const c = CONTROLS[record.controls];
  return (
    <Card id={id} className="ds-req-irm">
      <CardBody>
        <div className="ds-req-irm__head">
          <span className="ds-req-irm__label">Managed in IRM · change these there</span>
          <Button id={`${id}-open`} style="link" size="sm" label="Open IRM record" IconRight={ExternalLink} aria-label={`Open ${record.number} in IRM (opens in a new tab)`} onClick={() => openIrm(record.number)} />
        </div>
        <dl className="ds-req-irm__facts">
          <div>
            <dt>IRM record</dt>
            <dd>{record.number}</dd>
          </div>
          <div className="ds-req-irm__wide">
            <dt>Report name in IRM</dt>
            <dd>{record.name}</dd>
          </div>
          <div>
            <dt>Developer</dt>
            <dd>{record.developer}</dd>
          </div>
          <div>
            <dt>Business owner</dt>
            <dd>{record.businessOwner}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{record.source}</dd>
          </div>
          <div>
            <dt>Access group</dt>
            <dd>{record.accessGroup}</dd>
          </div>
          <div className="ds-req-irm__wide">
            <dt>Controls</dt>
            <dd>
              <Badge id={`${id}-controls`} label={c.label} color={c.color} appearance="soft" />
              <Text as="span" tone="muted"> · last reviewed {record.lastReviewed}</Text>
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

/* ── How it will look in Browse ────────────────────────────────────────────── */

function ListingPreview({ id, listing, hue, source }: { id: string; listing: Listing; hue: Dashboard['hue']; source: Dashboard['source'] }) {
  // A Dashboard-shaped stand-in, only so the thumbnail draws the same tile Browse will.
  const thumb = { id, hue } as Dashboard;
  return (
    <div className="ds-req-preview">
      <span className="ds-req-preview__label" id={`${id}-label`}>
        Preview · how it appears in Browse
      </span>
      <Card id={id} className="ds-req-preview__card" aria-labelledby={`${id}-label`}>
        <CardMedia ratio={8 / 3}>
          <DashboardThumb dashboard={thumb} />
        </CardMedia>
        <CardBody>
          <CardTitle as="p">{listing.title.trim() || 'Display title'}</CardTitle>
          <CardDescription>{listing.description.trim() || 'The description people read before they open it.'}</CardDescription>
          <Text as="span" tone="muted" className="ds-req-preview__meta">
            {[listing.category, source].filter(Boolean).join(' · ')}
          </Text>
        </CardBody>
      </Card>
    </div>
  );
}

/* ── The form ──────────────────────────────────────────────────────────────── */

export function DashboardForm({ initialMode = 'add', initialDashboardId }: { initialMode?: DashboardRequestMode; initialDashboardId?: string }) {
  const { state } = useSuite();
  const { phase, submit } = useSubmission();
  const [mode, setMode] = useState<DashboardRequestMode>(initialMode);

  // Publish
  const [irmNumber, setIrmNumber] = useState('');
  const [listing, setListing] = useState<Listing>(EMPTY_LISTING);
  const [display, setDisplay] = useState<Display>({ toolbar: true, tabs: false, beta: false });
  // Update listing / Promote / Unpublish
  const [gated, setGated] = useState<Gated>({ dashboardId: initialDashboardId ?? '', start: null, end: null, reason: '' });
  const [edit, setEdit] = useState<Listing>(EMPTY_LISTING);

  const [pendingMode, setPendingMode] = useState<DashboardRequestMode | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  /* What can be published: finished IRM records not already in DartBoards. */
  const listedIrm = new Set(state.dashboards.filter((d) => d.lifecycle === 'published').map((d) => irmFor(d).number));
  const publishable = IRM_UNPUBLISHED.filter((r) => !listedIrm.has(r.number));
  const record = publishable.find((r) => r.number === irmNumber);

  const listed = state.dashboards.filter((d) => d.lifecycle === 'published');
  const picked = listed.find((d) => d.id === gated.dashboardId);
  const current = picked ? listingOf(picked) : null;

  const listingKeys = Object.keys(LISTING_LABELS) as (keyof Listing)[];
  const editChanged = current ? listingKeys.filter((k) => edit[k].trim() && edit[k].trim() !== current[k]) : [];

  const dirty =
    mode === 'add'
      ? !!irmNumber || listingKeys.some((k) => listing[k].trim())
      : (!!gated.dashboardId && gated.dashboardId !== initialDashboardId) || !!gated.reason.trim() || !!gated.start || !!gated.end || editChanged.length > 0;

  const ready =
    mode === 'add'
      ? !!record && record.controls === 'complete' && !!listing.title.trim() && !!listing.description.trim() && !!listing.category
      : mode === 'edit'
        ? !!picked && editChanged.length > 0
        : mode === 'promote'
          ? !!picked && !!gated.start && !!gated.reason.trim()
          : !!picked && !!gated.reason.trim();

  const switchMode = (next: string) => {
    if (next === mode || phase === 'submitting') return;
    if (dirty) setPendingMode(next as DashboardRequestMode);
    else setMode(next as DashboardRequestMode);
  };

  const discardAndSwitch = () => {
    setIrmNumber('');
    setListing(EMPTY_LISTING);
    setEdit(EMPTY_LISTING);
    setGated({ dashboardId: '', start: null, end: null, reason: '' });
    if (pendingMode) setMode(pendingMode);
    setPendingMode(null);
  };

  /** Picking an IRM record pre-fills the display title from its name — minus the number. */
  const pickRecord = (n: string) => {
    setIrmNumber(n);
    const r = IRM_UNPUBLISHED.find((x) => x.number === n);
    if (r) setListing((l) => ({ ...l, title: l.title.trim() ? l.title : displayTitleFrom(r.name) }));
  };

  const doSubmit = () => {
    if (mode === 'add') {
      if (!record) return;
      const title = listing.title.trim();
      return submit({
        type: 'dashboard-add',
        product: 'DARTBoards',
        title: `Publish ${title} to DartBoards`,
        summary: `List ${record.number} in DartBoards as “${title}”.`,
        fields: [
          { label: 'IRM record', value: record.number },
          { label: 'IRM report name', value: record.name },
          { label: 'Display title', value: title },
          { label: 'Description', value: listing.description.trim() },
          { label: 'Category', value: listing.category },
          ...(listing.tags.trim() ? [{ label: 'Tags', value: listing.tags.trim() }] : []),
          { label: 'Show toolbar', value: display.toolbar ? 'Yes' : 'No' },
          { label: 'Show tabs', value: display.tabs ? 'Yes' : 'No' },
          { label: 'Beta / preview', value: display.beta ? 'Yes' : 'No' },
        ],
      });
    }
    if (!picked || !current) return;
    const irm = irmFor(picked);
    if (mode === 'edit') {
      const changes: FieldChange[] = editChanged.map((k) => ({ field: LISTING_LABELS[k], current: current[k], proposed: edit[k].trim() }));
      return submit(
        {
          type: 'dashboard-edit',
          product: 'DARTBoards',
          title: `Update the ${picked.name} listing`,
          summary: `Changes to the ${changes.map((c) => c.field.toLowerCase()).join(', ')} shown in Browse.`,
          fields: [
            { label: 'Dashboard', value: picked.name },
            { label: 'IRM record', value: irm.number },
          ],
          changes,
        },
        picked.id,
      );
    }
    if (mode === 'promote') {
      const window = `${fmtDate(gated.start)}${gated.end ? ` – ${fmtDate(gated.end)}` : ''}`;
      return submit(
        {
          type: 'dashboard-promote',
          product: 'DARTBoards',
          title: `Promote ${picked.name}`,
          summary: `Highlighted on the browse page, ${window}.`,
          fields: [
            { label: 'Dashboard', value: picked.name },
            { label: 'IRM record', value: irm.number },
            { label: 'Starts', value: fmtDate(gated.start) },
            ...(gated.end ? [{ label: 'Ends', value: fmtDate(gated.end) }] : []),
            { label: 'Reason for promotion', value: gated.reason.trim() },
          ],
        },
        picked.id,
      );
    }
    return submit(
      {
        type: 'dashboard-remove',
        product: 'DARTBoards',
        title: `Unpublish ${picked.name}`,
        summary: gated.reason.trim(),
        fields: [
          { label: 'Dashboard', value: picked.name },
          { label: 'IRM record', value: irm.number },
          { label: 'Reason', value: gated.reason.trim() },
          ...(gated.end ? [{ label: 'Proposed date', value: fmtDate(gated.end) }] : []),
        ],
      },
      picked.id,
    );
  };

  const onSubmit = () => (mode === 'remove' && phase !== 'failed' ? setConfirmRemove(true) : doSubmit());

  const picker = (
    <Combobox
      id={`ds-req-dash-${mode}-picker`}
      label="Dashboard in DartBoards"
      required
      placeholder="Select…"
      searchPlaceholder="Search by title or IRM number…"
      emptyMessage="No dashboards match."
      options={listed.map((d) => ({ value: d.id, label: d.name, description: irmFor(d).number, searchText: `${d.name} ${irmFor(d).number}` }))}
      value={gated.dashboardId || undefined}
      onValueChange={(v) => {
        setGated((g) => ({ ...g, dashboardId: v }));
        setEdit(EMPTY_LISTING);
      }}
    />
  );

  /** The listing fields — what this form is actually about. */
  const listingFields = (s: Listing, set: (k: keyof Listing) => (v: string) => void, cur: Listing | null, p: string) => {
    const now = (k: keyof Listing) => (cur ? `Current: ${cur[k] || '—'}` : undefined);
    return (
      <>
        <Input
          id={`ds-req-${p}-title`}
          label="Display title"
          required={!cur}
          description={now('title') ?? 'Shown in Browse instead of the IRM name. The IRM number stays on the record.'}
          placeholder={cur ? 'Leave blank to keep' : 'e.g. Originations Daily Volume'}
          value={s.title}
          onValueChange={set('title')}
        />
        <Textarea
          id={`ds-req-${p}-description`}
          label="Description"
          required={!cur}
          description={now('description') ?? 'One or two sentences: what it shows and who it is for.'}
          placeholder={cur ? 'Leave blank to keep' : 'e.g. Daily origination volume by channel, for the Collections team.'}
          value={s.description}
          onValueChange={set('description')}
          rows={3}
        />
        <Row>
          <Select id={`ds-req-${p}-category`} label="Category" required={!cur} description={now('category')} value={s.category || undefined} onValueChange={set('category')}>
            <SelectTrigger placeholder={cur ? 'Keep current' : 'Select…'} />
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} label={c} />
              ))}
            </SelectContent>
          </Select>
          <Input
            id={`ds-req-${p}-tags`}
            label="Tags"
            description={now('tags') ?? 'Separate with commas.'}
            placeholder={cur ? 'Leave blank to keep' : 'e.g. originations, daily'}
            value={s.tags}
            onValueChange={set('tags')}
          />
        </Row>
      </>
    );
  };

  const setL = (k: keyof Listing) => (v: string) => setListing((s) => ({ ...s, [k]: v }));
  const setE = (k: keyof Listing) => (v: string) => setEdit((s) => ({ ...s, [k]: v }));
  const merged = (cur: Listing): Listing => ({
    title: edit.title.trim() || cur.title,
    description: edit.description.trim() || cur.description,
    category: edit.category || cur.category,
    tags: edit.tags.trim() || cur.tags,
  });

  return (
    <FormShell
      id="ds-req-dash"
      crumb="Dashboard in DartBoards"
      title="Dashboard in DartBoards"
      Icon={LayoutGrid}
      color="info"
      ready={ready}
      phase={phase}
      dirty={dirty}
      onSubmit={onSubmit}
    >
      {/* The most common wrong turn, caught before any field: a new report, or a change to one, is IRM. */}
      <Alert
        id="ds-req-dash-irm-note"
        variant="info"
        title="Building a report, or changing its data, visuals, access or controls?"
        description="That is done in IRM. Use this form once a report is finished, to show it in DartBoards or change how it is listed."
        action={<Button id="ds-req-dash-irm-go" size="sm" style="outline" label="Open IRM" IconRight={ExternalLink} aria-label="Open IRM (opens in a new tab)" onClick={() => openIrm('IRM')} />}
      />

      <Tabs id="ds-req-dash-tabs" className="ds-requests-tabs" value={mode} onValueChange={switchMode} activationMode="manual">
        <TabsList aria-label="Dashboard request type">
          {MODES.map(({ value, label, Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon aria-hidden="true" size={16} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="add">
          <div className="ds-requests-fields">
            <Combobox
              id="ds-req-add-irm"
              label="IRM record"
              required
              description="The finished report to publish. Only reports with complete controls can be published."
              placeholder="Search by IRM number or name…"
              searchPlaceholder="IRM number or report name…"
              emptyMessage="No finished IRM records match."
              options={publishable.map((r) => ({
                value: r.number,
                label: r.name,
                description: CONTROLS[r.controls].label,
                searchText: r.name,
                disabled: r.controls !== 'complete',
              }))}
              value={irmNumber || undefined}
              onValueChange={pickRecord}
            />
            {record && (
              <>
                <IrmRecordPanel id="ds-req-add-irm-record" record={record} />
                <Separator label="HOW IT APPEARS IN DARTBOARDS" />
                <div className="ds-req-listing">
                  <div className="ds-req-listing__fields">{listingFields(listing, setL, null, 'add')}</div>
                  <ListingPreview id="ds-req-add-preview" listing={listing} hue="blue" source={record.source} />
                </div>
                <Separator label="DISPLAY OPTIONS" />
                <Switch
                  id="ds-req-add-toolbar"
                  label="Show toolbar"
                  description="Display the source tool’s toolbar when viewing this dashboard."
                  checked={display.toolbar}
                  onCheckedChange={(v) => setDisplay((s) => ({ ...s, toolbar: v }))}
                />
                <Switch
                  id="ds-req-add-tabs"
                  label="Show tabs"
                  description="Display panel tabs if the dashboard uses tab navigation."
                  checked={display.tabs}
                  onCheckedChange={(v) => setDisplay((s) => ({ ...s, tabs: v }))}
                />
                <Switch
                  id="ds-req-add-beta"
                  label="Beta / preview"
                  description="Mark it as a beta release with a preview badge."
                  checked={display.beta}
                  onCheckedChange={(v) => setDisplay((s) => ({ ...s, beta: v }))}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="ds-requests-fields">
            <Alert id="ds-req-edit-note" description="Change how a dashboard is listed in Browse. Its owner, data, access and controls are changed in IRM." />
            {picker}
            {picked && current && (
              <>
                <IrmRecordPanel id="ds-req-edit-irm-record" record={irmFor(picked)} />
                <Separator label="HOW IT APPEARS IN DARTBOARDS" />
                <div className="ds-req-listing">
                  <div className="ds-req-listing__fields">{listingFields(edit, setE, current, 'edit')}</div>
                  <ListingPreview id="ds-req-edit-preview" listing={merged(current)} hue={picked.hue} source={picked.source} />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="promote">
          <div className="ds-requests-fields">
            <Alert id="ds-req-promote-note" description="Promoting a dashboard adds a highlighted badge on the DartBoards browse page so users notice it." />
            {picker}
            {picked && (
              <>
                <Row>
                  <DatePicker
                    id="ds-req-promote-start"
                    label="Promotion start date"
                    required
                    placeholder="mm/dd/yyyy"
                    formatValue={fmtDate}
                    value={gated.start}
                    onValueChange={(d) => setGated((g) => ({ ...g, start: d }))}
                  />
                  <DatePicker
                    id="ds-req-promote-end"
                    label="Promotion end date"
                    placeholder="mm/dd/yyyy"
                    formatValue={fmtDate}
                    min={gated.start ?? undefined}
                    value={gated.end}
                    onValueChange={(d) => setGated((g) => ({ ...g, end: d }))}
                  />
                </Row>
                <Textarea
                  id="ds-req-promote-reason"
                  label="Reason for promotion"
                  required
                  description="Why should this dashboard be highlighted, and what should users know about it?"
                  placeholder="e.g. Q3 collateral coverage is a board metric this quarter."
                  rows={3}
                  value={gated.reason}
                  onValueChange={(v) => setGated((g) => ({ ...g, reason: v }))}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="remove">
          <div className="ds-requests-fields">
            <Alert
              id="ds-req-remove-note"
              description="Unpublishing takes the dashboard out of DartBoards. The report itself, its IRM record and its controls are untouched — retiring a report is done in IRM. Anyone who added it to a space will see it as unavailable."
            />
            {picker}
            {picked && (
              <>
                <Textarea
                  id="ds-req-remove-reason"
                  label="Reason"
                  required
                  description="Why should it come out of DartBoards?"
                  placeholder="e.g. Superseded by v2, live since July."
                  rows={3}
                  value={gated.reason}
                  onValueChange={(v) => setGated((g) => ({ ...g, reason: v }))}
                />
                <DatePicker
                  id="ds-req-remove-date"
                  label="Proposed date"
                  placeholder="mm/dd/yyyy"
                  formatValue={fmtDate}
                  value={gated.end}
                  onValueChange={(d) => setGated((g) => ({ ...g, end: d }))}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog id="ds-req-dash-switch" open={pendingMode !== null} onClose={() => setPendingMode(null)}>
        <AlertDialogHeader id="ds-req-dash-switch-header" title="Discard your changes?" />
        <AlertDialogBody>Switching request type clears the form. The details you’ve entered won’t be saved.</AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-req-dash-switch-keep" style="ghost" label="Keep editing" onClick={() => setPendingMode(null)} />
          <Button id="ds-req-dash-switch-discard" variant="error" label="Discard changes" onClick={discardAndSwitch} />
        </AlertDialogFooter>
      </AlertDialog>

      <AlertDialog id="ds-req-remove-confirm" open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <AlertDialogHeader id="ds-req-remove-confirm-header" title="Submit an unpublish request?" />
        <AlertDialogBody>
          The DART Central admin team will review this. Once approved, “{picked?.name}” comes out of DartBoards. Its IRM record is not changed.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-req-remove-confirm-cancel" style="ghost" label="Cancel" onClick={() => setConfirmRemove(false)} />
          <Button
            id="ds-req-remove-confirm-go"
            variant="error"
            label="Submit unpublish request"
            onClick={() => {
              setConfirmRemove(false);
              doSubmit();
            }}
          />
        </AlertDialogFooter>
      </AlertDialog>
    </FormShell>
  );
}
