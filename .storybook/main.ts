import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  // addon-themes is deliberately absent: it was registered for months and never
  // used — no withThemeBy* decorator anywhere, because the mode/theme/tint
  // globals are hand-rolled in preview.tsx. Verified it was not responsible for
  // the docs-page remount before removing it.
  addons: ['@storybook/addon-essentials'],
  // Generate a Docs page per component. Without this the prop JSDoc has no
  // home: the Controls panel only renders Name + Control, so the props TABLE
  // (name / description / default / type) never appears anywhere. Remove this
  // line to go back to canvas-only stories.
  docs: { autodocs: true },
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
      // Filter on the prop's DECLARATIONS, not its `parent`. Every props type
      // is an intersection with a React DOM interface, and for a key we
      // redeclare — `id`, `className`, `type` — docgen reports `parent` as the
      // @types/react interface it first saw. A `parent`-based filter therefore
      // dropped exactly the props a consumer most needs (Button lost `id`,
      // `className` and `type`). `declarations` lists every site the key is
      // declared at, so "declared anywhere in src/" keeps ours and still drops
      // the inherited DOM attributes.
      propFilter: (prop) => {
        if (prop.declarations && prop.declarations.length > 0) {
          return prop.declarations.some(
            (d) => !d.fileName.includes('node_modules'),
          );
        }
        return prop.parent ? !/node_modules/.test(prop.parent.fileName) : true;
      },
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
