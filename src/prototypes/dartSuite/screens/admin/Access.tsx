/* DART Central · Admin · 6 CONFIGURE — Access Control.

   Figma: Admin Flow 6.1 Access Control (two tables; the adds sit on the section
   headers, one per table) · 6.1a row menu (Edit scope · Revoke admin) ·
   6.1b edit admin drawer. Platform-admin only.

   Admins are `state.admins`. Request access has no store field yet, so it rides
   on the state object through a cast (see the area report). */

import { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import Avatar from '../../../../components/Avatar';
import Button from '../../../../components/Button';
import Checkbox from '../../../../components/Checkbox';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import Empty, { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import { toast } from '../../../../components/Toast';
import { ShieldAlert } from 'lucide-react';
import { ME, PEOPLE, personById } from '../../data';
import { today, useSuite } from '../../store';
import type { SuiteState } from '../../store';
import type { Admin, AdminScope, Product } from '../../types';
import { ConfirmDialog, Kpi, PRODUCT_LABEL, ToneBadge } from './shared';
import './Admin.scss';

type Level = 'Standard' | 'Contributor' | 'Publisher';
type Grant = { personId: string; level: Level; grantedBy: string };

const MAY_FILE: Record<Level, string> = {
  Standard: 'General only · the default for everyone',
  Contributor: 'General · Dashboard (add, promote, remove)',
  Publisher: 'General · Dashboard · Banner / Notice',
};

const SEED_GRANTS: Grant[] = [
  { personId: 'u-jl', level: 'Contributor', grantedBy: 'Priya Raman' },
  { personId: 'u-pr', level: 'Publisher', grantedBy: ME.name },
  { personId: 'u-so', level: 'Contributor', grantedBy: ME.name },
  { personId: 'u-mh', level: 'Publisher', grantedBy: ME.name },
  { personId: 'u-dw', level: 'Standard', grantedBy: 'Default' },
];

type WithGrants = SuiteState & { requestAccess?: Grant[] };

const ROLE_LABEL: Record<AdminScope, string> = { overall: 'Platform admin', sub: 'Sub admin', application: 'Application admin' };
const ALL_PRODUCTS: Product[] = ['DART Central', 'DARTBoards', 'Aiden'];

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function AdminAccess() {
  const { state, update, logActivity } = useSuite();
  const grants = (state as WithGrants).requestAccess ?? SEED_GRANTS;

  const [adminDrawer, setAdminDrawer] = useState<{ personId: string | null } | null>(null);
  const [draft, setDraft] = useState<{ personId: string; role: AdminScope; products: Product[] }>({ personId: '', role: 'sub', products: [] });
  const [revoke, setRevoke] = useState<Admin | null>(null);
  const [grantDrawer, setGrantDrawer] = useState<{ personId: string | null } | null>(null);
  const [grantDraft, setGrantDraft] = useState<{ personId: string; level: Level }>({ personId: '', level: 'Standard' });

  if (state.adminScope !== 'overall') {
    return (
      <PageContainer width="narrow">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlert />
            </EmptyMedia>
            <EmptyTitle>Access Control is platform-admin only</EmptyTitle>
            <EmptyDescription>It is the one page that can widen someone’s reach. Switch to Overall admin from the account menu to see it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PageContainer>
    );
  }

  const nonAdmins = PEOPLE.filter((p) => !state.admins.some((a) => a.personId === p.id));

  const openAdmin = (a: Admin | null) => {
    setDraft(a ? { personId: a.personId, role: a.role, products: [...a.products] } : { personId: nonAdmins[0]?.id ?? '', role: 'application', products: ['Aiden'] });
    setAdminDrawer({ personId: a?.personId ?? null });
  };

  const saveAdmin = () => {
    if (!draft.personId || draft.products.length === 0) return;
    const editing = adminDrawer?.personId;
    const name = personById(draft.personId).name;
    update((s) => {
      const existing = s.admins.find((a) => a.personId === draft.personId);
      if (existing) Object.assign(existing, { role: draft.role, products: draft.products });
      else s.admins.push({ personId: draft.personId, role: draft.role, products: draft.products, grantedAt: today() });
    });
    logActivity(editing ? 'changed admin scope for' : 'granted admin to', `${name} · ${draft.products.map((p) => PRODUCT_LABEL[p]).join(', ')}`);
    toast.success(editing ? 'Admin scope saved' : 'Admin added', { description: `${name} administers ${draft.products.map((p) => PRODUCT_LABEL[p]).join(', ')}.` });
    setAdminDrawer(null);
  };

  const openGrant = (g: Grant | null) => {
    const free = PEOPLE.filter((p) => !grants.some((x) => x.personId === p.id));
    setGrantDraft(g ? { personId: g.personId, level: g.level } : { personId: free[0]?.id ?? PEOPLE[0].id, level: 'Contributor' });
    setGrantDrawer({ personId: g?.personId ?? null });
  };

  const saveGrant = () => {
    const name = personById(grantDraft.personId).name;
    update((s) => {
      const list = [...((s as WithGrants).requestAccess ?? SEED_GRANTS)];
      const i = list.findIndex((g) => g.personId === grantDraft.personId);
      const next: Grant = { personId: grantDraft.personId, level: grantDraft.level, grantedBy: ME.name };
      if (i >= 0) list[i] = next;
      else list.push(next);
      (s as WithGrants).requestAccess = list;
    });
    logActivity('set request access for', `${name} · ${grantDraft.level}`);
    toast.success('Request access saved', { description: `${name} is ${grantDraft.level}: ${MAY_FILE[grantDraft.level]}.` });
    setGrantDrawer(null);
  };

  return (
    <PageContainer>
      <PageHeader
        id="ds-ac-header"
        title="Access Control"
        description="Who administers what, and who is allowed to file which kind of request. This page is platform-admin only, because it’s the one place that can widen someone’s reach."
        actions={<Kpi id="ds-ac-kpi" value={state.admins.length} label="Admins" hint={`${grants.length} requesters`} tone="info" />}
      />
      <Stack level={2}>
        <Section
          id="ds-ac-admins"
          heading="Admins · who can administer what"
          variant="group"
          actions={<Button id="ds-ac-add-admin" size="sm" style="outline" label="Add admin" IconLeft={Plus} disabled={nonAdmins.length === 0} onClick={() => openAdmin(null)} />}
        >
          <Table id="ds-ac-admin-table" label="Admins">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Person</TableHeaderCell>
                <TableHeaderCell>Administers</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Since</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.admins.map((a) => {
                const p = personById(a.personId);
                const self = a.personId === ME.id;
                return (
                  <TableRow key={a.personId}>
                    <TableCell>
                      <span className="ds-admin-person">
                        <Avatar id={`ds-ac-av-${a.personId}`} size="xs" fallback={initials(p.name)} />
                        {p.name}
                        {self && <span className="ds-muted">(you)</span>}
                      </span>
                    </TableCell>
                    <TableCell>{a.products.map((x) => PRODUCT_LABEL[x]).join(' · ')}</TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-ac-role-${a.personId}`} label={ROLE_LABEL[a.role]} tone={a.role === 'overall' ? 'info' : 'neutral'} />
                    </TableCell>
                    <TableCell>{a.grantedAt}</TableCell>
                    <TableCell actions>
                      <DropdownMenu id={`ds-ac-menu-${a.personId}`}>
                        <DropdownMenuTrigger>
                          <Button id={`ds-ac-more-${a.personId}`} style="ghost" size="sm" iconOnly IconCenter={MoreHorizontal} aria-label={`Actions for ${p.name}`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAdmin(a)}>Edit scope</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" disabled={self} onClick={() => setRevoke(a)}>
                            {self ? 'Revoke admin (not yourself)' : 'Revoke admin'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="ds-muted">An admin sees only the products they administer. The navigation and the queue are scoped by this table and nothing else.</p>
        </Section>

        <Section
          id="ds-ac-requests"
          heading="Request access · who may file what"
          variant="group"
          actions={<Button id="ds-ac-grant" size="sm" style="outline" label="Grant request access" IconLeft={Plus} onClick={() => openGrant(null)} />}
        >
          <Table id="ds-ac-grant-table" label="Request access">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Person</TableHeaderCell>
                <TableHeaderCell>Level</TableHeaderCell>
                <TableHeaderCell>May file</TableHeaderCell>
                <TableHeaderCell>Granted by</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grants.map((g) => {
                const p = personById(g.personId);
                return (
                  <TableRow key={g.personId}>
                    <TableCell>
                      <span className="ds-admin-person">
                        <Avatar id={`ds-ac-gav-${g.personId}`} size="xs" fallback={initials(p.name)} />
                        {p.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-ac-lvl-${g.personId}`} label={g.level} tone={g.level === 'Publisher' ? 'info' : g.level === 'Contributor' ? 'success' : 'neutral'} />
                    </TableCell>
                    <TableCell>{MAY_FILE[g.level]}</TableCell>
                    <TableCell>{g.grantedBy}</TableCell>
                    <TableCell actions>
                      <Button id={`ds-ac-gedit-${g.personId}`} style="ghost" size="sm" label="Change level" onClick={() => openGrant(g)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="ds-muted">
            Three levels, in deliberate order. Standard is everyone. Contributor adds dashboard requests. Publisher adds Banner / Notice, because a banner displays to every
            user of that product.
          </p>
        </Section>
      </Stack>

      {/* 6.1b — edit admin */}
      <Drawer id="ds-ac-drawer" open={!!adminDrawer} onClose={() => setAdminDrawer(null)}>
        <DrawerHeader
          id="ds-ac-drawer-header"
          title={adminDrawer?.personId ? 'Edit admin' : 'Add admin'}
          description="Direct edit, no request. Recorded in Activity under your name."
          onClose={() => setAdminDrawer(null)}
        />
        <DrawerBody>
          <Stack level={3}>
            <NativeSelect
              id="ds-ac-f-person"
              label="Person"
              value={draft.personId}
              disabled={!!adminDrawer?.personId}
              onValueChange={(v) => setDraft({ ...draft, personId: v })}
            >
              {(adminDrawer?.personId ? PEOPLE : nonAdmins).map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect id="ds-ac-f-role" label="Role" value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as AdminScope })}>
              {(Object.keys(ROLE_LABEL) as AdminScope[]).map((r) => (
                <NativeSelectOption key={r} value={r}>
                  {ROLE_LABEL[r]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <fieldset className="ds-admin-fieldset">
              <legend className="ds-text">Administers</legend>
              {ALL_PRODUCTS.map((p) => (
                <Checkbox
                  key={p}
                  id={`ds-ac-f-${p}`}
                  label={PRODUCT_LABEL[p]}
                  checked={draft.products.includes(p)}
                  onCheckedChange={(c) => setDraft({ ...draft, products: c ? [...draft.products, p] : draft.products.filter((x) => x !== p) })}
                />
              ))}
              {draft.products.length === 0 && <p className="ds-admin-error">Pick at least one product.</p>}
            </fieldset>
            <p className="ds-muted">Widening someone’s reach is the one change this page can make that nothing else can undo for them. Activity records your name, the products added or removed, and when.</p>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-ac-cancel" style="ghost" label="Cancel" onClick={() => setAdminDrawer(null)} />
          <Button id="ds-ac-save" label={adminDrawer?.personId ? 'Save changes' : 'Add admin'} disabled={!draft.personId || draft.products.length === 0} onClick={saveAdmin} />
        </DrawerFooter>
      </Drawer>

      <Drawer id="ds-ac-gdrawer" open={!!grantDrawer} onClose={() => setGrantDrawer(null)}>
        <DrawerHeader
          id="ds-ac-gdrawer-header"
          title={grantDrawer?.personId ? 'Change request access' : 'Grant request access'}
          description="Direct edit, no request. Recorded in Activity under your name."
          onClose={() => setGrantDrawer(null)}
        />
        <DrawerBody>
          <Stack level={3}>
            <NativeSelect id="ds-ac-g-person" label="Person" value={grantDraft.personId} disabled={!!grantDrawer?.personId} onValueChange={(v) => setGrantDraft({ ...grantDraft, personId: v })}>
              {PEOPLE.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect id="ds-ac-g-level" label="Level" value={grantDraft.level} onValueChange={(v) => setGrantDraft({ ...grantDraft, level: v as Level })}>
              {(Object.keys(MAY_FILE) as Level[]).map((l) => (
                <NativeSelectOption key={l} value={l}>
                  {l}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <p className="ds-muted">May file: {MAY_FILE[grantDraft.level]}.</p>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-ac-gcancel" style="ghost" label="Cancel" onClick={() => setGrantDrawer(null)} />
          <Button id="ds-ac-gsave" label="Save" onClick={saveGrant} />
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        id="ds-ac-revoke"
        open={!!revoke}
        destructive
        title="Revoke admin access?"
        body={`${revoke ? personById(revoke.personId).name : ''} loses admin rights. The Approval Queue and every MANAGE page disappear from their navigation on their next page load. Their own requests, and their request-access level, are untouched.`}
        verb="Revoke access"
        onClose={() => setRevoke(null)}
        onConfirm={() => {
          if (!revoke) return;
          const name = personById(revoke.personId).name;
          update((s) => void (s.admins = s.admins.filter((a) => a.personId !== revoke.personId)));
          logActivity('revoked admin from', name);
          toast(`Admin revoked`, { description: name });
          setRevoke(null);
        }}
      />
    </PageContainer>
  );
}
