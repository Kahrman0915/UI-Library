/* R3 · DASHBOARD REQUEST — four modes behind Tabs (R3.1 Add · R3.2 Edit ·
   R3.3 Promote · R3.4 Remove). Each tab is a different form, so switching with
   anything entered asks "Discard your changes?" first. Edit, Promote and Remove
   are GATED: nothing below the picker exists until a dashboard is chosen. */

import { useState } from 'react';
import { CirclePlus, LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../components/AlertDialog';
import Alert from '../../../../components/Alert';
import Button from '../../../../components/Button';
import Combobox from '../../../../components/Combobox';
import DatePicker from '../../../../components/DatePicker';
import Input from '../../../../components/Input';
import Select, { SelectContent, SelectItem, SelectTrigger } from '../../../../components/Select';
import Separator from '../../../../components/Separator';
import Switch from '../../../../components/Switch';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../../../../components/Tabs';
import Textarea from '../../../../components/Textarea';
import { useSuite } from '../../store';
import type { Dashboard, DashboardRequestMode, FieldChange } from '../../types';
import { FormShell, Row, fmtDate, useSubmission } from './shared';

const CATEGORIES = ['Operations', 'Finance', 'Sales', 'Customer', 'Risk', 'Collections'];
const ACCESS_ROLES = ['All authenticated users', 'Restricted · by request', 'DART Central admins only'];

/** "Current:" values the Edit tab shows under each label. Derived dummy data. */
const currentOf = (d: Dashboard) => ({
  name: d.name,
  project: d.owner === 'Priya Raman' ? 'Collateral' : 'Servicing',
  description: d.description,
  url: `https://tableau.example.com/views/${d.id}`,
  params: `?env=prod&team=${d.category.toLowerCase()}`,
  category: d.category,
  subcategory: d.category === 'Operations' ? 'Servicing' : 'Reporting',
  tags: d.tags.length ? d.tags.join(', ').toLowerCase() : d.category.toLowerCase(),
  developer: d.owner,
  inventory: `IRM-${4400 + d.name.length * 7}`,
  access: ACCESS_ROLES[0],
});

type AddState = {
  name: string;
  project: string;
  description: string;
  url: string;
  params: string;
  category: string;
  subcategory: string;
  tags: string;
  developer: string;
  inventory: string;
  access: string;
  toolbar: boolean;
  tabs: boolean;
  beta: boolean;
};

const EMPTY_ADD: AddState = {
  name: '',
  project: '',
  description: '',
  url: '',
  params: '',
  category: '',
  subcategory: '',
  tags: '',
  developer: '',
  inventory: '',
  access: '',
  toolbar: true,
  tabs: false,
  beta: false,
};

type Gated = { dashboardId: string; start: Date | null; end: Date | null; reason: string };
const EMPTY_GATED: Gated = { dashboardId: '', start: null, end: null, reason: '' };

const LABELS: Record<Exclude<keyof AddState, 'toolbar' | 'tabs' | 'beta'>, string> = {
  name: 'Dashboard name',
  project: 'Project name',
  description: 'Description',
  url: 'URL',
  params: 'URL parameters',
  category: 'Category',
  subcategory: 'Sub-category',
  tags: 'Tags',
  developer: 'Developer name',
  inventory: 'Inventory number',
  access: 'Access role',
};

/** Diff field names the admin "apply" step understands (store.applyRequest). */
const CHANGE_FIELD: Partial<Record<keyof AddState, string>> = { name: 'Name', description: 'Description', developer: 'Owner' };

const MODES: { value: DashboardRequestMode; label: string; Icon: typeof Plus }[] = [
  { value: 'add', label: 'Add', Icon: Plus },
  { value: 'edit', label: 'Edit', Icon: Pencil },
  { value: 'promote', label: 'Promote', Icon: CirclePlus },
  { value: 'remove', label: 'Remove', Icon: Trash2 },
];

export function DashboardForm({ initialMode = 'add' }: { initialMode?: DashboardRequestMode }) {
  const { state } = useSuite();
  const { phase, submit } = useSubmission();
  const [mode, setMode] = useState<DashboardRequestMode>(initialMode);
  const [add, setAdd] = useState<AddState>(EMPTY_ADD);
  const [edit, setEdit] = useState<AddState>({ ...EMPTY_ADD, toolbar: false });
  const [gated, setGated] = useState<Gated>(EMPTY_GATED);
  const [pendingMode, setPendingMode] = useState<DashboardRequestMode | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const dashboards = state.dashboards.filter((d) => d.lifecycle !== 'archived');
  const options = dashboards.map((d) => ({ value: d.id, label: d.name }));
  const picked = dashboards.find((d) => d.id === gated.dashboardId);
  const current = picked ? currentOf(picked) : null;

  const addKeys = Object.keys(LABELS) as (keyof typeof LABELS)[];
  const editFilled = addKeys.filter((k) => (edit[k] as string).trim());

  const dirty =
    mode === 'add'
      ? addKeys.some((k) => (add[k] as string).trim()) || add.tabs || add.beta || !add.toolbar
      : !!gated.dashboardId || !!gated.reason.trim() || !!gated.start || !!gated.end || editFilled.length > 0;

  const ready =
    mode === 'add'
      ? ['name', 'project', 'description', 'url', 'category', 'developer', 'access'].every((k) => (add[k as keyof AddState] as string).trim())
      : mode === 'edit'
        ? !!picked
        : mode === 'promote'
          ? !!picked && !!gated.start && !!gated.reason.trim()
          : !!picked && !!gated.reason.trim();

  const switchMode = (next: string) => {
    if (next === mode || phase === 'submitting') return;
    if (dirty) setPendingMode(next as DashboardRequestMode);
    else setMode(next as DashboardRequestMode);
  };

  const discardAndSwitch = () => {
    setAdd(EMPTY_ADD);
    setEdit({ ...EMPTY_ADD, toolbar: false });
    setGated(EMPTY_GATED);
    if (pendingMode) setMode(pendingMode);
    setPendingMode(null);
  };

  const doSubmit = () => {
    if (mode === 'add') {
      const fields = addKeys.filter((k) => (add[k] as string).trim()).map((k) => ({ label: LABELS[k], value: add[k] as string }));
      fields.push(
        { label: 'Show toolbar', value: add.toolbar ? 'Yes' : 'No' },
        { label: 'Show tabs', value: add.tabs ? 'Yes' : 'No' },
        { label: 'Beta / preview', value: add.beta ? 'Yes' : 'No' },
      );
      return submit({
        type: 'dashboard-add',
        product: 'DARTBoards',
        title: `Add ${add.name.trim()} to the library`,
        summary: `Request to add the ${add.name.trim()} dashboard to the Dartboards library.`,
        fields,
      });
    }
    if (!picked || !current) return;
    if (mode === 'edit') {
      const changes: FieldChange[] = editFilled.map((k) => ({
        field: CHANGE_FIELD[k] ?? LABELS[k],
        current: current[k],
        proposed: (edit[k] as string).trim(),
      }));
      return submit(
        {
          type: 'dashboard-edit',
          product: 'DARTBoards',
          title: `Update ${picked.name}`,
          summary: changes.length ? `Changes to ${changes.map((c) => c.field.toLowerCase()).join(', ')}.` : 'No field changes proposed.',
          fields: [{ label: 'Dashboard', value: picked.name }, ...editFilled.map((k) => ({ label: LABELS[k], value: (edit[k] as string).trim() }))],
          changes,
        },
        picked.id,
      );
    }
    if (mode === 'promote') {
      const window = `${fmtDate(gated.start)}${gated.end ? ` – ${fmtDate(gated.end)}` : ''}`;
      return submit(
        {
          type: 'dashboard-promote',
          product: 'DARTBoards',
          title: `Promote ${picked.name}`,
          summary: `Highlighted on the browse page, ${window}.`,
          fields: [
            { label: 'Dashboard', value: picked.name },
            { label: 'Starts', value: fmtDate(gated.start) },
            ...(gated.end ? [{ label: 'Ends', value: fmtDate(gated.end) }] : []),
            { label: 'Reason for promotion', value: gated.reason.trim() },
          ],
        },
        picked.id,
      );
    }
    return submit(
      {
        type: 'dashboard-remove',
        product: 'DARTBoards',
        title: `Remove ${picked.name}`,
        summary: gated.reason.trim(),
        fields: [
          { label: 'Dashboard', value: picked.name },
          { label: 'Reason', value: gated.reason.trim() },
          ...(gated.end ? [{ label: 'Proposed removal date', value: fmtDate(gated.end) }] : []),
        ],
      },
      picked.id,
    );
  };

  const onSubmit = () => (mode === 'remove' && phase !== 'failed' ? setConfirmRemove(true) : doSubmit());

  const setA = (k: keyof AddState) => (v: string) => setAdd((s) => ({ ...s, [k]: v }));
  const setE = (k: keyof AddState) => (v: string) => setEdit((s) => ({ ...s, [k]: v }));

  const picker = (
    <Combobox
      id={`ds-req-dash-${mode}-picker`}
      label="Select dashboard"
      required
      placeholder="Select…"
      searchPlaceholder="Search dashboards…"
      emptyMessage="No dashboards match."
      options={options}
      value={gated.dashboardId || undefined}
      onValueChange={(v) => setGated((g) => ({ ...g, dashboardId: v }))}
    />
  );

  /** Shared Add / Edit field set. In Edit every field is optional and shows its current value. */
  const identityFields = (s: AddState, set: (k: keyof AddState) => (v: string) => void, isEdit: boolean) => {
    const cur = (k: keyof ReturnType<typeof currentOf>) => (isEdit && current ? `Current: ${current[k]}` : undefined);
    const ph = (example: string) => (isEdit ? 'Leave blank to keep' : example);
    const p = isEdit ? 'edit' : 'add';
    return (
      <>
        <Separator label="IDENTITY" />
        <Input
          id={`ds-req-${p}-name`}
          label="Dashboard name"
          required={!isEdit}
          description={cur('name') ?? 'Must match IRM exactly.'}
          placeholder={ph('e.g. Originations Daily Volume')}
          value={s.name}
          onValueChange={set('name')}
        />
        <Input
          id={`ds-req-${p}-project`}
          label="Project name"
          required={!isEdit}
          description={cur('project') ?? 'The project or team it belongs to.'}
          placeholder={ph('e.g. FCPS, Collections…')}
          value={s.project}
          onValueChange={set('project')}
        />
        <Textarea
          id={`ds-req-${p}-description`}
          label="Description"
          required={!isEdit}
          description={cur('description') ?? 'What does this dashboard show and who is it for?'}
          placeholder={ph('e.g. Daily origination volume by channel, for the Collections team.')}
          value={s.description}
          onValueChange={set('description')}
          rows={3}
        />
        <Separator label="LOCATION" />
        <Input id={`ds-req-${p}-url`} label="URL" required={!isEdit} description={cur('url')} placeholder={ph('https://…')} value={s.url} onValueChange={set('url')} />
        <Input
          id={`ds-req-${p}-params`}
          label="URL parameters"
          description={cur('params')}
          placeholder={ph('?env=prod&team=example')}
          value={s.params}
          onValueChange={set('params')}
        />
        <Separator label="CLASSIFICATION" />
        <Row>
          <Select id={`ds-req-${p}-category`} label="Category" required={!isEdit} description={cur('category')} value={s.category || undefined} onValueChange={set('category')}>
            <SelectTrigger placeholder="Select…" />
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} label={c} />
              ))}
            </SelectContent>
          </Select>
          <Input
            id={`ds-req-${p}-subcategory`}
            label="Sub-category"
            description={cur('subcategory')}
            placeholder={ph('e.g. Originations, Servicing…')}
            value={s.subcategory}
            onValueChange={set('subcategory')}
          />
        </Row>
        <Input
          id={`ds-req-${p}-tags`}
          label="Tags"
          description={cur('tags') ?? 'Separate multiple tags with commas.'}
          placeholder={ph('e.g. originations, daily, ops')}
          value={s.tags}
          onValueChange={set('tags')}
        />
        <Separator label="OWNERSHIP & ACCESS" />
        <Row>
          <Input
            id={`ds-req-${p}-developer`}
            label="Developer name"
            required={!isEdit}
            description={cur('developer')}
            placeholder={ph('e.g. Jordan Mount')}
            value={s.developer}
            onValueChange={set('developer')}
          />
          <Input
            id={`ds-req-${p}-inventory`}
            label="Inventory number"
            description={cur('inventory')}
            placeholder={ph('Asset or tracking ID')}
            value={s.inventory}
            onValueChange={set('inventory')}
          />
        </Row>
        <Select id={`ds-req-${p}-access`} label="Access role" required={!isEdit} description={cur('access')} value={s.access || undefined} onValueChange={set('access')}>
          <SelectTrigger placeholder="Select…" />
          <SelectContent>
            {ACCESS_ROLES.map((c) => (
              <SelectItem key={c} value={c} label={c} />
            ))}
          </SelectContent>
        </Select>
      </>
    );
  };

  return (
    <FormShell
      id="ds-req-dash"
      crumb="Dashboard Request"
      title="Dashboard Request"
      Icon={LayoutGrid}
      color="info"
      ready={ready}
      phase={phase}
      dirty={dirty}
      onSubmit={onSubmit}
    >
      <Tabs id="ds-req-dash-tabs" className="ds-requests-tabs" value={mode} onValueChange={switchMode} activationMode="manual">
        <TabsList aria-label="Dashboard request type">
          {MODES.map(({ value, label, Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon aria-hidden="true" size={16} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="add">
          <div className="ds-requests-fields">
            {identityFields(add, setA, false)}
            <Separator label="DISPLAY OPTIONS" />
            <Switch
              id="ds-req-add-toolbar"
              label="Show toolbar"
              description="Display the Tableau toolbar when viewing this dashboard."
              checked={add.toolbar}
              onCheckedChange={(v) => setAdd((s) => ({ ...s, toolbar: v }))}
            />
            <Switch
              id="ds-req-add-tabs"
              label="Show tabs"
              description="Display panel tabs if the dashboard uses tab navigation."
              checked={add.tabs}
              onCheckedChange={(v) => setAdd((s) => ({ ...s, tabs: v }))}
            />
            <Switch
              id="ds-req-add-beta"
              label="Beta / preview"
              description="Mark this dashboard as a beta release with a preview badge."
              checked={add.beta}
              onCheckedChange={(v) => setAdd((s) => ({ ...s, beta: v }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <div className="ds-requests-fields">
            {picker}
            {picked && (
              <>
                <Alert
                  id="ds-req-edit-note"
                  description={`Editing ${picked.name}. Only fill in the fields you want to change, and leave the rest blank.`}
                />
                {identityFields(edit, setE, true)}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="promote">
          <div className="ds-requests-fields">
            <Alert id="ds-req-promote-note" description="Promoting a dashboard adds a highlighted badge on the Dartboards browse page so users notice it." />
            {picker}
            {picked && (
              <>
                <Row>
                  <DatePicker
                    id="ds-req-promote-start"
                    label="Promotion start date"
                    required
                    placeholder="mm/dd/yyyy"
                    formatValue={fmtDate}
                    value={gated.start}
                    onValueChange={(d) => setGated((g) => ({ ...g, start: d }))}
                  />
                  <DatePicker
                    id="ds-req-promote-end"
                    label="Promotion end date"
                    placeholder="mm/dd/yyyy"
                    formatValue={fmtDate}
                    min={gated.start ?? undefined}
                    value={gated.end}
                    onValueChange={(d) => setGated((g) => ({ ...g, end: d }))}
                  />
                </Row>
                <Textarea
                  id="ds-req-promote-reason"
                  label="Reason for promotion"
                  required
                  description="Why should this dashboard be highlighted, and what should users know about it?"
                  placeholder="e.g. Q3 collateral coverage is a board metric this quarter."
                  rows={3}
                  value={gated.reason}
                  onValueChange={(v) => setGated((g) => ({ ...g, reason: v }))}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="remove">
          <div className="ds-requests-fields">
            <Alert
              id="ds-req-remove-note"
              description="Removing a dashboard deletes it from the Dartboards library. Anyone who has added it to a space will see a broken tile until they remove it."
            />
            {picker}
            {picked && (
              <>
                <Textarea
                  id="ds-req-remove-reason"
                  label="Reason for removal"
                  required
                  description="Why is this dashboard being removed?"
                  placeholder="e.g. Superseded by v2, live since July."
                  rows={3}
                  value={gated.reason}
                  onValueChange={(v) => setGated((g) => ({ ...g, reason: v }))}
                />
                <DatePicker
                  id="ds-req-remove-date"
                  label="Proposed removal date"
                  placeholder="mm/dd/yyyy"
                  formatValue={fmtDate}
                  value={gated.end}
                  onValueChange={(d) => setGated((g) => ({ ...g, end: d }))}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog id="ds-req-dash-switch" open={pendingMode !== null} onClose={() => setPendingMode(null)}>
        <AlertDialogHeader id="ds-req-dash-switch-header" title="Discard your changes?" />
        <AlertDialogBody>Switching request type clears the form. The details you’ve entered won’t be saved.</AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-req-dash-switch-keep" style="ghost" label="Keep editing" onClick={() => setPendingMode(null)} />
          <Button id="ds-req-dash-switch-discard" variant="error" label="Discard changes" onClick={discardAndSwitch} />
        </AlertDialogFooter>
      </AlertDialog>

      <AlertDialog id="ds-req-remove-confirm" open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <AlertDialogHeader id="ds-req-remove-confirm-header" title="Submit a removal request?" />
        <AlertDialogBody>
          The DART Central admin team will review this. Once approved, “{picked?.name}” is removed from the library permanently.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-req-remove-confirm-cancel" style="ghost" label="Cancel" onClick={() => setConfirmRemove(false)} />
          <Button
            id="ds-req-remove-confirm-go"
            variant="error"
            label="Submit removal request"
            onClick={() => {
              setConfirmRemove(false);
              doSubmit();
            }}
          />
        </AlertDialogFooter>
      </AlertDialog>
    </FormShell>
  );
}
