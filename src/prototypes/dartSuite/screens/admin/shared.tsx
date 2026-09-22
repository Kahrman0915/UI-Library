/* DART Central · Admin — pieces every admin screen shares: product labels, the
   KPI tile, the status/type badges, the three decision dialogs (Approve, Deny,
   Request more information) and a couple of small hooks.

   Figma: Admin Flow ▸ ADMIN · ACTION DIALOGS for the dialog copy. */

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, FileEdit, LayoutDashboard, Lightbulb, MessageSquare, Megaphone, Rocket, Trash2 } from 'lucide-react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../components/AlertDialog';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import { BarChart, LineChart } from '../../../../charts';
import Code from '../../../../components/Code';
import Textarea from '../../../../components/Textarea';
import { personById } from '../../data';
import { useNav } from '../../nav';
import { adminStatus, toneBadge } from '../../store';
import type { Tone } from '../../store';
import type { ActivityEntry, Product, Request, RequestType, Route } from '../../types';

/* ── Vocabulary ──────────────────────────────────────────────────────────── */

/** How a product reads on screen. */
export const PRODUCT_LABEL: Record<Product, string> = {
  'DART Central': 'DART Central',
  DARTBoards: 'Dartboards',
  Aiden: 'Aiden',
};

export const requesterOf = (r: Request) => personById(r.requesterId);

/** Staged types: approving records the decision, Apply changes makes it real (Admin Flow ②b). */
export const isStaged = (t: RequestType) => t === 'dashboard-add' || t === 'dashboard-edit' || t === 'banner' || t === 'banner-edit';

export const TYPE_ICON: Record<RequestType, LucideIcon> = {
  'dashboard-add': LayoutDashboard,
  'dashboard-edit': FileEdit,
  'dashboard-promote': Rocket,
  'dashboard-remove': Trash2,
  banner: Bell,
  'banner-edit': Megaphone,
  general: MessageSquare,
  feature: Lightbulb,
};

/** MM/DD/YYYY → Date (the Figma format every record uses). */
export const parseDate = (s: string) => {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : new Date(s);
};

export const daysSince = (s: string) => Math.max(0, Math.round((Date.now() - parseDate(s).getTime()) / 86_400_000));

/** Queue order: needs review, new, awaiting reply, then decided — newest first inside each. */
export const byQueueOrder = (a: Request, b: Request) =>
  adminStatus(a.status).rank - adminStatus(b.status).rank || parseDate(b.submittedAt).getTime() - parseDate(a.submittedAt).getTime();

export const fieldValue = (r: Request, ...labels: string[]) =>
  r.fields.find((f) => labels.some((l) => f.label.toLowerCase() === l.toLowerCase()))?.value ?? '';

/* ── Badges ──────────────────────────────────────────────────────────────── */

export function StatusBadge({ id, request }: { id: string; request: Request }) {
  const s = adminStatus(request.status);
  return <Badge id={id} label={s.label} {...toneBadge(s.tone)} />;
}

export function ToneBadge({ id, label, tone }: { id: string; label: string; tone: Tone }) {
  return <Badge id={id} label={label} {...toneBadge(tone)} />;
}

export function RefCode({ children }: { children: string }) {
  return <Code className="ds-admin-ref">{children}</Code>;
}

/* ── KPI tile ────────────────────────────────────────────────────────────── */

export type KpiTone = 'info' | 'error' | 'success' | 'violet' | 'warning';

export function Kpi({ id, value, label, hint, tone = 'info' }: { id: string; value: string | number; label: string; hint?: string; tone?: KpiTone }) {
  return (
    <Card id={id} className="ds-admin-kpi">
      <p className={`ds-admin-kpi__value ds-admin-kpi__value--${tone}`}>{value}</p>
      <p className="ds-admin-kpi__label">{label}</p>
      {hint && <p className="ds-admin-kpi__hint">{hint}</p>}
    </Card>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="ds-admin-kpis">{children}</div>;
}

/* ── Hooks ───────────────────────────────────────────────────────────────── */

/** First-mount loading state (Admin Flow 5.1d): header stays, body is skeleton rows. */
export function useFirstLoad(ms = 750) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/**
 * Navigate on the NEXT commit. A screen that has just cleared its dirty state
 * still has its leave guard registered until `useLeaveGuard`'s effect runs, so
 * a `go()` in the same handler would prompt "Discard your reply?" for a reply
 * that was sent. Declare this hook AFTER `useLeaveGuard` so its effect runs second.
 */
export function useGoAfterCommit() {
  const { go } = useNav();
  const [target, setTarget] = useState<Route | null>(null);
  useEffect(() => {
    if (target) go(target);
  }, [target, go]);
  return setTarget;
}

/* ── Decision dialogs ────────────────────────────────────────────────────── */

export type Decision = 'approve' | 'deny' | 'ask';

const approveCopy = (rs: Request[]) => {
  if (rs.length > 1) return `${rs.length} requests are approved. Each requester sees it as Approved on My requests. Staged changes still need Apply changes before anything goes live.`;
  const r = rs[0];
  const who = requesterOf(r).name;
  switch (r.type) {
    case 'dashboard-add':
      return `The dashboard is added to the Dartboards library as a draft and ${who} sees it as Approved on My requests. You can add a note; it is optional.`;
    case 'banner':
    case 'banner-edit':
      return `The banner is staged as a draft and ${who} sees it as Approved on My requests. Nothing displays until you apply it. You can add a note; it is optional.`;
    case 'dashboard-edit':
      return `The change is staged, not applied, and ${who} sees it as Approved on My requests. You can add a note; it is optional.`;
    case 'feature':
      return `The request is published to the public feature backlog and ${who} sees it as Approved on My requests. You can add a note; it is optional.`;
    default:
      return `${who} sees it as Approved on My requests. You can add a note; it is optional.`;
  }
};

/**
 * One dialog for one request or a batch (Admin Flow 2.4 / 2.6 / 3.x).
 * Approve takes an optional note; Deny requires a reason; Ask requires a message.
 */
export function DecisionDialog({
  id,
  decision,
  requests,
  onClose,
  onConfirm,
}: {
  id: string;
  decision: Decision | null;
  requests: Request[];
  onClose: () => void;
  onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (decision) {
      setText('');
      setTouched(false);
    }
  }, [decision]);

  const who = requests.length === 1 ? requesterOf(requests[0]).name : 'Each requester';
  const required = decision === 'deny' || decision === 'ask';
  const missing = required && !text.trim();
  const plural = requests.length > 1;

  const copy =
    decision === 'approve'
      ? { title: plural ? `Approve ${requests.length} requests?` : 'Approve this request?', body: approveCopy(requests), label: 'Note (optional)', verb: plural ? `Approve ${requests.length} requests` : 'Approve request' }
      : decision === 'deny'
        ? {
            title: plural ? `Deny ${requests.length} requests?` : 'Deny this request?',
            body: `${who} sees this as Rejected on My requests, and your reason becomes the admin note they read. A denial with no reason is the one thing they cannot act on, so the reason is required.`,
            label: 'Reason',
            verb: plural ? `Deny ${requests.length} requests` : 'Deny request',
          }
        : {
            title: 'Ask the requester for more information?',
            body: 'Your message becomes a question in their activity thread and their status flips to Needs your reply, the top group on My requests. The request leaves your queue until they answer.',
            label: 'Your question',
            verb: 'Send question',
          };

  return (
    <AlertDialog id={id} open={!!decision} onClose={onClose}>
      <AlertDialogHeader id={`${id}-header`} title={copy.title} />
      <AlertDialogBody>
        <div className="ds-admin-dialog">
          <p className="ds-text">{copy.body}</p>
          <Textarea
            id={`${id}-text`}
            label={copy.label}
            required={required}
            rows={3}
            value={text}
            onValueChange={setText}
            onBlur={() => setTouched(true)}
            error={touched && missing}
            errorMessage={touched && missing ? (decision === 'deny' ? 'Add a reason. It is the only thing the requester receives.' : 'Write the question you want answered.') : undefined}
          />
        </div>
      </AlertDialogBody>
      <AlertDialogFooter>
        <Button id={`${id}-cancel`} style="ghost" label="Cancel" onClick={onClose} />
        <Button
          id={`${id}-confirm`}
          variant={decision === 'deny' ? 'error' : 'default'}
          label={copy.verb}
          disabled={missing}
          onClick={() => {
            if (missing) return setTouched(true);
            onConfirm(text.trim());
          }}
        />
      </AlertDialogFooter>
    </AlertDialog>
  );
}

/** A plain confirm (Decommission, End promotion early, Delete banner, Remove redirect, Revoke admin). */
export function ConfirmDialog({
  id,
  open,
  title,
  body,
  verb,
  destructive,
  onClose,
  onConfirm,
}: {
  id: string;
  open: boolean;
  title: string;
  body: React.ReactNode;
  verb: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog id={id} open={open} onClose={onClose}>
      <AlertDialogHeader id={`${id}-header`} title={title} />
      <AlertDialogBody>{body}</AlertDialogBody>
      <AlertDialogFooter>
        <Button id={`${id}-cancel`} style="ghost" label="Cancel" onClick={onClose} />
        <Button id={`${id}-confirm`} variant={destructive ? 'error' : 'default'} label={verb} onClick={onConfirm} />
      </AlertDialogFooter>
    </AlertDialog>
  );
}

/* ── Activity vocabulary ─────────────────────────────────────────────────── */

const EVENT: Record<string, { label: string; tone: Tone }> = {
  submitted: { label: 'Submitted', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'success' },
  applied: { label: 'Applied', tone: 'success' },
  denied: { label: 'Denied', tone: 'error' },
  closed: { label: 'Closed', tone: 'neutral' },
  'answered and closed': { label: 'Answered', tone: 'neutral' },
  'asked a question on': { label: 'Info requested', tone: 'warning' },
  'replied on': { label: 'Replied', tone: 'info' },
  'marked as duplicate': { label: 'Duplicate', tone: 'neutral' },
};

export const eventOf = (a: ActivityEntry) => EVENT[a.action] ?? { label: a.action.charAt(0).toUpperCase() + a.action.slice(1), tone: 'default' as Tone };

/** "#0431 Update Servicing SLA owner" → ['#0431', 'Update Servicing SLA owner']. */
export const splitTarget = (t: string): [string | null, string] => {
  const m = /^(#\d+)\s+(.*)$/.exec(t);
  return m ? [m[1], m[2]] : [null, t];
};


/* ── Usage charts (1.4, 5.5) — Figma's Chart/Line and Chart/Bar ─────────────────
   The library's LineChart / BarChart inside a Card: the Figma Chart master is the
   card and the chart together, so the chart carries the title and subtitle and
   nothing above it repeats them. Series and copy are Figma's. */

const k = (v: number) => `${v}k`;

/** "Views over time" — one line per device, over the months given. */
export function ViewsOverTime({ id, months, totals }: { id: string; months: string[]; totals: number[] }) {
  const split = (share: number) => totals.map((t) => Math.round(t * share));
  return (
    <Card id={id}>
      <CardBody>
        <LineChart
          id={`${id}-chart`}
          title="Views over time"
          description="All products · last 6 months"
          categories={months}
          series={[
            { key: 'mobile', label: 'Mobile', data: split(0.35) },
            { key: 'desktop', label: 'Desktop', data: split(0.5) },
            { key: 'tablet', label: 'Tablet', data: split(0.15) },
          ]}
          valueFormatter={k}
          height={240}
        />
      </CardBody>
    </Card>
  );
}

/** "Views by product" — how people arrived, per product. */
export function ViewsByProduct({ id, totals }: { id: string; totals: [number, number, number] }) {
  const split = (share: number) => totals.map((t) => Math.round(t * share));
  return (
    <Card id={id}>
      <CardBody>
        <BarChart
          id={`${id}-chart`}
          title="Views by product"
          description="Last 30 days"
          categories={['DART Central', 'Dartboards', 'Aiden']}
          series={[
            { key: 'direct', label: 'Direct', data: split(0.5) },
            { key: 'referral', label: 'Referral', data: split(0.3) },
            { key: 'organic', label: 'Organic', data: split(0.2) },
          ]}
          valueFormatter={k}
          height={240}
        />
      </CardBody>
    </Card>
  );
}

