/* DART Central · Home — the IRM roles' own work, and acting on it in place.

   Two halves. `useWaitingActions` lets "Waiting on you" finish a simple item
   without leaving the hub — approve, certify, attest, review, take, start,
   assign, deploy — each in a dialog or a single click, with "Open in IRM" for
   anyone who wants the whole page. The role widgets themselves live in
   widgets.tsx. */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../components/Dialog';
import DescriptionList, { DescriptionListItem } from '../../../../components/DescriptionList';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import Textarea from '../../../../components/Textarea';
import { toast } from '../../../../components/Toast';
import { PEOPLE } from '../../data';
import type { WaitingItem } from '../../hub';
import { CHANGE_TYPE, PRIORITY, WORK_STATUSES, recordName } from '../../irm';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { AttestDialog, ControlHistory } from '../irm/Evidence';
import { nameOf, useIrm } from '../irm/shared';

/* ── Acting on "Waiting on you" without leaving DART Central ─────────────── */

type Open = { kind: 'approve' | 'certify' | 'assign' | 'deploy' | 'attest' | 'review'; w: WaitingItem } | null;

/**
 * Returns `act(item)` for a waiting item and the dialogs it may open. A reply
 * and a retiring notice still navigate: both are conversations or choices that
 * need the full page.
 */
export function useWaitingActions(): { act: (w: WaitingItem) => void; dialogs: ReactNode } {
  const irm = useIrm();
  const { go } = useNav();
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);

  const act = (w: WaitingItem) => {
    switch (w.kind) {
      case 'take':
        irm.take(w.ref);
        toast(`${w.ref} is yours to deploy`, { action: { label: 'Deploy now', onClick: () => setOpen({ kind: 'deploy', w: { ...w, kind: 'deploy' } }) } });
        return;
      case 'start':
        irm.move(w.ref, 'in-development');
        toast(`${w.ref} moved to In development`, { action: { label: 'Open in IRM', onClick: () => go({ page: 'irm-change', id: w.ref }) } });
        return;
      case 'approve':
      case 'certify':
      case 'assign':
      case 'deploy':
      case 'attest':
      case 'review':
        setOpen({ kind: w.kind, w });
        return;
      default:
        go(w.route);
    }
  };

  return { act, dialogs: <WaitingDialogs open={open} close={close} /> };
}

function WaitingDialogs({ open, close }: { open: Open; close: () => void }) {
  const { state } = useSuite();
  const irm = useIrm();
  const { go } = useNav();
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [dev, setDev] = useState('');
  const done = () => {
    setReason('');
    setRejecting(false);
    setDev('');
    close();
  };
  const toIrm = (route: WaitingItem['route']) => (
    <Button id="ds-home-act-irm" style="link" size="sm" label="Open in IRM" IconRight={ArrowRight} onClick={() => (done(), go(route))} />
  );

  const w = open?.w;
  const change = w ? state.irm.changes.find((c) => c.id === w.ref) : undefined;
  const recordNo = change ? change.record : (w?.record ?? w?.ref);
  const record = recordNo ? state.irm.records.find((r) => r.number === recordNo) : undefined;

  // Attest and review reuse IRM's own dialog and drawer, so there is one way to do each.
  if (open?.kind === 'attest' && record) {
    const control = record.controlItems.find((c) => c.id === open.w.ref);
    return control ? <AttestDialog record={record} control={control} open onClose={done} /> : null;
  }
  if (open?.kind === 'review' && record) {
    const a = state.irm.attestations.find((x) => x.id === open.w.ref);
    const control = record.controlItems.find((c) => c.id === a?.controlId) ?? null;
    return <ControlHistory record={record} control={control} open onClose={done} />;
  }

  const developers = PEOPLE.filter((p) => p.irmRole === 'developer');
  const load = (id: string) => state.irm.changes.filter((c) => c.assigneeId === id && WORK_STATUSES.includes(c.status)).length;

  const summary = change && (
    <DescriptionList>
      <DescriptionListItem term="Request">{`${change.id} · ${CHANGE_TYPE[change.type].label}`}</DescriptionListItem>
      <DescriptionListItem term="Priority">{PRIORITY[change.priority].label}</DescriptionListItem>
      <DescriptionListItem term="Report">{record ? recordName(record) : 'A new report'}</DescriptionListItem>
      <DescriptionListItem term="Requested by">{nameOf(change.createdById)}</DescriptionListItem>
    </DescriptionList>
  );

  const content = (() => {
    if (!open || !w) return null;
    switch (open.kind) {
      case 'approve':
        return {
          title: rejecting ? 'Reject this request?' : 'Approve this request?',
          body: (
            <Stack level={3}>
              {change && change.summary !== change.title && <Text size="sm">{change.summary}</Text>}
              {summary}
              {rejecting && <Textarea id="ds-home-act-reason" label="Why" value={reason} onValueChange={setReason} description="The requester sees this in My Requests." />}
            </Stack>
          ),
          actions: rejecting ? (
            <>
              <Button id="ds-home-act-back" style="ghost" label="Back" onClick={() => setRejecting(false)} />
              <Button id="ds-home-act-reject-go" variant="error" label="Reject" disabled={!reason.trim()} onClick={() => (irm.reject(w.ref, reason.trim()), toast(`${w.ref} rejected`), done())} />
            </>
          ) : (
            <>
              <Button id="ds-home-act-reject" style="ghost" label="Reject…" onClick={() => setRejecting(true)} />
              <Button id="ds-home-act-approve" label="Approve" onClick={() => (irm.approve(w.ref), toast(`${w.ref} approved`), done())} />
            </>
          ),
        };
      case 'certify':
        return {
          title: `Recertify ${record ? recordName(record) : w.ref}?`,
          body: (
            <Stack level={3}>
              <Text size="sm">You confirm the report is still needed, still correct, and still owned by you. The next review falls due a cycle from today.</Text>
              {record && (
                <DescriptionList>
                  <DescriptionListItem term="Last certified">{record.evergreen.lastCertified}</DescriptionListItem>
                  <DescriptionListItem term="Due">{record.evergreen.due}</DescriptionListItem>
                </DescriptionList>
              )}
            </Stack>
          ),
          actions: <Button id="ds-home-act-certify" label="Certify" onClick={() => (irm.certify(w.ref), toast('Report recertified'), done())} />,
        };
      case 'assign':
        return {
          title: 'Assign this request',
          body: (
            <Stack level={3}>
              {summary}
              <NativeSelect id="ds-home-act-dev" label="Developer" value={dev} onValueChange={setDev}>
                <NativeSelectOption value="">Choose a developer</NativeSelectOption>
                {developers.map((p) => (
                  <NativeSelectOption key={p.id} value={p.id}>{`${p.name} · ${load(p.id)} in progress`}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Stack>
          ),
          actions: <Button id="ds-home-act-assign" label="Assign" disabled={!dev} onClick={() => (irm.assign(w.ref, dev), toast(`${w.ref} assigned to ${nameOf(dev)}`), done())} />,
        };
      case 'deploy':
        return {
          title: 'Deploy to production?',
          body: (
            <Stack level={3}>
              {summary}
              <Text size="sm" tone="muted">Linked DartBoards listings update as soon as it is live; a fix clears its known-issue notice.</Text>
            </Stack>
          ),
          actions: <Button id="ds-home-act-deploy" label="Deploy" onClick={() => (irm.deploy(w.ref), toast(`${w.ref} deployed`), done())} />,
        };
      default:
        return null;
    }
  })();

  if (!content || !w) return null;
  return (
    <Dialog id="ds-home-act" open onClose={done}>
      <DialogHeader id="ds-home-act-header" title={content.title} description={w.title} onClose={done} />
      <DialogBody>{content.body}</DialogBody>
      <DialogFooter>
        <Stack level={4} direction="horizontal" align="center" justify="between" className="ds-home-act__footer">
          {toIrm(w.route)}
          <Stack level={4} direction="horizontal">
            <Button id="ds-home-act-cancel" style="ghost" label="Cancel" onClick={done} />
            {content.actions}
          </Stack>
        </Stack>
      </DialogFooter>
    </Dialog>
  );
}
