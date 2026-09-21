/* R1.1 My Requests · list — the entry point and the destination of every branch.
   No filter controls (③): one search field (name or reference) and the page
   grouped NEEDS YOUR REPLY · IN REVIEW · ACTIVE · DONE, newest first, with a
   heavier Separator between what is live and what is finished.
   R1.1a is the empty state; §9 is the one-time "Submit feature requests"
   Announcement. */

import { useEffect, useMemo, useState } from 'react';
import { Inbox, Plus, Search } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Announcement from '../../../../components/Announcement';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Separator from '../../../../components/Separator';
import Skeleton from '../../../../components/Skeleton';
import Stack from '../../../../components/Stack';
import { ME } from '../../data';
import { useNav } from '../../nav';
import { toneBadge, typeLabel, useSuite } from '../../store';
import type { Request } from '../../types';
import { dateKey, scopeLabel, statusFor, typeVisual } from './shared';
import type { Group } from './shared';
import { openReplyOnArrival } from './RequestDetail';

const GROUPS: { key: Group; heading: string }[] = [
  { key: 'reply', heading: 'Needs your reply' },
  { key: 'review', heading: 'In review' },
  { key: 'active', heading: 'Active' },
  { key: 'done', heading: 'Done' },
];

// Shown once per session, on the first visit to My Requests (§9).
let announcementSeen = false;
// Skeleton only on the first load of the session, not on every tab switch.
let loadedOnce = false;

export function MyRequests() {
  const { state } = useSuite();
  const { go } = useNav();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!loadedOnce);
  const [announce, setAnnounce] = useState(!announcementSeen);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      loadedOnce = true;
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, [loading]);

  const dismissAnnouncement = () => {
    announcementSeen = true;
    setAnnounce(false);
  };

  const mine = useMemo(() => state.requests.filter((r) => r.requesterId === ME.id), [state.requests]);
  const q = search.trim().toLowerCase().replace(/^#/, '');
  const shown = q ? mine.filter((r) => r.title.toLowerCase().includes(q) || r.id.replace('#', '').includes(q)) : mine;

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: shown
      .filter((r) => statusFor(r).group === g.key)
      .sort((a, b) => dateKey(b.submittedAt) - dateKey(a.submittedAt) || b.id.localeCompare(a.id)),
  })).filter((g) => g.items.length);

  const newRequest = () => go({ page: 'new-request' });

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-myreq-header"
        title="My Requests"
        description="Submit requests to the DART Central admin team and track their status."
        actions={<Button id="ds-myreq-new" style="secondary" label="New request" IconLeft={Plus} onClick={newRequest} />}
        toolbar={
          mine.length > 0 ? (
            <Input
              id="ds-myreq-search"
              type="search"
              aria-label="Search requests"
              placeholder="Search requests by name or reference number…"
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
      ) : mine.length === 0 ? (
        // R1.1a — invites rather than reports.
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>No requests yet</EmptyTitle>
            <EmptyDescription>
              When you submit a request it appears here. This is where you track it and where the DART Central admin team replies, you will not get an
              email.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-myreq-empty-new" label="New request" IconLeft={Plus} onClick={newRequest} />
          </EmptyContent>
        </Empty>
      ) : grouped.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No requests match “{search.trim()}”</EmptyTitle>
            <EmptyDescription>Search looks at request names and reference numbers.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-myreq-clear" style="outline" label="Clear search" onClick={() => setSearch('')} />
          </EmptyContent>
        </Empty>
      ) : (
        <Stack level={2}>
          {grouped.map((g) => (
            <div key={g.key} className={g.key === 'done' && grouped.some((x) => x.key !== 'done') ? 'ds-requests-done' : undefined}>
              {g.key === 'done' && grouped.some((x) => x.key !== 'done') && <Separator className="ds-requests-divider" />}
              <Section id={`ds-myreq-${g.key}`} heading={g.heading} variant="group">
                <Stack level={3}>
                  {g.items.map((r) => (
                    <RequestCard key={r.id} r={r} />
                  ))}
                </Stack>
              </Section>
            </div>
          ))}
        </Stack>
      )}

      <Announcement
        id="ds-myreq-announcement"
        open={announce && !loading}
        onClose={dismissAnnouncement}
        title="Submit feature requests"
        description="Feature requests are now a request type. Pick Feature Request from New request, describe the feature and its impact, and submit. The admin team reviews it like any other request."
        secondaryAction={<Button id="ds-myreq-announcement-ok" style="ghost" label="Got it" onClick={dismissAnnouncement} />}
        primaryAction={
          <Button
            id="ds-myreq-announcement-go"
            label="Submit a feature request"
            onClick={() => {
              dismissAnnouncement();
              go({ page: 'request-form', kind: 'feature' });
            }}
          />
        }
      />
    </PageContainer>
  );
}

function RequestCard({ r }: { r: Request }) {
  const { go } = useNav();
  const s = statusFor(r);
  const { Icon, color } = typeVisual(r.type);
  const lastAdmin = [...r.thread].reverse().find((t) => t.author === 'admin');
  const open = () => go({ page: 'request-detail', id: r.id });
  const needsReply = r.status === 'awaiting-reply';

  return (
    <Card id={`ds-myreq-card-${r.id.slice(1)}`} interactive role="link" tabIndex={0} aria-label={`${r.id} ${r.title}`} onClick={open} onKeyDown={(e) => e.key === 'Enter' && open()}>
      <div className="ds-requests-card">
        <FeaturedIcon Icon={Icon} color={color} />
        <div className="ds-requests-card__main">
          <p className="ds-requests-meta">
            {r.id} · {typeLabel[r.type]} · {scopeLabel(r)}
          </p>
          <h3 className="ds-requests-card__title">{r.title}</h3>
          <p className="ds-muted">{r.summary}</p>
        </div>
        <div className="ds-requests-card__aside">
          <Badge id={`ds-myreq-badge-${r.id.slice(1)}`} label={s.label} IconLeft={s.Icon} {...toneBadge(s.tone)} />
          <span className="ds-requests-meta">{r.submittedAt}</span>
        </div>
      </div>
      {lastAdmin && (
        <div className="ds-requests-card__note">
          <Alert
            id={`ds-myreq-note-${r.id.slice(1)}`}
            variant={needsReply ? 'warning' : 'default'}
            style="outline"
            title={`${needsReply ? 'Question from the admin team' : 'Note from admin'} · ${lastAdmin.at}`}
            description={lastAdmin.text}
            action={
              needsReply ? (
                // Stop the click reaching the card, which would open the detail without the composer.
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Button
                    id={`ds-myreq-reply-${r.id.slice(1)}`}
                    style="outline"
                    size="sm"
                    label="Reply"
                    onClick={() => {
                      openReplyOnArrival(r.id);
                      open();
                    }}
                  />
                </span>
              ) : undefined
            }
          />
        </div>
      )}
    </Card>
  );
}
