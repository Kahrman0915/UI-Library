import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Calendar from './Calendar';
import Card, { CardBody } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

// Fixed dates so every story renders identically on any day — a story keyed on
// `new Date()` produces a different screenshot every morning, which makes the
// screenshot regression test (CLAUDE.md hard rule 7) useless.
const MARCH = new Date(2026, 2, 1);
const MARCH_12 = new Date(2026, 2, 12);

// Story chrome only — a caption over each specimen. Written longhand rather
// than with the `font` shorthand, which does not accept `var()` for its
// sub-values.
const caption: React.CSSProperties = {
  margin: '0 0 8px',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)' as unknown as number,
  lineHeight: 'var(--leading-4)',
  color: 'var(--muted-foreground)',
};

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The month grid on its own — a six-row date grid with month navigation, a today marker, disabled days and full keyboard support. `DatePicker` opens one in a floating panel; use `Calendar` directly when the grid is permanently on screen, as in a booking flow or a scheduling sidebar.\n\nBuilt on the native `Date` and `Intl` with **no date library** — hard rule 1 allows `lucide-react` and nothing else. The helpers live in `src/utils/date.ts`.',
      tags: ['form control', 'grid'],
      usage: {
        when: [
          'The calendar is always visible — a booking page, an availability panel, a dashboard date scrubber.',
          'You need the grid inside something the picker does not give you: a two-month layout, a legend, an inline confirm.',
          'Availability is the point of the screen, so the disabled days should be readable at a glance rather than discovered by clicking.',
        ],
        avoid: [
          'It is a field in a form — use `DatePicker`, which wraps this in the shared field shell and posts a value.',
          'You need a date **range** — build it from two fields for now. There is no range mode, deliberately: a range changes `value` from a `Date` to a tuple.',
          'You need a time as well as a date — this is days only.',
        ],
        notes:
          '`weekStartsOn` defaults to `0` (Sunday) and is **not** inferred from the locale: `Intl.Locale#getWeekInfo` is still missing in Firefox, so inferring it would silently give two browsers different grids. An app that wants Monday says so once.\n\nThe grid is always **six rows**, borrowing days from the neighbouring months. A grid that changed height would move every control beneath it as the user pages through the year — and inside a floating panel it would re-anchor the surface on every step.',
      },
      a11y: {
        notes:
          'The grid is a `role="grid"` labelled by the month caption, which is also an `aria-live="polite"` region — paging the month replaces every cell without moving focus off the arrow, so the caption is the only thing that tells a screen-reader user where they now are. Each cell is a `role="gridcell"` carrying `aria-selected`; today also carries `aria-current="date"`.\n\nOne day at a time is tabbable (a roving `tabindex`), so the grid is a single tab stop rather than 42. An unavailable day is marked `aria-disabled`, **not** `disabled` — a natively disabled button drops out of the arrow walk, and arrowing across a blacked-out week would silently swallow the keypress and look like a frozen grid. The click guard is what actually blocks selection.\n\n`ArrowLeft` and `ArrowRight` swap under `dir="rtl"` (they are visual directions); everything else is unaffected.',
        keyboard: [
          { keys: ['←'], description: 'Previous day. Mirrored under `dir="rtl"`.' },
          { keys: ['→'], description: 'Next day. Mirrored under `dir="rtl"`.' },
          { keys: ['↑'], description: 'Same weekday, previous week.' },
          { keys: ['↓'], description: 'Same weekday, next week.' },
          { keys: ['Home'], description: 'First day of the focused week.' },
          { keys: ['End'], description: 'Last day of the focused week.' },
          { keys: ['Page Up'], description: 'Previous month.' },
          { keys: ['Page Down'], description: 'Next month.' },
          { keys: ['Shift', 'Page Up'], description: 'Previous year.' },
          { keys: ['Shift', 'Page Down'], description: 'Next year.' },
          {
            keys: ['Enter'],
            description: 'Select the focused day. `Space` does the same.',
          },
        ],
      },
      motion: {
        notes:
          'Almost none, deliberately. Only the day cell transitions its background and colour, so hovering across a week reads as one continuous sweep rather than 42 hard flips. Paging a month is an instant swap: 42 cells animating at once is noise, not feedback.',
        moments: [
          {
            trigger: 'Hover',
            description:
              'The day fills with `--accent` over `--duration-fast`.',
          },
          {
            trigger: 'Select',
            description:
              'The fill crosses to `--primary` on the same transition, so selection and hover share one movement.',
          },
        ],
      },
      changelog: [
        {
          date: '2026-09-02',
          summary: 'Initial build complete.',
          detail:
            'Single-date month grid with the ARIA date-grid keyboard model, min/max plus a per-day veto, localisation through `Intl`, and three sizes. Date arithmetic lives in the new dependency-free `src/utils/date.ts`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    weekStartsOn: { control: 'inline-radio', options: [0, 1, 6] },
    showOutsideDays: { control: 'boolean' },
    disabled: { control: 'boolean' },
    // Date-valued props are excluded from the controls: Storybook's `date`
    // control hands back a timestamp number, which is not a `Date` and throws
    // the moment the grid formats it.
    value: { control: false },
    defaultValue: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
    onValueChange: { action: 'value-change' },
    onMonthChange: { action: 'month-change' },
  },
  args: {
    id: 'story-calendar',
    size: 'default',
    weekStartsOn: 0,
    showOutsideDays: true,
    disabled: false,
    defaultMonth: MARCH,
    defaultValue: MARCH_12,
  },
};

export default meta;

type Story = StoryObj<typeof Calendar>;

/** Every knob, live. Pick a day and watch the action logger. */
export const Playground: Story = {};

/**
 * The three rungs of the shared size scale. Only the cell box and the type
 * move — the header, the weekday row and the six-row grid are identical, so a
 * calendar can change size inside a panel without the panel resizing oddly.
 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size}>
          <p
            style={caption}
          >
            {size}
          </p>
          <Calendar {...args} id={`story-calendar-${size}`} size={size} />
        </div>
      ))}
    </div>
  ),
};

/**
 * The states a day can be in, side by side. `today` is the dot under the
 * numeral — deliberately not a ring, which the focus ring would replace the
 * moment the day is focused and which would read as a second selection next to
 * the filled one.
 */
export const AllStates: Story = {
  render: (args) => {
    const cases: { label: string; props: Partial<typeof args> }[] = [
      { label: 'Nothing selected', props: { defaultValue: null } },
      { label: 'A day selected', props: {} },
      {
        label: 'Bounded — min 8th, max 24th',
        props: { min: new Date(2026, 2, 8), max: new Date(2026, 2, 24) },
      },
      {
        label: 'Weekends unavailable',
        props: {
          isDateDisabled: (date: Date) =>
            date.getDay() === 0 || date.getDay() === 6,
        },
      },
      { label: 'Outside days hidden', props: { showOutsideDays: false } },
      { label: 'Whole calendar disabled', props: { disabled: true } },
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, max-content)',
          gap: 32,
        }}
      >
        {cases.map(({ label, props }, index) => (
          <div key={label}>
            <p
              style={caption}
            >
              {label}
            </p>
            <Calendar
              {...args}
              {...props}
              id={`story-calendar-state-${index}`}
            />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * `min` / `max` bound the range and disable the arrows once a whole month is
 * out of reach; `isDateDisabled` vetoes individual days on top of that. Both
 * mark days `aria-disabled` rather than `disabled`, so the arrow keys still
 * walk straight across them.
 */
export const Constraints: Story = {
  args: {
    min: new Date(2026, 2, 3),
    max: new Date(2026, 2, 27),
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
    defaultValue: new Date(2026, 2, 11),
  },
};

/**
 * Every string on the grid comes from `Intl` — the month caption, the weekday
 * abbreviations and each cell's accessible name. `weekStartsOn` is a separate
 * prop because it cannot be read from the locale in every browser.
 */
export const Localised: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {(
        [
          { locale: 'en-US', weekStartsOn: 0 as const, label: 'en-US · Sunday' },
          { locale: 'fr-FR', weekStartsOn: 1 as const, label: 'fr-FR · Monday' },
          { locale: 'ja-JP', weekStartsOn: 0 as const, label: 'ja-JP · Sunday' },
        ] as const
      ).map(({ locale, weekStartsOn, label }) => (
        <div key={locale}>
          <p
            style={caption}
          >
            {label}
          </p>
          <Calendar
            {...args}
            id={`story-calendar-${locale}`}
            locale={locale}
            weekStartsOn={weekStartsOn}
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * Both the selection and the displayed month can be controlled. Here the
 * consumer owns them, which is what a two-calendar range view or a
 * "jump to today" button needs.
 */
export const Controlled: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | null>(MARCH_12);
    const [month, setMonth] = useState<Date>(MARCH);

    return (
      <Card id="story-calendar-controlled-card">
        <CardBody id="story-calendar-controlled-body">
          <Calendar
            {...args}
            id="story-calendar-controlled"
            value={date}
            onValueChange={setDate}
            month={month}
            onMonthChange={setMonth}
          />
          <p
            style={{
              margin: '8px 0 0',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-5)',
              color: 'var(--muted-foreground)',
            }}
          >
            {date ? date.toDateString() : 'Nothing selected'}
          </p>
        </CardBody>
      </Card>
    );
  },
};
