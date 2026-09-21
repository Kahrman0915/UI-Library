import type { Space } from '../../../types';

/* Shared between the Space page and the Builder (both in this area).

   The layout presets a space can be saved with (Builder BL4.7). The chosen
   preset is stored on the space itself (`Space.layout`). */

export type LayoutPreset = NonNullable<Space['layout']>;

export const LAYOUT_PRESETS: { value: LayoutPreset; label: string; description: string }[] = [
  { value: 'auto', label: 'Auto', description: 'Pack components left to right by width.' },
  { value: 'two', label: 'Two column', description: 'Two equal columns.' },
  { value: 'three', label: 'Three column', description: 'Three equal columns.' },
  { value: 'kpis', label: 'KPIs and charts', description: 'A KPI row on top, charts below.' },
  { value: 'full', label: 'Full width', description: 'Every component spans the full width.' },
];

/** The grid class for a preset — `.ds-space-grid--{preset}` in Space.scss. */
export const gridClass = (preset: LayoutPreset) => `ds-space-grid ds-space-grid--${preset}`;

/** Group items under their section headings, in first-appearance order. */
export function groupBySection<T extends { section?: string }>(items: T[]): { section?: string; items: T[] }[] {
  const groups: { section?: string; items: T[] }[] = [];
  for (const it of items) {
    const g = groups.find((x) => x.section === it.section);
    if (g) g.items.push(it);
    else groups.push({ section: it.section, items: [it] });
  }
  return groups;
}
