import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './Field';
import Input from '../Input';
import Textarea from '../Textarea';
import Checkbox from '../Checkbox';
import Switch from '../Switch';
import RadioGroup, { RadioGroupItem } from '../RadioGroup';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../Select';
import Button from '../Button';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    orientation: 'vertical',
    invalid: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

// Reset Input's own label so Field controls it externally.
const inputProps = { label: undefined, description: undefined };

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <Field {...args}>
        <FieldLabel htmlFor="email" required>
          Email
        </FieldLabel>
        <Input id="email" type="email" placeholder="you@example.com" {...inputProps} />
        <FieldDescription>We'll never share your email.</FieldDescription>
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  args: { invalid: true },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <Field {...args}>
        <FieldLabel htmlFor="username" required>
          Username
        </FieldLabel>
        <Input
          id="username"
          defaultValue="admin"
          aria-invalid
          {...inputProps}
        />
        <FieldError>That username is already taken.</FieldError>
      </Field>
    </div>
  ),
};

export const MultipleErrors: Story = {
  args: { invalid: true },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <Field {...args}>
        <FieldLabel htmlFor="password" required>
          Password
        </FieldLabel>
        <Input
          id="password"
          type="password"
          defaultValue="abc"
          aria-invalid
          {...inputProps}
        />
        <FieldError
          errors={[
            'Must be at least 8 characters.',
            'Must include a number.',
            'Must include a special character.',
          ]}
        />
      </Field>
    </div>
  ),
};

export const HorizontalOrientation: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="h-name">Full name</FieldLabel>
          <FieldContent>
            <Input id="h-name" placeholder="Jane Doe" {...inputProps} />
          </FieldContent>
        </Field>
        <Field {...args}>
          <FieldLabel htmlFor="h-email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="h-email"
              type="email"
              placeholder="jane@example.com"
              {...inputProps}
            />
            <FieldDescription>Used for notifications only.</FieldDescription>
          </FieldContent>
        </Field>
        <Field {...args}>
          <FieldLabel htmlFor="h-bio">Bio</FieldLabel>
          <FieldContent>
            <Textarea id="h-bio" rows={3} label={undefined} />
            <FieldDescription>Max 300 characters.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  ),
};

export const GroupedFieldSet: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>
          Appears on your invoices and email notifications.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="g-name" required>
              Full name
            </FieldLabel>
            <Input id="g-name" placeholder="Jane Doe" {...inputProps} />
          </Field>
          <Field>
            <FieldLabel htmlFor="g-company">Company</FieldLabel>
            <Input id="g-company" placeholder="Company name" {...inputProps} />
            <FieldDescription>Optional.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="g-country">Country</FieldLabel>
            <Select id="g-country" label={undefined}>
              <SelectTrigger placeholder="Choose a country" />
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

export const WrappingCheckboxAndSwitch: Story = {
  render: () => {
    const [marketing, setMarketing] = useState(false);
    const [notifications, setNotifications] = useState(true);
    return (
      <div style={{ maxWidth: 'var(--max-w-sm)' }}>
        <FieldSet>
          <FieldLegend variant="label">Preferences</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox
                id="wc-marketing"
                checked={marketing}
                onCheckedChange={setMarketing}
              />
              <FieldContent>
                <FieldTitle>Marketing emails</FieldTitle>
                <FieldDescription>
                  Occasional product updates and announcements.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <Switch
                id="wc-notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
              <FieldContent>
                <FieldTitle>Notifications</FieldTitle>
                <FieldDescription>
                  Ping me when someone comments on a thread.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    );
  },
};

export const WrappingRadioGroup: Story = {
  render: () => {
    const [value, setValue] = useState('starter');
    return (
      <div style={{ maxWidth: 'var(--max-w-sm)' }}>
        <FieldSet>
          <FieldLegend>Plan</FieldLegend>
          <FieldDescription>You can change this later.</FieldDescription>
          <Field>
            <RadioGroup
              id="wr-plan"
              value={value}
              onValueChange={setValue}
            >
              <RadioGroupItem
                id="wr-starter"
                value="starter"
                label="Starter"
                description="Free forever, up to 3 projects."
              />
              <RadioGroupItem
                id="wr-pro"
                value="pro"
                label="Pro"
                description="$12/mo — unlimited projects."
              />
              <RadioGroupItem
                id="wr-team"
                value="team"
                label="Team"
                description="$29/mo per seat — SSO + collaboration."
              />
            </RadioGroup>
          </Field>
        </FieldSet>
      </div>
    );
  },
};

export const WithSeparator: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-sm)' }}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sep-email">Email</FieldLabel>
          <Input id="sep-email" type="email" {...inputProps} />
        </Field>
        <Field>
          <FieldLabel htmlFor="sep-pw">Password</FieldLabel>
          <Input id="sep-pw" type="password" {...inputProps} />
        </Field>
        <FieldSeparator>or</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="sep-sso">Company email (SSO)</FieldLabel>
          <Input id="sep-sso" type="email" {...inputProps} />
          <FieldDescription>
            We'll redirect you to your identity provider.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        // eslint-disable-next-line no-console
        console.log('form values:', Object.fromEntries(data));
      }}
      style={{
        display: 'grid',
        gap: 'var(--p-6)',
        maxWidth: 'var(--max-w-md)',
      }}
    >
      <FieldSet>
        <FieldLegend>Sign up</FieldLegend>
        <FieldDescription>
          It only takes a minute — no credit card required.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="f-email" required>
              Email
            </FieldLabel>
            <Input
              id="f-email"
              name="email"
              type="email"
              required
              {...inputProps}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="f-pw" required>
              Password
            </FieldLabel>
            <Input
              id="f-pw"
              name="password"
              type="password"
              required
              {...inputProps}
            />
            <FieldDescription>At least 8 characters.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div style={{ justifySelf: 'start' }}>
        <Button id="field-submit" type="submit" label="Create account" />
      </div>
    </form>
  ),
};
