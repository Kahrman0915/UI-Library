/* DART Central · Request Flow — pieces every requester screen shares:
   the ⑤ ALERT DIALOGS copy, the per-type status vocabulary (③ BEHAVIOR SPEC),
   the breadcrumb, the form shell and the submit → outcome machine. */

import { Fragment, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, CircleAlert, CircleCheck, CircleX, Clock, LayoutGrid, Lightbulb, MessageCircle, MessageSquare } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/Breadcrumb';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import { useLeaveGuard, useNav } from '../../nav';
import type { LeaveGuard } from '../../nav';
import { useSuite } from '../../store';
import type { NewRequestInput, Tone } from '../../store';
import type { Request, RequestType, Route } from '../../types';
import './Requests.scss';

/* ── ⑤ ALERT DIALOGS — the exact copy ─────────────────────────────────────── */

export const LEAVE_REQUEST: LeaveGuard = {
  title: 'Leave without submitting?',
  description: 'This request hasn’t been submitted yet. The details you’ve entered will be discarded.',
  confirmLabel: 'Discard request',
  cancelLabel: 'Keep editing',
};

export const DISCARD_UNSENT_REPLY: LeaveGuard = {
  title: 'Discard your reply?',
  description: 'You’ve written a reply that hasn’t been sent. It won’t be saved.',
  confirmLabel: 'Discard reply',
  cancelLabel: 'Keep editing',
};

/* ── Status, per type (③: "do not build one flat enum") ───────────────────── */

export type Group = 'reply' | 'review' | 'active' | 'done';

const parseDate = (s: string) => {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])).getTime() : 0;
};

/** Sort key for MM/DD/YYYY. */
export const dateKey = parseDate;

/** The end of a banner or promotion's window, from its fields or its summary. */
const windowEnd = (r: Request) => {
  const ends = r.fields.find((f) => f.label === 'Ends' || f.label.toLowerCase().includes('end date'))?.value;
  if (ends) return parseDate(ends);
  const all = r.summary.match(/\d{2}\/\d{2}\/\d{4}/g);
  return all && all.length > 1 ? parseDate(all[all.length - 1]) : 0;
};

export function statusFor(r: Request): { label: string; tone: Tone; group: Group; Icon: LucideIcon } {
  const lifecycle = r.type === 'banner' || r.type === 'banner-edit' || r.type === 'dashboard-promote';
  switch (r.status) {
    case 'awaiting-reply':
      return { label: 'Needs your reply', tone: 'warning', group: 'reply', Icon: MessageCircle };
    case 'new':
    case 'needs-review':
      return { label: 'Pending review', tone: 'neutral', group: 'review', Icon: Clock };
    case 'applied':
      if (lifecycle) {
        const end = windowEnd(r);
        return end && end < Date.now()
          ? { label: 'No longer active', tone: 'neutral', group: 'done', Icon: Clock }
          : { label: 'Active', tone: 'success', group: 'active', Icon: CircleCheck };
      }
      return { label: 'Approved', tone: 'success', group: 'done', Icon: CircleCheck };
    case 'approved':
    case 'approved-not-applied':
      return { label: 'Approved', tone: 'success', group: 'done', Icon: CircleCheck };
    case 'denied':
      return { label: 'Rejected', tone: 'error', group: 'done', Icon: CircleX };
    case 'closed':
      return { label: 'Closed', tone: 'neutral', group: 'done', Icon: MessageSquare };
  }
}

export const typeVisual = (t: RequestType): { Icon: LucideIcon; color: FeaturedIconColor } => {
  if (t === 'banner' || t === 'banner-edit') return { Icon: Bell, color: 'warning' };
  if (t === 'feature') return { Icon: Lightbulb, color: 'info' };
  if (t === 'general') return { Icon: MessageSquare, color: 'default' };
  return { Icon: LayoutGrid, color: 'info' };
};

/** The third part of the reference line: scope for a banner, else the product. */
export const scopeLabel = (r: Request) => {
  if (r.type === 'banner' || r.type === 'banner-edit') {
    const scope = r.fields.find((f) => f.label === 'Scope')?.value;
    if (scope) {
      const n = scope.split(',').length;
      return n === 1 ? scope : `${n} dashboards`;
    }
  }
  return r.product === 'DARTBoards' ? 'Dartboards' : r.product;
};

/* ── Breadcrumb ───────────────────────────────────────────────────────────── */

export function Crumbs({ trail }: { trail: { label: string; route?: Route }[] }) {
  const { go } = useNav();
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbList>
        {trail.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {c.route ? (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(c.route!);
                  }}
                >
                  {c.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const MY_REQUESTS: { label: string; route: Route } = { label: 'My requests', route: { page: 'my-requests' } };
export const NEW_REQUEST: { label: string; route: Route } = { label: 'New request', route: { page: 'new-request' } };

/* ── Date helpers ─────────────────────────────────────────────────────────── */

export const fmtDate = (d: Date | null | undefined) =>
  d ? `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}` : '';

/* ── Submit machine: ready → submitting (1.5s) → submitted | failed ───────── */

export type Phase = 'idle' | 'submitting' | 'failed';

/**
 * PROTOTYPE FAILURE TRIGGER: if any submitted field value contains the word
 * "fail" (any case), the FIRST attempt fails (R7.1c). "Try again" then goes
 * through. Kept out of the UI on purpose — the form should read as the design.
 */
export function useSubmission() {
  const { submitRequest, update } = useSuite();
  const { replace } = useNav();
  const [phase, setPhase] = useState<Phase>('idle');
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const submit = (input: NewRequestInput, assetId?: string) => {
    setPhase('submitting');
    timer.current = setTimeout(() => {
      const haystack = [input.title, input.summary, ...input.fields.map((f) => f.value)].join(' ');
      const fail = attempts.current === 0 && /fail/i.test(haystack);
      attempts.current += 1;
      if (fail) return setPhase('failed');
      const req = submitRequest(input);
      if (assetId) update((d) => void (d.requests.find((r) => r.id === req.id)!.assetId = assetId));
      replace({ page: 'request-submitted', id: req.id });
    }, 1500);
  };

  return { phase, submit };
}

/* ── Form shell: breadcrumb, header, the card, the footer note + submit ───── */

export function FormShell({
  id,
  crumb,
  title,
  Icon,
  color,
  children,
  ready,
  phase,
  dirty,
  onSubmit,
}: {
  id: string;
  crumb: string;
  title: string;
  Icon: LucideIcon;
  color: FeaturedIconColor;
  children: ReactNode;
  ready: boolean;
  phase: Phase;
  dirty: boolean;
  onSubmit: () => void;
}) {
  // Guard every route out (breadcrumb, sidebar, rail, tab switch, tab close).
  // While a submit is in flight the guard also holds — there is no abort.
  useLeaveGuard(dirty || phase === 'submitting' ? LEAVE_REQUEST : null);

  // The note and the button are one unit (③): the note states the BLOCKER.
  const note =
    phase === 'submitting'
      ? 'Sending your request. Don’t close this page.'
      : phase === 'failed'
        ? 'Nothing has been submitted yet.'
        : ready
          ? 'Reviewed by the DART Central admin team.'
          : 'Complete the required fields to submit';

  return (
    <PageContainer width="form">
      <PageHeader
        id={`${id}-header`}
        overline={<Crumbs trail={[MY_REQUESTS, NEW_REQUEST, { label: crumb }]} />}
        visual={<FeaturedIcon Icon={Icon} color={color} />}
        title={title}
      />
      <div className="ds-requests-form">
        <Card id={`${id}-card`}>
          <div className="ds-requests-form__body">
            {children}
            {phase === 'failed' && (
              <Alert
                id={`${id}-failed`}
                variant="error"
                Icon={CircleAlert}
                title="We couldn’t submit your request"
                description="Something went wrong on our end, and nothing was sent. Everything you entered is still here, so you can try again. If it keeps failing, quote error IRM-503 to the DART Central admin team."
              />
            )}
          </div>
        </Card>
        <div className="ds-requests-form__footer">
          <p className="ds-muted" aria-live="polite">
            {note}
          </p>
          <Button
            id={`${id}-submit`}
            label={phase === 'failed' ? 'Try again' : phase === 'submitting' ? 'Submitting…' : 'Submit for review'}
            isLoading={phase === 'submitting'}
            disabled={!ready && phase !== 'failed'}
            onClick={() => phase !== 'submitting' && onSubmit()}
          />
        </div>
      </div>
    </PageContainer>
  );
}

/** A two-up row of fields that stacks when the column is narrow. */
export const Row = ({ children }: { children: ReactNode }) => <div className="ds-requests-row">{children}</div>;
