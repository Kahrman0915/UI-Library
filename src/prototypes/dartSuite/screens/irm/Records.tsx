/* IRM · Inventory and the record page. The record is the report's whole life
   in one place: what it is, its controls, every change requested against it,
   its incidents — and where it is listed in DartBoards, live. */

import { useState } from 'react';
import { ExternalLink, Flag, MoreHorizontal, Plus, ShieldCheck, Star, Trash2 } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Button from '../../../../components/Button';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import DescriptionList, { DescriptionListItem } from '../../../../components/DescriptionList';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../../../../components/Tabs';
import Text from '../../../../components/Text';
import Toggle from '../../../../components/Toggle';
import Timeline, { TimelineItem } from '../../../../components/Timeline';
import { personById } from '../../data';
import { CHANGE_STATUS, CONTROL_STATE, LIFECYCLE, controlState, daysBetween, evergreenState, fmtIso, recordName } from '../../irm';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import { AuditTable } from './Audit';
import { AttestDialog, ControlHistory } from './Evidence';
import { LineageView } from './Lineage';
import { ChangeTable, ControlsBadge, EvergreenBadge, IrmCrumbs, LifecycleBadge, StateLabel, useIrm } from './shared';

/* ── One record ──────────────────────────────────────────────────────────── */

export function IrmRecord({ number }: { number: string }) {
  const { state, toggleIrmFavorite } = useSuite();
  const { person } = useSignedIn();
  const fav = (state.irmFavorites[person.id] ?? []).includes(number);
  const { go } = useNav();
  const irm = useIrm();
  const [attesting, setAttesting] = useState<string | null>(null);
  const [historyOf, setHistoryOf] = useState<string | null>(null);
  const r = state.irm.records.find((x) => x.number === number);
  if (!r) return <PageContainer><Text>No IRM record {number}.</Text></PageContainer>;

  const today = state.irm.today;
  const changes = state.irm.changes.filter((c) => c.record === number);
  const incidents = state.irm.incidents.filter((i) => i.record === number);
  const listings = state.dashboards.filter((d) => d.irm === number);
  const owner = r.businessOwnerId === irm.me;
  const governance = irm.role === 'governance';
  const live = r.lifecycle === 'production';
  const openDecom = changes.find((c) => c.type === 'decommission' && CHANGE_STATUS[c.status].active);
  const canDecommission = live && (owner || governance) && !openDecom;
  const attestingCtl = r.controlItems.find((c) => c.id === attesting) ?? null;
  const historyCtl = r.controlItems.find((c) => c.id === historyOf) ?? null;

  return (
    <PageContainer>
      <Stack level={4}>
        <IrmCrumbs parent={{ label: 'Inventory', route: { page: 'irm-records' } }} page={recordName(r)} />
        <PageHeader
          id="ds-irm-rec-header"
          overline={
            <>
              {`${r.number} · ${LIFECYCLE[r.lifecycle].label} · v${r.version}`}
              {/* Only what needs attention gets a badge; a healthy record's eyebrow is just its facts. */}
              {r.lifecycle === 'retiring' && <LifecycleBadge id="ds-irm-rec-lc" record={r} />}
              {r.controls !== 'complete' && <ControlsBadge id="ds-irm-rec-ctl" record={r} prefixed />}
              {evergreenState(r, today) !== 'current' && <EvergreenBadge id="ds-irm-rec-ever" record={r} prefixed />}
            </>
          }
          title={recordName(r)}
          description={r.description || undefined}
          actions={
            <>
              <Toggle
                id="ds-irm-rec-fav"
                variant="outline"
                IconCenter={Star}
                aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                pressed={fav}
                onPressedChange={() => toggleIrmFavorite(person.id, r.number)}
                className={fav ? 'ds-inv__fav-toggle--on' : undefined}
              />
              <Button id="ds-irm-rec-new" style="outline" label="New IRM request" IconLeft={Plus} onClick={() => go({ page: 'irm-new-change', record: r.number })} />
              {(canDecommission || governance) && (
                <DropdownMenu id="ds-irm-rec-more">
                  <DropdownMenuTrigger>
                    <Button id="ds-irm-rec-more-btn" style="ghost" iconOnly IconCenter={MoreHorizontal} aria-label="More actions for this report" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {governance &&
                      (r.flagged ? (
                        <DropdownMenuItem onClick={() => irm.clearFlag(r.number)}>
                          <Flag aria-hidden="true" />
                          Clear flag
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => irm.flag(r.number, 'Flagged from the record page.')}>
                          <Flag aria-hidden="true" />
                          Flag for review
                        </DropdownMenuItem>
                      ))}
                    {canDecommission && (
                      <>
                        {governance && <DropdownMenuSeparator />}
                        <DropdownMenuItem variant="destructive" onClick={() => go({ page: 'irm-new-change', type: 'decommission', record: r.number })}>
                          <Trash2 aria-hidden="true" />
                          Decommission…
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          }
        />
      </Stack>
      <Stack level={3}>
        {r.lifecycle === 'retiring' && r.retireOn && (
          <Alert
            id="ds-irm-rec-retiring"
            variant="warning"
            title={`Retires on ${fmtIso(r.retireOn)}`}
            description={`DartBoards is showing a notice on ${listings.length ? 'its listing' : 'any listing'}${r.replacedBy ? ` and pointing readers to ${r.replacedBy}` : ''}. On the day, the listing archives itself.`}
            action={governance ? <Button id="ds-irm-rec-retire-now" size="sm" style="outline" label="Retire now" onClick={() => irm.retireNow(r.number)} /> : undefined}
          />
        )}
        {r.flagged && <Alert id="ds-irm-rec-flagged" variant="warning" title="Flagged for review" description={`${r.flagged.reason} — ${personById(r.flagged.byId).name}, ${fmtIso(r.flagged.on)}.`} />}

        <Tabs id="ds-irm-rec-tabs" defaultValue="overview" variant="line">
          <TabsList aria-label="Record">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="changes">Changes ({changes.length})</TabsTrigger>
            <TabsTrigger value="incidents">Incidents ({incidents.filter((i) => !i.resolved).length})</TabsTrigger>
            <TabsTrigger value="listings">DartBoards listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DescriptionList>
              <DescriptionListItem term="Purpose">{r.purpose}</DescriptionListItem>
              <DescriptionListItem term="Department">{r.department}</DescriptionListItem>
              <DescriptionListItem term="Business owner">{r.businessOwner}</DescriptionListItem>
              <DescriptionListItem term="Developer">{r.developer}</DescriptionListItem>
              <DescriptionListItem term="Source">{r.source}</DescriptionListItem>
              <DescriptionListItem term="Access role">{r.accessGroup}</DescriptionListItem>
              <DescriptionListItem term="BRD location">
                <a className="ds-inv__link" href={r.brdLocation} target="_blank" rel="noopener noreferrer">
                  {`SharePoint › ${r.department}`}
                  <ExternalLink aria-hidden="true" />
                </a>
              </DescriptionListItem>
              <DescriptionListItem term="Last run">
                {r.lastRun ? new Date(r.lastRun).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never — still being built'}
              </DescriptionListItem>
              <DescriptionListItem term="Refresh">{r.refresh}</DescriptionListItem>
              <DescriptionListItem term="Tier">{`Tier ${r.tier}`}</DescriptionListItem>
              <DescriptionListItem term="Classification">{r.classification}</DescriptionListItem>
              <DescriptionListItem term="Version">{`v${r.version}`}</DescriptionListItem>
              <DescriptionListItem term="Evergreen">
                {`${r.evergreen.cadence} · last certified ${fmtIso(r.evergreen.lastCertified)} · due ${fmtIso(r.evergreen.due)}`}
              </DescriptionListItem>
              {r.replacedBy && <DescriptionListItem term="Replaced by">{r.replacedBy}</DescriptionListItem>}
            </DescriptionList>
            {owner && (
              <Button id="ds-irm-rec-certify" style="outline" label="Certify this report" IconLeft={ShieldCheck} onClick={() => irm.certify(r.number)} className="ds-irm-gap-top" />
            )}
          </TabsContent>

          <TabsContent value="controls">
            <Table id="ds-irm-rec-ctl-table" label="Controls">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Control</TableHeaderCell>
                  <TableHeaderCell>Cadence</TableHeaderCell>
                  <TableHeaderCell>Last attested</TableHeaderCell>
                  <TableHeaderCell>Due</TableHeaderCell>
                  <TableHeaderCell>State</TableHeaderCell>
                  <TableHeaderCell align="end">
                    <span className="ui-table__sr-only">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.controlItems.map((c) => {
                  const inReview = state.irm.attestations.some((a) => a.controlId === c.id && a.outcome === 'pending');
                  const s = controlState(c, today, inReview);
                  const count = state.irm.attestations.filter((a) => a.controlId === c.id).length;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{`Every ${c.cadenceDays} days`}</TableCell>
                      <TableCell>{c.lastAttested ? fmtIso(c.lastAttested) : '—'}</TableCell>
                      <TableCell>{fmtIso(c.due)}</TableCell>
                      <TableCell>
                        <StateLabel id={`ds-irm-ctl-${c.id}`} label={CONTROL_STATE[s].label} tone={CONTROL_STATE[s].tone} />
                      </TableCell>
                      <TableCell align="end">
                        <Stack level={5} direction="horizontal" justify="end">
                          <Button id={`ds-irm-ctl-${c.id}-history`} size="sm" style="ghost" label={`History (${count})`} onClick={() => setHistoryOf(c.id)} />
                          {/* Due, late, never attested — or inside the 30 days before it falls due. */}
                          {(governance || owner) && !inReview && c.kind !== 'data-quality' && (s !== 'ok' || daysBetween(today, c.due) <= 30) && (
                            <Button id={`ds-irm-ctl-${c.id}-attest`} size="sm" style="outline" label="Attest" onClick={() => setAttesting(c.id)} />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {attestingCtl && <AttestDialog record={r} control={attestingCtl} open onClose={() => setAttesting(null)} />}
            <ControlHistory record={r} control={historyCtl} open={!!historyCtl} onClose={() => setHistoryOf(null)} />
          </TabsContent>

          <TabsContent value="changes">
            {changes.length ? (
              <ChangeTable id="ds-irm-rec-changes" label="Changes" rows={changes} columns={['id', 'title', 'type', 'status', 'assignee', 'opened']} />
            ) : (
              <Text tone="muted">No change has been requested against this report.</Text>
            )}
          </TabsContent>

          <TabsContent value="incidents">
            {incidents.length ? (
              <Timeline connector aria-label="Incidents">
                {incidents.map((i) => (
                  <TimelineItem key={i.id} author={i.id} time={i.resolved ? `opened ${fmtIso(i.opened)} · resolved ${fmtIso(i.resolved)}` : `opened ${fmtIso(i.opened)} · open`} dateTime={i.opened}>
                    {i.summary}
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Text tone="muted">No incidents.</Text>
            )}
          </TabsContent>

          <TabsContent value="listings">
            {listings.length ? (
              <Table id="ds-irm-rec-listings" label="DartBoards listings">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Listing</TableHeaderCell>
                    <TableHeaderCell>Lifecycle</TableHeaderCell>
                    <TableHeaderCell>Health</TableHeaderCell>
                    <TableHeaderCell>What viewers see</TableHeaderCell>
                    <TableHeaderCell align="end">
                      <span className="ui-table__sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listings.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>
                        <StateLabel id={`ds-irm-l-${d.id}-lc`} label={d.lifecycle === 'published' ? 'Published' : d.lifecycle === 'archived' ? 'Archived' : d.lifecycle === 'under-review' ? 'Under review' : 'Draft'} tone="default" />
                      </TableCell>
                      <TableCell>
                        <StateLabel id={`ds-irm-l-${d.id}-h`} label={d.health === 'ok' ? 'OK' : d.health === 'unreachable' ? 'Unreachable' : 'Decommissioning'} tone={d.health === 'ok' ? 'default' : d.health === 'unreachable' ? 'error' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        <Text as="span" size="sm" tone="muted">
                          {[
                            d.retiring && `Retiring ${fmtIso(d.retiring.on)}`,
                            d.retired && 'Retired placeholder in spaces',
                            d.irmFlags?.incident && `Known issue: ${d.irmFlags.incident}`,
                            d.irmFlags?.controlsOverdue && 'Controls overdue',
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Nothing — it is healthy'}
                        </Text>
                      </TableCell>
                      <TableCell align="end">
                        <Button id={`ds-irm-l-${d.id}-open`} size="sm" style="ghost" label="Open in DartBoards" IconRight={ExternalLink} onClick={() => go({ page: 'dashboard', id: d.id })} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Text tone="muted">{r.lifecycle === 'production' ? 'Not listed in DartBoards yet. A developer can request it from DART Central › New request.' : 'Not in production, so it cannot be listed yet.'}</Text>
            )}
          </TabsContent>
          <TabsContent value="lineage">
            <LineageView record={r} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTable id="ds-irm-rec-audit" rows={state.irm.audit.filter((e) => e.record === r.number)} showRecord={false} />
          </TabsContent>
        </Tabs>
      </Stack>
    </PageContainer>
  );
}
