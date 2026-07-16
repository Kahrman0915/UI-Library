import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AtSign, Mail, Search, X } from 'lucide-react';
import Input from './Input';
import Label from '../Label/Label';
import Checkbox from '../Checkbox/Checkbox';
import Button from '../Button/Button';
import Card, { CardHeader, CardBody, CardFooter } from '../Card';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'] },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-input',
    label: 'Email',
    placeholder: 'you@example.com',
    size: 'default',
    error: false,
    disabled: false,
    required: false,
    type: 'email',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 320 }}>
        <Input {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const NoLabel: Story = {
  args: { label: undefined },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'API key',
    description: 'Used to authenticate requests. Rotate every 90 days.',
    placeholder: 'sk_...',
    required: true,
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search reports…',
    IconLeft: Search,
    type: 'search',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithBothIcons: Story = {
  args: {
    label: 'Username',
    placeholder: 'kahrman',
    IconLeft: AtSign,
    IconRight: X,
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 360 }}>
      <Input id="sz-sm" size="sm" label="Small" placeholder="text-xs, h-8" IconLeft={Mail} />
      <Input
        id="sz-md"
        size="default"
        label="Default"
        placeholder="text-sm, h-10"
        IconLeft={Mail}
      />
      <Input id="sz-lg" size="lg" label="Large" placeholder="text-base, h-12" IconLeft={Mail} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, value: 'read-only@example.com' },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Email',
    value: 'not-an-email',
    error: true,
    errorMessage: 'Enter a valid email address.',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 360 }}>
      <Input id="st-1" label="Default" placeholder="Type here…" />
      <Input id="st-2" label="Required" required placeholder="Type here…" />
      <Input id="st-3" label="With value" defaultValue="Hello world" />
      <Input id="st-4" label="Disabled" disabled defaultValue="Read only" />
      <Input
        id="st-5"
        label="Error"
        defaultValue="not-an-email"
        error
        errorMessage="Enter a valid email address."
      />
    </div>
  ),
};

// The plan called for a Form story exercising Label + Input + Checkbox composing.
export const InForm: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [values, setValues] = useState({
      email: '',
      password: '',
      remember: true,
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
      {},
    );

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const next: typeof errors = {};
      if (!values.email.includes('@')) next.email = 'Enter a valid email.';
      if (values.password.length < 8)
        next.password = 'Password must be at least 8 characters.';
      setErrors(next);
      if (Object.keys(next).length === 0) {
        // eslint-disable-next-line no-console
        console.log('form submitted', values);
      }
    };

    return (
      <form onSubmit={submit} style={{ maxWidth: 'var(--max-w-sm)' }}>
        <Card id="signin-card">
          <CardHeader
            id="signin-header"
            title="Sign in"
            description="Enter your credentials to continue."
          />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <Input
                id="form-email"
                label="Email"
                type="email"
                name="email"
                IconLeft={Mail}
                placeholder="you@example.com"
                required
                value={values.email}
                onValueChange={(v) =>
                  setValues((s) => ({ ...s, email: v }))
                }
                error={!!errors.email}
                errorMessage={errors.email}
                autoComplete="email"
              />
              <Input
                id="form-password"
                label="Password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                required
                value={values.password}
                onValueChange={(v) =>
                  setValues((s) => ({ ...s, password: v }))
                }
                error={!!errors.password}
                errorMessage={errors.password}
                autoComplete="current-password"
              />
              <Checkbox
                id="form-remember"
                label="Remember me on this device"
                checked={values.remember}
                onCheckedChange={(v) =>
                  setValues((s) => ({ ...s, remember: v }))
                }
              />
            </div>
          </CardBody>
          <CardFooter>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--p-3)',
                width: '100%',
              }}
            >
              <Label
                htmlFor="form-email"
                size="sm"
                description="We'll never share your info."
              >
                Need help?
              </Label>
              <Button id="form-submit" type="submit" label="Sign in" />
            </div>
          </CardFooter>
        </Card>
      </form>
    );
  },
};
