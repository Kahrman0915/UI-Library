import type { Align, Side } from '#/utils/computePosition';
import type { WeekDay } from '#/utils/date';

/** Field height. Matches Input / Select so the three line up in one form. */
export type DatePickerSize = 'sm' | 'default' | 'lg';
/** Which edge of the field the panel sits on. */
export type DatePickerSide = Side;
/** How the panel lines up along that edge. */
export type DatePickerAlign = Align;

/**
 * A date field: the shared `.ui-input-wrap` shell with a calendar glyph, opening
 * a floating {@link Calendar}.
 *
 * **Not a native `<input type="date">`.** The native control cannot be styled to
 * match the rest of the library and renders a different picker in every browser,
 * so a form using it looks like three different design systems. This owns its
 * own surface instead.
 *
 * **Single date only** — there is no range mode. A date range is two of these
 * side by side, which is what the forms this was built for actually show, and a
 * real range picker would change `value` from a `Date` to a tuple.
 *
 * Not an intersection with `React.HTMLAttributes`, deliberately: the root is a
 * field wrapper and the ref goes to the trigger button, so a spread of arbitrary
 * div attributes would have no single honest home. Same shape as `SelectProps`.
 */
export type DatePickerProps = {
  /**
   * Required. Seeds `{id}-trigger`, `{id}-panel`, `{id}-calendar`,
   * `{id}-description` and `{id}-error`, which is how the label, helper text
   * and error message wire up without the consumer touching aria.
   */
  id: string;
  /** Controlled selection. Pair with `onValueChange`; `null` means empty. */
  value?: Date | null;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: Date | null;
  /** Fires with the picked day at local midnight. Selecting also closes the panel. */
  onValueChange?: (date: Date) => void;
  /** Controlled panel state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial panel state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Rendered through the shared `<Label>`, tied to the trigger via `htmlFor`. */
  label?: React.ReactNode;
  /** Helper text. Exposed via `aria-describedby`, not the accessible name. */
  description?: React.ReactNode;
  /** Paints the error border and sets `aria-invalid`. */
  error?: boolean;
  /** Message text, announced via `role="alert"` when it appears. */
  errorMessage?: React.ReactNode;
  /** Visual asterisk plus `aria-required` on the trigger. */
  required?: boolean;
  /** Blocks opening and dims the field. */
  disabled?: boolean;
  /** Default `default`. See {@link DatePickerSize}. */
  size?: DatePickerSize;
  /** Shown in `--muted-foreground` while nothing is picked. Default `Select a date`. */
  placeholder?: string;
  /**
   * Emits a hidden input holding `YYYY-MM-DD` (built from the **local**
   * calendar fields, never `toISOString`) so the value posts with a plain form.
   */
  name?: string;
  /** Earliest selectable day, inclusive. */
  min?: Date;
  /** Latest selectable day, inclusive. */
  max?: Date;
  /** Per-day veto on top of `min` / `max` — weekends, blackout dates. */
  isDateDisabled?: (date: Date) => boolean;
  /** First column of the week: `0` Sunday (default) … `6` Saturday. */
  weekStartsOn?: WeekDay;
  /** BCP-47 tag for the field display and the calendar's own formatting. */
  locale?: string;
  /** Render the neighbouring months' days in the grid. Default `true`. */
  showOutsideDays?: boolean;
  /** Overrides the field's display string. Defaults to `Intl` `dateStyle: 'medium'`. */
  formatValue?: (date: Date) => string;
  /** Default `bottom`. */
  side?: DatePickerSide;
  /** Default `start`. */
  align?: DatePickerAlign;
  /** Gap between field and panel, **in px**. Default `4`. */
  sideOffset?: number;
  /** Accessible name for the panel. Default `Choose a date`. */
  panelLabel?: string;
  /** Accessible name for the calendar's back arrow. Default `Previous month`. */
  previousMonthLabel?: string;
  /** Accessible name for the calendar's forward arrow. Default `Next month`. */
  nextMonthLabel?: string;
  className?: string;
};
