import { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { DocsPage } from './docs';
import '../src/styles/fonts.scss';
import '../src/styles/tokens.scss';
import './preview.scss';

// Brand themes. 'main' = the neutral slate base (no data-theme attribute).
const THEMES = ['main', 'db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'] as const;

// Two independent toolbar globals, applied to <html>:
//   mode  → data-mode="light|dark"   (light / dark)
//   theme → data-theme="{code}"      (sub-brand; 'main' clears the attribute)
// Kept separate so the two toolbars never clobber each other.
const withModeAndTheme: Decorator = (Story, context) => {
  const mode = (context.globals.mode as string) || 'light';
  const theme = (context.globals.theme as string) || 'main';

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-mode', mode);
    if (theme && theme !== 'main') {
      html.setAttribute('data-theme', theme);
    } else {
      html.removeAttribute('data-theme');
    }
  }, [mode, theme]);

  return <Story />;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    // Replace Storybook's stock autodocs layout with our own template. It reads
    // `parameters.ui` (see src/types/DocsTypes.ts) and is composed from the
    // library's own components. See .storybook/docs/DocsPage.tsx.
    docs: {
      page: DocsPage,
      // 93% of our stories use a custom `render`, and with the default `auto`
      // Storybook prints the raw CSF export for those — the reader gets
      // `{ parameters: {...}, render: () => ... }` instead of the JSX. `dynamic`
      // snapshots what actually rendered, which is what a consumer wants to copy.
      source: { type: 'dynamic' },
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Overview', 'Typography', 'Spacing & Sizing', 'Motion', 'Tokens', 'Themes'],
          'Components',
          // Charts are their own subsystem, not a member of Components: own
          // frame, own maths, own accessibility gate.
          'Charts',
          ['Overview', 'Bar', 'Line', 'Area'],
          'Hooks',
          'Prototypes',
        ],
      },
    },
  },
  globalTypes: {
    mode: {
      description: 'Light / dark mode',
      defaultValue: 'light',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Brand theme (remaps --primary)',
      defaultValue: 'main',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEMES.map((t) => ({
          value: t,
          title: t === 'main' ? 'Main (slate)' : t.toUpperCase(),
        })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [withModeAndTheme],
};

export default preview;
