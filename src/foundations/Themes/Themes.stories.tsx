import type { Meta, StoryObj } from '@storybook/react';
import { Save } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/Card';
import Checkbox from '../../components/Checkbox';
import Switch from '../../components/Switch';
import Input from '../../components/Input';
import Chip from '../../components/Chip';

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
          "Three independent axes. **Mode** (`data-mode` = light/dark) ⊥ **Theme** (`data-theme=\"{code}\"` = a sub-brand's accent, remaps `--primary`) ⊥ **Surface** (`data-surface=\"aiden\"` = the AI surface, a gradient identity that layers *inside* any brand). A theme remaps `--primary` so every `--primary`-driven control (primary button, checkbox, switch, radio, active chip, progress) takes the accent automatically. The MAIN brand is the absence of `data-theme`: `--primary` stays neutral slate. Secondary/ghost/outline and Tooltip stay neutral in every theme. See the **Aiden Surface** story for the third axis.",
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
        <H>Three axes: mode, theme, surface</H>
        <P>
          The system has three <em>independent</em> attribute-driven axes. They
          compose: you can be in dark mode, inside the <Code>db</Code> brand, on an
          Aiden surface, all at once.
        </P>
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
        <P>
          <strong>Surface</strong> is a cross-cutting product identity — today just{' '}
          <strong>Aiden</strong>, the AI assistant. Set{' '}
          <Code>data-surface="aiden"</Code> on a panel and it adopts Aiden's violet
          gradient identity, <em>even inside another brand</em> (an Aiden chat inside{' '}
          <Code>db</Code> stays Aiden, not indigo). It's <em>not</em> a theme code —
          it never enters the brand picker, and it layers on top of whatever brand
          it's in. See the <strong>Aiden Surface</strong> story for how it works.
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
{`<html data-mode="dark">                 {/* AXIS 1 — light / dark */}
  <App />                                {/* main brand — slate primary */}

  <section data-theme="db">              {/* AXIS 2 — db sub-brand */}
    <Button variant="default">Save</Button>   {/* → indigo, automatically */}
    <Button style="secondary">Cancel</Button> {/* → stays neutral slate */}
    <Checkbox checked />                       {/* → indigo */}

    <aside data-surface="aiden">         {/* AXIS 3 — Aiden AI panel */}
      <Button variant="default">Ask Aiden</Button> {/* → violet gradient */}
      <Checkbox checked />                          {/* → violet, not indigo */}
    </aside>                             {/* keeps Aiden identity inside db */}
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

// ═══════════════════════════════════════════════════════════════════════════
// Story 5 — Aiden surface (the third axis)
// ═══════════════════════════════════════════════════════════════════════════

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </div>
);

const AidenSampler = () => (
  <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', alignItems: 'center' }}>
    <Button id={`a-${Math.random()}`} variant="default" label="Ask Aiden" />
    <Button id={`as-${Math.random()}`} variant="default" style="secondary" label="Secondary" />
    <Button id={`ao-${Math.random()}`} variant="default" style="outline" label="Outline" />
    <Button id={`ag-${Math.random()}`} style="ghost" label="Ghost" />
    <Badge id={`ab-${Math.random()}`} variant="default" label="Badge" />
    <Chip id={`ac-${Math.random()}`} label="Active" active />
    <Checkbox id={`acb-${Math.random()}`} defaultChecked label="Checked" />
    <Switch id={`asw-${Math.random()}`} defaultChecked label="On" />
  </div>
);

export const AidenSurface: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 'var(--max-w-3xl)' }}>
      <div>
        <H>Aiden — the surface axis</H>
        <P>
          <strong>Aiden</strong> is the AI assistant. It has its own UI and also
          appears embedded inside every product brand. Its identity is a{' '}
          <strong>violet→blue gradient</strong>, so it is <em>not</em> a brand theme:
          a gradient can't be the single scalar <Code>--primary</Code>, and Aiden must{' '}
          <em>keep</em> its look inside another brand rather than be swapped by it.
          It's the third axis — a <strong>surface</strong>, set with{' '}
          <Code>data-surface="aiden"</Code>, that layers on top of any brand.
        </P>
      </div>

      <div>
        <Eyebrow>Neutral — no surface (reference)</Eyebrow>
        <AidenSampler />
      </div>

      <div data-surface="aiden">
        <Eyebrow>data-surface=&quot;aiden&quot;</Eyebrow>
        <AidenSampler />
      </div>

      <div data-theme="db">
        <Eyebrow>Aiden panel nested inside data-theme=&quot;db&quot;</Eyebrow>
        <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center', marginBottom: 'var(--p-3)' }}>
          <Button id={`dbref-${Math.random()}`} variant="default" label="db button (indigo)" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
            ← the brand · the panel below keeps Aiden violet →
          </span>
        </div>
        <div data-surface="aiden">
          <AidenSampler />
        </div>
      </div>

      <div>
        <H>How it works</H>
        <P>
          The surface reuses the entire theming machinery. It remaps{' '}
          <Code>--primary</Code> to Aiden's <strong>solid violet</strong> (the
          gradient's fallback colour), so every <em>scalar</em> <Code>--primary</Code>{' '}
          consumer — outline / link / secondary text, borders, focus rings, and the
          checked checkbox / switch / radio / active chip — turns violet{' '}
          <em>for free</em>. Then the handful of <strong>hero fills</strong> that want
          the actual gradient (primary Button, default Badge, active Chip, checked
          Checkbox, Switch track) override their background to{' '}
          <Code>var(--aiden-primary)</Code> in their own component SCSS. The{' '}
          <strong>ghost</strong> button stays neutral slate — the same carve-out as in
          the brand themes.
        </P>
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
{`/* tokens.scss — one remap, mirrors a theme scope */
[data-surface='aiden'] {
  --primary: var(--aiden-outline-border);   /* solid violet */
  --primary-foreground: var(--aiden-primary-foreground);
  /* --primary-text / -light / -border / -ring / -focus all derive */
}

/* component SCSS — hero fills take the gradient */
[data-surface='aiden'] .ui-button--default-default { background: var(--aiden-primary); }
[data-surface='aiden'] .ui-badge--default          { background: var(--aiden-primary); }
[data-surface='aiden'] .ui-chip--active            { background: var(--aiden-primary); }`}
        </pre>
      </div>

      <div>
        <H>The Aiden token family</H>
        <P>
          <Code>--aiden-primary</Code> (the gradient fill) ·{' '}
          <Code>--aiden-hover</Code> (deeper gradient, hover) ·{' '}
          <Code>--aiden-outline-border</Code> (the solid violet = the surface's{' '}
          <Code>--primary</Code>) · <Code>--aiden-secondary</Code> /{' '}
          <Code>--aiden-border</Code> / <Code>--aiden-ring</Code> /{' '}
          <Code>--aiden-focus</Code> (tints for the standalone{' '}
          <Code>variant="aiden"</Code>). All are mode-aware.
        </P>
        <P>
          <strong>Accessibility:</strong> in light mode the gradient is tuned so{' '}
          <em>white</em> text clears AA (~4.6:1) across every stop; in dark mode it's
          a pastel gradient carrying <em>dark</em> text. The scalar violet clears AA
          as text via the derived <Code>--primary-text</Code>. So the whole surface —
          in both modes — passes WCAG AA.
        </P>
      </div>
    </div>
  ),
};
