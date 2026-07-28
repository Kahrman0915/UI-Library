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
    // Without these, docgen extracts prop NAMES but every `description` comes
    // back empty, so the Docs props tables show no JSDoc at all. Every props
    // type here is `Omit<React.*HTMLAttributes<T>, …> & { … }` behind a
    // `forwardRef`; `savePropValueAsString` + an explicit propFilter make
    // react-docgen-typescript resolve through that and keep the comments.
    // The filter also drops the ~250 inherited DOM attributes per component,
    // which would otherwise bury our own props.
    reactDocgenTypescriptOptions: {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
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
