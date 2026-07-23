import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import InputOTP from './InputOTP';

const meta: Meta<typeof InputOTP> = {
  title: 'Components/InputOTP',
  component: InputOTP,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    length: { control: { type: 'number', min: 2, max: 8 } },
    groupSize: { control: { type: 'number', min: 0, max: 4 } },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof InputOTP>;

export const Playground: Story = {
  args: {
    id: 'otp-play',
    length: 6,
    groupSize: 3,
    'aria-label': 'One-time code',
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return <InputOTP {...args} value={value} onChange={setValue} />;
  },
};

const row = (children: React.ReactNode) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-6)' }}>
    {children}
  </div>
);

export const Sizes: Story = {
  render: () => {
    const [a, setA] = useState('12');
    const [b, setB] = useState('123');
    const [c, setC] = useState('1234');
    return row(
      <>
        <InputOTP id="otp-sm" size="sm" length={6} groupSize={3} value={a} onChange={setA} aria-label="sm" />
        <InputOTP id="otp-md" size="default" length={6} groupSize={3} value={b} onChange={setB} aria-label="default" />
        <InputOTP id="otp-lg" size="lg" length={6} groupSize={3} value={c} onChange={setC} aria-label="lg" />
      </>,
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [done, setDone] = useState<string | null>(null);
    return (
      <InputOTP
        id="otp-label"
        label="Verification code"
        description={done ? `Submitted: ${done}` : 'Enter the 6-digit code we sent you.'}
        length={6}
        groupSize={3}
        value={value}
        onChange={setValue}
        onComplete={setDone}
      />
    );
  },
};

export const States: Story = {
  render: () =>
    row(
      <>
        <InputOTP id="otp-err" error errorMessage="That code isn't right." length={6} groupSize={3} defaultValue="123456" aria-label="error" />
        <InputOTP id="otp-dis" disabled length={6} groupSize={3} defaultValue="1234" aria-label="disabled" />
        <InputOTP id="otp-alnum" length={5} pattern={/[a-zA-Z0-9]/} inputMode="text" aria-label="alphanumeric" description="Alphanumeric (letters + digits)." />
      </>,
    ),
};
