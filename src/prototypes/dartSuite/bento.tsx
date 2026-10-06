/* ── DART Suite prototype · the bento ─────────────────────────────────────────
   The customizable tile grid DART Central Home and Admin Overview share: twelve
   columns, tiles spanning 3 / 4 / 6 / 8 / 12, `dense` flow so reordering never
   strands a hole. A tile is a Card with a title and a "see all" link — or, for
   something that is already its own card (a KPI, a chart), `bare`, which adds
   nothing but the Customize controls. Composed in the prototype, not a library
   component (yet). */

import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardBody, CardHeader } from '../../components/Card';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../components/Drawer';
import Section from '../../components/Section';
import Stack from '../../components/Stack';
import Text from '../../components/Text';
import ToggleGroup, { ToggleGroupItem } from '../../components/ToggleGroup';
import type { BentoSize } from './types';
import './bento.scss';

export const SIZE_LABEL: Record<BentoSize, string> = { 3: 'XS', 4: 'S', 6: 'M', 8: 'L', 12: 'Full' };

export function Bento({ editing, children }: { editing: boolean; children: ReactNode }) {
  return <div className={`ds-bento${editing ? ' ds-bento--editing' : ''}`}>{children}</div>;
}

type TileProps = {
  id: string;
  title: string;
  size: BentoSize;
  /** The sizes this tile may take; one size means it cannot be resized. */
  sizes: readonly BentoSize[];
  editing: boolean;
  /** Position in the layout, for the move buttons' disabled ends. */
  index: number;
  count: number;
  onResize: (size: BentoSize) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
  /** The header's "see all" link, shown when not customizing. */
  link?: ReactNode;
  /** The content is already a card (a KPI, a chart): no second frame, controls above it. */
  bare?: boolean;
  children: ReactNode;
};

export function BentoTile({ id, title, size, sizes, editing, index, count, onResize, onMove, onRemove, link, bare, children }: TileProps) {
  const controls = editing && (
    <Stack level={5} direction="horizontal" align="center">
      {sizes.length > 1 && (
        <ToggleGroup id={`${id}-size`} type="single" size="sm" value={String(size)} aria-label={`Size of ${title}`} onValueChange={(v) => v && onResize(Number(v) as BentoSize)}>
          {sizes.map((s) => (
            <ToggleGroupItem key={s} value={String(s)} label={SIZE_LABEL[s]} />
          ))}
        </ToggleGroup>
      )}
      <Button id={`${id}-up`} style="ghost" size="xs" iconOnly IconCenter={ArrowUp} aria-label={`Move ${title} earlier`} disabled={index === 0} onClick={() => onMove(-1)} />
      <Button id={`${id}-down`} style="ghost" size="xs" iconOnly IconCenter={ArrowDown} aria-label={`Move ${title} later`} disabled={index === count - 1} onClick={() => onMove(1)} />
      <Button id={`${id}-rm`} style="ghost" size="xs" iconOnly IconCenter={X} aria-label={`Remove ${title}`} onClick={onRemove} />
    </Stack>
  );
  return (
    <div className={`ds-bento__tile ds-bento__tile--s${size}${bare ? ' ds-bento__tile--bare' : ''}`}>
      {bare ? (
        <div className="ds-bento__bare">
          {editing && (
            <Stack level={4} direction="horizontal" align="center" justify="between" className="ds-bento__bar">
              <span className="ds-bento__bar-title">{title}</span>
              {controls}
            </Stack>
          )}
          {children}
        </div>
      ) : (
        <Card id={id} className="ds-bento__card">
          <CardHeader id={`${id}-header`} title={title} showDivider={false} action={editing ? controls : link} />
          <CardBody>{children}</CardBody>
        </Card>
      )}
    </div>
  );
}

/**
 * "Add widget": every widget the page can show, grouped, each Add / Added.
 * One picker for every bento page, so adding works the same on Home and on
 * Admin Overview. Always reachable — when everything is already on the page,
 * it still lists it, so the button never vanishes.
 */
export function BentoPicker({
  id,
  open,
  onClose,
  description,
  items,
  onToggle,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  description: string;
  items: { id: string; label: string; group: string; added: boolean }[];
  onToggle: (id: string, add: boolean) => void;
}) {
  const groups = [...new Set(items.map((i) => i.group))];
  return (
    <Drawer id={id} open={open} onClose={onClose}>
      <DrawerHeader id={`${id}-header`} title="Add a widget" description={description} onClose={onClose} />
      <DrawerBody>
        <Stack level={3}>
          {groups.map((g) => (
            <Section key={g} id={`${id}-${g.replace(/\W+/g, '-').toLowerCase()}`} heading={g} variant="group" headingLevel="h3">
              <Stack level={4}>
                {items
                  .filter((i) => i.group === g)
                  .map((i) => (
                    <Stack key={i.id} level={4} direction="horizontal" align="center" justify="between">
                      <Text as="span">{i.label}</Text>
                      <Button id={`${id}-${i.id}`} size="xs" style={i.added ? 'ghost' : 'outline'} label={i.added ? 'Added' : 'Add'} onClick={() => onToggle(i.id, !i.added)} />
                    </Stack>
                  ))}
              </Stack>
            </Section>
          ))}
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Button id={`${id}-done`} label="Done" onClick={onClose} />
      </DrawerFooter>
    </Drawer>
  );
}
