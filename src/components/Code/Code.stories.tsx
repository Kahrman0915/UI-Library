import type { Meta, StoryObj } from '@storybook/react';
import Code, { CodeBlock } from './Code';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Code> = {
  title: 'Components/Code',
  component: Code,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        '`Code` for a symbol mentioned inside a sentence, `CodeBlock` for a fenced ' +
        'snippet with an optional filename header and a copy button. No syntax ' +
        'highlighting — that would need a dependency, and the trade-off was taken ' +
        'deliberately.',
      tags: ['typography', '2 exports'],
    } satisfies UiDocsParameters,
  },
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
        filename="app.tsx"
        code={`const themes = ['db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'] as const;`}
      />
    </div>
  ),
};
