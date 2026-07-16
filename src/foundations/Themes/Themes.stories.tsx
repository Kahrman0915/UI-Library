import type { Meta, StoryObj } from '@storybook/react';
import { Save } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/Card';
import Checkbox from '../../components/Checkbox';
import Switch from '../../components/Switch';
import Input from '../../components/Input';

// ─── Theme catalogue ────────────────────────────────────────────────────────
const themes = [
  { code: 'db', name: 'DB', hue: 'Indigo' },
  { code: 'dc', name: 'DC', hue: 'Teal' },
  { code: 'dr', name: 'DR', hue: 'Rose' },
  { code: 'ec', name: 'EC', hue: 'Cyan' },
  { code: 'ir', name: 'IR', hue: 'Blue' },
  { code: 'nb', name: 'NB', hue: 'Emerald' },
  { code: 'ph', name: 'PH', hue: 'Orange' },
  { code: 'rm', name: 'RM', hue: 'Violet' },
] as const;

const meta: Meta = {
  title: 'Foundations/Themes',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Mode vs. theme. **Mode** = light/dark, set with `data-mode` on `<html>`. **Theme** = a sub-brand's color, set with `data-theme=\"{code}\"` on `<html>` or any subtree. A theme just remaps `--primary` — so the primary button/CTA and every `--primary`-driven control (checkbox, switch, radio, active chip, progress) takes the theme color automatically. The MAIN brand is the absence of `data-theme`: `--primary` stays neutral slate. Secondary/ghost/outline and Tooltip stay neutral in every theme.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const H = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      margin: '0 0 var(--p-2) 0',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-semibold)',
      color: 'var(--foreground)',
    }}
  >
    {children}
  </h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      margin: '0 0 var(--p-3) 0',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-5)',
      color: 'var(--muted-foreground)',
      maxWidth: 'var(--max-w-3xl)',
    }}
  >
    {children}
  </p>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code
    style={{
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--text-code)',
      background: 'var(--muted)',
      padding: '2px var(--p-1-5)',
      borderRadius: 'var(--rounded-sm)',
    }}
  >
    {children}
  </code>
);

// ═══════════════════════════════════════════════════════════════════════════
// Story 1 — Mental model
// ═══════════════════════════════════════════════════════════════════════════

export const MentalModel: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 'var(--max-w-3xl)' }}>
      <div>
        <H>Mode vs. theme</H>
        <P>
          <strong>Mode</strong> is light / dark — set <Code>data-mode="light"</Code>{' '}
          or <Code>data-mode="dark"</Code> on <Code>&lt;html&gt;</Code> (the{' '}
          <Code>ModeToggler</Code> does this for you).
        </P>
        <P>
          <strong>Theme</strong> is a sub-brand's color — set{' '}
          <Code>data-theme="db"</Code> on <Code>&lt;html&gt;</Code> or any
          subtree. A theme remaps a single token, <Code>--primary</Code>, to that
          brand's color. Everything that reads <Code>--primary</Code> — the
          primary button, checked checkbox, switch track, radio dot, active chip,
          progress bar — takes the color automatically. No opt-in.
        </P>
        <P>
          The <strong>main brand</strong> is simply the absence of{' '}
          <Code>data-theme</Code>: <Code>--primary</Code> stays neutral slate.
          Secondary / ghost / outline buttons, chrome, borders, body text, and
          tooltips stay neutral in every theme — so sub-brands feel like one
          synced family with a single accent swapped in.
        </P>
      </div>

      <div>
        <H>How to scope</H>
        <pre
          style={{
            margin: 0,
            padding: 'var(--p-4)',
            background: 'var(--muted)',
            borderRadius: 'var(--rounded-md)',
            fontSize: 'var(--text-code)',
            fontFamily: 'var(--font-family-mono)',
            overflow: 'auto',
          }}
        >
{`<html data-mode="dark">                 {/* light / dark */}
  <App />                                {/* main brand — slate primary */}

  <section data-theme="db">              {/* db sub-brand */}
    <Button variant="default">Save</Button>   {/* → indigo, automatically */}
    <Button style="secondary">Cancel</Button> {/* → stays neutral slate */}
    <Checkbox checked />                       {/* → indigo */}
  </section>
</html>`}
        </pre>
      </div>
    </div>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// Story 2 — The same CTA across themes
// ═══════════════════════════════════════════════════════════════════════════

const CTARow = () => (
  <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap', alignItems: 'center' }}>
    <Button id={`p-${Math.random()}`} variant="default" label="Save changes" IconLeft={Save} />
    <Button id={`s-${Math.random()}`} variant="default" style="secondary" label="Save as draft" />
    <Button id={`t-${Math.random()}`} style="ghost" label="Cancel" />
    <Checkbox id={`c-${Math.random()}`} defaultChecked label="Notify team" />
    <Switch id={`sw-${Math.random()}`} defaultChecked label="Auto-publish" />
  </div>
);

export const SameCTAAcrossThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      <div>
        <H>Same components, every theme</H>
        <P>
          Identical JSX. Only the primary button, checkbox, and switch shift —
          the secondary and ghost buttons stay neutral slate throughout.
        </P>
      </div>
      <div>
        <div
          style={{
            marginBottom: 'var(--p-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          Main brand — no data-theme
        </div>
        <CTARow />
      </div>
      {themes.map((t) => (
        <div key={t.code} data-theme={t.code}>
          <div
            style={{
              marginBottom: 'var(--p-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            data-theme=&quot;{t.code}&quot; — {t.hue}
          </div>
          <CTARow />
        </div>
      ))}
    </div>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// Story 3 — A mini build rendered in each theme
// ═══════════════════════════════════════════════════════════════════════════

const MiniBuild = () => (
  <Card id={`mb-${Math.random()}`}>
    <CardHeader
      id={`mbh-${Math.random()}`}
      title="Q4 report"
      description="Weekly digest for the design team"
      action={<Badge id={`mbb-${Math.random()}`} variant="default" label="Live" />}
    />
    <CardBody>
      <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
        <Input
          id={`mbi-${Math.random()}`}
          label="Report name"
          placeholder="Untitled report"
          size="sm"
        />
        <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
          <Badge id={`mbb1-${Math.random()}`} variant="default" label="Primary" />
          <Badge id={`mbb3-${Math.random()}`} variant="outline" label="Outline" />
        </div>
      </div>
    </CardBody>
    <CardFooter>
      <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'flex-end', width: '100%' }}>
        <Button id={`mbg-${Math.random()}`} style="ghost" label="Cancel" />
        <Button id={`mbp-${Math.random()}`} variant="default" label="Publish" />
      </div>
    </CardFooter>
  </Card>
);

export const RenderedInEachTheme: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      <div>
        <H>Same build, rendered in each theme</H>
        <P>
          Identical JSX wrapped once per <Code>data-theme</Code>. Neutral chrome
          (card, borders, secondary badge, ghost button) stays constant; the
          primary button and default badge carry the theme color.
        </P>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 'var(--p-4)',
        }}
      >
        {themes.map((t) => (
          <div key={t.code} data-theme={t.code}>
            <div
              style={{
                marginBottom: 'var(--p-2)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              data-theme=&quot;{t.code}&quot; — {t.hue}
            </div>
            <MiniBuild />
          </div>
        ))}
      </div>
    </div>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// Story 4 — Theme palette swatches
// ═══════════════════════════════════════════════════════════════════════════

export const Palettes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      <div>
        <H>The 8 theme primaries</H>
        <P>
          Each theme assigns one token — <Code>--primary</Code> — to its color.
          Shown here in the current mode (toggle the Storybook mode control to
          see the dark-mode values).
        </P>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--p-3)',
        }}
      >
        {themes.map((t) => (
          <div key={t.code} data-theme={t.code} style={{ display: 'grid', gap: 'var(--p-1)' }}>
            <div
              style={{
                height: 56,
                borderRadius: 'var(--rounded-md)',
                background: 'var(--primary)',
              }}
            />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              data-theme=&quot;{t.code}&quot;
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              {t.name} — {t.hue}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
