import type { Size } from '#/types/GlobalTypes';

/**
 * Chip's three rungs, so a FilterTag and a Chip can sit in one row at matching
 * heights: `xs` 24, `sm` 32, `default` 36. No `lg`, same as Chip.
 */
export type FilterTagSize = Exclude<Size, 'lg'>;

/**
 * One APPLIED filter, removable.
 *
 * **This is not a Chip.** Chip is a toggle: it renders `aria-pressed` and means
 * "click me to switch this on or off". A FilterTag means "this is applied; the X
 * takes it away". The label is plain text and only the X is a control, so a
 * screen reader hears "Category: Finance" and then "Remove Category: Finance,
 * button" — never "toggle button, not pressed" for a filter that IS on.
 *
 * The root is a `span`, not a `button`, for the same reason TabBar's tab is a
 * `div`: the remove control has to be a real, separately named button, and a
 * button cannot nest inside another.
 */
export type FilterTagProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Seeds `${id}-remove` for the remove button. */
  id: string;
  /** What is applied — "Category: Finance". Also seeds the remove button's name. */
  label: string;
  /**
   * Called when the X is pressed. The tag removes nothing itself — you own the
   * list. Inside a {@link FilterTagGroup} focus is moved for you after the tag
   * disappears; standalone, that is yours to do.
   */
  onRemove: () => void;
  /**
   * The remove button's accessible name. Default `Remove ${label}` — it says
   * WHAT is removed, because a row of buttons all called "Close" is unusable by
   * ear. Override to localize.
   */
  removeLabel?: string;
  /**
   * See {@link FilterTagSize}. Inside a {@link FilterTagGroup} it defaults to the
   * group's `size`; set it here only to make one tag differ. Standalone, the
   * default is `default`.
   */
  size?: FilterTagSize;
  className?: string;
};

/**
 * The row of applied filters: a visible label, the tags as a list, and an
 * optional "Clear all".
 *
 * Its one real job is FOCUS. When a tag is removed its button leaves the DOM and
 * focus would drop to the top of the page. The group moves it to the next tag's
 * remove button, else the previous one, else {@link returnFocusRef} — so a
 * keyboard user can clear filters one after another without losing their place.
 */
export type FilterTagGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Seeds `${id}-label` and `${id}-clear`. */
  id: string;
  /** Names the list — "Active filters". Rendered visibly unless {@link hideLabel}. */
  label: string;
  /** Keep the name for screen readers but draw nothing. Default `false`. */
  hideLabel?: boolean;
  /** Renders a "Clear all" after the tags while there is at least one. */
  onClearAll?: () => void;
  /** Default `'Clear all'`. */
  clearAllLabel?: string;
  /**
   * Sizes every tag in the group and the Clear all button together, so a row
   * cannot end up with mixed heights. Default `default`. A tag's own `size`
   * still wins. Clear all follows at the matching Button rung (`xs` 24, `sm` 32,
   * `default` 36).
   */
  size?: FilterTagSize;
  /**
   * Where focus goes when the LAST tag is removed, or after Clear all — usually
   * the Filter button that opened the filters. Without it focus falls back to
   * the group itself, which is focusable for exactly this case.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** `FilterTag` elements. Each is wrapped in an `li`. */
  children?: React.ReactNode;
  className?: string;
};
