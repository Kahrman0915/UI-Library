/* The Builder's ITEM panel — the settings of whatever is selected on the canvas,
   in the same side panel as the library (owner, 2026-10-01: "everything you need
   to build your space is right there in one place"). It replaces every dialog the
   Builder had: a metric's view, a note's words, a divider's label, a link list,
   a KPI strip's metrics, a card's style and its section heading.

   Nothing here has a Save button. Toggles and checkboxes apply as you change
   them; text applies when you leave the field (or press Enter), so typing is one
   undo step, not one per key. The panel's status line says what changed. */

import { ChevronLeft, CopyPlus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Input from '../../../../../components/Input';
import Label from '../../../../../components/Label';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import Textarea from '../../../../../components/Textarea';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Text from '../../../../../components/Text';
import type { SuiteState } from '../../../store';
import type { MetricView, SpaceBlock, SpaceCardLayout, SpaceItem } from '../../../types';
import { BREAKDOWN_LABEL, TIMEFRAME_LABEL } from '../space/MetricViewCard';

const GRAIN_TO_TIMEFRAME = { day: 'day', week: 'week', month: 'mtd' } as const;

/** A text field that applies on blur or Enter — one undo step per edit, not per key. */
function CommitInput({ id, label, value, placeholder, onCommit, list }: { id: string; label: string; value: string; placeholder?: string; onCommit: (v: string) => void; list?: string }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const done = () => v !== value && onCommit(v);
  return (
    <Input
      id={id}
      label={label}
      placeholder={placeholder}
      value={v}
      list={list}
      onValueChange={setV}
      onBlur={done}
      onKeyDown={(e) => e.key === 'Enter' && done()}
    />
  );
}

function CommitTextarea({ id, label, value, onCommit }: { id: string; label: string; value: string; onCommit: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return <Textarea id={id} label={label} rows={4} value={v} onValueChange={setV} onBlur={() => v !== value && onCommit(v)} />;
}

export type ItemPanelProps = {
  item: SpaceItem;
  itemKey: string;
  state: SuiteState;
  hasFilterBar: boolean;
  /** Headings already on the space, offered as suggestions. */
  headings: string[];
  /** Change the item (one undo step) and say what changed in the status line. */
  onChange: (patch: Partial<SpaceItem>, said: string) => void;
  onAddView: () => void;
  onRemove: () => void;
  onBack: () => void;
};

export function ItemPanel({ item, itemKey, state, hasFilterBar, headings, onChange, onAddView, onRemove, onBack }: ItemPanelProps) {
  const id = `ds-builder-item-${itemKey.replace(/[^a-z0-9]+/gi, '-')}`;
  const asset = item.assetId ? state.assets.find((a) => a.id === item.assetId) : undefined;
  const isDashboard = !item.assetId && !item.widgetId && !item.block;
  const block = item.block;
  const setBlock = (b: SpaceBlock, said: string) => onChange({ block: b }, said);

  const group = (labelId: string, label: string, control: React.ReactNode, help?: string) => (
    <Stack level={5}>
      <Label id={labelId} description={help}>
        {label}
      </Label>
      {control}
    </Stack>
  );

  return (
    <Stack level={3}>
      <div>
        <Button id={`${id}-back`} style="link" size="sm" label="Back to the library" IconLeft={ChevronLeft} onClick={onBack} />
      </div>

      {/* ── A metric: how it is shown here ── */}
      {item.metric && asset && (
        <Section id={`${id}-view`} variant="group" heading="Show it as">
          <Stack level={3}>
            {group(
              `${id}-display-label`,
              'View',
              <ToggleGroup
                id={`${id}-display`}
                type="single"
                size="sm"
                variant="outline"
                value={item.metric.display}
                onValueChange={(x) => x && onChange({ metric: { ...item.metric!, display: x as MetricView['display'] } }, `Showing ${asset.name} as a ${x}`)}
                aria-labelledby={`${id}-display-label`}
              >
                <ToggleGroupItem value="number" label="Number" />
                <ToggleGroupItem value="trend" label="Trend" />
                <ToggleGroupItem value="breakdown" label="Breakdown" disabled={!asset.metric?.breakdowns.length} />
              </ToggleGroup>,
            )}
            {group(
              `${id}-time-label`,
              'Timeframe',
              <ToggleGroup
                id={`${id}-time`}
                type="single"
                size="sm"
                variant="outline"
                value={item.metric.timeframe}
                onValueChange={(x) => x && onChange({ metric: { ...item.metric!, timeframe: x as MetricView['timeframe'] } }, `Timeframe set to ${TIMEFRAME_LABEL[x as MetricView['timeframe']].toLowerCase()}`)}
                aria-labelledby={`${id}-time-label`}
              >
                {(['follow', ...(asset.metric?.grains ?? ['week']).map((g) => GRAIN_TO_TIMEFRAME[g])] as MetricView['timeframe'][]).map((t) => (
                  <ToggleGroupItem key={t} value={t} label={TIMEFRAME_LABEL[t]} />
                ))}
              </ToggleGroup>,
              hasFilterBar ? '“Follows the space” takes the filter bar’s period. Anything else is pinned here.' : 'No filter bar yet, so “Follows the space” shows the last 13 weeks.',
            )}
            {item.metric.display === 'breakdown' &&
              group(
                `${id}-by-label`,
                'Break down by',
                <ToggleGroup
                  id={`${id}-by`}
                  type="single"
                  size="sm"
                  variant="outline"
                  value={item.metric.breakdown}
                  onValueChange={(x) => x && onChange({ metric: { ...item.metric!, breakdown: x as MetricView['breakdown'] } }, `Broken down by ${x}`)}
                  aria-labelledby={`${id}-by-label`}
                >
                  {(asset.metric?.breakdowns ?? []).map((b) => (
                    <ToggleGroupItem key={b} value={b} label={BREAKDOWN_LABEL[b]} />
                  ))}
                </ToggleGroup>,
              )}
            <div>
              <Button id={`${id}-again`} style="outline" size="sm" label="Add another view of this metric" IconLeft={CopyPlus} onClick={onAddView} />
            </div>
          </Stack>
        </Section>
      )}

      {/* ── A dashboard: its card style ── */}
      {isDashboard &&
        group(
          `${id}-style-label`,
          'Card style',
          <ToggleGroup
            id={`${id}-style`}
            type="single"
            size="sm"
            variant="outline"
            value={item.layout}
            onValueChange={(x) => x && onChange({ layout: x as SpaceCardLayout }, x === 'card' ? 'Shown as a compact card' : 'Shown as a thumbnail card')}
            aria-labelledby={`${id}-style-label`}
          >
            <ToggleGroupItem value="thumbnail" label="Thumbnail" />
            <ToggleGroupItem value="card" label="Compact" />
          </ToggleGroup>,
        )}

      {/* ── Blocks ── */}
      {block?.type === 'note' && (
        <Stack level={3}>
          <CommitInput id={`${id}-note-title`} label="Title (optional)" value={block.title} placeholder="e.g. Before you read these numbers" onCommit={(v) => setBlock({ ...block, title: v.trim() }, 'Note title saved')} />
          <CommitTextarea id={`${id}-note-text`} label="Note" value={block.text} onCommit={(v) => v.trim() && setBlock({ ...block, text: v.trim() }, 'Note saved')} />
          {group(
            `${id}-tone-label`,
            'Tone',
            <ToggleGroup
              id={`${id}-tone`}
              type="single"
              size="sm"
              variant="outline"
              value={block.tone}
              onValueChange={(x) => x && setBlock({ ...block, tone: x as typeof block.tone }, `Note tone set to ${x === 'default' ? 'plain' : x}`)}
              aria-labelledby={`${id}-tone-label`}
            >
              <ToggleGroupItem value="default" label="Plain" />
              <ToggleGroupItem value="info" label="Info" />
              <ToggleGroupItem value="warning" label="Warning" />
            </ToggleGroup>,
          )}
        </Stack>
      )}
      {block?.type === 'divider' && (
        <CommitInput id={`${id}-divider`} label="Label (optional)" value={block.label} placeholder="e.g. Month-end" onCommit={(v) => setBlock({ type: 'divider', label: v.trim() }, v.trim() ? `Divider labelled “${v.trim()}”` : 'Divider label removed')} />
      )}
      {block?.type === 'links' && (
        <Stack level={3}>
          <CommitInput id={`${id}-links-title`} label="Title" value={block.title} onCommit={(v) => v.trim() && setBlock({ ...block, title: v.trim() }, 'Links title saved')} />
          {block.links.map((l, i) => (
            <Stack key={l.id} level={4} direction="horizontal" align="end">
              <CommitInput id={`${id}-link-${l.id}-label`} label={`Link ${i + 1}`} value={l.label} onCommit={(v) => setBlock({ ...block, links: block.links.map((x) => (x.id === l.id ? { ...x, label: v } : x)) }, `Link ${i + 1} saved`)} />
              <CommitInput id={`${id}-link-${l.id}-url`} label="Address" value={l.url} onCommit={(v) => setBlock({ ...block, links: block.links.map((x) => (x.id === l.id ? { ...x, url: v } : x)) }, `Link ${i + 1} saved`)} />
              <Button
                id={`${id}-link-${l.id}-remove`}
                style="ghost"
                iconOnly
                IconCenter={Trash2}
                aria-label={`Remove link ${i + 1}`}
                onClick={() => setBlock({ ...block, links: block.links.filter((x) => x.id !== l.id) }, `Removed ${l.label || `link ${i + 1}`}`)}
              />
            </Stack>
          ))}
          <div>
            <Button
              id={`${id}-links-add`}
              style="outline"
              size="sm"
              label="Add a link"
              IconLeft={Plus}
              onClick={() => setBlock({ ...block, links: [...block.links, { id: `l-${Date.now().toString(36)}`, label: 'New link', url: 'https://' }] }, 'Link added — give it a label and an address')}
            />
          </div>
        </Stack>
      )}
      {block?.type === 'kpis' && (
        <Section id={`${id}-kpis`} variant="group" heading="Metrics in the strip">
          <Stack level={4}>
            {state.assets
              .filter((a) => a.kind === 'metric')
              .map((m) => (
                <Checkbox
                  key={m.id}
                  id={`${id}-kpi-${m.id}`}
                  label={m.name}
                  description={m.glance}
                  checked={block.metricIds.includes(m.id)}
                  onCheckedChange={(c) =>
                    setBlock(
                      { type: 'kpis', metricIds: state.assets.filter((a) => a.kind === 'metric' && (a.id === m.id ? c : block.metricIds.includes(a.id))).map((a) => a.id) },
                      c ? `${m.name} added to the strip` : `${m.name} taken out of the strip`,
                    )
                  }
                />
              ))}
          </Stack>
        </Section>
      )}
      {block?.type === 'filters' && <Text tone="muted">Set the space’s period and product with the bar itself, on the canvas. Every live chart and metric here follows it.</Text>}
      {block?.type === 'summary' && <Text tone="muted">Aiden writes this from the charts, metrics and workflows on the space. Add or change those and it follows.</Text>}
      {block?.type === 'freshness' && <Text tone="muted">Reads every source behind the space. Nothing to set — it names the late ones on its own.</Text>}

      {/* ── Every card can sit under a section heading ── */}
      {!block && (
        <Section id={`${id}-heading`} variant="group" heading="Section heading">
          <Stack level={4}>
            <CommitInput
              id={`${id}-heading-input`}
              label="Heading"
              value={item.section ?? ''}
              placeholder="e.g. Early stage"
              list={`${id}-heading-options`}
              onCommit={(v) => onChange({ section: v.trim() || undefined }, v.trim() ? `Grouped under “${v.trim()}”` : 'Heading removed')}
            />
            <datalist id={`${id}-heading-options`}>
              {headings.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </Stack>
        </Section>
      )}

      <div>
        <Button id={`${id}-remove`} style="ghost" variant="error" label="Remove from space" IconLeft={Trash2} onClick={onRemove} />
      </div>
    </Stack>
  );
}
