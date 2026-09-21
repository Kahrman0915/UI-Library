/* DartBoards · Space (Figma page "Space", 3347:44).

   S1.1 landing · S1.2 empty · S1.3 grouped under section headings · S1.4 loading
   S2.1 card menu · S2.2 / S2.3 the hover cards the menu opens
   S3.1 / S3.2 banners (+ the "Space shared" toast) · S3.3 / S3.4 are fired by the Builder
   S4.1 remove a dashboard · S4.2 delete the space

   Editing is not on this page: "Edit space" opens the Builder on this space. */

import { Ellipsis, Info, KeyRound, LayoutGrid, Pencil, Share2, SquareArrowOutUpRight, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../../components/AlertDialog';
import Banner from '../../../../../components/Banner';
import Button from '../../../../../components/Button';
import { CardDescription, CardOverline, CardTitle } from '../../../../../components/Card';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import HoverCard, { HoverCardContent, HoverCardTrigger } from '../../../../../components/HoverCard';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import { toast } from '../../../../../components/Toast';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, SpaceCardLayout, SpaceItem } from '../../../types';
import { useUi } from '../../../ui';
import { SpaceCard, SpaceCardSkeleton } from './SpaceCards';
import { gridClass, groupBySection } from './spaceLayout';
import './Space.scss';

type Popover = { dashboardId: string; kind: 'info' | 'access' } | null;

export function SpacePage({ id }: { id: string }) {
  const { state, removeFromSpace, setItemLayout, deleteSpace, dismissSpaceBanner, update } = useSuite();
  const { go } = useNav();
  const { openDashboardInfo, openGetAccess } = useUi();
  const space = state.spaces.find((s) => s.id === id);

  // S1.4 — only the grid loads; the header is already known from the route.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  const [removing, setRemoving] = useState<Dashboard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [popover, setPopover] = useState<Popover>(null);

  if (!space) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGrid />
            </EmptyMedia>
            <EmptyTitle>This space no longer exists</EmptyTitle>
            <EmptyDescription>It may have been deleted. The dashboards it held are still in the library.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id={`ds-space-${id}-gone-browse`} style="outline" label="Browse dashboards" onClick={() => go({ page: 'browse' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const byId = (dashId: string) => state.dashboards.find((d) => d.id === dashId);
  const items = space.items.filter((i) => byId(i.dashboardId));
  const grouped = items.some((i) => i.section);
  const preset = space.layout ?? 'auto';
  const base = `ds-space-${space.id}`;

  const confirmRemove = () => {
    if (!removing) return;
    const index = space.items.findIndex((i) => i.dashboardId === removing.id);
    const item = space.items[index];
    removeFromSpace(space.id, removing.id);
    toast.success('Dashboard removed', {
      description: `${removing.name} was removed from ${space.name}.`,
      action: {
        label: 'Undo',
        onClick: () =>
          update((d) => {
            const s = d.spaces.find((x) => x.id === space.id);
            if (s && item && !s.items.some((i) => i.dashboardId === item.dashboardId)) s.items.splice(index, 0, item);
          }),
      },
    });
    setRemoving(null);
  };

  const confirmDelete = () => {
    const name = space.name;
    setDeleting(false);
    deleteSpace(space.id);
    go({ page: 'browse' });
    toast.success('Space deleted', { description: `${name} was deleted. Its dashboards are still in the library.` });
  };

  const renderCard = (item: SpaceItem) => {
    const dash = byId(item.dashboardId)!;
    const cardId = `${base}-card-${dash.id}`;
    const menu = (
      <DropdownMenu id={`${cardId}-menu`}>
        <DropdownMenuTrigger>
          <Button id={`${cardId}-menu-trigger`} style="ghost" size="xs" iconOnly IconCenter={Ellipsis} aria-label={`More actions for ${dash.name}`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Card layout</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={item.layout}
            onValueChange={(v) => {
              setItemLayout(space.id, dash.id, v as SpaceCardLayout);
              toast.success('Card layout changed', { description: `${dash.name} now shows as a ${v === 'card' ? 'compact' : 'thumbnail'} card.` });
            }}
          >
            <DropdownMenuRadioItem value="thumbnail">Thumbnail card</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="card">Compact card</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setPopover({ dashboardId: dash.id, kind: 'info' })}>
            <Info aria-hidden="true" />
            Dashboard info
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPopover({ dashboardId: dash.id, kind: 'access' })}>
            <KeyRound aria-hidden="true" />
            How to get access
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setRemoving(dash)}>
            <Trash2 aria-hidden="true" />
            Remove from space
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const open = popover?.dashboardId === dash.id;
    return (
      <HoverCard
        key={dash.id}
        id={`${cardId}-hover`}
        open={open}
        onOpenChange={(o) => {
          if (!o) setPopover(null);
        }}
      >
        <HoverCardTrigger>
          <div className="ds-space-cell">
            <SpaceCard
              id={cardId}
              dashboard={dash}
              layout={item.layout}
              action={menu}
              onOpen={() => go({ page: 'dashboard', id: dash.id, fromSpaceId: space.id })}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="ds-space-hover">
          {popover?.kind === 'access' ? (
            <Stack level={4}>
              <CardOverline>
                <KeyRound aria-hidden="true" size={14} />
                Access needed
              </CardOverline>
              <CardTitle as="p">Request access to {dash.name}</CardTitle>
              <CardDescription>
                Submit a request for the Production environment with the Viewer role. Admins usually reply within a day.
              </CardDescription>
              <Stack level={4} direction="horizontal" wrap>
                <Button id={`${cardId}-access-requests`} style="link" size="sm" label="Open My Requests" onClick={() => go({ page: 'my-requests' })} />
                <Button
                  id={`${cardId}-access-how`}
                  style="link"
                  size="sm"
                  label="See how to get access"
                  onClick={() => {
                    setPopover(null);
                    openGetAccess(dash.id);
                  }}
                />
              </Stack>
            </Stack>
          ) : (
            <Stack level={4}>
              <CardOverline>
                {dash.category} · {dash.owner}
              </CardOverline>
              <CardTitle as="p">{dash.name}</CardTitle>
              <CardDescription>{dash.description}</CardDescription>
              <Stack level={4} direction="horizontal" wrap>
                <Button
                  id={`${cardId}-info-library`}
                  style="link"
                  size="sm"
                  label="View in the library"
                  onClick={() => go({ page: 'dashboard', id: dash.id, fromSpaceId: space.id })}
                />
                <Button
                  id={`${cardId}-info-more`}
                  style="link"
                  size="sm"
                  label="More details"
                  onClick={() => {
                    setPopover(null);
                    openDashboardInfo(dash.id);
                  }}
                />
              </Stack>
            </Stack>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  };

  const grid = (list: SpaceItem[]) => <div className={gridClass(preset)}>{list.map(renderCard)}</div>;

  let body;
  if (loading) {
    const shape: SpaceCardLayout[] = items.length ? items.map((i) => i.layout) : ['thumbnail', 'card', 'card', 'thumbnail'];
    body = (
      <div className={gridClass(preset)} aria-busy="true" aria-label="Loading dashboards">
        {shape.map((l, i) => (
          <SpaceCardSkeleton key={i} id={`${base}-skeleton-${i}`} layout={l} />
        ))}
      </div>
    );
  } else if (!items.length) {
    body = (
      <Empty className="ds-space-empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayoutGrid />
          </EmptyMedia>
          <EmptyTitle>No dashboards in this space yet</EmptyTitle>
          <EmptyDescription>Browse the library and add the dashboards this team checks.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Stack level={4} direction="horizontal" justify="center" wrap>
            <Button id={`${base}-empty-browse`} label="Browse dashboards" onClick={() => go({ page: 'browse' })} />
            <Button id={`${base}-empty-edit`} style="outline" label="Edit space" IconLeft={Pencil} onClick={() => go({ page: 'builder', spaceId: space.id })} />
          </Stack>
        </EmptyContent>
      </Empty>
    );
  } else if (grouped) {
    body = (
      <Stack level={2}>
        {groupBySection(items).map((g, i) => (
          <Section key={g.section ?? `none-${i}`} id={`${base}-section-${i}`} heading={g.section ?? 'Other dashboards'}>
            {grid(g.items)}
          </Section>
        ))}
      </Stack>
    );
  } else {
    body = grid(items);
  }

  return (
    <div className="ds-space-page">
      {space.banners?.map((b) => (
        <Banner
          key={b.id}
          id={`${base}-banner-${b.id}`}
          variant={b.variant}
          title={b.title}
          onClose={() => {
            dismissSpaceBanner(space.id, b.id);
            toast('Notice dismissed', { description: 'It will not show again on this space.' });
          }}
        >
          {b.text}
        </Banner>
      ))}
      <PageContainer>
        <PageHeader
          id={`${base}-header`}
          title={space.name}
          description={space.description}
          showDivider
          actions={
            <>
              <Button
                id={`${base}-export`}
                style="ghost"
                iconOnly
                IconCenter={SquareArrowOutUpRight}
                aria-label="Export space"
                onClick={() => toast.success('Export started', { description: `A PDF of ${space.name} will download when it is ready.` })}
              />
              <Button
                id={`${base}-share`}
                style="ghost"
                iconOnly
                IconCenter={Share2}
                aria-label="Share space"
                onClick={() => {
                  update((d) => {
                    const s = d.spaces.find((x) => x.id === space.id);
                    if (s) s.shared = true;
                  });
                  toast.success('Space shared', { description: `${space.name} is now shared with 12 people.` });
                }}
              />
              <Button
                id={`${base}-edit`}
                style="outline"
                label="Edit space"
                IconLeft={Pencil}
                onClick={() => go({ page: 'builder', spaceId: space.id })}
              />
              <DropdownMenu id={`${base}-more`}>
                <DropdownMenuTrigger>
                  <Button id={`${base}-more-trigger`} style="ghost" iconOnly IconCenter={Ellipsis} aria-label="More space actions" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => go({ page: 'browse' })}>
                    <LayoutGrid aria-hidden="true" />
                    Add dashboards
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
                    <Trash2 aria-hidden="true" />
                    Delete space
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
        {body}
      </PageContainer>

      {/* S4.1 */}
      <AlertDialog id={`${base}-remove`} open={!!removing} onClose={() => setRemoving(null)}>
        <AlertDialogHeader id={`${base}-remove-header`} title="Remove this dashboard from the space?" />
        <AlertDialogBody>
          {removing?.name} stays in the library — this only takes it out of {space.name}. Anyone with the space keeps their own copies.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id={`${base}-remove-cancel`} style="ghost" label="Cancel" onClick={() => setRemoving(null)} />
          <Button id={`${base}-remove-confirm`} variant="error" label="Remove dashboard" onClick={confirmRemove} />
        </AlertDialogFooter>
      </AlertDialog>

      {/* S4.2 */}
      <AlertDialog id={`${base}-delete`} open={deleting} onClose={() => setDeleting(false)}>
        <AlertDialogHeader id={`${base}-delete-header`} title="Delete this space?" />
        <AlertDialogBody>
          {space.name} and its layout are deleted for everyone it’s shared with. The dashboards stay in the library.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id={`${base}-delete-cancel`} style="ghost" label="Cancel" onClick={() => setDeleting(false)} />
          <Button id={`${base}-delete-confirm`} variant="error" label="Delete space" onClick={confirmDelete} />
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
}
