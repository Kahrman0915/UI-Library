/* The suite's notifications — ONE bell for DART Central, DartBoards and IRM,
   because DART Central is where a person hears from every application under it.
   Each line says which application it is from. IRM sends approvals, due dates,
   SLA breaches, evidence reviews and retirements; DART Central sends updates on
   a person's requests; DartBoards asks for a finished report to be listed. In
   production each one is also an email.
   */

import { useState } from 'react';
import { Archive, Bell, CalendarClock, CheckCheck, ClipboardCheck, Clock, FileCheck, Inbox, ShieldCheck, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '../../../../components/Button';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import Popover, { PopoverContent, PopoverTrigger } from '../../../../components/Popover';
import Stack from '../../../../components/Stack';
import StatusDot from '../../../../components/StatusDot';
import Text from '../../../../components/Text';
import { fmtIso } from '../../irm';
import type { IrmNotificationKind } from '../../irm';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { useIrm } from './shared';

const ICON: Record<IrmNotificationKind, LucideIcon> = {
  approval: ClipboardCheck,
  evergreen: CalendarClock,
  'control-due': ShieldCheck,
  aged: Clock,
  'attestation-review': FileCheck,
  'attestation-reviewed': FileCheck,
  retiring: Archive,
  'ready-to-list': Upload,
  'request-update': Inbox,
};

export function NotificationsMenu() {
  const { state } = useSuite();
  const { go } = useNav();
  const irm = useIrm();
  const [open, setOpen] = useState(false);
  const mine = state.irm.notifications.filter((n) => n.personId === irm.me);
  const unread = mine.filter((n) => !n.read);
  const shown = mine.slice(0, 8);
  return (
    <Popover id="ds-notifications" open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          id="ds-notifications-btn"
          style="ghost"
          size="sm"
          iconOnly={!unread.length}
          IconLeft={unread.length ? Bell : undefined}
          IconCenter={unread.length ? undefined : Bell}
          count={unread.length || undefined}
          aria-label={unread.length ? `Notifications, ${unread.length} unread` : 'Notifications'}
        />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="ds-notifications">
        <Stack level={4}>
          <Stack level={4} direction="horizontal" align="center" justify="between">
            <Text weight="semibold">Notifications</Text>
            {unread.length > 0 && (
              <Button id="ds-notifications-read" style="link" size="sm" label="Mark all read" IconLeft={CheckCheck} onClick={() => irm.markRead(unread.map((n) => n.id))} />
            )}
          </Stack>
          {shown.length ? (
            <ItemGroup>
              {shown.map((n) => {
                const Icon = ICON[n.kind];
                return (
                  <Item
                    key={n.id}
                    size="sm"
                    onClick={() => {
                      irm.markRead([n.id]);
                      setOpen(false);
                      go(n.route);
                    }}
                  >
                    <ItemMedia variant="icon">
                      <Icon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        <Stack level={5} direction="horizontal" align="center">
                          {!n.read && <StatusDot status="busy" size="sm" label="Unread" />}
                          {n.title}
                        </Stack>
                      </ItemTitle>
                      <ItemDescription>{`${n.app ?? 'IRM'} · ${n.body} · ${fmtIso(n.at)}`}</ItemDescription>
                    </ItemContent>
                  </Item>
                );
              })}
            </ItemGroup>
          ) : (
            <Text size="sm" tone="muted">You’re all caught up.</Text>
          )}
          <Text size="xs" tone="muted">
            {mine.length > shown.length ? `${mine.length - shown.length} older not shown · ` : ''}Each of these is also sent by email.
          </Text>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
