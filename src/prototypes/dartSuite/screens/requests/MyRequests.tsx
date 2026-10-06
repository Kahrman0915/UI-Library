/* Open items — the working list. Everything this person is doing or waiting on, from every application:
   the requests they opened (DART Central, DartBoards, IRM), the IRM work assigned to them, and their Jira
   tickets — sorted by what it needs (Needs you · In progress · Waiting on others), with what closed in the
   last 30 days folded away at the bottom. Was "My Requests" (owner, 2026-10-06: it is a to-do list across
   the apps, not only what you asked for). Home is the glance; this page is where you work the list.

   Each item can still be worked in its own app — Jira tickets open in Jira, DartBoards requests in
   DartBoards, IRM requests in IRM. This page only brings them to one place, and shows the chain: a Jira
   ticket sits under the IRM request it was opened for, and a report's IRM request and its DartBoards
   listing request name each other. The model is `openItems()`.

   One search field (name or reference). No announcements here — this is a person's own list. Site news
   (§9's "Submit feature requests") is a banner at the top of New request, a "New" tag on its option there,
   and a What's New entry. */

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Archive, ChevronDown, ClipboardCheck, ExternalLink, FileClock, FolderCheck, Inbox, Link2, Plus, Search, ShieldCheck, Ticket } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '../../../../components/Collapsible';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Skeleton from '../../../../components/Skeleton';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import Heading from '../../../../components/Heading';
import { useNav } from '../../nav';
import { OPEN_SECTIONS, openItems } from '../../openItems';
import type { OpenItem } from '../../openItems';
import { toneBadge, useSignedIn, useSuite } from '../../store';
import { JIRA_STATUS_TONE, openInJira } from '../home/jira';
import { useWaitingActions } from '../home/RoleWork';
import { fmtIso } from '../../irm';
import { typeVisual } from './shared';
import { openReplyOnArrival } from './RequestDetail';
import { IRM_TYPE_VISUAL } from '../irm/shared';

// Skeleton only on the first load of the session, not on every tab switch.
let loadedOnce = false;

export function MyRequests() {
  const { state } = useSuite();
  const { go } = useNav();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!loadedOnce);
  const { act, dialogs } = useWaitingActions();

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      loadedOnce = true;
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, [loading]);

  const { person } = useSignedIn();
  const all = useMemo(() => openItems(state, person.id), [state, person.id]);
  const q = search.trim().toLowerCase().replace(/^#/, '');
  const shown = q
    ? all.filter((m) => m.title.toLowerCase().includes(q) || m.ref.toLowerCase().replace('#', '').includes(q) || m.tickets.some((t) => t.key.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)))
    : all;

  const newRequest = () => go({ page: 'new-request' });

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-myreq-header"
        title="Open items"
        description="Everything that needs you or is waiting on someone — your requests, your IRM work and your Jira tickets, in one list."
        actions={<Button id="ds-myreq-new" style="secondary" label="New request" IconLeft={Plus} onClick={newRequest} />}
        toolbar={
          all.length > 0 ? (
            <Input
              id="ds-myreq-search"
              type="search"
              aria-label="Search open items"
              placeholder="Search by name or reference — #0417, CHG-1046, DART-890…"
              IconLeft={Search}
              value={search}
              onValueChange={setSearch}
            />
          ) : undefined
        }
      />

      {loading ? (
        <Stack level={3}>
          {[0, 1, 2].map((i) => (
            <Card id={`ds-myreq-skel-${i}`} key={i}>
              <div className="ds-requests-card">
                <Skeleton shape="default" className="ds-requests-skel-icon" />
                <div className="ds-requests-card__main">
                  <Skeleton shape="text" />
                  <Skeleton shape="text" />
                </div>
              </div>
            </Card>
          ))}
        </Stack>
      ) : all.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Nothing open</EmptyTitle>
            <EmptyDescription>
              Requests you open, IRM work assigned to you and your Jira tickets all show up here, so you can keep track of everything in one place.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-myreq-empty-new" label="New request" IconLeft={Plus} onClick={newRequest} />
          </EmptyContent>
        </Empty>
      ) : shown.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Nothing matches “{search.trim()}”</EmptyTitle>
            <EmptyDescription>Search looks at names and reference numbers, including Jira tickets.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-myreq-clear" style="outline" label="Clear search" onClick={() => setSearch('')} />
          </EmptyContent>
        </Empty>
      ) : (
        <OpenItemsList id="ds-myreq" items={shown} forceClosedOpen={!!q} onAct={act} />
      )}
      {dialogs}
    </PageContainer>
  );
}

/**
 * The list itself, by section: Needs you · In progress · Waiting on others, then "Closed in the last 30
 * days" folded away. Open items shows every application's items; My IRM passes IRM's alone.
 */
export function OpenItemsList({ id, items, forceClosedOpen = false, onAct }: { id: string; items: OpenItem[]; forceClosedOpen?: boolean; onAct: (w: NonNullable<OpenItem['waiting']>) => void }) {
  const [showClosed, setShowClosed] = useState(false);
  const sections = OPEN_SECTIONS.map((g) => ({ ...g, items: items.filter((m) => m.section === g.key) }));
  const open = sections.filter((g) => g.key !== 'closed' && g.items.length);
  const closed = sections.find((g) => g.key === 'closed')!;
  return (
    <Stack level={2}>
      {open.map((g) => (
        <Section key={g.key} id={`${id}-${g.key}`} heading={`${g.heading} · ${g.items.length}`} variant="group">
          <Stack level={3}>
            {g.items.map((m) => (
              <OpenItemCard key={m.key} item={m} onAct={onAct} />
            ))}
          </Stack>
        </Section>
      ))}
      {open.length === 0 && <Text tone="muted">Nothing open right now.</Text>}
      {closed.items.length > 0 && (
        <Collapsible id={`${id}-closed`} open={showClosed || forceClosedOpen} onOpenChange={setShowClosed} className="ds-open-closed">
          <CollapsibleTrigger>
            <Button id={`${id}-closed-trigger`} style="ghost" size="sm" label={`${closed.heading} · ${closed.items.length}`} IconRight={ChevronDown} className="ds-open-closed__trigger" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Stack level={3}>
              {closed.items.map((m) => (
                <OpenItemCard key={m.key} item={m} onAct={onAct} />
              ))}
            </Stack>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Stack>
  );
}

const TASK_ICON: Partial<Record<string, LucideIcon>> = { certify: FileClock, attest: ClipboardCheck, review: ShieldCheck, retiring: Archive };

/** The icon an item wears: what kind of thing it is. */
function visualOf(m: OpenItem): { Icon: LucideIcon; color: FeaturedIconColor } {
  if (m.jira) return { Icon: Ticket, color: m.jira.status === 'Blocked' ? 'error' : 'info' };
  if (m.request) return typeVisual(m.request.type);
  if (m.change) return IRM_TYPE_VISUAL[m.change.type];
  return { Icon: (m.waiting && TASK_ICON[m.waiting.kind]) || FolderCheck, color: m.status.tone === 'error' ? 'error' : 'warning' };
}

/** One open item: what it is, where it stands, its next move — and the rest of its chain under it. */
function OpenItemCard({ item: m, onAct }: { item: OpenItem; onAct: (w: NonNullable<OpenItem['waiting']>) => void }) {
  const { go } = useNav();
  const { Icon, color } = visualOf(m);
  const domKey = m.key.replace(/[^a-z0-9-]/gi, '-');
  const openIt = () => (m.jira ? openInJira(m.jira.key) : m.route && go(m.route));
  const runWaiting = () => {
    if (!m.waiting) return;
    if (m.waiting.kind === 'reply') {
      openReplyOnArrival(m.waiting.ref);
      go(m.waiting.route);
    } else onAct(m.waiting);
  };
  // Buttons inside the card do their own thing; the card itself opens the item.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  // ONE thing on the right of a card, never a stack: the action when the next move is yours (its status
  // drops to a quiet line under the title — "Pending approval" over an "Approve" button said it twice),
  // otherwise the status. A Jira card has no button: the card opens Jira, and its line says so.
  const action = m.waiting ? <Button id={`ds-open-${domKey}-act`} size="sm" label={m.waiting.action} onClick={runWaiting} /> : null;

  return (
    <Card id={`ds-open-${domKey}`} interactive role="link" tabIndex={0} aria-label={`${m.ref} ${m.title}`} onClick={openIt} onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && openIt()}>
      <div className="ds-requests-card">
        <FeaturedIcon Icon={Icon} color={color} />
        <div className="ds-requests-card__main">
          <Text size="xs" tone="muted" className="ds-open-line">
            {m.line}
            {m.jira && <ExternalLink aria-label="Opens in Jira" className="ds-open-line__out" />}
          </Text>
          <Heading level={3} size="base">
            {m.title}
          </Heading>
          {m.summary && <Text tone="muted">{m.summary}</Text>}
          {action && (
            <span className="ds-open-meta">
              <span className={`ds-open-meta__status ds-open-meta__status--${m.status.tone}`}>{m.status.label}</span>
              {m.when && <span>{m.when}</span>}
            </span>
          )}
          {m.links.length > 0 && (
            <span className="ds-open-links" onClick={stop} onKeyDown={stop}>
              {m.links.map((l, i) => (
                <Button key={i} id={`ds-open-${domKey}-link-${i}`} style="link" size="sm" label={l.label} IconLeft={Link2} onClick={() => go(l.route)} />
              ))}
            </span>
          )}
        </div>
        {action ? (
          <div className="ds-requests-card__aside ds-open-act" onClick={stop} onKeyDown={stop}>
            {action}
          </div>
        ) : (
          <div className="ds-requests-card__aside">
            <Badge id={`ds-open-${domKey}-status`} label={m.status.label} IconLeft={m.status.Icon} {...toneBadge(m.status.tone)} />
            {m.when && (
              <Text as="span" size="xs" tone="muted">
                {m.when}
              </Text>
            )}
          </div>
        )}
      </div>
      {m.tickets.length > 0 && (
        // The Jira tickets opened for this IRM request, from its BRD. Each opens in Jira.
        <div className="ds-open-tickets" onClick={stop} onKeyDown={stop}>
          <Text as="span" size="xs" tone="muted" weight="medium">
            Jira tickets for {m.ref} · {m.tickets.length}
          </Text>
          <ul className="ds-open-tickets__list">
            {m.tickets.map((t) => (
              <li key={t.key}>
                <button type="button" className="ds-open-ticket" onClick={() => openInJira(t.key)}>
                  <Ticket aria-hidden="true" className="ds-open-ticket__icon" />
                  <span className="ds-open-ticket__key">{t.key}</span>
                  <span className="ds-open-ticket__title">{t.summary}</span>
                  {t.due && <span className="ds-open-ticket__due">Due {fmtIso(t.due)}</span>}
                  <Badge id={`ds-open-${domKey}-${t.key}`} label={t.status} {...toneBadge(JIRA_STATUS_TONE[t.status])} />
                  <ExternalLink aria-hidden="true" className="ds-open-ticket__out" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

