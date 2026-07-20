import type { Meta, StoryObj } from '@storybook/react';
import Code, { CodeBlock } from './Code';

const meta: Meta<typeof Code> = {
  title: 'Components/Code',
  component: Code,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof Code>;

export const Inline: Story = {
  render: () => (
    <p style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--text-sm)', maxWidth: 560, lineHeight: 1.7 }}>
      Install with <Code>npm install @ui/lib</Code>, then import the styles once:{' '}
      <Code>import '@ui/lib/styles.css'</Code>. Every component is a named export
      from <Code>@ui/lib</Code>.
    </p>
  ),
};

const SAMPLE = `import { Button } from '@ui/lib';

export function App() {
  return <Button id="save" label="Save" />;
}`;

export const Block: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock id="cb-basic" code={SAMPLE} />
    </div>
  ),
};

export const WithFilename: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock id="cb-file" filename="App.tsx" language="tsx" code={SAMPLE} />
    </div>
  ),
};

export const NoCopy: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock id="cb-nocopy" filename="README.md" showCopy={false} code={`# @ui/lib\n\nA React + SCSS component library.`} />
    </div>
  ),
};

export const LongLine: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <CodeBlock
        id="cb-long"
        filename="tokens.scss"
        code={`--aiden-primary: linear-gradient(135deg, #8b5cf6 0%, #7761f3 50%, #60a5fa 100%);`}
      />
    </div>
  ),
};
