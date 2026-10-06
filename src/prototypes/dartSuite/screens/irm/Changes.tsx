/* IRM · change requests — the list, one request, and the form that files one.
   A request is New, Break, Modification or Decommission, against a record. Its
   page shows the actions the signed-in person's role allows at its status. */

import { useMemo, useState } from 'react';
import { Check, ExternalLink, FilePlus, Plus, Rocket, Search, Ticket, Undo2, UserPlus, X } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Card, { CardBody } from '../../../../components/Card';
import Combobox from '../../../../components/Combobox';
import DatePicker from '../../../../components/DatePicker';
import DescriptionList, { DescriptionListItem } from '../../../../components/DescriptionList';
import Input from '../../../../components/Input';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import Textarea from '../../../../components/Textarea';
import Timeline, { TimelineItem } from '../../../../components/Timeline';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { personById } from '../../data';
import { CHANGE_STATUS, CHANGE_TYPE, PRIORITY, WORK_STATUSES, addDaysIso, fmtIso, recordName } from '../../irm';
import type { IrmPriority } from '../../irm';
import { useNav } from '../../nav';
import { approversOf } from '../../irmEngine';
import { toneBadge, useSignedIn, useSuite } from '../../store';
import type { RequestView } from '../../store';
import { ColumnsMenu, SavedViewsMenu } from './SavedViews';
import type { IrmChangeType } from '../../types';
import { IRM_TYPE_OPTION, audienceOf, canRequest } from '../../hub';
import { ImpactAlert } from './Lineage';
import { JIRA_STATUS_TONE, JIRA_TICKETS, openInJira } from '../home/jira';
import { FormShell } from '../requests/shared';
import { toast } from '../../../../components/Toast';
import { Age, CHANGE_HEADERS, ChangeTable, IRM_TYPE_VISUAL, IrmCrumbs, RejectDialog, WorkMenu, nameOf, sortChanges, useIrm } from './shared';
import type { ChangeColumn } from './shared';

/* ── Every request ───────────────────────────────────────────────────────── */

/** The requests list as everyone starts it: open requests of every type, newest first. */
const DEFAULT_REQUEST_COLUMNS: ChangeColumn[] = ['id', 'title', 'record', 'type', 'priority', 'status', 'assignee', 'opened', 'age'];
const DEFAULT_REQUEST_VIEW: RequestView = { type: 'all', phase: 'active', sort: { key: 'opened', dir: 'desc' }, columns: DEFAULT_REQUEST_COLUMNS };
/** Every column the requests table can show. The change and its title always show: they name the row. */
const REQUEST_COLUMNS = (Object.keys(CHANGE_HEADERS) as ChangeColumn[]).map((key) => ({ key, label: CHANGE_HEADERS[key], locked: key === 'id' || key === 'title' }));

export function IrmChanges() {
  const { state, setRequestView, setSavedRequestViews } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  // What the list shows is the person's VIEW — kept, and nameable through the Views menu.
  const view = state.irmRequestView[person.id] ?? DEFAULT_REQUEST_VIEW;
  const save = (next: Partial<RequestView>) => setRequestView(person.id, { ...view, ...next });
  const { type, phase } = view;
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      sortChanges(
        state.irm.changes
          .filter((c) => type === 'all' || c.type === type)
          .filter((c) => phase === 'all' || (phase === 'active') === CHANGE_STATUS[c.status].active)
          .filter((c) => !q || [c.id, c.title, c.record, nameOf(c.assigneeId), nameOf(c.requestedForId)].some((s) => s.toLowerCase().includes(q))),
        view.sort,
        state.irm.today,
      ),
    [state.irm.changes, state.irm.today, type, phase, q, view.sort],
  );
  return (
    <PageContainer>
      <PageHeader
        id="ds-irm-chg-header"
        title="All requests"
        description="Every request about a report, from everyone — new reports, things that are wrong, changes and retirements."
        actions={<Button id="ds-irm-chg-new" label="New IRM request" IconLeft={Plus} onClick={() => go({ page: 'irm-new-change' })} />}
      />
      <Stack level={4}>
        <Toolbar id="ds-irm-chg-filters" label="Filter requests" justify="between">
          <ToolbarGroup>
            <ToggleGroup id="ds-irm-chg-type" type="single" variant="plain" size="sm" value={type} onValueChange={(v) => save({ type: (v as IrmChangeType) || 'all' })}>
              <ToggleGroupItem value="all" label="All types" />
              {(['new', 'break', 'modification', 'decommission'] as const).map((t) => (
                <ToggleGroupItem key={t} value={t} label={CHANGE_TYPE[t].label} />
              ))}
            </ToggleGroup>
            <ToggleGroup id="ds-irm-chg-phase" type="single" variant="plain" size="sm" value={phase} onValueChange={(v) => save({ phase: (v as RequestView['phase']) || 'active' })}>
              <ToggleGroupItem value="active" label="Open" />
              <ToggleGroupItem value="closed" label="Closed" />
              <ToggleGroupItem value="all" label="All" />
            </ToggleGroup>
          </ToolbarGroup>
          <ToolbarGroup>
            <SavedViewsMenu
              id="ds-irm-chg-views"
              view={view}
              defaults={DEFAULT_REQUEST_VIEW}
              saved={state.irmSavedRequestViews[person.id] ?? []}
              essence={(v) => JSON.stringify({ t: v.type, p: v.phase, s: v.sort, c: v.columns ?? DEFAULT_REQUEST_COLUMNS })}
              keeps="your columns and their order, the request types, open or closed, and the sort"
              placeholder="e.g. Something is wrong, oldest first"
              setView={(v) => setRequestView(person.id, v)}
              setSaved={(list) => setSavedRequestViews(person.id, list)}
            />
            <ColumnsMenu
              id="ds-irm-chg-cols"
              all={REQUEST_COLUMNS}
              shown={view.columns ?? DEFAULT_REQUEST_COLUMNS}
              onChange={(columns) => save({ columns })}
              onReset={() => setRequestView(person.id, null)}
            />
            <Input id="ds-irm-chg-search" size="sm" aria-label="Search requests" placeholder="Change, report or person…" IconLeft={Search} value={query} onValueChange={setQuery} className="ds-admin-search" />
          </ToolbarGroup>
        </Toolbar>
        <ChangeTable
          id="ds-irm-chg-table"
          label="Requests"
          rows={rows}
          columns={(view.columns ?? DEFAULT_REQUEST_COLUMNS) as ChangeColumn[]}
          sort={view.sort}
          onSort={(sort) => save({ sort })}
        />
      </Stack>
    </PageContainer>
  );
}

/* ── One request ─────────────────────────────────────────────────────────── */

/** `hosted`: shown inside DART Central for a business person, so the way back is Open items, not IRM. */
export function IrmChange({ id, hosted }: { id: string; hosted?: boolean }) {
  const { state } = useSuite();
  const { go } = useNav();
  const irm = useIrm();
  const [rejecting, setRejecting] = useState(false);
  const c = state.irm.changes.find((x) => x.id === id);
  if (!c) return <PageContainer><Text>No change {id}.</Text></PageContainer>;
  const rec = state.irm.records.find((r) => r.number === c.record);
  const tickets = JIRA_TICKETS.filter((t) => t.irm === c.id);
  const listing = state.requests.find((r) => r.type.startsWith('dashboard') && r.fields.some((f) => f.label === 'IRM record' && f.value === c.record));
  const role = irm.role;
  // Who may approve is the type's workflow, not the screen.
  const canApprove = approversOf(c, state.irm.workflows).includes(irm.me);
  const canWork = (role === 'developer' && c.assigneeId === irm.me) || role === 'dev-manager';
  const canDeploy = role === 'prod-support' && c.status === 'awaiting-deployment';

  return (
    // Filed from DART Central, it reads like every request page there: the narrow reading width.
    <PageContainer width={hosted ? 'narrow' : undefined}>
      <Stack level={4}>
        <IrmCrumbs parent={hosted ? { label: 'Open items', route: { page: 'my-requests' } } : { label: 'All requests', route: { page: 'irm-changes' } }} page={c.id} />
        <PageHeader
          id="ds-irm-c-header"
          overline={
            <>
              {`${c.id} · ${CHANGE_TYPE[c.type].label} · ${PRIORITY[c.priority].label}`}
              {/* The one state this page is about, so it is always a badge here. */}
              <Badge id="ds-irm-c-status" label={CHANGE_STATUS[c.status].label} {...toneBadge(CHANGE_STATUS[c.status].tone)} />
            </>
          }
          title={c.title}
          description={c.summary !== c.title ? c.summary : undefined}
          actions={
            <>
              {canApprove && (
                <>
                  <Button id="ds-irm-c-approve" label={c.type === 'decommission' ? 'Approve retirement' : 'Approve'} IconLeft={Check} onClick={() => irm.approve(c.id)} />
                  <Button id="ds-irm-c-reject" style="ghost" label="Reject" IconLeft={X} onClick={() => setRejecting(true)} />
                </>
              )}
              {canDeploy && !c.deployerId && <Button id="ds-irm-c-take" style="outline" label="Take" IconLeft={UserPlus} onClick={() => irm.take(c.id)} />}
              {canDeploy && c.deployerId === irm.me && (
                <>
                  <Button id="ds-irm-c-deploy" label="Deploy" IconLeft={Rocket} onClick={() => irm.deploy(c.id)} />
                  <Button id="ds-irm-c-rollback" style="ghost" label="Roll back" IconLeft={Undo2} onClick={() => irm.rollback(c.id)} />
                </>
              )}
              {c.status === 'scheduled' && role === 'governance' && (
                <Button id="ds-irm-c-cancel" style="ghost" label="Cancel retirement" IconLeft={X} onClick={() => irm.cancelDecommission(c.id)} />
              )}
              {canWork && WORK_STATUSES.includes(c.status) && <WorkMenu id="ds-irm-c-work" change={c} canAssign={role === 'dev-manager'} />}
            </>
          }
        />
      </Stack>
      <Stack level={2}>
        {c.type === 'decommission' && c.retireOn && (
          <Alert
            id="ds-irm-c-decom"
            variant={c.status === 'scheduled' ? 'warning' : 'info'}
            title={c.status === 'scheduled' ? `Retires on ${fmtIso(c.retireOn)}` : `Proposed retire date ${fmtIso(c.retireOn)}`}
            description={
              c.status === 'scheduled'
                ? 'DartBoards has been told: its listing shows a retiring notice now and archives itself on the day.'
                : 'When governance approves, DartBoards is told at once — its listing shows a retiring notice for the whole notice period, then archives itself.'
            }
          />
        )}
        <Card id="ds-irm-c-details">
          <CardBody>
            <DescriptionList>
              <DescriptionListItem term="IRM record">
                <Button id="ds-irm-c-rec" style="link" className="ds-admin-rowlink" label={rec ? `${recordName(rec)} · ${c.record}` : c.record} onClick={() => go({ page: 'irm-record', number: c.record })} />
              </DescriptionListItem>
              {rec?.brdLocation && (
                // The business's requirements — what the Jira tickets below were opened from.
                <DescriptionListItem term="BRD">
                  <a className="ds-inv__link" href={rec.brdLocation} target="_blank" rel="noreferrer">
                    {rec.brdLocation.split('/').pop()}
                  </a>
                </DescriptionListItem>
              )}
              {listing && (
                <DescriptionListItem term="DartBoards listing">
                  <Button id="ds-irm-c-listing" style="link" className="ds-admin-rowlink" label={`${listing.id} · ${listing.title}`} onClick={() => go({ page: 'request-detail', id: listing.id })} />
                </DescriptionListItem>
              )}
              <DescriptionListItem term="Business owner">{nameOf(c.requestedForId)}</DescriptionListItem>
              {c.status === 'pending-approval' && (
                <DescriptionListItem term="Waiting on">
                  {approversOf(c, state.irm.workflows).map(nameOf).join(', ') || '—'}
                  {c.ownerApproved ? ' · the business owner has approved' : ''}
                </DescriptionListItem>
              )}
              <DescriptionListItem term="Requested by">{nameOf(c.createdById)}</DescriptionListItem>
              <DescriptionListItem term="Assignee">{nameOf(c.assigneeId)}</DescriptionListItem>
              {c.deployerId && <DescriptionListItem term="Deployed by">{nameOf(c.deployerId)}</DescriptionListItem>}
              <DescriptionListItem term="Opened">{fmtIso(c.opened)}</DescriptionListItem>
              <DescriptionListItem term="In this status">
                <Age change={c} />
              </DescriptionListItem>
              {c.replacedBy && <DescriptionListItem term="Replaced by">{c.replacedBy}</DescriptionListItem>}
            </DescriptionList>
          </CardBody>
        </Card>
        {tickets.length > 0 && (
          // The Jira tickets opened for this request — the work, broken down from the BRD. Each opens in Jira.
          <Section id="ds-irm-c-jira" heading={`Jira tickets · ${tickets.length}`} variant="group">
            <ul className="ds-open-tickets__list">
              {tickets.map((t) => (
                <li key={t.key}>
                  <button type="button" className="ds-open-ticket" onClick={() => openInJira(t.key)}>
                    <Ticket aria-hidden="true" className="ds-open-ticket__icon" />
                    <span className="ds-open-ticket__key">{t.key}</span>
                    <span className="ds-open-ticket__title">{t.summary}</span>
                    <span className="ds-open-ticket__due">{nameOf(t.assigneeId)}</span>
                    <Badge id={`ds-irm-c-jira-${t.key}`} label={t.status} {...toneBadge(JIRA_STATUS_TONE[t.status])} />
                    <ExternalLink aria-hidden="true" className="ds-open-ticket__out" />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}
        <Section id="ds-irm-c-history" heading="History" variant="group">
          <Timeline connector aria-label="History">
            {c.history.map((h) => (
              <TimelineItem key={h.id} author={h.name} time={h.at}>
                {h.text}
              </TimelineItem>
            ))}
          </Timeline>
        </Section>
      </Stack>
      <RejectDialog id="ds-irm-c-reject-dialog" change={rejecting ? c : null} onClose={() => setRejecting(false)} />
    </PageContainer>
  );
}

/* ── New request ─────────────────────────────────────────────────────────── */

const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** `hosted`: filed from DART Central by a business person — they stay in DART Central before and after. */
export function IrmNewChange({ type: initialType, record: initialRecord, hosted }: { type?: IrmChangeType; record?: string; hosted?: boolean }) {
  const { state } = useSuite();
  const { replace } = useNav();
  const irm = useIrm();
  // Only the request types this person can raise (hub.ts) — production support can report a break, not order a report.
  const audience = audienceOf(state, irm.me);
  const types = (['new', 'break', 'modification', 'decommission'] as const).filter((t) => canRequest(IRM_TYPE_OPTION[t], audience));
  const [type, setType] = useState<IrmChangeType>(initialType && types.includes(initialType) ? initialType : (types.includes('modification') ? 'modification' : types[0]));
  const [record, setRecord] = useState(initialRecord ?? '');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState<IrmPriority>(initialType === 'break' ? 'P1' : 'P3');
  const [retireOn, setRetireOn] = useState<Date | null>(fromIso(addDaysIso(state.irm.today, Math.max(30, state.irm.workflows.decommission.noticeDays ?? 0))));
  const [replacedBy, setReplacedBy] = useState('');
  const [tried, setTried] = useState(false);

  const rec = state.irm.records.find((r) => r.number === record);
  const live = state.irm.records.filter((r) => r.lifecycle === 'production' || r.lifecycle === 'in-development' || r.lifecycle === 'in-review');
  // An owner retires only what is theirs; governance can retire anything.
  const retirable = live.filter((r) => r.lifecycle === 'production' && (audience === 'governance' || r.businessOwnerId === irm.me));
  const recordOptions = (type === 'decommission' ? retirable : live).map((r) => ({
    value: r.number,
    label: `${recordName(r)} · ${r.number}`,
    searchText: r.name,
  }));
  const minRetire = fromIso(addDaysIso(state.irm.today, state.irm.workflows.decommission.noticeDays ?? 7));
  const needsRecord = type !== 'new';
  const approver = state.irm.workflows[type].approver;
  const ownerName = rec ? (personById(rec.businessOwnerId)?.name ?? rec.businessOwner) : 'the business owner';
  const approvalCopy =
    (approver === 'none'
      ? 'No approval needed: it goes straight to the development queue.'
      : approver === 'governance'
        ? 'Goes to the governance team for approval.'
        : approver === 'both'
          ? `Goes to ${ownerName} for approval, then the governance team.`
          : `Goes to ${ownerName} for approval.`) +
    (type === 'break' ? ' DartBoards shows a known-issue notice until the fix is deployed.' : type === 'decommission' ? ' Approving it starts the notice period in DartBoards.' : '');
  const effectiveTitle = title.trim() || (type === 'decommission' && rec ? `Retire ${rec.name.replace(/^IRM-\d+\s*/, '').replace(/\s+v\d+$/, '')}` : '');
  const valid =
    (!needsRecord || !!rec) &&
    (type !== 'new' || !!name.trim()) &&
    !!(effectiveTitle || (type === 'new' && name.trim())) &&
    (type !== 'decommission' || !!retireOn);

  const submit = () => {
    setTried(true);
    if (!valid) return;
    const id = irm.create({
      type,
      record: needsRecord ? record : undefined,
      newReportName: type === 'new' ? name.trim() : undefined,
      title: effectiveTitle || `New report: ${name.trim()}`,
      summary: summary.trim() || effectiveTitle || name.trim(),
      priority,
      requestedForId: rec?.businessOwnerId || irm.me,
      retireOn: type === 'decommission' && retireOn ? toIso(retireOn) : undefined,
      replacedBy: type === 'decommission' && replacedBy ? replacedBy : undefined,
    });
    // `replace`, not `go`: the form's leave guard would otherwise stop the move to what was just filed.
    replace(hosted ? { page: 'report-request-detail', id } : { page: 'irm-change', id });
    // The same toast every request form gives: it went in, who has it next, where to track it.
    // Only who is next: a known-issue notice gets its own toast from IRM, so this one does not repeat it.
    toast.success(`Request ${id} submitted`, { description: `${approvalCopy.split('. ')[0].replace(/\.$/, '')}. Track it in Open items, under Waiting on others.` });
  };

  // The form wears the choice that opened it: its name, its icon. Only when nothing was chosen (IRM's own
  // New request) does it ask which kind — the chooser cards already asked everywhere else.
  const chosen = !!initialType && types.includes(initialType);
  const visual = IRM_TYPE_VISUAL[type];

  return (
    <FormShell
      id="ds-irm-new"
      crumb={CHANGE_TYPE[type].label}
      trail={hosted ? undefined : null}
      title={chosen ? CHANGE_TYPE[type].label : 'New IRM request'}
      Icon={chosen ? visual.Icon : FilePlus}
      color={chosen ? visual.color : 'default'}
      ready={valid}
      phase="idle"
      dirty={!!(title.trim() || name.trim() || summary.trim() || (record && record !== initialRecord))}
      onSubmit={submit}
      readyNote={rec || type === 'new' ? approvalCopy : 'Handled in IRM by the report’s owner and developers.'}
      submitLabel="Submit request"
    >
      <Stack level={3}>
        {!chosen && (
          <ToggleGroup
            id="ds-irm-new-type"
            type="single"
            value={type}
            onValueChange={(v) => {
              if (!v) return;
              setType(v as IrmChangeType);
              // Something is wrong defaults to P1, and back to normal when it stops being that — unless the priority was chosen.
              if (v === 'break' && priority === 'P3') setPriority('P1');
              if (v !== 'break' && type === 'break' && priority === 'P1') setPriority('P3');
            }}
            aria-label="What kind of request"
          >
            {types.map((t) => (
              <ToggleGroupItem key={t} value={t} label={CHANGE_TYPE[t].label} />
            ))}
          </ToggleGroup>
        )}
        <Text tone="muted">{CHANGE_TYPE[type].hint}</Text>
        {needsRecord ? (
          <Combobox
            id="ds-irm-new-record"
            label="Report"
            required
            placeholder="Find the IRM record…"
            searchPlaceholder="IRM number or report name…"
            emptyMessage="No report matches."
            options={recordOptions}
            value={record || undefined}
            onValueChange={setRecord}
            error={tried && !rec}
            errorMessage="Choose the report this is about."
          />
        ) : (
          <Input id="ds-irm-new-name" label="Report name" required value={name} onValueChange={setName} error={tried && !name.trim()} errorMessage="Name the report." />
        )}

        {type === 'decommission' ? (
          <>
            {rec && <ImpactAlert number={rec.number} />}
            <DatePicker
              id="ds-irm-new-retire"
              label="Retire on"
              required
              description={`At least ${state.irm.workflows.decommission.noticeDays ?? 0} days from today. DartBoards shows a retiring notice from approval until this date, then archives the listing.`}
              value={retireOn}
              min={minRetire}
              onValueChange={setRetireOn}
            />
            <Combobox
              id="ds-irm-new-replacement"
              label="Replaced by"
              description="Optional. Readers of the retiring listing are pointed here."
              placeholder="No replacement"
              searchPlaceholder="IRM number or report name…"
              emptyMessage="No report matches."
              options={live.filter((r) => r.number !== record && r.lifecycle === 'production').map((r) => ({ value: r.number, label: `${recordName(r)} · ${r.number}`, searchText: r.name }))}
              value={replacedBy || undefined}
              onValueChange={setReplacedBy}
              clearable
            />
          </>
        ) : (
          <Input id="ds-irm-new-title" label="What do you need?" required={type !== 'new'} value={title} onValueChange={setTitle} error={tried && type !== 'new' && !title.trim()} errorMessage="Say what you need in a line." />
        )}
        <Textarea id="ds-irm-new-summary" label="Details" value={summary} onValueChange={setSummary} description={type === 'break' ? 'What is wrong, since when, and who it affects. DartBoards shows a known-issue notice on the report straight away.' : undefined} />
        <NativeSelect id="ds-irm-new-priority" label="Priority" value={priority} onValueChange={(v) => setPriority(v as IrmPriority)}>
          {(['P1', 'P2', 'P3', 'P4'] as const).map((p) => (
            <NativeSelectOption key={p} value={p}>
              {PRIORITY[p].label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Stack>
    </FormShell>
  );
}
