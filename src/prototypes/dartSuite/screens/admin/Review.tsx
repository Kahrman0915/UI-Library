/* DART Central · Admin · 3 DECIDE and 4 APPLY.

   Figma: Admin Flow 3.1 Dashboard (add) · 3.2 Banner · 3.3 General ·
   3.4 Dashboard (edit, shows a DIFF) · 3.5 Banner (edit) · 3.6 Feature Request,
   each with its "· replying" state (3.xa — the composer expanded in place),
   and 3.3b the Open-a-feature-request drawer. Promote / Remove render as 3.4.

   4.1 / 4.2 approved, not yet applied · 4.3 / 4.4 the edit drawer prefilled
   from the request, the old value under each changed field · 4.6 Applied.

   The ACTION BAR is type-dependent (Admin Flow ① READ FIRST):
     Dashboard / Banner / Feature → Deny · Approve
     General                      → Close · Open a feature request
   Replying is never on the bar: the thread ends in a Reply that expands a
   composer. The breadcrumb is the only way back — there is no Cancel. */

import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Info, Lightbulb, ThumbsUp } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Avatar from '../../../../components/Avatar';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/Breadcrumb';
import Button from '../../../../components/Button';
import Card, { CardBody, CardHeader } from '../../../../components/Card';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Input from '../../../../components/Input';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Textarea from '../../../../components/Textarea';
import { toast } from '../../../../components/Toast';
import { DISCARD_REPLY, useLeaveGuard, useNav } from '../../nav';
import { adminStatus, today, typeLabel, useSuite } from '../../store';
import type { Banner, Dashboard, Request } from '../../types';
import { DecisionDialog, fieldValue, isStaged, PRODUCT_LABEL, requesterOf, StatusBadge, TYPE_ICON, useGoAfterCommit } from './shared';
import type { Decision } from './shared';
import './Admin.scss';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Entries already on the public backlog — what the SIMILAR card compares against (3.6). */
const BACKLOG = [
  { id: 'fb-118', title: 'Pin a dashboard to the top of Browse', votes: 42 },
  { id: 'fb-097', title: 'Saved views per team', votes: 17 },
];

/* ── Shared page chrome ──────────────────────────────────────────────────── */

function Crumbs({ r }: { r: Request }) {
  const { go } = useNav();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go({ page: 'admin-queue' });
            }}
          >
            Approval Queue
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {r.id} {r.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function RequestHeader({ r, sub }: { r: Request; sub: string }) {
  const Icon = TYPE_ICON[r.type];
  const key = r.id.replace('#', '');
  return (
    <PageHeader
      id={`ds-ar-header-${key}`}
      size="sm"
      visual={<FeaturedIcon Icon={Icon} color="default" />}
      overline={`${r.id}  ·  ${typeLabel[r.type]}  ·  ${PRODUCT_LABEL[r.product]}  ·  ${requesterOf(r).name}`}
      title={r.title}
      actions={
        <div className="ds-admin-status">
          <StatusBadge id={`ds-ar-status-${key}`} request={r} />
          <span className="ds-muted">{sub}</span>
        </div>
      }
    />
  );
}

/** Field / current / proposed — or was / now once applied (3.4, 4.1, 4.6). */
function Diff({ r, applied }: { r: Request; applied?: boolean }) {
  const key = r.id.replace('#', '');
  return (
    <Table id={`ds-ar-diff-${key}`} label="Proposed changes" density="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Field</TableHeaderCell>
          <TableHeaderCell>{applied ? 'Was' : 'Current'}</TableHeaderCell>
          <TableHeaderCell>{applied ? 'Now' : 'Proposed'}</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(r.changes ?? []).map((c) => (
          <TableRow key={c.field}>
            <TableCell>{c.field}</TableCell>
            <TableCell>{c.current}</TableCell>
            <TableCell>{c.current === c.proposed ? <span className="ds-muted">no change</span> : c.proposed}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Details({ r, applied }: { r: Request; applied?: boolean }) {
  if (r.changes?.length) return <Diff r={r} applied={applied} />;
  return (
    <Card id={`ds-ar-details-${r.id.replace('#', '')}`}>
      <CardBody>
        <dl className="ds-fields">
          {r.fields.map((f) => (
            <div key={f.label} className="ds-admin-field">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  );
}

/** The activity thread, ending in a Reply that expands the composer in place (3.xa). */
function Thread({
  r,
  canReply,
  reply,
  setReply,
  onSend,
}: {
  r: Request;
  canReply: boolean;
  reply: string | null;
  setReply: (v: string | null) => void;
  onSend: (close: boolean) => void;
}) {
  const key = r.id.replace('#', '');
  const first = requesterOf(r).name.split(' ')[0];
  const twoVerbs = r.type === 'general' || r.type === 'feature';
  const empty = !reply?.trim();
  return (
    <Card id={`ds-ar-thread-${key}`}>
      <CardBody>
        <Section id={`ds-ar-activity-${key}`} heading="Activity" variant="group">
          <ol className="ds-admin-thread">
            {r.thread.map((t) => (
              <li key={t.id} className="ds-admin-thread__entry">
                <Avatar id={`ds-ar-av-${key}-${t.id}`} size="sm" fallback={t.author === 'system' ? 'DC' : initialsOf(t.name)} />
                <div className="ds-admin-thread__text">
                  <p className="ds-muted">
                    {t.author === 'admin' ? `${t.name} (admin)` : t.name}  ·  {t.at}
                  </p>
                  <p className="ds-text">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        {canReply &&
          (reply === null ? (
            <div className="ds-admin-thread__foot">
              <Button id={`ds-ar-reply-${key}`} style="outline" size="sm" label="Reply" onClick={() => setReply('')} />
            </div>
          ) : (
            <div className="ds-admin-composer">
              <Textarea
                id={`ds-ar-composer-${key}`}
                label="Your reply"
                placeholder={`Write a reply to ${first}…`}
                rows={4}
                autoFocus
                value={reply}
                onValueChange={setReply}
              />
              <div className="ds-admin-composer__row">
                <p className="ds-muted">
                  Send reply hands it back. {first} sees “Needs your reply” and it leaves your queue.
                  {twoVerbs ? ' Send & close answers and ends it.' : ''}
                </p>
                <div className="ds-admin-composer__actions">
                  <Button id={`ds-ar-cancel-reply-${key}`} style="ghost" size="sm" label="Cancel" onClick={() => setReply(null)} />
                  {twoVerbs && <Button id={`ds-ar-send-close-${key}`} style="outline" size="sm" label="Send & close" disabled={empty} onClick={() => onSend(true)} />}
                  <Button id={`ds-ar-send-${key}`} size="sm" label="Send reply" disabled={empty} onClick={() => onSend(false)} />
                </div>
              </div>
            </div>
          ))}
      </CardBody>
    </Card>
  );
}

function NotFound({ id }: { id: string }) {
  const { go } = useNav();
  return (
    <PageContainer width="form">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Info />
          </EmptyMedia>
          <EmptyTitle>Request {id} was not found</EmptyTitle>
          <EmptyDescription>It may have been removed. The Approval Queue lists every request.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button id="ds-ar-nf-back" style="outline" label="Back to Approval Queue" onClick={() => go({ page: 'admin-queue' })} />
        </EmptyContent>
      </Empty>
    </PageContainer>
  );
}

/* ── 3 · Request review ──────────────────────────────────────────────────── */

export function AdminReview({ id }: { id: string }) {
  const { state, update, approve, deny, replyAsAdmin, close, markDuplicate, submitRequest } = useSuite();
  const { go } = useNav();
  const r = state.requests.find((x) => x.id === id);

  const [reply, setReply] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [featureOpen, setFeatureOpen] = useState(false);

  // An unsent reply is guarded on every exit (breadcrumb, sidebar, tab switch/close).
  useLeaveGuard(reply?.trim() ? DISCARD_REPLY : null);
  const goNext = useGoAfterCommit();

  if (!r) return <NotFound id={id} />;
  const key = r.id.replace('#', '');
  const s = adminStatus(r.status);
  const first = requesterOf(r).name.split(' ')[0];
  const done = () => goNext({ page: 'admin-queue' });

  const send = (andClose: boolean) => {
    if (!reply?.trim()) return;
    replyAsAdmin(r.id, reply.trim(), andClose);
    setReply(null);
    toast(andClose ? `Answered and closed ${r.id}` : `Reply sent on ${r.id}`, {
      description: andClose ? `${first} sees it as Closed, with your answer.` : `${first} sees “Needs your reply”. It leaves your queue until they answer.`,
    });
    done();
  };

  const onDecide = (text: string) => {
    if (decision === 'approve') {
      approve(r.id, text || undefined);
      setDecision(null);
      // What approving produces (③ DATA CONTRACT §2): Promote → a scheduled
      // promotion window; Remove → that dashboard's health = decommissioning.
      const dash = state.dashboards.find((d) => d.name === fieldValue(r, 'Dashboard', 'Dashboard name'));
      if (dash && r.type === 'dashboard-promote')
        update((d) =>
          void d.promotions.unshift({
            id: `pr-${Date.now()}`,
            dashboardId: dash.id,
            placement: fieldValue(r, 'Placement') || 'Browse · featured row',
            starts: fieldValue(r, 'Starts') || today(),
            ends: fieldValue(r, 'Ends') || today(),
            state: 'scheduled',
          }),
        );
      if (dash && r.type === 'dashboard-remove') update((d) => void Object.assign(d.dashboards.find((x) => x.id === dash.id) ?? {}, { health: 'decommissioning' }));
      if (isStaged(r.type)) {
        toast.success(`${r.id} approved`, { description: 'Nothing is live yet. Apply changes when you are ready.' });
        go({ page: 'admin-applied', id: r.id });
      } else {
        toast.success(`${r.id} approved`, {
          description: r.type === 'feature' ? 'Published to the public feature backlog.' : `${first} sees it as Approved on My requests.`,
        });
        done();
      }
    } else if (decision === 'deny') {
      deny(r.id, text);
      setDecision(null);
      toast(`${r.id} denied`, { description: `${first} sees it as Rejected, with your reason.` });
      done();
    }
  };

  const bar = !s.active ? null : r.type === 'general' ? (
    <div className="ds-admin-bar">
      <Button
        id={`ds-ar-close-${key}`}
        style="ghost"
        label="Close"
        onClick={() => {
          close(r.id);
          toast(`${r.id} closed`, { description: 'Closed without a reply. The thread says so.' });
          done();
        }}
      />
      <Button id={`ds-ar-feature-${key}`} style="secondary" label="Open a feature request" onClick={() => setFeatureOpen(true)} />
    </div>
  ) : (
    <div className="ds-admin-bar">
      <Button id={`ds-ar-deny-${key}`} variant="error" style="outline" label="Deny" onClick={() => setDecision('deny')} />
      <Button id={`ds-ar-approve-${key}`} label="Approve" onClick={() => setDecision('approve')} />
    </div>
  );

  const outcome =
    r.status === 'approved-not-applied' ? (
      <Alert
        id={`ds-ar-outcome-${key}`}
        variant="warning"
        title="Approved, not applied"
        description="Approving recorded the decision. Nothing changes for users until you apply it."
        action={<Button id={`ds-ar-goapply-${key}`} size="sm" style="outline" label="Apply changes" onClick={() => go({ page: 'admin-applied', id: r.id })} />}
      />
    ) : !s.active ? (
      <Alert
        id={`ds-ar-outcome-${key}`}
        variant={r.status === 'denied' ? 'error' : r.status === 'closed' ? 'default' : 'success'}
        title={`This request is ${s.label.toLowerCase()}`}
        description="It is decided, so there is nothing to act on here. The thread is the record."
        action={
          r.status === 'applied' ? (
            <Button id={`ds-ar-goapplied-${key}`} size="sm" style="outline" label="View applied change" onClick={() => go({ page: 'admin-applied', id: r.id })} />
          ) : undefined
        }
      />
    ) : r.status === 'awaiting-reply' ? (
      <Alert id={`ds-ar-outcome-${key}`} variant="info" title="Waiting on the requester" description={`You asked ${first} a question. It comes back to the top of your queue when they answer.`} />
    ) : null;

  return (
    <PageContainer width="form">
      <Stack level={3}>
        <Crumbs r={r} />
        <RequestHeader r={r} sub={`Submitted ${r.submittedAt}`} />
        {outcome}
        <Details r={r} />
        {r.type === 'feature' && s.active && (
          <Card id={`ds-ar-similar-${key}`}>
            <CardHeader
              id={`ds-ar-similar-${key}-header`}
              title="Similar on the backlog"
              description={`Two entries already ask for this. Marking this request as a duplicate closes it and links ${first} to the existing entry, so the votes land in one place.`}
            />
            <CardBody>
              <ul className="ds-admin-similar">
                {BACKLOG.map((b) => (
                  <li key={b.id} className="ds-admin-similar__row">
                    <FeaturedIcon Icon={Lightbulb} size="sm" color="violet" />
                    <div className="ds-admin-similar__text">
                      <p className="ds-text">{b.title}</p>
                      <p className="ds-muted">
                        <ThumbsUp aria-hidden="true" className="ds-admin-inline-icon" /> {b.votes} upvotes
                      </p>
                    </div>
                    <Button
                      id={`ds-ar-dup-${key}-${b.id}`}
                      style="outline"
                      size="sm"
                      label="Mark as duplicate"
                      onClick={() => {
                        markDuplicate(r.id, b.title);
                        toast(`${r.id} marked as duplicate`, { description: `Closed and linked to “${b.title}”.` });
                        done();
                      }}
                    />
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
        <Thread r={r} canReply={s.active} reply={reply} setReply={setReply} onSend={send} />
        {bar}
      </Stack>

      <DecisionDialog id={`ds-ar-dialog-${key}`} decision={decision} requests={[r]} onClose={() => setDecision(null)} onConfirm={onDecide} />

      <FeatureDrawer
        r={r}
        open={featureOpen}
        onClose={() => setFeatureOpen(false)}
        onPublish={(title, detail, impact) => {
          // Publish directly — the admin is the reviewer (3.3b): create, approve, close #0419.
          const created = submitRequest({
            type: 'feature',
            product: r.product,
            title,
            summary: detail,
            fields: [
              { label: 'Feature title', value: title },
              { label: 'Describe the feature', value: detail },
              { label: 'Business impact', value: impact },
            ],
          });
          approve(created.id);
          replyAsAdmin(r.id, `Opened as a feature request on the public backlog: ${created.id} “${title}”. Follow and upvote it there.`, true);
          setFeatureOpen(false);
          toast.success('Feature request opened', { description: `${created.id} is on the backlog and ${r.id} is closed.` });
          done();
        }}
      />
    </PageContainer>
  );
}

/** 3.3b — Open a feature request: the admin edits the text before it becomes public. */
function FeatureDrawer({
  r,
  open,
  onClose,
  onPublish,
}: {
  r: Request;
  open: boolean;
  onClose: () => void;
  onPublish: (title: string, detail: string, impact: string) => void;
}) {
  const key = r.id.replace('#', '');
  const first = requesterOf(r).name.split(' ')[0];
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [impact, setImpact] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTitle(fieldValue(r, 'Topic', 'Title') || r.title);
    setDetail(fieldValue(r, 'Message', 'Question', 'Details') || r.summary);
    setImpact('');
    setTried(false);
  }, [open, r]);
  const ok = title.trim() && detail.trim() && impact.trim();

  return (
    <Drawer id={`ds-ar-fdrawer-${key}`} open={open} onClose={onClose}>
      <DrawerHeader
        id={`ds-ar-fdrawer-${key}-header`}
        title="Open a feature request"
        description="This publishes a public backlog entry that anyone can read and upvote. Edit it before it goes."
        onClose={onClose}
      />
      <DrawerBody>
        <Stack level={3}>
          <Input id={`ds-ar-f-title-${key}`} label="Feature title" required value={title} onValueChange={setTitle} error={tried && !title.trim()} errorMessage={tried && !title.trim() ? 'Give the entry a title.' : undefined} />
          <Textarea id={`ds-ar-f-detail-${key}`} label="Describe the feature" required rows={4} value={detail} onValueChange={setDetail} error={tried && !detail.trim()} errorMessage={tried && !detail.trim() ? 'Describe the feature.' : undefined} />
          <Textarea
            id={`ds-ar-f-impact-${key}`}
            label="Business impact"
            required
            rows={3}
            placeholder={`${first} didn’t write one. Say why this matters before it goes to the backlog.`}
            value={impact}
            onValueChange={setImpact}
            error={tried && !impact.trim()}
            errorMessage={tried && !impact.trim() ? 'The backlog ranks on business impact, so it is required.' : undefined}
          />
          <Alert
            id={`ds-ar-f-public-${key}`}
            variant="info"
            title="This becomes public"
            description={`Anyone using DART Central can read and upvote it. ${first} wrote the first two fields privately, so edit anything they wouldn’t want published.`}
          />
          <p className="ds-muted">
            Closes {r.id} and publishes directly, since you are the reviewer. The closing entry in {first}’s thread is how they learn where it went.
          </p>
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Button id={`ds-ar-f-cancel-${key}`} style="ghost" label="Cancel" onClick={onClose} />
        <Button
          id={`ds-ar-f-open-${key}`}
          label="Open request"
          onClick={() => {
            if (!ok) return setTried(true);
            onPublish(title.trim(), detail.trim(), impact.trim());
          }}
        />
      </DrawerFooter>
    </Drawer>
  );
}

/* ── 4 · Approved, not applied → Apply changes → Applied ─────────────────── */

type ApplyField = { label: string; value: string; was?: string; options?: string[] };

const SEVERITIES = ['info', 'warning', 'success', 'error'];
const CATEGORIES = ['Operations', 'Finance', 'Sales', 'Customer', 'Risk'];

/** The drawer's fields, prefilled with the requester's values (4.3 / 4.4). */
const applyFields = (r: Request): ApplyField[] => {
  if (r.changes?.length) return r.changes.map((c) => ({ label: c.field, value: c.proposed, was: c.current !== c.proposed ? c.current : undefined }));
  if (r.type === 'dashboard-add')
    return [
      { label: 'Dashboard name', value: fieldValue(r, 'Dashboard name', 'Name') || r.title },
      { label: 'Category', value: fieldValue(r, 'Category') || 'Operations', options: CATEGORIES },
      { label: 'Description', value: fieldValue(r, 'Description') || r.summary },
    ];
  return [
    { label: 'Title', value: fieldValue(r, 'Title') || r.title },
    { label: 'Severity', value: (fieldValue(r, 'Banner type', 'Severity') || 'info').toLowerCase(), options: SEVERITIES },
    { label: 'Scope', value: fieldValue(r, 'Scope') },
    { label: 'Message', value: fieldValue(r, 'Message') || r.summary },
    { label: 'Starts', value: fieldValue(r, 'Starts') || today() },
    { label: 'Ends', value: fieldValue(r, 'Ends') },
  ];
};

export function AdminApplied({ id }: { id: string }) {
  const { state, update, applyRequest } = useSuite();
  const { go } = useNav();
  const r = state.requests.find((x) => x.id === id);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ApplyField[]>([]);

  if (!r) return <NotFound id={id} />;
  const key = r.id.replace('#', '');
  const first = requesterOf(r).name.split(' ')[0];
  const isBanner = r.type === 'banner' || r.type === 'banner-edit';

  if (r.status !== 'approved-not-applied' && r.status !== 'applied') {
    return (
      <PageContainer width="form">
        <Stack level={3}>
          <Crumbs r={r} />
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Info />
              </EmptyMedia>
              <EmptyTitle>Nothing to apply yet</EmptyTitle>
              <EmptyDescription>{r.id} is not approved, so there is no staged change. Review it first.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button id={`ds-aa-review-${key}`} style="outline" label="Open review" onClick={() => go({ page: 'admin-review', id: r.id })} />
            </EmptyContent>
          </Empty>
        </Stack>
      </PageContainer>
    );
  }

  const applied = r.status === 'applied';
  const startApply = () => {
    setValues(applyFields(r));
    setOpen(true);
  };
  const set = (label: string, value: string) => setValues((vs) => vs.map((v) => (v.label === label ? { ...v, value } : v)));
  const val = (label: string) => values.find((v) => v.label === label)?.value ?? '';
  const missing = values.some((v) => !v.value.trim() && v.label !== 'Ends' && v.label !== 'Scope');

  const submit = () => {
    if (missing) return;
    const proposed = applyFields(r);
    const adjusted = values.filter((v, i) => v.value !== proposed[i]?.value);
    applyRequest(r.id);
    // Write the asset. applyRequest already handles a dashboard edit's Owner /
    // Description / Name; the rest is written here so every type produces something.
    update((d) => {
      const req = d.requests.find((x) => x.id === r.id);
      if (!req) return;
      if (r.changes?.length && r.assetId) {
        const dash = d.dashboards.find((x) => x.id === r.assetId);
        if (dash)
          for (const v of values) {
            if (v.label === 'Owner') dash.owner = v.value;
            if (v.label === 'Description') dash.description = v.value;
            if (v.label === 'Name') dash.name = v.value;
          }
      } else if (r.type === 'dashboard-add') {
        const name = val('Dashboard name');
        const existing = d.dashboards.find((x) => x.name === name);
        const dash: Dashboard = existing ?? {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          description: val('Description'),
          owner: requesterOf(r).name,
          source: 'Tableau',
          category: val('Category') as Dashboard['category'],
          tags: ['New'],
          updatedAt: today(),
          views: 0,
          lifecycle: 'published',
          health: 'ok',
          hasAccess: true,
          hue: 'violet',
        };
        dash.lifecycle = 'published';
        dash.description = val('Description');
        if (!existing) d.dashboards.unshift(dash);
        req.assetId = dash.id;
      } else if (isBanner) {
        const title = val('Title');
        const existing = d.banners.find((b) => b.title === title);
        const banner: Banner = existing ?? {
          id: `bn-${Math.random().toString(36).slice(2, 7)}`,
          title,
          message: '',
          variant: 'info',
          scope: [],
          starts: '',
          ends: '',
          state: 'scheduled',
          visible: true,
        };
        banner.message = val('Message');
        banner.variant = val('Severity') as Banner['variant'];
        banner.scope = val('Scope')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        banner.starts = val('Starts');
        banner.ends = val('Ends');
        banner.visible = true;
        banner.state = 'scheduled';
        if (!existing) d.banners.unshift(banner);
        req.assetId = banner.id;
      }
      if (adjusted.length)
        req.thread.push({
          id: `t-${Date.now()}`,
          author: 'system',
          name: 'DART Central',
          at: today(),
          text: `Shipped with admin adjustments to ${adjusted.map((a) => a.label).join(', ')}, so it differs from what was asked for.`,
        });
    });
    setOpen(false);
    toast.success('Changes applied', {
      description: `${r.title} now shows ${first}’s values.`,
      action: isBanner ? { label: 'View banners', onClick: () => go({ page: 'admin-banners' }) } : { label: 'View dashboards', onClick: () => go({ page: 'admin-dashboards' }) },
    });
  };

  return (
    <PageContainer width="form">
      <Stack level={3}>
        <Crumbs r={r} />
        <RequestHeader r={r} sub={`${applied ? 'Applied' : 'Approved'} ${r.updatedAt} by you`} />
        <Details r={r} applied={applied} />
        {applied ? (
          <Alert
            id={`ds-aa-done-${key}`}
            variant="success"
            Icon={CheckCircle2}
            title="Applied"
            description={`The ${isBanner ? 'banner' : 'dashboard'} now shows these values. Activity carries the change under your name. This request is the record, not a draft.`}
          />
        ) : (
          <Alert
            id={`ds-aa-staged-${key}`}
            variant="info"
            title="Approved, not applied"
            description={`Approved, but the ${isBanner ? 'banner' : 'dashboard'} still shows the current values. “Apply changes” opens it with these values filled in. You submit there, and that’s the step that actually changes anything.`}
          />
        )}
        <Thread r={r} canReply={false} reply={null} setReply={() => undefined} onSend={() => undefined} />
        <div className="ds-admin-bar ds-admin-bar--end">
          {applied ? (
            <Button id={`ds-aa-back-${key}`} style="outline" label="Back to Approval Queue" onClick={() => go({ page: 'admin-queue' })} />
          ) : (
            <Button id={`ds-aa-apply-${key}`} label="Apply changes" IconLeft={Check} onClick={startApply} />
          )}
        </div>
      </Stack>

      <Drawer id={`ds-aa-drawer-${key}`} open={open} onClose={() => setOpen(false)}>
        <DrawerHeader
          id={`ds-aa-drawer-${key}-header`}
          title={`Apply request ${r.id}`}
          description={`Approved ${r.updatedAt}. These are ${first}’s values, so check them before you submit.`}
          onClose={() => setOpen(false)}
        />
        <DrawerBody>
          <Stack level={3}>
            {values.map((f, i) =>
              f.options ? (
                <NativeSelect key={f.label} id={`ds-aa-f-${key}-${i}`} label={f.label} value={f.value} onValueChange={(v) => set(f.label, v)} description={f.was ? `was  ${f.was}` : undefined}>
                  {f.options.map((o) => (
                    <NativeSelectOption key={o} value={o}>
                      {o}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : f.label === 'Message' || f.label === 'Description' ? (
                <Textarea
                  key={f.label}
                  id={`ds-aa-f-${key}-${i}`}
                  label={f.label}
                  rows={3}
                  value={f.value}
                  onValueChange={(v) => set(f.label, v)}
                  description={f.was ? `was  ${f.was}` : undefined}
                  error={!f.value.trim()}
                  errorMessage={!f.value.trim() ? `${f.label} is required.` : undefined}
                />
              ) : (
                <Input
                  key={f.label}
                  id={`ds-aa-f-${key}-${i}`}
                  label={f.label}
                  value={f.value}
                  onValueChange={(v) => set(f.label, v)}
                  description={f.was ? `was  ${f.was}` : undefined}
                  error={!f.value.trim() && f.label !== 'Ends' && f.label !== 'Scope'}
                  errorMessage={!f.value.trim() && f.label !== 'Ends' && f.label !== 'Scope' ? `${f.label} is required.` : undefined}
                />
              ),
            )}
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id={`ds-aa-cancel-${key}`} style="ghost" label="Cancel" onClick={() => setOpen(false)} />
          <Button id={`ds-aa-submit-${key}`} label="Submit" disabled={missing} onClick={submit} />
        </DrawerFooter>
      </Drawer>
    </PageContainer>
  );
}
