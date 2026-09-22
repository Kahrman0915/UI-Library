/* What's New · a release story (Figma W2.1 "Introducing Dartboards").

   The DartBoards launch is the one story the file draws in full: what's
   included (three clips), how to get started (the walkthrough), the default
   space callout, the full details and what's coming. Every other entry gets
   the same header with its summary and clip, so Learn more always lands
   somewhere real. */

import { Share2, Star, Store, Link2, Library, LayoutGrid, Move, BarChart3, Home as HomeIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/Breadcrumb';
import Button from '../../../../components/Button';
import Code from '../../../../components/Code';
import Card, { CardBody, CardHeader, CardMedia } from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Item, { ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../../components/Item';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import { toast } from '../../../../components/Toast';
import { Walkthrough } from '../../../productDemos/Walkthrough';
import { useNav } from '../../nav';
import { WHATS_NEW } from './entries';
import type { WnEntry } from './entries';
import { Clip, EntryBadges } from './parts';

const INCLUDED: { clip: WnEntry['clip']; Icon: LucideIcon; color: 'blue' | 'violet' | 'emerald'; title: string; text: string }[] = [
  {
    clip: 'library',
    Icon: Library,
    color: 'blue',
    title: 'Dashboard Library',
    text: 'Every DART dashboard in one place. Filter, sort, or search by name, description, or keyword. Dashboards you can’t open yet still show their name, with a lock.',
  },
  {
    clip: 'spaces',
    Icon: LayoutGrid,
    color: 'violet',
    title: 'Spaces',
    text: 'Create as many personal spaces as you like and pin the dashboards you use most. Come back to them exactly the way you left them.',
  },
  {
    clip: 'edit',
    Icon: Move,
    color: 'emerald',
    title: 'Edit Mode',
    text: 'Drag and drop to rearrange, switch dashboards between thumbnail and compact view, and rename your space. Undo reverses your last change.',
  },
];

const DETAILS: [string, string][] = [
  ['Dashboard Library', 'Browse every DART dashboard in one place. Filter, sort, or search by name, description, or keyword.'],
  ['Spaces', 'Create as many personal spaces as you like and pin the dashboards you use most into them.'],
  ['The builder', 'Name a new space and add several dashboards at once from the Add components panel.'],
  ['Tabs', 'Dashboards you open from a space appear as tabs, so your space is always one click away.'],
  ['Edit mode', 'Drag and drop to rearrange, switch between thumbnail and compact view, and rename your space or change its description. Undo reverses your last change.'],
  ['Default space', 'Right-click a space in the sidebar and choose Make default space. Dartboards opens to it next time.'],
  ['Locked dashboards', 'See the name of every dashboard, even ones you can’t open yet. A lock shows which ones need access.'],
];

const SOON: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Share2, title: 'Share a copy of a space', text: 'Send a teammate a copy of a space you built. They get their own version to rename, rearrange and make their own.' },
  { Icon: BarChart3, title: 'Metrics library', text: 'Browse metrics the same way you browse dashboards, then add any metric to your space as the chart type you prefer.' },
  { Icon: HomeIcon, title: 'Your own home page', text: 'Make DART Central’s home page yours, with the spaces, dashboards, and shortcuts you use most.' },
];

export function WhatsNewStory({ id }: { id: string }) {
  const { go } = useNav();
  const entry = WHATS_NEW.find((e) => e.id === id) ?? WHATS_NEW[0];
  const full = entry.id === 'introducing-dartboards';

  const header = (
    <PageHeader
      id={`ds-wns-${entry.id}`}
      size="lg"
      overline={
        <Breadcrumb id={`ds-wns-${entry.id}-crumbs`}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  go({ page: 'whats-new' });
                }}
              >
                What’s New
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{entry.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      title={entry.title}
      description={
        full
          ? 'Your dashboards, organized your way. Dartboards brings every DART dashboard into one library, lets you build spaces around the way you work, and opens straight to the dashboards you use most.'
          : entry.summary
      }
      meta={<span className="ds-wn-date">{entry.date}</span>}
      actions={
        <Button
          id={`ds-wns-${entry.id}-copy`}
          style="outline"
          size="sm"
          label="Copy link"
          IconLeft={() => <Link2 aria-hidden="true" />}
          onClick={() => {
            void navigator.clipboard?.writeText(`https://dart.example.com/whats-new/${entry.id}`).catch(() => undefined);
            toast.success('Link copied', { description: entry.title });
          }}
        />
      }
    />
  );

  const badges = (
    <div className="ds-wn-badges">
      <EntryBadges entry={entry} idPrefix={`ds-wns-${entry.id}`} />
      {entry.version && <Code>{entry.version}</Code>}
    </div>
  );

  if (!full) {
    return (
      <PageContainer width="narrow">
        {header}
        <Stack level={2}>
          {badges}
          {entry.clip && (
            <Card id={`ds-wns-${entry.id}-clip`}>
              <CardMedia ratio={16 / 9}>
                <Clip clip={entry.clip} />
              </CardMedia>
            </Card>
          )}
          <div className="ds-wn-actions">
            <Button id={`ds-wns-${entry.id}-back`} style="outline" label="Back to What’s New" onClick={() => go({ page: 'whats-new' })} />
            {entry.product === 'Dartboards' && (
              <Button id={`ds-wns-${entry.id}-open`} label="Open the Dashboard Library" IconLeft={() => <Store aria-hidden="true" />} onClick={() => go({ page: 'browse' })} />
            )}
          </div>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="narrow">
      {header}
      <Stack level={2}>
        {badges}

        <Section id="ds-wns-included" heading="What’s included" variant="group">
          <div className="ds-wn-grid">
            {INCLUDED.map((c) => (
              <Card id={`ds-wns-inc-${c.clip}`} key={c.title}>
                <CardMedia ratio={16 / 10}>
                  <Clip clip={c.clip} />
                </CardMedia>
                <CardHeader
                  id={`ds-wns-inc-${c.clip}-header`}
                  media={<FeaturedIcon Icon={c.Icon} size="sm" color={c.color} />}
                  title={c.title}
                  description={c.text}
                  showDivider={false}
                />
              </Card>
            ))}
          </div>
        </Section>

        <Section id="ds-wns-start" heading="How to get started" variant="group">
          <Walkthrough id="ds-wns-walkthrough" />
        </Section>

        <Card id="ds-wns-default">
          <Item size="sm">
            <ItemMedia variant="icon">
              <FeaturedIcon Icon={Star} size="sm" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Set a default space</ItemTitle>
              <ItemDescription>
                With one space, Dartboards opens straight to it. With more than one, right-click a space in the sidebar and choose Make default
                space — that’s where you’ll land next time.
              </ItemDescription>
            </ItemContent>
          </Item>
        </Card>

        <Section id="ds-wns-details" heading="Full details" variant="group">
          <Stack level={4}>
            <p className="ds-wn-copy">Stop hunting for the dashboards you check every day. Here’s everything Dartboards gives you:</p>
            <ul className="ds-wn-details">
              {DETAILS.map(([term, text]) => (
                <li key={term}>
                  <strong>{term}</strong> — {text}
                </li>
              ))}
            </ul>
            <div className="ds-wn-actions">
              <Button id="ds-wns-try" label="Open the Dashboard Library" IconLeft={() => <Store aria-hidden="true" />} onClick={() => go({ page: 'browse' })} />
              <Button id="ds-wns-space" style="outline" label="Create a space" IconLeft={() => <LayoutGrid aria-hidden="true" />} onClick={() => go({ page: 'builder' })} />
            </div>
          </Stack>
        </Section>

        <Section id="ds-wns-soon" heading="Coming soon" variant="group">
          <div className="ds-wn-grid">
            {SOON.map((s) => (
              <Card id={`ds-wns-soon-${s.title}`} key={s.title}>
                <CardBody>
                  <div className="ds-wn-soon">
                    <FeaturedIcon Icon={s.Icon} size="sm" />
                    <Badge id={`ds-wns-soon-${s.title}-badge`} label="Soon" color="default" appearance="outline" />
                  </div>
                  <Stack level={5}>
                    <h3 className="ds-wn-card__title">{s.title}</h3>
                    <p className="ds-wn-copy">{s.text}</p>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      </Stack>
    </PageContainer>
  );
}
