import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.test.tsx', '**/*.test.ts'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '#components': resolve(__dirname, 'src/components'),
      '#charts': resolve(__dirname, 'src/charts'),
      '#': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      // Two entries. `markdown` is the ONLY module allowed to import the
      // markdown/highlighting dependencies — it is deliberately not exported
      // from src/index.ts, so the main entry stays dependency-free and apps
      // that never render AI markdown never pay for it. See CLAUDE.md hard
      // rule 1 for the scoped exception.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        markdown: resolve(__dirname, 'src/markdown.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lucide-react',
        // The three approved chat-markdown deps stay external so consumers
        // dedupe them and dist never inlines a copy.
        /^react-markdown/,
        /^remark-gfm/,
        /^highlight\.js/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },
    sourcemap: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
});
