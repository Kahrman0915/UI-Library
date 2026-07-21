import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  ModeToggler,
  NativeSelect,
  NativeSelectOption,
} from '../index';

/**
 * Shared scaffolding for the prototype test pages. Renders a sticky control
 * strip with the real ModeToggler (drives `data-mode` on <html>) and a theme
 * picker (drives `data-theme` on the content subtree). Everything below the bar
 * is wrapped in the themed subtree, so we can watch which components pick up the
 * accent (--primary consumers) and which deliberately stay neutral.
 */
const THEMES: { code: string; label: string }[] = [
  { code: '', label: 'Main (neutral slate)' },
  { code: 'db', label: 'db' },
  { code: 'dc', label: 'dc' },
  { code: 'dr', label: 'dr' },
  { code: 'ec', label: 'ec' },
  { code: 'ir', label: 'ir' },
  { code: 'nb', label: 'nb' },
  { code: 'ph', label: 'ph' },
  { code: 'rm', label: 'rm' },
];

/** Visually-hidden but screen-reader-available — for bridging heading levels. */
export const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function ThemeHarness({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-family)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-4)',
          padding: 'var(--p-3) var(--p-5)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
          background: 'var(--background)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <strong style={{ fontSize: 'var(--text-sm)' }}>Prototype harness</strong>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          flip mode + theme to test →
        </span>
        <span style={{ flex: 1 }} />
        <div style={{ width: 220 }}>
          <NativeSelect
            id="harness-theme"
            aria-label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {THEMES.map((t) => (
              <NativeSelectOption key={t.code} value={t.code}>
                {`Theme: ${t.label}`}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <ModeToggler id="harness-mode" variant="outline" />
      </header>

      <main data-theme={theme || undefined}>{children}</main>
    </div>
  );
}
