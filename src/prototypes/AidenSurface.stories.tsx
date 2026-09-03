import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sparkles } from 'lucide-react';
import { Button, Badge, Input, Checkbox, Switch, Chip } from '../index';
import { ThemeHarness } from './ThemeHarness';

const meta: Meta = {
  title: 'Prototypes/Aiden Surface',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// One set of --primary-driven components, rendered identically in each context.
function Sampler({ p }: { p: string }) {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button id={`${p}-primary`} label="Ask Aiden" IconLeft={Sparkles} />
        <Button id={`${p}-secondary`} label="Secondary" style="secondary" />
        <Button id={`${p}-outline`} label="Outline" style="outline" />
        <Button id={`${p}-link`} label="Link" style="link" />
        <Button id={`${p}-ghost`} label="Ghost" style="ghost" />
      </div>
      <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge id={`${p}-badge`} color="default" label="Default" />
        <Badge id={`${p}-badge-o`} color="default" appearance="outline" label="Outline" />
        <Chip id={`${p}-chip`} label="Active" active />
        <Checkbox id={`${p}-cb`} label="Checked" defaultChecked />
        <Switch id={`${p}-sw`} checked={on} onCheckedChange={setOn} aria-label="Toggle" />
      </div>
      <Input id={`${p}-input`} label="Prompt" placeholder="Focus me — the ring follows the context" />
    </div>
  );
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-lg)',
        padding: 'var(--p-5)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wide)',
          color: 'var(--muted-foreground)',
          marginBottom: 'var(--p-4)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function AidenPoc() {
  return (
    <ThemeHarness>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
            Aiden surface — proof of concept
          </h1>
          <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            The identical component set in three contexts. <code>data-surface="aiden"</code> remaps{' '}
            <code>--primary</code> to Aiden's solid violet (so outline/link text, borders, focus rings,
            checked controls all go violet for free) while the primary button + default badge take the
            actual gradient. Flip mode top-right to check both.
          </p>
        </div>

        <Frame title="Neutral — no surface (reference)">
          <Sampler p="neutral" />
        </Frame>

        <Frame title={'Aiden surface — data-surface="aiden"'}>
          <div data-surface="aiden">
            <Sampler p="aiden" />
          </div>
        </Frame>

        <Frame title={'Aiden panel nested inside data-theme="db"'}>
          <div data-theme="db" style={{ display: 'grid', gap: 'var(--p-4)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              A db primary button (indigo) sits right next to the Aiden panel, which keeps its violet
              identity — proving the surface overrides the brand for its subtree only.
            </div>
            <div>
              <Button id="db-ref" label="db button" />
            </div>
            <div data-surface="aiden">
              <Sampler p="aiden-in-db" />
            </div>
          </div>
        </Frame>
      </div>
    </ThemeHarness>
  );
}

export const ProofOfConcept: Story = {
  render: () => <AidenPoc />,
};
