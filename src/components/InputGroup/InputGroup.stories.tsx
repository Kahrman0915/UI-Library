import type { Meta, StoryObj } from '@storybook/react';
import {
  ArrowUp,
  AtSign,
  Copy,
  Eye,
  Mail,
  Paperclip,
  Search,
  Send,
} from 'lucide-react';
import InputGroup, {
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  InputGroupRequired,
} from './InputGroup';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A field flanked by addons — a currency symbol, a unit, a prefix, an inline ' +
        'button — all sharing one border with the input.',
      tags: ['compound', '6 parts', 'form'],
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The `destructive` button is a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
        },
        {
          date: '2026-08-05',
          summary:
            'New `InputGroupRequired` part — the required asterisk, positioned by you rather than '+
            'injected automatically.',
          detail:
            'Unlike Input / Textarea / NativeSelect, InputGroup renders no label of its own '+
            '(its documented use is inside a `Field`, whose `FieldLabel` already draws the '+
            'asterisk) and is a free-form compound with no fixed slot to inject into — so it '+
            'is opt-in, and must NOT be used when a label above already marks the field. The '+
            'group lays out by `order` (0 block-start · 1 inline-start · 2 control · '+
            '3 inline-end · 4 block-end), so the part takes `order: 3`, tying with an '+
            'inline-end addon so DOM order decides which comes first.',
        },
        {
          date: '2026-08-02',
          summary:
            'The default button\u2019s hover now darkens in light mode and lightens in dark, so its label gains contrast rather than losing it.',
          detail:
            'Matches the same fix in `Button`. The 10% `--opacity-90` overlay moved the fill toward the label; it now reads `--primary-hover`, which mixes toward `--foreground` and adapts by mode. The `data-surface=\'aiden\'` override is unaffected.',
        },
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    size: 'default',
    disabled: false,
    error: false,
  },
};

export default meta;

type Story = StoryObj<typeof InputGroup>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Search…" />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const IconLeadingAndTrailing: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search anything…" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="you@company.com" />
        <InputGroupAddon align="inline-end">
          <Mail />
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <AtSign />
        </InputGroupAddon>
        <InputGroupInput placeholder="username" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>@ui/lib</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const TextPrefixAndSuffix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput type="number" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="your-store" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.myshop.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const ButtonActions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup>
        <InputGroupInput type="password" placeholder="Enter a password" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Toggle visibility">
            <Eye />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput
          defaultValue="https://ui.lib/design/gz2joHIO5CQhE0NedTAZCY"
          readOnly
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" aria-label="Copy">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder="Enter a URL to shorten" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="default" size="sm">
            Shorten
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-sm)' }}>
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder={`Size: ${size}`} />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{size}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  ),
};

export const ErrorState: Story = {
  args: { error: true },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup {...args}>
        <InputGroupAddon>
          <Mail />
        </InputGroupAddon>
        <InputGroupInput defaultValue="not-an-email" aria-invalid />
      </InputGroup>
    </div>
  ),
};

export const TextareaWithBlockFooter: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <InputGroup>
        <InputGroupTextarea
          placeholder="Message the team…"
          rows={4}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm" aria-label="Attach">
            <Paperclip />
          </InputGroupButton>
          <div style={{ flex: 1 }} />
          <InputGroupButton variant="default" size="sm">
            <Send />
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const ChatComposer: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <InputGroup>
        <InputGroupTextarea
          placeholder="Ask anything…"
          rows={3}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm" aria-label="Attach">
            <Paperclip />
          </InputGroupButton>
          <InputGroupText style={{ marginLeft: 'var(--p-2)', fontSize: 'var(--text-xs)' }}>
            Shift+Enter for new line
          </InputGroupText>
          <div style={{ flex: 1 }} />
          <InputGroupButton variant="default" size="icon-sm" aria-label="Send">
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithBlockStart: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText style={{ fontWeight: 'var(--font-medium)', color: 'var(--foreground)' }}>
            Add a note
          </InputGroupText>
          <div style={{ flex: 1 }} />
          <InputGroupText>{`0 / 280`}</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Write something…" rows={3} />
      </InputGroup>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` on the group reaches every control inside it through context — ' +
          'the input, the textarea and any `InputGroupButton`. A child’s own ' +
          '`disabled` still wins, so you can disable one button in an otherwise live ' +
          'group.\n\n' +
          'Worth a story of its own because the prop shipped doing **nothing**: it ' +
          'painted the group grey while the input stayed typeable and the buttons ' +
          'stayed clickable. A rendered disabled state is the cheapest way to catch ' +
          'that class of bug — try typing in the fields below.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup id="ig-disabled" disabled>
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search is unavailable" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup id="ig-partly">
        <InputGroupAddon align="inline-start">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled aria-label="Copy link">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
        The first group is disabled entirely. The second is live, with only its
        trailing button disabled.
      </p>
    </div>
  ),
};

/**
 * `InputGroupRequired` is PLACED, not automatic — unlike Input / Textarea /
 * NativeSelect, which render the asterisk themselves whenever `required` is set
 * and no label exists.
 *
 * InputGroup can do neither. It renders no label of its own (its documented use
 * is inside a `Field`, whose `FieldLabel` already draws the asterisk), and it is
 * a free-form compound, so there is no fixed slot to inject into. Reach for this
 * only when nothing above the group is already carrying the mark.
 */
export const RequiredMarker: Story = {
  name: 'Required marker (placed, not automatic)',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-5)', maxWidth: 'var(--max-w-sm)' }}>
      <InputGroup id="ig-req-1">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput id="ig-req-1-input" required placeholder="your-site.com" />
        <InputGroupRequired />
      </InputGroup>

      {/* Placement is the consumer's, so it can sit before a trailing button. */}
      <InputGroup id="ig-req-2">
        <InputGroupInput id="ig-req-2-input" required placeholder="Before a trailing action" />
        <InputGroupRequired />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Check</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* The case NOT to use it in: a Field above already marks the label. */}
      <div style={{ display: 'grid', gap: 'var(--p-1-5)' }}>
        <label
          className="ui-field-label ui-label ui-label--sz-default"
          htmlFor="ig-req-3-input"
        >
          <span className="ui-label__text">
            Website
            <span className="ui-label__required" aria-hidden="true">*</span>
          </span>
        </label>
        <InputGroup id="ig-req-3">
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="ig-req-3-input" required placeholder="Label already marks it — no InputGroupRequired" />
        </InputGroup>
      </div>
    </div>
  ),
};
