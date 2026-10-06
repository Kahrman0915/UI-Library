/* IRM · Team board — the dev manager's home. Change requests on a board:
   COLUMNS are the working statuses, LANES are who has it, with Unassigned on
   top so new work is the first thing a manager sees. Drag a card into another
   cell to move it on or hand it to someone; every card's menu does the same
   from the keyboard. Each lane's header carries that person's load, which is
   what balancing is about.

   Composed here, not a library component (owner's call). Native HTML drag and
   drop, the technique TabBar uses — no library. */

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Avatar from '../../../../components/Avatar';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { IRM_DEVELOPERS, personById } from '../../data';
import { CHANGE_STATUS, CHANGE_TYPE, WORK_STATUSES, isAged } from '../../irm';
import type { IrmChange, IrmChangeStatus } from '../../irm';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { Age, PriorityBadge, WorkMenu, useIrm } from './shared';

const DRAG_TYPE = 'application/x-irm-change';
type Lane = { id: string; label: string };

export function Board() {
  const { state } = useSuite();
  const { go } = useNav();
  const irm = useIrm();
  const [type, setType] = useState('all');
  const [over, setOver] = useState<string | null>(null);
  const today = state.irm.today;

  const lanes: Lane[] = [{ id: '', label: 'Unassigned' }, ...IRM_DEVELOPERS.map((id) => ({ id, label: personById(id).name }))];
  const work = state.irm.changes.filter((c) => WORK_STATUSES.includes(c.status) && (type === 'all' || c.type === type));
  const cell = (lane: string, status: IrmChangeStatus) => work.filter((c) => (c.assigneeId ?? '') === lane && c.status === status);
  const load = (lane: string) => state.irm.changes.filter((c) => (c.assigneeId ?? '') === lane && WORK_STATUSES.includes(c.status)).length;

  const drop = (e: React.DragEvent, lane: string, status: IrmChangeStatus) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    const c = state.irm.changes.find((x) => x.id === id);
    if (!c) return;
    if ((c.assigneeId ?? '') !== lane) irm.assign(c.id, lane || undefined);
    if (c.status !== status) irm.move(c.id, status);
  };

  return (
    // Narrow like every other landing page. The four status columns take the whole width; who has the
    // work is a line across the top of each lane rather than a fifth column, which is what lets it fit.
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-board-header"
        title="Team board"
        description="Every change being worked, by status and by who has it. Drag a card to move it or hand it on — its ⋯ menu does the same."
        actions={<Button id="ds-irm-board-activity" style="outline" label="Month over month" IconLeft={BarChart3} onClick={() => go({ page: 'irm-activity' })} />}
      />
      <Toolbar id="ds-irm-board-filters" label="Filter the board">
        <ToolbarGroup>
          <ToggleGroup id="ds-irm-board-type" type="single" variant="plain" size="sm" value={type} onValueChange={(v) => setType(v || 'all')}>
            <ToggleGroupItem value="all" label="All work" />
            {(['break', 'new', 'modification'] as const).map((t) => (
              <ToggleGroupItem key={t} value={t} label={CHANGE_TYPE[t].label} />
            ))}
          </ToggleGroup>
        </ToolbarGroup>
      </Toolbar>

      <div className="ds-irm-board" role="grid" aria-label="Team board" style={{ '--ds-irm-cols': WORK_STATUSES.length } as React.CSSProperties}>
        <div className="ds-irm-board__row ds-irm-board__row--head" role="row">
          {/* Kept for the grid's column count; the person is named on each lane's own line. */}
          <span className="ui-sr-only" role="columnheader">Assignee</span>
          {WORK_STATUSES.map((s) => (
            <Stack key={s} level={5} direction="horizontal" align="center" role="columnheader">
              <Text as="span" size="sm" weight="semibold">{CHANGE_STATUS[s].label}</Text>
              <Badge id={`ds-irm-board-n-${s}`} label={String(work.filter((c) => c.status === s).length)} color="default" appearance="outline" />
            </Stack>
          ))}
        </div>
        {lanes.map((lane) => {
          const n = load(lane.id);
          return (
            <div key={lane.id || 'none'} className="ds-irm-board__row" role="row">
              <Stack level={4} direction="horizontal" align="center" className="ds-irm-board__lane-head" role="rowheader">
                {lane.id ? <Avatar id={`ds-irm-board-av-${lane.id}`} size="xs" fallback={personById(lane.id).initials} /> : null}
                <Stack level={4} direction="horizontal" align="center">
                  <Text as="span" size="sm" weight="medium">{lane.label}</Text>
                  {lane.id ? (
                    <Text size="xs" tone="muted">{`${n} active${n >= 4 ? ' · heavy' : ''}`}</Text>
                  ) : n ? (
                    // Unassigned is marked by its count, not by tinting the whole lane.
                    <Badge id="ds-irm-board-unassigned" label={`${n} to assign`} color="warning" appearance="soft" />
                  ) : (
                    <Text size="xs" tone="muted">Nothing to assign</Text>
                  )}
                </Stack>
              </Stack>
              {WORK_STATUSES.map((s) => {
                const key = `${lane.id || 'none'}:${s}`;
                return (
                  <div
                    key={s}
                    role="gridcell"
                    className={`ds-irm-board__cell${over === key ? ' ds-irm-board__cell--over' : ''}`}
                    aria-label={`${lane.label}, ${CHANGE_STATUS[s].label}`}
                    onDragOver={(e) => {
                      if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
                      e.preventDefault();
                      setOver(key);
                    }}
                    onDragLeave={() => setOver((o) => (o === key ? null : o))}
                    onDrop={(e) => drop(e, lane.id, s)}
                  >
                    {cell(lane.id, s).map((c) => (
                      <BoardCard key={c.id} change={c} aged={isAged(c, today, state.irm.workflows)} />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

function BoardCard({ change, aged }: { change: IrmChange; aged: boolean }) {
  const { go } = useNav();
  return (
    <Card
      id={`ds-irm-card-${change.id}`}
      size="sm"
      interactive
      className="ds-irm-card"
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData(DRAG_TYPE, change.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <CardBody>
        <Stack level={5} direction="horizontal" align="center" justify="between">
          <Text as="span" size="xs" tone="muted">{change.id} · {CHANGE_TYPE[change.type].label}</Text>
          <WorkMenu id={`ds-irm-card-${change.id}`} change={change} className="ds-irm-card__menu" />
        </Stack>
        {/* The title is the card's one link, stretched over the whole card; the ⋯ menu sits above it. */}
        <Button id={`ds-irm-card-${change.id}-open`} style="link" className="ds-admin-rowlink ds-irm-card__open" label={change.title} onClick={() => go({ page: 'irm-change', id: change.id })} />
        <Stack level={5} direction="horizontal" align="center" wrap>
          <PriorityBadge id={`ds-irm-card-${change.id}-pri`} priority={change.priority} />
          {/* Past its SLA: said in a badge and the red age, never a colored edge on the card. */}
          {aged && <Badge id={`ds-irm-card-${change.id}-sla`} label="Past SLA" color="error" appearance="soft" />}
          <Age change={change} />
        </Stack>
      </CardBody>
    </Card>
  );
}
