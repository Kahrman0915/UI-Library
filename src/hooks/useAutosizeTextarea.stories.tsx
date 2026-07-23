import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useAutosizeTextarea } from './useAutosizeTextarea';
import '../components/Input/Input.scss';

/**
 * `useAutosizeTextarea` grows a textarea to fit its content up to `maxRows`,
 * then scrolls. It powers `ChatComposerInput`. Type across several lines to
 * watch it grow, then keep going to see it cap and scroll.
 */
const meta: Meta = {
  title: 'Hooks/useAutosizeTextarea',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const note = (children: React.ReactNode) => (
  <p
    style={{
      margin: '0 0 12px 0',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6,
      color: 'var(--muted-foreground)',
      maxWidth: 520,
    }}
  >
    {children}
  </p>
);

const Demo = ({ maxRows }: { maxRows: number }) => {
  const [value, setValue] = useState('');
  const ref = useAutosizeTextarea(value, { maxRows });
  return (
    <div className="ui-input-wrap" style={{ maxWidth: 480 }}>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a few lines…"
        className="ui-input"
        style={{ resize: 'none' }}
      />
    </div>
  );
};

export const Playground: Story = {
  render: () => (
    <div>
      {note(
        <>
          Grows up to <code>maxRows={8}</code>, then the textarea scrolls
          internally instead of pushing the layout.
        </>,
      )}
      <Demo maxRows={8} />
    </div>
  ),
};

export const LowCap: Story = {
  render: () => (
    <div>
      {note(
        <>
          A tighter <code>maxRows={3}</code> — useful for a compact composer.
        </>,
      )}
      <Demo maxRows={3} />
    </div>
  ),
};
