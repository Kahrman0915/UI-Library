import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Mail } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardBody,
  Checkbox,
  Combobox,
  Input,
  NativeSelect,
  NativeSelectOption,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Slider,
  Switch,
  Textarea,
} from '../index';
import type { ComboboxOption } from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Test-drive: a developer builds this screen from the Figma handoff
// (page "🧪 Example — Settings"). Component picks mirror the Figma layer spec —
// Role = Select, Language = NativeSelect, Timezone = Combobox — so the code and
// the design line up 1:1. See the review notes in the PR / ledger for where the
// static design was ambiguous.
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Prototypes/Settings Handoff',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const timezones: ComboboxOption[] = [
  { value: 'la', label: 'America/Los_Angeles' },
  { value: 'ny', label: 'America/New_York' },
  { value: 'utc', label: 'UTC' },
  { value: 'lon', label: 'Europe/London' },
  { value: 'ber', label: 'Europe/Berlin' },
  { value: 'tok', label: 'Asia/Tokyo' },
];

function SettingsScreen() {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@acme.io');
  const [role, setRole] = useState<string | undefined>('member');
  const [theme, setTheme] = useState('light');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 'var(--p-8)',
          display: 'grid',
          gap: 'var(--p-6)',
        }}
      >
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--foreground)',
            }}
          >
            Settings
          </h1>
          <p
            style={{
              margin: 'var(--p-1) 0 0',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
            }}
          >
            Manage your account, preferences and appearance.
          </p>
        </header>

        {/* ── Profile ─────────────────────────────────────────────── */}
        <Card id="profile">
          <CardHeader
            id="profile"
            title="Profile"
            description="Update your personal information and how others see you."
          />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--p-4)',
                }}
              >
                <Avatar id="avatar" fallback="JD" size="lg" />
                <Button
                  id="change-photo"
                  label="Change photo"
                  style="outline"
                  onClick={() => {}}
                />
              </div>

              <Input
                id="name"
                label="Full name"
                required
                value={name}
                onValueChange={setName}
              />
              <Input
                id="email"
                label="Email"
                required
                type="email"
                IconLeft={Mail}
                value={email}
                onValueChange={setEmail}
              />
              <Textarea
                id="bio"
                label="Bio"
                placeholder="A short bio about yourself…"
                rows={3}
              />

              <div style={{ display: 'grid', gap: 'var(--p-1-5)' }}>
                <Select
                  id="role"
                  label="Role"
                  value={role}
                  onValueChange={setRole}
                >
                  <SelectTrigger placeholder="Select a role" />
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Preferences ─────────────────────────────────────────── */}
        <Card id="prefs">
          <CardHeader
            id="prefs"
            title="Preferences"
            description="Choose your language, timezone and what we email you about."
          />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <NativeSelect id="language" label="Language" defaultValue="en">
                <NativeSelectOption value="en">English (US)</NativeSelectOption>
                <NativeSelectOption value="es">Español</NativeSelectOption>
                <NativeSelectOption value="fr">Français</NativeSelectOption>
                <NativeSelectOption value="de">Deutsch</NativeSelectOption>
              </NativeSelect>

              <Combobox
                id="tz"
                label="Timezone"
                options={timezones}
                defaultValue="ny"
              />

              <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                <Switch id="notif-email" label="Email notifications" defaultChecked />
                <Switch id="notif-product" label="Product updates & tips" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Appearance ──────────────────────────────────────────── */}
        <Card id="appearance">
          <CardHeader
            id="appearance"
            title="Appearance"
            description="Personalise how the app looks and feels."
          />
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <RadioGroup
                id="theme"
                label="Theme"
                value={theme}
                onValueChange={setTheme}
              >
                <RadioGroupItem id="theme-light" value="light" label="Light" />
                <RadioGroupItem id="theme-dark" value="dark" label="Dark" />
                <RadioGroupItem id="theme-system" value="system" label="System" />
              </RadioGroup>

              <Slider id="font-size" label="Font size" defaultValue={60} showValue />

              <Checkbox id="reduce-motion" label="Reduce motion" />
            </div>
          </CardBody>
        </Card>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--p-3)',
          }}
        >
          <Button id="cancel" label="Cancel" style="ghost" />
          <Button id="save" label="Save changes" />
        </div>
      </div>
    </div>
  );
}

export const Settings_: Story = {
  name: 'Settings',
  render: () => <SettingsScreen />,
};
