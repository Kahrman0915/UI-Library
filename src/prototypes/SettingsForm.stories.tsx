import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  Textarea,
  NativeSelect,
  NativeSelectOption,
  Combobox,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  Separator,
  Banner,
  Toaster,
  toast,
} from '../index';
import type { ComboboxOption } from '../index';
import { Bold, Italic, Underline } from 'lucide-react';
import { ThemeHarness, srOnly } from './ThemeHarness';

const meta: Meta = {
  title: 'Prototypes/Settings Form',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const timezones: ComboboxOption[] = [
  { value: 'pt', label: 'Pacific (UTC−8)' },
  { value: 'mt', label: 'Mountain (UTC−7)' },
  { value: 'ct', label: 'Central (UTC−6)' },
  { value: 'et', label: 'Eastern (UTC−5)' },
  { value: 'utc', label: 'UTC' },
  { value: 'cet', label: 'Central Europe (UTC+1)' },
];

function SettingsPage() {
  const [name, setName] = useState('Kahrman McKenzie');
  const [email, setEmail] = useState('');
  const [density, setDensity] = useState('comfortable');
  const emailError = email.length > 0 && !email.includes('@');

  return (
    <ThemeHarness>
      <Toaster />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Account settings</h1>
          <p style={{ margin: 'var(--p-1) 0 0', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            Every form control in one flow — flip mode and theme to check contrast and checked-state accents.
          </p>
        </div>

        <Banner id="edit-mode" variant="info" title="Editing your profile — unsaved changes are kept until you save." centered />

        <h2 style={srOnly}>Profile and preferences</h2>
        <Card id="profile">
          <CardHeader id="profile" title="Profile" description="This information is visible to your team." />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-5)' }}>
              <Input id="name" label="Full name" value={name} onValueChange={setName} />

              <Field>
                <FieldLabel htmlFor="email" required>Work email</FieldLabel>
                <Input id="email" type="email" placeholder="you@acme.com" value={email} onValueChange={setEmail} error={emailError} />
                {emailError ? (
                  <FieldError>Enter a valid email address.</FieldError>
                ) : (
                  <FieldDescription>We'll send billing receipts here.</FieldDescription>
                )}
              </Field>

              <Textarea id="bio" label="Bio" placeholder="A short description…" rows={3} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-4)' }}>
                <NativeSelect id="role" label="Role">
                  <NativeSelectOption value="owner">Owner</NativeSelectOption>
                  <NativeSelectOption value="admin">Admin</NativeSelectOption>
                  <NativeSelectOption value="member">Member</NativeSelectOption>
                </NativeSelect>
                <Combobox id="tz" label="Timezone" options={timezones} defaultValue="pt" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card id="prefs">
          <CardHeader id="prefs" title="Preferences" description="Controls that read --primary when active — watch them recolor with the theme." />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-5)' }}>
              <div style={{ display: 'grid', gap: 'var(--p-2-5)' }}>
                <Checkbox id="pref-news" label="Product newsletter" defaultChecked />
                <Checkbox id="pref-tips" label="Onboarding tips" />
                <Checkbox id="pref-mixed" label="Partial selection" indeterminate />
              </div>

              <Separator />

              <RadioGroup id="density" label="Density" value={density} onValueChange={setDensity}>
                <RadioGroupItem id="d-comfy" value="comfortable" label="Comfortable" />
                <RadioGroupItem id="d-compact" value="compact" label="Compact" />
              </RadioGroup>

              <Separator />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Two-factor auth</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Require a code at sign-in.</div>
                </div>
                <Switch id="2fa" defaultChecked aria-label="Two-factor auth" />
              </div>

              <Slider id="volume" label="Notification volume" defaultValue={60} showValue />

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Signature style</span>
                <ToggleGroup id="fmt" type="multiple" defaultValue={['bold']} variant="outline">
                  <ToggleGroupItem value="bold" IconCenter={Bold} aria-label="Bold" />
                  <ToggleGroupItem value="italic" IconCenter={Italic} aria-label="Italic" />
                  <ToggleGroupItem value="underline" IconCenter={Underline} aria-label="Underline" />
                </ToggleGroup>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'flex-end', width: '100%' }}>
              <Button id="cancel" label="Cancel" style="ghost" />
              <Button id="save" label="Save changes" onClick={() => toast.success('Settings saved.', { action: { label: 'Undo', onClick: () => {} } })} />
            </div>
          </CardFooter>
        </Card>
      </div>
    </ThemeHarness>
  );
}

export const Settings_: Story = {
  name: 'Settings',
  render: () => <SettingsPage />,
};
