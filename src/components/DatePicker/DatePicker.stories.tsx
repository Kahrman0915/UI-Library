import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DatePicker from './DatePicker';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

// Fixed dates so a screenshot taken today matches one taken next month.
const MARCH_12 = new Date(2026, 2, 12);

const caption: React.CSSProperties = {
  margin: '0 0 8px',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)' as unknown as number,
  lineHeight: 'var(--leading-4)',
  color: 'var(--muted-foreground)',
};

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A date field: the shared field shell with a calendar glyph, opening a floating `Calendar`. It is the same object as every other field in the form — same height, border, hover, focus ring and error state at all three sizes — because it reuses `.ui-input-wrap` rather than restyling a control of its own.\n\n**Not a native `<input type="date">`.** The native control cannot be styled to match the system and renders a different picker in every browser, so one form ends up looking like three design systems.',
      tags: ['form control', 'portal'],
      usage: {
        when: [
          'A form asks for one date — a start date, an end date, a proposed removal date.',
          'The field has to sit in a column of Inputs and Selects and look like it belongs there.',
          'The value should post with a plain form — pass `name` and it emits a hidden `YYYY-MM-DD` input.',
        ],
        avoid: [
          'The calendar should always be visible — drop a `Calendar` straight into the page instead.',
          'You need a date **range**. Use two fields, which is what the designs this was built for actually show. There is no range mode.',
          'You need a time of day as well. This is days only.',
        ],
        notes:
          'A range is deliberately two pickers, not one field: a real range picker changes `value` from a `Date` to a tuple and needs its own hover-preview and cross-field validation, so it is a future component rather than a prop on this one.',
      },
      a11y: {
        notes:
          'The field is a `role="combobox"` with `aria-haspopup="dialog"` and `aria-expanded`; the panel is a non-modal `role="dialog"` holding the calendar\'s `role="grid"`. `id` seeds every child id, so the label, helper text and error message wire up through `aria-labelledby` / `aria-describedby` without the consumer touching aria.\n\nThe panel is portalled to `<body>`, so `Tab` from the field walks past it in DOM order rather than into it. Focus is moved into the grid on open instead, and the panel closes as soon as focus leaves it for anything but the field — which is what tabbing out means here. `Esc` closes and returns focus to the field; picking a day does the same.\n\nThe whole field is the click target, not just the button: the glyph and the wrap\'s padding are siblings of the trigger, so without that there is a dead strip down the right edge of a control whose cursor already promises it is clickable.',
        keyboard: [
          { keys: ['Enter'], description: 'Open the panel. `Space` does the same.' },
          { keys: ['↓'], description: 'Open the panel.' },
          {
            keys: ['Esc'],
            description: 'Close without picking and return focus to the field.',
          },
          {
            keys: ['Tab'],
            description:
              'Inside the panel, moves between the arrows and the grid; leaving the panel closes it.',
          },
        ],
      },
      motion: {
        notes:
          'The panel uses the shared overlay choreography every floating surface in the library uses — it fades and scales up out of the field on open, and reverses on close, with the transform origin pinned toward the field so it reads as growing from the control rather than appearing beside it.',
        moments: [
          {
            trigger: 'Open',
            description:
              'The panel scales from `--motion-scale-in` and slides `--motion-slide-sm` off the field.',
          },
          {
            trigger: 'Close',
            description:
              'The reverse, slightly quicker, so dismissing feels decisive. `usePresence` keeps the panel mounted until the exit finishes.',
          },
        ],
      },
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The field’s error border and focus ring are a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
        },
        {
          date: '2026-09-02',
          summary: 'Initial build complete.',
          detail:
            'Field shell reused from Input, floating panel on `computePosition` + `useFloatingReposition`, `usePresence` for the exit, and a hidden `YYYY-MM-DD` input for plain form posts.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    weekStartsOn: { control: 'inline-radio', options: [0, 1, 6] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    showOutsideDays: { control: 'boolean' },
    // Storybook's `date` control returns a timestamp, not a `Date`.
    value: { control: false },
    defaultValue: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
    formatValue: { control: false },
    onValueChange: { action: 'value-change' },
    onOpenChange: { action: 'open-change' },
  },
  args: {
    id: 'story-date-picker',
    label: 'Promote start date',
    description: 'The day the request goes live.',
    placeholder: 'Select a date',
    size: 'default',
    side: 'bottom',
    align: 'start',
    weekStartsOn: 0,
    showOutsideDays: true,
    disabled: false,
    required: false,
    error: false,
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

/** Every knob, live. */
export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <DatePicker {...args} />
    </div>
  ),
};

/**
 * The closed field in every state it can be in. All of it comes from the shared
 * `.ui-input-wrap`, so a date field and a text field are the same object with a
 * different glyph.
 */
export const AllStates: Story = {
  render: (args) => {
    const cases: { label: string; props: Partial<typeof args> }[] = [
      { label: 'Empty', props: {} },
      { label: 'Filled', props: { defaultValue: MARCH_12 } },
      { label: 'Required', props: { required: true } },
      {
        label: 'Error',
        props: { error: true, errorMessage: 'Pick a start date.' },
      },
      { label: 'Disabled', props: { disabled: true, defaultValue: MARCH_12 } },
      {
        label: 'No label',
        props: { label: undefined, description: undefined },
      },
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 240px)',
          gap: 24,
        }}
      >
        {cases.map(({ label, props }, index) => (
          <div key={label}>
            <p style={caption}>{label}</p>
            <DatePicker
              {...args}
              {...props}
              id={`story-date-picker-state-${index}`}
            />
          </div>
        ))}
      </div>
    );
  },
};

/** The three field heights, matching Input, Select and NativeSelect exactly. */
export const Sizes: Story = {
  render: (args) => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}
    >
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <DatePicker
          {...args}
          key={size}
          id={`story-date-picker-${size}`}
          label={size}
          description={undefined}
          size={size}
        />
      ))}
    </div>
  ),
};

/**
 * The shape the DART request flow needs: a start and an end date as two
 * separate fields, with the end field's `min` following the start. That
 * relationship is the consumer's to wire — there is no range mode here.
 */
export const DateRangeAsTwoFields: Story = {
  render: (args) => {
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);

    return (
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 240 }}>
          <DatePicker
            {...args}
            id="story-date-picker-start"
            label="Start date"
            description="First day the promotion runs."
            value={start}
            onValueChange={(date) => {
              setStart(date);
              // A start after the current end would leave an impossible range
              // on screen; clearing is more honest than silently reordering.
              if (end && date > end) setEnd(null);
            }}
          />
        </div>
        <div style={{ width: 240 }}>
          <DatePicker
            {...args}
            id="story-date-picker-end"
            label="End date"
            description="Last day it runs."
            value={end}
            min={start ?? undefined}
            onValueChange={setEnd}
          />
        </div>
      </div>
    );
  },
};

/**
 * `min` / `max` bound the range and disable the arrows once a whole month is
 * out of reach. `isDateDisabled` vetoes individual days on top — here,
 * weekends.
 */
export const Constrained: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <DatePicker
        {...args}
        id="story-date-picker-constrained"
        label="Weekday only"
        description="Weekends and anything outside March are unavailable."
        defaultValue={new Date(2026, 2, 11)}
        min={new Date(2026, 2, 1)}
        max={new Date(2026, 2, 31)}
        isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
    </div>
  ),
};

/**
 * With `name` the picker emits a hidden input holding `YYYY-MM-DD`, built from
 * the **local** calendar fields — never `toISOString()`, which converts to UTC
 * and posts the previous day for anyone west of Greenwich.
 */
export const InAForm: Story = {
  render: (args) => {
    const [posted, setPosted] = useState<string | null>(null);

    return (
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPosted(String(data.get('startDate') ?? ''));
        }}
      >
        <DatePicker
          {...args}
          id="story-date-picker-form"
          name="startDate"
          label="Banner start date"
          description="Posts as YYYY-MM-DD."
          defaultValue={MARCH_12}
        />
        <Button id="story-date-picker-submit" label="Submit" type="submit" />
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-5)',
            color: 'var(--muted-foreground)',
          }}
        >
          {posted === null ? 'Not submitted yet.' : `Posted: ${posted || '(empty)'}`}
        </p>
      </form>
    );
  },
};

/**
 * Both the value and the panel can be controlled — what a "clear" button, a
 * preset row, or a wizard that opens the picker for you needs.
 */
export const Controlled: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | null>(MARCH_12);
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}
      >
        <DatePicker
          {...args}
          id="story-date-picker-controlled"
          value={date}
          onValueChange={setDate}
          open={open}
          onOpenChange={setOpen}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            id="story-date-picker-today"
            label="Today"
            style="outline"
            size="sm"
            onClick={() => setDate(new Date())}
          />
          <Button
            id="story-date-picker-clear"
            label="Clear"
            style="ghost"
            size="sm"
            onClick={() => setDate(null)}
          />
        </div>
      </div>
    );
  },
};
