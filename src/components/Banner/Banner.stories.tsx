import { useState } from 'react';
import { Info, Megaphone, Sparkles } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Banner from './Banner';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A full-bleed bar for something that affects the whole page — planned ' +
        'maintenance, a trial about to expire, an action the user must take before ' +
        'continuing. Distinct from `Alert`, which sits inline beside the thing it ' +
        'describes.',
      tags: ['5 variants', 'dismissible'],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'brand', 'info', 'success', 'warning', 'error'],
    },
    centered: { control: 'boolean' },
  },
  args: {
    id: 'story-banner',
    variant: 'info',
    title: 'A new version is available.',
    centered: false,
  },
};

export default meta;

type Story = StoryObj<typeof Banner>;

export const Playground: Story = {
  render: (args) => (
    <Banner {...args} Icon={Info} action={<Button id="pg-a" size="xsmall" style="outline" label="Reload" />} />
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid' }}>
      <Banner id="b-default" Icon={Megaphone} title="Scheduled maintenance this Sunday at 02:00 UTC." />
      <Banner id="b-brand" variant="brand" Icon={Sparkles} title="Brand banner — follows the active theme's --primary." />
      <Banner id="b-info" variant="info" Icon={Info} title="A new version (4.1) is available." />
      <Banner id="b-success" variant="success" title="Your changes have been published." />
      <Banner id="b-warning" variant="warning" title="Your trial ends in 3 days." />
      <Banner id="b-error" variant="error" title="We couldn't reach the server. Retrying…" />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Banner
      id="b-action"
      variant="info"
      Icon={Sparkles}
      title="Aiden can now summarize long threads for you."
      action={
        <>
          <Button id="ba-dismiss" size="xsmall" style="ghost" label="Not now" />
          <Button id="ba-try" size="xsmall" style="outline" label="Try it" />
        </>
      }
    />
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    if (!open) {
      return (
        <div style={{ padding: 24, fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          Dismissed.{' '}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
          >
            Bring it back
          </button>
        </div>
      );
    }
    return (
      <Banner
        id="b-dismiss"
        variant="warning"
        title="You have unsaved changes."
        onClose={() => setOpen(false)}
      />
    );
  },
};

export const Centered: Story = {
  render: () => (
    <Banner
      id="b-centered"
      variant="default"
      centered
      Icon={Sparkles}
      title="Free shipping on orders over $50 — this week only."
    />
  ),
};
