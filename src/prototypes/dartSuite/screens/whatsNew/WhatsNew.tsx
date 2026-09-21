/* What's New · the page (Figma W1.1, in the shell W1.2).

   A featured launch, a row of three, "More updates" with load more, "Coming
   soon" with notify-me, and the release-notifications switch. The product
   filter is a ToggleGroup (it filters in place — CLAUDE.md's Tabs vs
   ToggleGroup rule), topics are a checkbox menu, and search matches titles
   and summaries. The tour (W3) opens over the page on the first visit. */

import { useMemo, useState } from 'react';
import { ArrowRight, Bell, BellRing, ChevronDown, Megaphone, Search } from 'lucide-react';
import Button from '../../../../components/Button';
import Card, { CardBody, CardMedia } from '../../../../components/Card';
import DropdownMenu, {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Switch from '../../../../components/Switch';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { toast } from '../../../../components/Toast';
import { useNav } from '../../nav';
import { TOPIC_LABEL, WHATS_NEW } from './entries';
import type { WnEntry, WnProduct, WnTopic } from './entries';
import { Clip, EntryBadges, EntryMeta, Tour, takeTourOnce } from './parts';

const PRODUCTS: WnProduct[] = ['DART Central', 'Aiden', 'Dartboards'];
const TOPICS: WnTopic[] = ['launch', 'feature', 'resource', 'coming-soon'];
const PAGE = 3;

export function WhatsNew() {
  const { go } = useNav();
  const [tour, setTour] = useState(takeTourOnce);
  const [product, setProduct] = useState<string>('all');
  const [topics, setTopics] = useState<WnTopic[]>([]);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [notify, setNotify] = useState<string[]>([]);
  const [releaseAlerts, setReleaseAlerts] = useState(true);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      WHATS_NEW.filter(
        (e) =>
          (product === 'all' || !product || e.product === product) &&
          (!topics.length || topics.includes(e.topic)) &&
          (!q || `${e.title} ${e.summary} ${e.product}`.toLowerCase().includes(q)),
      ),
    [product, topics, q],
  );

  const featured = matches.find((e) => e.featured);
  const released = matches.filter((e) => !e.featured && e.topic !== 'coming-soon');
  const top = released.slice(0, 3);
  const more = released.slice(3);
  const soon = matches.filter((e) => e.topic === 'coming-soon');
  const filtered = product !== 'all' || topics.length > 0 || !!q;

  const open = (e: WnEntry) => go({ page: 'whats-new-story', id: e.id });
  const clear = () => {
    setProduct('all');
    setTopics([]);
    setQuery('');
  };

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-wn"
        size="lg"
        overline={
          <>
            <Megaphone aria-hidden="true" />
            What’s new
          </>
        }
        title="Catch up on DART Central"
        toolbar={
          <Toolbar id="ds-wn-toolbar" label="Filter updates" justify="between">
            <ToolbarGroup>
              <ToggleGroup
                id="ds-wn-product"
                type="single"
                variant="line"
                value={product}
                onValueChange={(v) => setProduct(v || 'all')}
                aria-label="Product"
              >
                <ToggleGroupItem value="all" label="All Products" />
                {PRODUCTS.map((p) => (
                  <ToggleGroupItem key={p} value={p} label={p} />
                ))}
              </ToggleGroup>
              <DropdownMenu id="ds-wn-topics">
                <DropdownMenuTrigger>
                  <Button
                    id="ds-wn-topics-trigger"
                    style="ghost"
                    size="sm"
                    label={topics.length ? `Topics · ${topics.length}` : 'Topics'}
                    IconRight={() => <ChevronDown aria-hidden="true" />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {TOPICS.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t}
                      checked={topics.includes(t)}
                      onCheckedChange={(on) => setTopics((ts) => (on ? [...ts, t] : ts.filter((x) => x !== t)))}
                    >
                      {t === 'feature' ? 'New features' : t === 'resource' ? 'Resources' : t === 'launch' ? 'Launches' : TOPIC_LABEL[t]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTopics([])} disabled={!topics.length}>
                    Clear topics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ToolbarGroup>
            <ToolbarGroup>
              <Input
                id="ds-wn-search"
                size="sm"
                IconLeft={() => <Search aria-hidden="true" />}
                placeholder="Search…"
                aria-label="Search updates"
                value={query}
                onValueChange={setQuery}
              />
            </ToolbarGroup>
          </Toolbar>
        }
      />

      {matches.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No updates match{q ? ` “${query.trim()}”` : ''}</EmptyTitle>
            <EmptyDescription>Try another product or topic, or clear the filters to see every update.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-wn-clear" style="outline" label="Clear filters" onClick={clear} />
          </EmptyContent>
        </Empty>
      ) : (
        <Stack level={2}>
          {featured && (
            <Card id="ds-wn-featured">
              <CardMedia ratio={21 / 9}>
                <Clip clip={featured.clip} />
              </CardMedia>
              <CardBody>
                <Stack level={4}>
                  <EntryMeta entry={featured} />
                  <h2 className="ds-wn-featured__title">{featured.title}</h2>
                  <p className="ds-wn-lede">{featured.summary}</p>
                  {featured.bullets && (
                    <ul className="ds-wn-bullets">
                      {featured.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                  <div className="ds-wn-foot">
                    <EntryBadges entry={featured} idPrefix="ds-wn-featured" />
                    <Button
                      id="ds-wn-featured-read"
                      label="Read full release story"
                      IconRight={() => <ArrowRight aria-hidden="true" />}
                      onClick={() => open(featured)}
                    />
                  </div>
                </Stack>
              </CardBody>
            </Card>
          )}

          {top.length > 0 && (
            <div className="ds-wn-grid">
              {top.map((e) => (
                <Card id={`ds-wn-card-${e.id}`} key={e.id}>
                  <CardMedia ratio={16 / 9}>
                    <Clip clip={e.clip} />
                  </CardMedia>
                  <CardBody>
                    <Stack level={5}>
                      <EntryMeta entry={e} />
                      <h3 className="ds-wn-card__title">{e.title}</h3>
                      <p className="ds-wn-copy">{e.summary}</p>
                    </Stack>
                    <div className="ds-wn-foot">
                      <EntryBadges entry={e} idPrefix={`ds-wn-card-${e.id}`} />
                      <LearnMore entry={e} onOpen={open} />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {more.length > 0 && (
            <Section id="ds-wn-more" heading="More updates" variant="group">
              <Stack level={4}>
                {more.slice(0, shown).map((e) => (
                  <Row key={e.id} entry={e}>
                    <LearnMore entry={e} onOpen={open} />
                  </Row>
                ))}
                {more.length > shown ? (
                  <div className="ds-wn-center">
                    <Button id="ds-wn-load" style="outline" size="sm" label="Load more updates" onClick={() => setShown((n) => n + PAGE)} />
                  </div>
                ) : (
                  more.length > PAGE && <p className="ds-wn-end">You’re all caught up.</p>
                )}
              </Stack>
            </Section>
          )}

          {soon.length > 0 && (
            <Section id="ds-wn-soon" heading="Coming soon" variant="group">
              <Stack level={4}>
                {soon.map((e) => {
                  const on = notify.includes(e.id);
                  return (
                    <Row key={e.id} entry={e}>
                      <Button
                        id={`ds-wn-notify-${e.id}`}
                        style={on ? 'secondary' : 'outline'}
                        size="sm"
                        label={on ? 'We’ll let you know' : 'Notify me when it launches'}
                        IconLeft={() => (on ? <BellRing aria-hidden="true" /> : <Bell aria-hidden="true" />)}
                        aria-pressed={on}
                        onClick={() => {
                          setNotify((ns) => (on ? ns.filter((x) => x !== e.id) : [...ns, e.id]));
                          toast.success(on ? 'Notification removed' : 'You’ll be notified', { description: e.title });
                        }}
                      />
                    </Row>
                  );
                })}
              </Stack>
            </Section>
          )}
        </Stack>
      )}

      {!filtered && (
        <Card id="ds-wn-alerts">
          <CardBody>
            <div className="ds-wn-alerts">
              <FeaturedIcon Icon={Megaphone} size="sm" />
              <div className="ds-wn-alerts__text">
                <p className="ds-wn-card__title">Release notifications</p>
                <p className="ds-wn-copy">Get notified when new releases ship.</p>
              </div>
              <Switch
                id="ds-wn-alerts-switch"
                checked={releaseAlerts}
                aria-label="Release notifications"
                onCheckedChange={(on) => {
                  setReleaseAlerts(on);
                  toast.success(on ? 'Release notifications on' : 'Release notifications off');
                }}
              />
            </div>
          </CardBody>
        </Card>
      )}

      <Tour open={tour} onClose={() => setTour(false)} />
    </PageContainer>
  );
}

function LearnMore({ entry, onOpen }: { entry: WnEntry; onOpen: (e: WnEntry) => void }) {
  return (
    <Button
      id={`ds-wn-learn-${entry.id}`}
      style="link"
      size="sm"
      label="Learn more"
      IconRight={() => <ArrowRight aria-hidden="true" />}
      onClick={() => onOpen(entry)}
    />
  );
}

function Row({ entry, children }: { entry: WnEntry; children: React.ReactNode }) {
  return (
    <Card id={`ds-wn-row-${entry.id}`}>
      <CardBody>
        <Stack level={5}>
          <EntryMeta entry={entry} />
          <h3 className="ds-wn-card__title">{entry.title}</h3>
          <p className="ds-wn-copy">{entry.summary}</p>
        </Stack>
        <div className="ds-wn-foot">
          <EntryBadges entry={entry} idPrefix={`ds-wn-row-${entry.id}`} />
          {children}
        </div>
      </CardBody>
    </Card>
  );
}
