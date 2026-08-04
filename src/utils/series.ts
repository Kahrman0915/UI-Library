/**
 * Series → colour-slot assignment.
 *
 * Pure, dependency-free — see the note at the top of `scale.ts`.
 */

/** The chart ramp has six slots. Past that, fold — never generate a seventh. */
export const SERIES_SLOTS = 6;

export type SeriesSlot = 1 | 2 | 3 | 4 | 5 | 6;

export type SlotAssignment<T> = {
  item: T;
  key: string;
  /** 1-6, or null for the folded "Other" bucket. */
  slot: SeriesSlot | null;
  /** The CSS custom property to paint with. */
  token: string;
};

/**
 * Assign a stable colour slot to each series.
 *
 * COLOUR FOLLOWS THE ENTITY, NEVER ITS RANK. Slots are derived once from the
 * full declared list and keyed by `key`, so hiding a series via the legend must
 * not renumber the survivors. Assigning by "position among visible series" is
 * the classic bug: a reader who learned "Acme is blue" watches Acme turn orange
 * because someone filtered out a different company. Callers therefore pass the
 * COMPLETE list here and filter for rendering afterwards — never the reverse.
 *
 * `slotFor` lets a caller pin a series (e.g. a brand that is always slot 1).
 * Pinned slots are honoured first; everything else takes the lowest slot still
 * free, so pinning one series does not cascade a renumber through the rest.
 */
export function assignSlots<T>(
  series: readonly T[],
  keyOf: (item: T) => string,
  slotFor?: (item: T) => SeriesSlot | undefined,
): SlotAssignment<T>[] {
  const taken = new Set<number>();
  const pinned = new Map<number, SeriesSlot>();

  if (slotFor) {
    series.forEach((item, i) => {
      const s = slotFor(item);
      if (s && s >= 1 && s <= SERIES_SLOTS && !taken.has(s)) {
        taken.add(s);
        pinned.set(i, s);
      }
    });
  }

  let next = 1;
  return series.map((item, i) => {
    let slot = pinned.get(i) ?? null;
    if (slot === null) {
      while (next <= SERIES_SLOTS && taken.has(next)) next++;
      if (next <= SERIES_SLOTS) {
        slot = next as SeriesSlot;
        taken.add(next);
      }
    }
    return {
      item,
      key: keyOf(item),
      slot,
      token: slot === null ? 'var(--chart-muted)' : `var(--chart-${slot})`,
    };
  });
}

/**
 * Split a series list into the six that keep a slot and the tail that folds.
 *
 * Past six, a seventh step is indistinguishable from an existing one — the
 * remainder becomes a single de-emphasised "Other", or the caller facets into
 * small multiples. Returning both halves lets the caller decide which.
 */
export function foldOverflow<T>(
  series: readonly T[],
  max: number = SERIES_SLOTS,
): { kept: readonly T[]; folded: readonly T[] } {
  if (series.length <= max) return { kept: series, folded: [] };
  // Keep max-1 and leave the last slot for "Other", so the fold is visible as
  // its own entry rather than silently swallowing the 6th real series.
  return { kept: series.slice(0, max - 1), folded: series.slice(max - 1) };
}
