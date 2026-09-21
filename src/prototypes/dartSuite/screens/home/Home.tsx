/* DART Central · Home — the fixed first tab. Adapted from the DART Central Home
   prototype, with every tile wired into the suite. */

import { ChevronRight, Clock, Inbox, LayoutGrid, ListChecks, Pin, Plus, Search, Sparkles, Store } from 'lucide-react';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Item, { ItemActions, ItemContent, ItemMedia, ItemTitle } from '../../../../components/Item';
import Kbd from '../../../../components/Kbd';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { useUi } from '../../ui';
import { ME } from '../../data';
import type { Route } from '../../types';
import { tabMeta } from '../../Shell';
import '../../../DartCentralHome.scss';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function Home() {
  const { go } = useNav();
  const nav = useNav();
  const { state } = useSuite();
  const { openNewTab } = useUi();

  const quick: { label: string; Icon: typeof Plus; color: 'default' | 'info' | 'success' | 'warning'; route: Route }[] = [
    { label: 'New request', Icon: Plus, color: 'info', route: { page: 'new-request' } },
    { label: 'My Requests', Icon: Inbox, color: 'default', route: { page: 'my-requests' } },
    { label: 'Browse dashboards', Icon: Store, color: 'success', route: { page: 'browse' } },
    { label: 'Create space', Icon: LayoutGrid, color: 'default', route: { page: 'builder' } },
    { label: 'Chat with Aiden', Icon: Sparkles, color: 'default', route: { page: 'aiden-launcher' } },
    ...(state.adminScope ? [{ label: 'Approval queue', Icon: ListChecks, color: 'warning' as const, route: { page: 'admin-queue' } as Route }] : []),
  ];

  const recent = nav.tabs.filter((t) => t.id !== 'home');
  const pinned = state.spaces.filter((s) => !s.shared).slice(0, 3);

  return (
    <div className="dc-col">
      <header className="dc-greeting">
        <h1 className="dc-greeting__title">
          {greeting()}, {ME.name.split(' ')[0]}
        </h1>
        <p className="dc-greeting__sub">What would you like to work on today?</p>
      </header>

      {/* Search opens the + tab's search, which already covers spaces, dashboards and chats. */}
      <div style={{ marginTop: 'var(--p-10)' }}>
        <Card id="ds-home-search" interactive onClick={openNewTab} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openNewTab()}>
          <Item size="sm">
            <ItemMedia variant="icon">
              <Search />
            </ItemMedia>
            <ItemContent>
              <span style={{ color: 'var(--muted-foreground)' }}>Search spaces, dashboards, requests…</span>
            </ItemContent>
            <ItemActions>
              <Kbd size="sm">⌘K</Kbd>
            </ItemActions>
          </Item>
        </Card>
      </div>

      <div style={{ marginTop: 'var(--p-6)' }} data-surface="aiden">
        <Card id="ds-home-aiden" className="dc-aiden-card">
          <div style={{ padding: 'var(--p-4)' }}>
            <div className="dc-aiden__head">
              <Sparkles aria-hidden="true" />
              Ask Aiden
            </div>
            <div className="dc-aiden__row">
              <span className="dc-aiden__placeholder">Help me find a dashboard, build a space, check on a request…</span>
              <Button id="ds-home-aiden-go" variant="aiden" size="sm" label="Start a chat" onClick={() => go({ page: 'aiden-launcher' })} />
            </div>
          </div>
        </Card>
      </div>

      <section className="dc-section">
        <div className="dc-section__head">
          <h2 className="dc-section__title">Quick actions</h2>
        </div>
        <div className="dc-section__body dc-grid">
          {quick.map(({ label, Icon, color, route }) => (
            <Card id={`ds-q-${label}`} key={label} interactive onClick={() => go(route)}>
              <Item size="sm">
                <ItemMedia variant="icon">
                  <FeaturedIcon Icon={Icon} size="sm" color={color} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                </ItemContent>
              </Item>
            </Card>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="dc-section">
          <div className="dc-section__head">
            <h2 className="dc-section__title">
              <Clock aria-hidden="true" />
              Open tabs
            </h2>
          </div>
          <div className="dc-section__body dc-rows">
            {recent.map((t) => {
              const { label, Icon } = tabMeta(t.route, state);
              return (
                <Item key={t.id} size="sm" onClick={() => nav.activate(t.id)}>
                  <ItemMedia variant="icon">
                    <Icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{label}</ItemTitle>
                  </ItemContent>
                </Item>
              );
            })}
          </div>
        </section>
      )}

      <section className="dc-section">
        <div className="dc-section__head">
          <h2 className="dc-section__title">
            <Pin aria-hidden="true" />
            Your spaces
          </h2>
          <Button
            id="ds-home-browse"
            style="link"
            size="xs"
            label="Browse dashboards"
            IconRight={() => <ChevronRight size={12} aria-hidden="true" />}
            onClick={() => go({ page: 'browse' })}
          />
        </div>
        <div className="dc-section__body dc-grid dc-grid--wide">
          {pinned.map((s) => (
            <Card id={`ds-p-${s.id}`} key={s.id} interactive onClick={() => go({ page: 'space', id: s.id })}>
              <Item size="sm">
                <ItemMedia variant="icon">
                  <FeaturedIcon Icon={LayoutGrid} size="sm" color={s.hue} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{s.name}</ItemTitle>
                  <span style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-4)', color: 'var(--muted-foreground)' }}>
                    {s.items.length} dashboards · {s.description}
                  </span>
                </ItemContent>
              </Item>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
