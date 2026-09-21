/* R1.2 Request detail — the thread, and the only place a person can reply.
   R1.2  needs your reply · R1.2a replying (composer expands in place) ·
   R1.2b closed, became a feature request (the admin's note links the backlog).
   The thread is the real one from the store, so an admin reply shows up here. */

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, FileQuestion, Plus, Reply } from 'lucide-react';
import Avatar from '../../../../components/Avatar';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Separator from '../../../../components/Separator';
import Stack from '../../../../components/Stack';
import Textarea from '../../../../components/Textarea';
import { toast } from '../../../../components/Toast';
import { ME } from '../../data';
import { useLeaveGuard, useNav } from '../../nav';
import { toneBadge, typeLabel, useSuite } from '../../store';
import type { ThreadEntry } from '../../types';
import { Crumbs, DISCARD_UNSENT_REPLY, MY_REQUESTS, scopeLabel, statusFor, typeVisual } from './shared';

/** My Requests' "Reply" button lands here with the composer already open. */
let replyOnArrival: string | null = null;
export const openReplyOnArrival = (id: string) => void (replyOnArrival = id);

const who = (t: ThreadEntry) =>
  t.author === 'requester'
    ? { name: t.name === ME.name ? 'You' : t.name, initials: t.name === ME.name ? ME.initials : t.name.split(' ').map((p) => p[0]).join('').slice(0, 2) }
    : t.author === 'admin'
      ? { name: 'DART Central admin', initials: 'DC' }
      : { name: t.name, initials: 'DC' };

/** A backlog title quoted in an admin note (“…”), e.g. from Mark duplicate. */
const backlogLink = (text: string) => (/backlog|feature request/i.test(text) ? (text.match(/“([^”]+)”/)?.[1] ?? 'View on the feature backlog') : null);

export function RequestDetail({ id }: { id: string }) {
  const { state, replyAsRequester } = useSuite();
  const { go } = useNav();
  const r = state.requests.find((x) => x.id === id);
  const [composing, setComposing] = useState(() => {
    const on = replyOnArrival === id;
    if (on) replyOnArrival = null;
    return on;
  });
  const [reply, setReply] = useState('');
  const box = useRef<HTMLTextAreaElement>(null);

  useLeaveGuard(reply.trim() ? DISCARD_UNSENT_REPLY : null);

  useEffect(() => {
    if (composing) box.current?.focus();
  }, [composing]);

  if (!r) {
    return (
      <PageContainer width="narrow">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Request not found</EmptyTitle>
            <EmptyDescription>{id} is not one of your requests.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-reqd-missing-back" label="Back to My requests" onClick={() => go({ page: 'my-requests' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const s = statusFor(r);
  const { Icon, color } = typeVisual(r.type);
  const done = s.group === 'done';
  const key = r.id.slice(1);

  const send = () => {
    replyAsRequester(r.id, reply.trim());
    setReply('');
    setComposing(false);
    toast.success('Reply sent', { description: 'Your request is back with the DART Central admin team.' });
  };

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-reqd-header"
        overline={<Crumbs trail={[MY_REQUESTS, { label: r.title }]} />}
        visual={<FeaturedIcon Icon={Icon} color={color} />}
        title={r.title}
        description={`${r.id} · ${typeLabel[r.type]} · ${scopeLabel(r)}`}
        actions={
          <div className="ds-requests-card__aside">
            <Badge id={`ds-reqd-badge-${key}`} label={s.label} IconLeft={s.Icon} {...toneBadge(s.tone)} />
            <span className="ds-requests-meta">Submitted {r.submittedAt}</span>
          </div>
        }
      />

      <Stack level={3}>
        {/* Every field the branch collected — the person needs their own answers to reply. */}
        <Card id="ds-reqd-fields">
          <div className="ds-requests-panel">
            <dl className="ds-fields">
              {r.fields.map((f) => (
                <FieldRow key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
            {r.changes && r.changes.length > 0 && (
              <>
                <Separator label="PROPOSED CHANGES" />
                <dl className="ds-fields">
                  {r.changes.map((c) => (
                    <FieldRow key={c.field} label={c.field} value={`${c.current} → ${c.proposed}`} />
                  ))}
                </dl>
              </>
            )}
          </div>
        </Card>

        <Card id="ds-reqd-activity">
          <div className="ds-requests-panel">
            <h2 className="ds-requests-eyebrow">Activity</h2>
            <ol className="ds-requests-thread">
              {r.thread.map((t) => {
                const w = who(t);
                const link = t.author === 'admin' ? backlogLink(t.text) : null;
                return (
                  <li key={t.id} className="ds-requests-thread__entry">
                    <Avatar id={`ds-reqd-av-${t.id}`} size="sm" fallback={w.initials} />
                    <div className="ds-requests-thread__body">
                      <p className="ds-requests-meta">
                        {w.name} · {t.at}
                      </p>
                      <p className="ds-text">{t.author === 'system' && t.text === 'Request submitted.' ? 'Submitted this request.' : t.text}</p>
                      {link && (
                        <Button
                          id={`ds-reqd-backlog-${t.id}`}
                          style="link"
                          size="sm"
                          label={link}
                          IconRight={ArrowRight}
                          onClick={() => toast('The public feature backlog is outside this prototype', { description: `“${link}” would open there.` })}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {done ? (
              // OPEN in Figma (③): whether a DONE request keeps its composer. Built as the
              // likely answer — the thread stays read-only, with a route to a new request.
              <div className="ds-requests-reply">
                <Separator />
                <div className="ds-requests-reply__footer">
                  <p className="ds-muted">This request is finished. Follow-ups start as a new request.</p>
                  <Button id="ds-reqd-new" style="outline" size="sm" label="Start a new request" IconLeft={Plus} onClick={() => go({ page: 'new-request' })} />
                </div>
              </div>
            ) : composing ? (
              <div className="ds-requests-reply">
                <Separator />
                <Textarea
                  ref={box}
                  id="ds-reqd-reply"
                  label="Your reply"
                  rows={4}
                  placeholder="Write a reply to the DART Central admin team…"
                  value={reply}
                  onValueChange={setReply}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && reply.trim()) send();
                  }}
                />
                <div className="ds-requests-reply__footer">
                  <p className="ds-muted">Sending puts this back with the DART Central admin team. Your request returns to Pending review.</p>
                  <Button id="ds-reqd-send" size="sm" label="Send reply" disabled={!reply.trim()} onClick={send} />
                </div>
              </div>
            ) : (
              <div className="ds-requests-reply">
                <Separator />
                <div className="ds-requests-reply__footer ds-requests-reply__footer--end">
                  <Button id="ds-reqd-open-reply" style="outline" size="sm" label="Reply" IconLeft={Reply} onClick={() => setComposing(true)} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </Stack>
    </PageContainer>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
