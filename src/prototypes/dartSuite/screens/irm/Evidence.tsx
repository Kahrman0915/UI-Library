/* IRM · evidence on controls. Attesting is a SUBMISSION — links and files plus
   a note — that someone else accepts or rejects. A control counts as attested
   only once its evidence is accepted, the submitter can never review their own,
   and every submission stays on the control as its history: that history is
   what an auditor asks for. */

import { useRef, useState } from 'react';
import { Check, FileText, Link2, Paperclip, X } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '../../../../components/Attachment';
import Button from '../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../components/Dialog';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import Input from '../../../../components/Input';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Text from '../../../../components/Text';
import Textarea from '../../../../components/Textarea';
import Timeline, { TimelineItem } from '../../../../components/Timeline';
import { fmtIso, recordName } from '../../irm';
import type { IrmAttestation, IrmControl, IrmEvidence, IrmRecord } from '../../irm';
import { useSuite } from '../../store';
import { RecordLink, StateLabel, nameOf, useIrm } from './shared';

const who = (id: string) => (id === 'irm' ? 'Automated check' : nameOf(id));

/** One piece of evidence as an Attachment row: a link opens, a file shows its name. */
function EvidenceRow({ e, onRemove }: { e: IrmEvidence; onRemove?: () => void }) {
  return (
    <Attachment size="sm">
      <AttachmentMedia variant="icon">{e.kind === 'link' ? <Link2 /> : <FileText />}</AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{e.label}</AttachmentTitle>
        <AttachmentDescription>{e.kind === 'link' ? e.url : 'File'}</AttachmentDescription>
      </AttachmentContent>
      {onRemove && (
        <AttachmentActions>
          <AttachmentAction aria-label={`Remove ${e.label}`} onClick={onRemove}>
            <X />
          </AttachmentAction>
        </AttachmentActions>
      )}
    </Attachment>
  );
}

/* ── Submit ──────────────────────────────────────────────────────────────── */

export function AttestDialog({ record, control, open, onClose }: { record: IrmRecord; control: IrmControl; open: boolean; onClose: () => void }) {
  const irm = useIrm();
  const [evidence, setEvidence] = useState<IrmEvidence[]>([]);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setEvidence([]);
    setLabel('');
    setUrl('');
    setNote('');
    setTried(false);
  };
  const close = () => {
    reset();
    onClose();
  };
  const addLink = () => {
    if (!url.trim()) return;
    setEvidence((ev) => [...ev, { kind: 'link', label: label.trim() || url.trim(), url: url.trim() }]);
    setLabel('');
    setUrl('');
  };

  return (
    <Dialog id="ds-irm-attest" open={open} onClose={close}>
      <DialogHeader id="ds-irm-attest-header" title={`Attest: ${control.name}`} description={`${recordName(record)} · every ${control.cadenceDays} days`} onClose={close} />
      <DialogBody>
        <Stack level={3}>
          <Text size="sm" tone="muted">
            Attach what shows the control was done. The governance team reviews it; the control counts as attested once they accept it.
          </Text>
          {evidence.length > 0 && (
            <AttachmentGroup>
              {evidence.map((e, i) => (
                <EvidenceRow key={`${e.label}-${i}`} e={e} onRemove={() => setEvidence((ev) => ev.filter((_, j) => j !== i))} />
              ))}
            </AttachmentGroup>
          )}
          <Stack level={4} direction="horizontal" align="end" wrap>
            <Input id="ds-irm-attest-url" label="Link" placeholder="https://…" value={url} onValueChange={setUrl} />
            <Input id="ds-irm-attest-label" label="Name it" placeholder="Optional" value={label} onValueChange={setLabel} />
            <Button id="ds-irm-attest-add" style="outline" label="Add link" IconLeft={Link2} disabled={!url.trim()} onClick={addLink} />
          </Stack>
          <Stack level={4} direction="horizontal" align="center">
            <Button id="ds-irm-attest-file" style="outline" label="Attach a file" IconLeft={Paperclip} onClick={() => fileRef.current?.click()} />
            <input
              ref={fileRef}
              type="file"
              multiple
              className="ui-sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])].map((f): IrmEvidence => ({ kind: 'file', label: f.name }));
                setEvidence((ev) => [...ev, ...files]);
                e.target.value = '';
              }}
            />
            <Text as="span" size="sm" tone="muted">Kept with the control for audit.</Text>
          </Stack>
          {tried && !evidence.length && <Alert id="ds-irm-attest-none" variant="error" title="Add at least one piece of evidence" description="A link or a file — something a reviewer can open." />}
          <Textarea id="ds-irm-attest-note" label="Note for the reviewer" value={note} onValueChange={setNote} />
        </Stack>
      </DialogBody>
      <DialogFooter>
        <Button id="ds-irm-attest-cancel" style="ghost" label="Cancel" onClick={close} />
        <Button
          id="ds-irm-attest-submit"
          label="Submit for review"
          onClick={() => {
            setTried(true);
            if (!evidence.length) return;
            irm.submitAttestation(record.number, control.id, evidence, note.trim());
            close();
          }}
        />
      </DialogFooter>
    </Dialog>
  );
}

/* ── History + review ────────────────────────────────────────────────────── */

const OUTCOME = {
  pending: { label: 'In review', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'default' },
  rejected: { label: 'Rejected', tone: 'error' },
} as const;

/** A control's whole evidence history, newest first — and the review, for someone allowed to do it. */
export function ControlHistory({ record, control, open, onClose }: { record: IrmRecord; control: IrmControl | null; open: boolean; onClose: () => void }) {
  const { state } = useSuite();
  const irm = useIrm();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const items = control ? state.irm.attestations.filter((a) => a.controlId === control.id) : [];
  const canReview = irm.role === 'governance';
  return (
    <Drawer id="ds-irm-history" open={open && !!control} onClose={onClose}>
      <DrawerHeader id="ds-irm-history-header" title={control?.name ?? ''} description={`${recordName(record)} · evidence history`} onClose={onClose} />
      <DrawerBody>
        {items.length ? (
          <Timeline connector aria-label="Evidence history">
            {items.map((a) => (
              <TimelineItem
                key={a.id}
                author={who(a.submittedById)}
                time={`submitted ${fmtIso(a.submittedOn)}`}
                dateTime={a.submittedOn}
                actions={
                  a.outcome === 'pending' && canReview ? (
                    a.submittedById === irm.me ? (
                      <Text size="sm" tone="muted">You submitted this, so someone else on the team reviews it.</Text>
                    ) : (
                      <Stack level={4}>
                        <Input id={`ds-irm-rev-note-${a.id}`} size="sm" aria-label="Review note" placeholder="Note (required to reject)" value={notes[a.id] ?? ''} onValueChange={(v) => setNotes((n) => ({ ...n, [a.id]: v }))} />
                        <Stack level={5} direction="horizontal">
                          <Button id={`ds-irm-rev-accept-${a.id}`} size="sm" label="Accept" IconLeft={Check} onClick={() => irm.reviewAttestation(a.id, 'accepted', notes[a.id] ?? '')} />
                          <Button
                            id={`ds-irm-rev-reject-${a.id}`}
                            size="sm"
                            style="ghost"
                            label="Reject"
                            IconLeft={X}
                            disabled={!(notes[a.id] ?? '').trim()}
                            onClick={() => irm.reviewAttestation(a.id, 'rejected', notes[a.id] ?? '')}
                          />
                        </Stack>
                      </Stack>
                    )
                  ) : undefined
                }
              >
                <Stack level={4}>
                  <Stack level={5} direction="horizontal" align="center">
                    <StateLabel id={`ds-irm-hist-${a.id}`} label={OUTCOME[a.outcome].label} tone={OUTCOME[a.outcome].tone} />
                    {a.reviewerId && (
                      <Text as="span" size="sm" tone="muted">{`by ${nameOf(a.reviewerId)}${a.reviewedOn ? ` · ${fmtIso(a.reviewedOn)}` : ''}`}</Text>
                    )}
                  </Stack>
                  <AttachmentGroup>
                    {a.evidence.map((e, i) => (
                      <EvidenceRow key={i} e={e} />
                    ))}
                  </AttachmentGroup>
                  {a.note && <Text size="sm">{a.note}</Text>}
                  {a.reviewNote && <Text size="sm" tone="muted">{`Reviewer: ${a.reviewNote}`}</Text>}
                </Stack>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Text tone="muted">Nothing submitted yet.</Text>
        )}
      </DrawerBody>
      <DrawerFooter>
        <Button id="ds-irm-history-close" style="ghost" label="Close" onClick={onClose} />
      </DrawerFooter>
    </Drawer>
  );
}

/* ── The governance team's review queue ──────────────────────────────────── */

export function ReviewQueue() {
  const { state } = useSuite();
  const irm = useIrm();
  const [open, setOpen] = useState<IrmAttestation | null>(null);
  const pending = state.irm.attestations.filter((a) => a.outcome === 'pending');
  const rec = (n: string) => state.irm.records.find((r) => r.number === n);
  const ctlOf = (a: IrmAttestation) => rec(a.record)?.controlItems.find((c) => c.id === a.controlId) ?? null;
  if (!pending.length) return null;
  const openRec = open ? rec(open.record) : undefined;
  return (
    <>
      <Table id="ds-irm-rev-table" label="Evidence to review">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Report</TableHeaderCell>
            <TableHeaderCell>Control</TableHeaderCell>
            <TableHeaderCell>Submitted by</TableHeaderCell>
            <TableHeaderCell>Submitted</TableHeaderCell>
            <TableHeaderCell>Evidence</TableHeaderCell>
            <TableHeaderCell align="end">
              <span className="ui-table__sr-only">Actions</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pending.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <RecordLink id={`ds-irm-rev-rec-${a.id}`} record={rec(a.record)} number={a.record} />
              </TableCell>
              <TableCell>{ctlOf(a)?.name}</TableCell>
              <TableCell>{who(a.submittedById)}</TableCell>
              <TableCell>{fmtIso(a.submittedOn)}</TableCell>
              <TableCell>{`${a.evidence.length} item${a.evidence.length === 1 ? '' : 's'}`}</TableCell>
              <TableCell align="end">
                <Button id={`ds-irm-rev-open-${a.id}`} size="sm" style="outline" label={a.submittedById === irm.me ? 'View' : 'Review'} onClick={() => setOpen(a)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {openRec && <ControlHistory record={openRec} control={open ? ctlOf(open) : null} open={!!open} onClose={() => setOpen(null)} />}
    </>
  );
}
