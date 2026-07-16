import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Tell Vite's Sass integration to use the modern API. Silences the
  // "legacy JS API" deprecation warning that fires once per SCSS file.
  viteFinal: async (config) => {
    config.css = config.css ?? {};
    config.css.preprocessorOptions = config.css.preprocessorOptions ?? {};
    config.css.preprocessorOptions.scss = {
      ...(config.css.preprocessorOptions.scss ?? {}),
      api: 'modern-compiler',
    };
    return config;
  },
};

export default config;
