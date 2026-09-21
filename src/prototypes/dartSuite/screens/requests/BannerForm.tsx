/* R4 · BANNER / NOTICE — R4.1 no type selected · R4.1a standard message ·
   R4.1b custom message + call to action · R4.1c the scope menu.
   Rules from ③: picking a standard message LOCKS the banner type (severity
   belongs to the message); a blank start date means "as soon as approved";
   switching from a written custom message to standard asks first. */

import { useState } from 'react';
import { Bell, CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import Alert from '../../../../components/Alert';
import type { AlertVariant } from '../../../../components/Alert/Alert.types';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../components/AlertDialog';
import Button from '../../../../components/Button';
import Checkbox from '../../../../components/Checkbox';
import DatePicker from '../../../../components/DatePicker';
import Input from '../../../../components/Input';
import Label from '../../../../components/Label';
import RadioGroup, { RadioGroupItem } from '../../../../components/RadioGroup';
import Select, { SelectContent, SelectItem, SelectTrigger } from '../../../../components/Select';
import Separator from '../../../../components/Separator';
import Switch from '../../../../components/Switch';
import Textarea from '../../../../components/Textarea';
import { useSuite } from '../../store';
import { FormShell, Row, fmtDate, useSubmission } from './shared';
import { ScopeMultiSelect } from './ScopeMultiSelect';

type BannerType = 'info' | 'warning' | 'error' | 'success';

const TYPES: { value: BannerType; label: string }[] = [
  { value: 'info', label: 'Info · for your awareness' },
  { value: 'warning', label: 'Warning · action needed' },
  { value: 'error', label: 'Error · something is broken' },
  { value: 'success', label: 'Success · issue resolved' },
];

const TYPE_ICON = { info: Info, warning: TriangleAlert, error: CircleAlert, success: CircleCheck };

/** Pre-approved wording. Each message owns its severity. */
const STANDARD: { id: string; type: BannerType; name: string; title: string; text: string }[] = [
  { id: 'no-load', type: 'warning', name: 'Data won’t load · source system issue', title: 'Data isn’t loading right now', text: 'The source system is having issues. We’re working on it.' },
  { id: 'delayed', type: 'warning', name: 'Data is delayed · late refresh', title: 'Today’s data is delayed', text: 'The overnight refresh is running late. Numbers may be from yesterday.' },
  { id: 'outage', type: 'error', name: 'Dashboard unavailable · outage', title: 'This dashboard is unavailable', text: 'We’re aware of the problem and working on a fix.' },
  { id: 'maintenance', type: 'info', name: 'Scheduled maintenance', title: 'Scheduled maintenance', text: 'This dashboard may be briefly unavailable during the maintenance window.' },
  { id: 'new-metric', type: 'info', name: 'New metric added', title: 'A new metric is available', text: 'We’ve added a new metric to this dashboard. See the release notes for details.' },
  { id: 'resolved', type: 'success', name: 'Issue resolved', title: 'The issue is resolved', text: 'Data is loading normally again.' },
];

export function BannerForm() {
  const { state } = useSuite();
  const { phase, submit } = useSubmission();
  const [type, setType] = useState<BannerType | ''>('');
  const [scope, setScope] = useState<string[]>([]);
  const [source, setSource] = useState<'standard' | 'custom' | ''>('');
  const [standardId, setStandardId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [noEnd, setNoEnd] = useState(false);
  const [cta, setCta] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  const standard = STANDARD.find((m) => m.id === standardId);
  const options = state.dashboards.filter((d) => d.lifecycle !== 'archived').map((d) => ({ value: d.id, label: d.name }));
  const scopeNames = scope.map((id) => options.find((o) => o.value === id)?.label ?? id);
  const locked = source === 'standard' && !!standard;

  const previewTitle = source === 'standard' ? standard?.title : title.trim();
  const previewText = source === 'standard' ? standard?.text : message.trim();

  const dirty = !!(type || scope.length || source || title || message || start || end || noEnd || cta || ctaLabel || ctaUrl);
  const ready =
    !!type &&
    scope.length > 0 &&
    (source === 'standard' ? !!standard : source === 'custom' ? !!title.trim() && !!message.trim() : false) &&
    (!cta || (!!ctaLabel.trim() && !!ctaUrl.trim()));

  const pickSource = (v: string) => {
    if (v === source) return;
    // ⑤: only a written custom message is at risk when switching to standard.
    if (v === 'standard' && (title.trim() || message.trim())) return setConfirmSwitch(true);
    setSource(v as 'standard' | 'custom');
    if (v === 'custom') setStandardId('');
  };

  const onSubmit = () => {
    const typeLabel = TYPES.find((t) => t.value === type)!.label;
    const window = start || end ? `${start ? fmtDate(start) : 'on approval'} – ${noEnd ? 'no end date' : end ? fmtDate(end) : 'open'}` : 'from approval';
    submit({
      type: 'banner',
      product: 'DARTBoards',
      title: previewTitle ?? 'Banner / Notice',
      summary: `${typeLabel.split(' · ')[0]} banner, ${window}.`,
      fields: [
        { label: 'Banner type', value: typeLabel },
        { label: 'Scope', value: scopeNames.join(', ') },
        { label: 'Message source', value: source === 'standard' ? `Standard · ${standard?.name}` : 'Custom message' },
        { label: 'Banner title', value: previewTitle ?? '' },
        { label: 'Message', value: previewText ?? '' },
        { label: 'Starts', value: start ? fmtDate(start) : 'As soon as it is approved' },
        { label: 'Ends', value: noEnd ? 'No end date · an admin removes it manually' : end ? fmtDate(end) : 'Not set' },
        ...(cta ? [{ label: 'Call to action', value: `${ctaLabel.trim()} → ${ctaUrl.trim()}` }] : []),
      ],
    });
  };

  return (
    <FormShell id="ds-req-banner" crumb="Banner / Notice" title="Banner / Notice" Icon={Bell} color="warning" ready={ready} phase={phase} dirty={dirty} onSubmit={onSubmit}>
      <div className="ds-requests-fields">
        <Separator label="TARGETING" />
        <Row>
          <Select
            id="ds-req-banner-type"
            label="Banner type"
            required
            description={locked ? 'Set by the standard message.' : 'Sets the color and urgency.'}
            value={type || undefined}
            onValueChange={(v) => setType(v as BannerType)}
            disabled={locked}
          >
            <SelectTrigger placeholder="Select…" />
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} label={t.label} />
              ))}
            </SelectContent>
          </Select>
          <ScopeMultiSelect id="ds-req-banner-scope" options={options} selected={scope} onChange={setScope} />
        </Row>

        <Separator label="MESSAGE" />
        <RadioGroup id="ds-req-banner-source" aria-label="Message source" value={source || undefined} onValueChange={pickSource}>
          <RadioGroupItem
            id="ds-req-banner-source-standard"
            value="standard"
            label="Use a standard message"
            description="Pre-approved wording for common situations. Filtered to the banner type above."
          />
          <RadioGroupItem
            id="ds-req-banner-source-custom"
            value="custom"
            label="Write a custom message"
            description="Only when nothing standard fits. Custom wording takes longer to approve."
          />
        </RadioGroup>

        {source === 'standard' && (
          <Select
            id="ds-req-banner-standard"
            label="Standard message"
            required
            value={standardId || undefined}
            onValueChange={(v) => {
              setStandardId(v);
              // Type → message → type locks.
              setType(STANDARD.find((m) => m.id === v)!.type);
            }}
          >
            <SelectTrigger placeholder="Select…" />
            <SelectContent>
              {STANDARD.filter((m) => !type || locked || m.type === type).map((m) => (
                <SelectItem key={m.id} value={m.id} label={m.name} />
              ))}
            </SelectContent>
          </Select>
        )}

        {source === 'custom' && (
          <>
            <Input id="ds-req-banner-title" label="Banner title" required placeholder="e.g. Scheduled maintenance this Saturday" value={title} onValueChange={setTitle} />
            <Textarea
              id="ds-req-banner-message"
              label="Message"
              required
              rows={3}
              placeholder="e.g. 8:00 AM – 12:00 PM ET. Dashboards may be briefly unavailable."
              value={message}
              onValueChange={setMessage}
            />
          </>
        )}

        {previewTitle && previewText && (
          <div className="ds-requests-preview">
            <Label>Preview · what users will see</Label>
            <Alert
              id="ds-req-banner-preview"
              variant={(type || 'info') as AlertVariant}
              Icon={TYPE_ICON[type || 'info']}
              title={previewTitle}
              description={previewText}
              action={
                cta && ctaLabel.trim() ? (
                  <Button id="ds-req-banner-preview-cta" style="outline" size="sm" label={ctaLabel.trim()} onClick={() => window.open(ctaUrl.trim() || 'about:blank', '_blank', 'noopener')} />
                ) : undefined
              }
            />
          </div>
        )}

        <Separator label="SCHEDULE" />
        <Row>
          <DatePicker
            id="ds-req-banner-start"
            label="Start date"
            description="Leave blank to publish as soon as it is approved."
            placeholder="mm/dd/yyyy"
            formatValue={fmtDate}
            value={start}
            onValueChange={setStart}
          />
          <DatePicker
            id="ds-req-banner-end"
            label="End date"
            description={noEnd ? 'An admin removes it manually.' : 'Optional.'}
            placeholder="mm/dd/yyyy"
            formatValue={fmtDate}
            min={start ?? undefined}
            disabled={noEnd}
            value={noEnd ? null : end}
            onValueChange={setEnd}
          />
        </Row>
        <Checkbox id="ds-req-banner-noend" label="No end date · an admin removes it manually" checked={noEnd} onCheckedChange={setNoEnd} />

        <Separator label="CALL TO ACTION" />
        <Switch
          id="ds-req-banner-cta"
          label="Add a call-to-action button"
          description="Adds a clickable button to the banner for links or actions."
          checked={cta}
          onCheckedChange={setCta}
        />
        {cta && (
          <Row>
            <Input id="ds-req-banner-cta-label" label="Button label" required placeholder="e.g. View status page" value={ctaLabel} onValueChange={setCtaLabel} />
            <Input id="ds-req-banner-cta-url" label="Button URL" required type="url" placeholder="https://…" value={ctaUrl} onValueChange={setCtaUrl} />
          </Row>
        )}
      </div>

      <AlertDialog id="ds-req-banner-switch" open={confirmSwitch} onClose={() => setConfirmSwitch(false)}>
        <AlertDialogHeader id="ds-req-banner-switch-header" title="Discard your custom message?" />
        <AlertDialogBody>Switching to a standard message replaces what you’ve written. Your custom title and message won’t be saved.</AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-req-banner-switch-keep" style="ghost" label="Keep editing" onClick={() => setConfirmSwitch(false)} />
          <Button
            id="ds-req-banner-switch-go"
            variant="error"
            label="Discard and switch"
            onClick={() => {
              setTitle('');
              setMessage('');
              setSource('standard');
              setConfirmSwitch(false);
            }}
          />
        </AlertDialogFooter>
      </AlertDialog>
    </FormShell>
  );
}
